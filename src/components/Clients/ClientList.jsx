import { useState } from 'react';
import { useStore } from '../../context/InvoiceContext';
import { genId, randomColor } from '../../utils/helpers';
import { escHtml } from '../../utils/format';

export default function ClientList({ newInvoiceForClient, toast }) {
  const { state, dispatch } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', address: '' });

  function openModal(client) {
    if (client) {
      setForm({ name: client.name, company: client.company, email: client.email, phone: client.phone, address: client.address });
      setEditId(client.id);
    } else {
      setForm({ name: '', company: '', email: '', phone: '', address: '' });
      setEditId(null);
    }
    setModalOpen(true);
  }

  function save() {
    if (!form.name) { toast('Enter a name', 'error'); return; }
    const existing = editId ? state.clients.find(x => x.id === editId) : null;
    const c = { ...form, id: editId || genId(), color: existing?.color || randomColor() };
    let newClients;
    if (editId) {
      newClients = state.clients.map(x => x.id === editId ? c : x);
    } else {
      newClients = [...state.clients, c];
    }
    dispatch({ type: 'SET_CLIENTS', payload: newClients });
    setModalOpen(false);
    toast('Client saved', 'success');
  }

  function remove(id) {
    dispatch({ type: 'SET_CLIENTS', payload: state.clients.filter(c => c.id !== id) });
    toast('Deleted');
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div className="page-header">
        <div>
          <div className="page-header-title">Clients</div>
          <div className="page-header-sub">Your client address book</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>+ New Client</button>
      </div>

      {!state.clients.length ? (
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-icon">👥</div>
          <div className="empty-title">No clients yet</div>
          <div className="empty-text">Save client details so you can fill invoices faster</div>
          <button className="btn btn-primary btn-sm" onClick={() => openModal(null)}>Add client</button>
        </div>
      ) : (
        <div className="clients-grid">
          {state.clients.map(c => (
            <div key={c.id} className="client-card" onClick={() => openModal(c)}>
              <div className="client-avatar" style={{ background: c.color || '#2563EB' }}>
                {(c.name || '?')[0].toUpperCase()}
              </div>
              <div className="client-name">{escHtml(c.name)}</div>
              {c.company ? <div className="client-detail">🏢 {escHtml(c.company)}</div> : null}
              {c.email ? <div className="client-detail">✉ {escHtml(c.email)}</div> : null}
              {c.phone ? <div className="client-detail">📞 {escHtml(c.phone)}</div> : null}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); newInvoiceForClient(c.id); }}>+ Invoice</button>
                <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); remove(c.id); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-title">{editId ? 'Edit' : 'Add'} Client</div>
            <div className="modal-sub">Save client details for quick fill</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Acme Inc." />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@acme.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 0100" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-input" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="456 Oak Ave, City" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
