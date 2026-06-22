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
    const c = { ...form, id: editId || genId(), color: randomColor() };
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
      <div style={{ padding: '32px 32px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.4px' }}>Clients</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Your client address book</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>+ New Client</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, padding: '24px 32px' }}>
        {!state.clients.length ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No clients yet</div>
            <div>Save client details so you can fill invoices faster</div>
            <button className="btn btn-primary btn-sm mt-4" onClick={() => openModal(null)}>Add client</button>
          </div>
        ) : state.clients.map(c => (
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

      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, width: '100%',
            maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,.12)'
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Add Client</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Save client details for quick fill</div>
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
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
