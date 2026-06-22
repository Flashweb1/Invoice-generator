import { useStore } from './context/InvoiceContext';
import { usePlan } from './context/PlanContext';
import { useToast } from './components/UI/Toast';
import AuthPage from './components/Auth/AuthPage';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import InvoiceList from './components/Invoices/InvoiceList';
import ClientList from './components/Clients/ClientList';
import Settings from './components/Settings/Settings';
import Billing from './components/Billing/Billing';
import Editor from './components/Editor/Editor';
import { genId, today, addDays } from './utils/helpers';

export default function App() {
  const { state, dispatch } = useStore();
  const plan = usePlan();
  const { showToast, ToastContainer } = useToast();

  function handleNavigate(page) {
    dispatch({ type: 'SET_PAGE', payload: page });
  }

  function handleDuplicateInvoice(id) {
    const orig = state.invoices.find(i => i.id === id);
    if (!orig) return;
    const dup = JSON.parse(JSON.stringify(orig));
    dup.id = genId();
    dup.num = state.settings.invPrefix + (state.settings.invNext || 1001);
    dup.status = 'Draft';
    dup.date = today();
    const newInvs = [...state.invoices, dup];
    dispatch({ type: 'SET_INVOICES', payload: newInvs });
    dispatch({ type: 'SET_SETTINGS', payload: { invNext: (state.settings.invNext || 1001) + 1 } });
    showToast('Invoice duplicated', 'success');
  }

  function handleDeleteInvoice(id) {
    dispatch({ type: 'SET_INVOICES', payload: state.invoices.filter(i => i.id !== id) });
    showToast('Deleted');
  }

  function handleNewInvoice() {
    if (!plan.canCreateInvoice) {
      showToast('Free plan: 5 invoices/month. Upgrade to Pro or buy credits.', 'error');
      dispatch({ type: 'SET_PAGE', payload: 'billing' });
      return;
    }
    const s = state.settings;
    const inv = {
      id: genId(),
      num: s.invPrefix + (s.invNext || 1001),
      date: today(),
      due: addDays(today(), s.terms || 30),
      status: 'Draft',
      docType: 'invoice',
      template: 'modern',
      currency: s.currency || 'USD',
      tax: s.taxRate || 0,
      discount: 0,
      discountType: 'pct',
      fromName: s.bizName || s.name,
      fromEmail: s.bizEmail || s.email,
      fromPhone: s.phone || '',
      fromAddress: s.bizAddress || '',
      toName: '', toEmail: '', toPhone: '', toAddress: '',
      items: [{ id: genId(), desc: '', qty: 1, price: '' }],
      notes: '',
      logo: s.logo || null,
    };
    dispatch({ type: 'SET_CURRENT_INVOICE', payload: inv });
    dispatch({ type: 'SET_PAGE', payload: 'editor' });
  }

  function handleEditInvoice(id) {
    const inv = JSON.parse(JSON.stringify(state.invoices.find(i => i.id === id)));
    dispatch({ type: 'SET_CURRENT_INVOICE', payload: inv });
    dispatch({ type: 'SET_PAGE', payload: 'editor' });
  }

  function handleNewInvoiceForClient(clientId) {
    handleNewInvoice();
    const c = state.clients.find(x => x.id === clientId);
    if (c) {
      setTimeout(() => {
        const elName = document.getElementById('to-name');
        const elEmail = document.getElementById('to-email');
        const elPhone = document.getElementById('to-phone');
        const elAddr = document.getElementById('to-address');
        if (elName) elName.value = c.name || '';
        if (elEmail) elEmail.value = c.email || '';
        if (elPhone) elPhone.value = c.phone || '';
        if (elAddr) elAddr.value = c.address || '';
      }, 50);
    }
  }

  function handleCloseEditor() {
    dispatch({ type: 'SET_CURRENT_INVOICE', payload: null });
    dispatch({ type: 'SET_PAGE', payload: 'invoices' });
  }

  if (!state.user) {
    return <><AuthPage showToast={showToast} /><ToastContainer /></>;
  }

  return (
    <div className="app">
      <style>{`
        @media print {
          .nav, .editor-sidebar, .preview-toolbar, .editor-preview > *:not(.preview-doc) { display:none !important; }
          .editor-preview { padding:0 !important; background:#fff !important; }
          .preview-doc { box-shadow:none !important; border-radius:0 !important; width:100% !important; margin:0 !important; }
          body { background:#fff; }
        }
        @keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {state.page !== 'editor' && <Navbar onNewInvoice={handleNewInvoice} />}

      <div className="page active" style={state.page === 'editor' ? { display: 'flex', flex: 1 } : { overflowY: 'auto', flex: 1 }}>
        {state.page === 'dashboard' && <Dashboard onNewInvoice={handleNewInvoice} onEdit={handleEditInvoice} onDuplicate={handleDuplicateInvoice} onDelete={handleDeleteInvoice} onNavigate={handleNavigate} />}
        {state.page === 'invoices' && <InvoiceList onEdit={handleEditInvoice} onNewInvoice={handleNewInvoice} toast={showToast} />}
        {state.page === 'clients' && <ClientList newInvoiceForClient={handleNewInvoiceForClient} toast={showToast} />}
        {state.page === 'settings' && <Settings toast={showToast} />}
        {state.page === 'billing' && <Billing toast={showToast} />}
        {state.page === 'editor' && <Editor onClose={handleCloseEditor} toast={showToast} />}
      </div>

      <ToastContainer />
    </div>
  );
}
