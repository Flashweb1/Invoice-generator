import { useState } from 'react';
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
import AiAssistant from './components/AI/AiAssistant';
import Editor from './components/Editor/Editor';
import { genId, today, addDays } from './utils/helpers';

export default function App() {
  const { state, dispatch } = useStore();
  const plan = usePlan();
  const { showToast, ToastContainer } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  function handleNewInvoice(clientId) {
    if (!plan.canCreateInvoice) {
      showToast('Free plan: 5 invoices/month. Upgrade to Pro or buy credits.', 'error');
      dispatch({ type: 'SET_PAGE', payload: 'billing' });
      return;
    }
    const s = state.settings;
    const c = clientId ? state.clients.find(x => x.id === clientId) : null;
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
      toName: c?.name || '', toEmail: c?.email || '', toPhone: c?.phone || '', toAddress: c?.address || '',
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
    handleNewInvoice(clientId);
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
      {state.page !== 'editor' && <Navbar onNewInvoice={handleNewInvoice} sidebarOpen={sidebarOpen} onToggleSidebar={setSidebarOpen} />}

      <div className={state.page === 'editor' ? '' : 'page-content'} style={state.page === 'editor' ? { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' } : {}}>
        {state.page !== 'editor' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }} className="mobile-topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Invoice Me</span>
          </div>
        )}
        {state.page === 'dashboard' && <Dashboard onNewInvoice={handleNewInvoice} onEdit={handleEditInvoice} onDuplicate={handleDuplicateInvoice} onDelete={handleDeleteInvoice} onNavigate={handleNavigate} />}
        {state.page === 'invoices' && <InvoiceList onEdit={handleEditInvoice} onNewInvoice={handleNewInvoice} onDuplicate={handleDuplicateInvoice} onDelete={handleDeleteInvoice} toast={showToast} />}
        {state.page === 'clients' && <ClientList newInvoiceForClient={handleNewInvoiceForClient} toast={showToast} />}
        {state.page === 'settings' && <Settings toast={showToast} />}
        {state.page === 'billing' && <Billing toast={showToast} />}
        {state.page === 'ai' && <AiAssistant toast={showToast} />}
        {state.page === 'editor' && <Editor onClose={handleCloseEditor} toast={showToast} />}
      </div>

      <ToastContainer />
    </div>
  );
}
