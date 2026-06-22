import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

const ctx = createContext(null);

const initialState = {
  user: null,
  invoices: [],
  clients: [],
  currentInvoice: null,
  currentTemplate: 'modern',
  editorLogo: null,
  page: 'auth',
  settings: {
    name: 'Jane Doe', email: 'jane@example.com', phone: '',
    bizName: '', bizAddress: '', bizEmail: '', bizWeb: '', bizTax: '',
    logo: null,
    currency: 'USD', taxRate: 0, taxLabel: 'Tax', terms: 30,
    invPrefix: 'INV-', invNext: 1001,
    plan: 'free', creditBalance: 0,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, invoices: [], clients: [] };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_CURRENT_INVOICE':
      return { ...state, currentInvoice: action.payload };
    case 'SET_CURRENT_TEMPLATE':
      return { ...state, currentTemplate: action.payload };
    case 'SET_EDITOR_LOGO':
      return { ...state, editorLogo: action.payload };
    case 'SET_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function InvoiceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const firestoreSyncing = useRef(false);

  // Persist to localStorage
  const persist = useCallback(() => {
    try {
      localStorage.setItem('ik_invoices', JSON.stringify(state.invoices));
      localStorage.setItem('ik_clients', JSON.stringify(state.clients));
      localStorage.setItem('ik_settings', JSON.stringify(state.settings));
    } catch {}
  }, [state.invoices, state.clients, state.settings]);

  useEffect(() => {
    if (state.user) persist();
  }, [persist, state.user]);

  // Firestore sync — enabled when Firebase env vars are set
  useEffect(() => {
    if (!state.user || state.user.uid === 'demo') return;
    if (firestoreSyncing.current) return;
    firestoreSyncing.current = true;

    import('../firebase/config').then(async ({ getFirebase }) => {
      const fb = await getFirebase();
      if (!fb) return;
      const { doc, setDoc, getDoc } = await import('firebase/firestore');
      const uid = state.user.uid;

      // Load from Firestore on first sync
      const invSnap = await getDoc(doc(fb.db, 'users', uid, 'data', 'invoices'));
      const cliSnap = await getDoc(doc(fb.db, 'users', uid, 'data', 'clients'));
      const setSnap = await getDoc(doc(fb.db, 'users', uid, 'data', 'settings'));

      const patch = {};
      if (invSnap.exists()) patch.invoices = invSnap.data().items || [];
      if (cliSnap.exists()) patch.clients = cliSnap.data().items || [];
      if (setSnap.exists()) patch.settings = { ...state.settings, ...setSnap.data() };
      if (Object.keys(patch).length) dispatch({ type: 'SET_STATE', payload: patch });
    }).catch(() => {});
  }, [state.user]);

  // Write to Firestore on every state change (debounced)
  useEffect(() => {
    if (!state.user || state.user.uid === 'demo') return;
    const timer = setTimeout(() => {
      import('../firebase/config').then(async ({ getFirebase }) => {
        const fb = await getFirebase();
        if (!fb) return;
        const { doc, setDoc } = await import('firebase/firestore');
        const uid = state.user.uid;
        const batch = [
          setDoc(doc(fb.db, 'users', uid, 'data', 'invoices'), { items: state.invoices }),
          setDoc(doc(fb.db, 'users', uid, 'data', 'clients'), { items: state.clients }),
          setDoc(doc(fb.db, 'users', uid, 'data', 'settings'), state.settings),
        ];
        await Promise.all(batch).catch(() => {});
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.user, state.invoices, state.clients, state.settings]);

  return <ctx.Provider value={{ state, dispatch }}>{children}</ctx.Provider>;
}

export function useStore() {
  return useContext(ctx);
}
