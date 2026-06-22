import { useState } from 'react';
import { useStore } from '../../context/InvoiceContext';
import { invTotal, fmt } from '../../utils/format';

const statusMap = { Paid: 'badge-green', Sent: 'badge-blue', Draft: 'badge-gray', Overdue: 'badge-red' };

export default function InvoiceList({ onEdit, onNewInvoice, toast }) {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  let list = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (search) list = list.filter(i => (i.toName + i.num + i.fromName).toLowerCase().includes(search.toLowerCase()));
  if (statusFilter) list = list.filter(i => i.status === statusFilter);

  function duplicate(id) {
    const orig = state.invoices.find(i => i.id === id);
    if (!orig) return;
    const dup = JSON.parse(JSON.stringify(orig));
    dup.id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    dup.num = state.settings.invPrefix + (state.settings.invNext || 1001);
    dup.status = 'Draft';
    dup.date = new Date().toISOString().slice(0, 10);
    const newInvs = [...state.invoices, dup];
    const newNext = (state.settings.invNext || 1001) + 1;
    dispatch({ type: 'SET_INVOICES', payload: newInvs });
    dispatch({ type: 'SET_SETTINGS', payload: { invNext: newNext } });
    toast('Invoice duplicated', 'success');
  }

  function remove(id) {
    dispatch({ type: 'SET_INVOICES', payload: state.invoices.filter(i => i.id !== id) });
    toast('Deleted');
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div style={{ padding: '32px 32px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.4px' }}>Invoices</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Manage and track all your invoices</div>
        </div>
        <button className="btn btn-primary" onClick={onNewInvoice}>+ New Invoice</button>
      </div>

      <div style={{ padding: '20px 32px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option>
        </select>
      </div>

      <div style={{ padding: '0 32px 32px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th><th>Client</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {list.length ? list.map(inv => (
              <tr key={inv.id}>
                <td><span style={{ fontWeight: 600 }}>{inv.num}</span></td>
                <td>{inv.toName || '—'}</td>
                <td>{inv.date || '—'}</td>
                <td>{inv.due || '—'}</td>
                <td style={{ fontWeight: 600 }}>{fmt(invTotal(inv), inv.currency || 'USD')}</td>
                <td><span className={`badge ${statusMap[inv.status] || 'badge-gray'}`}>{inv.status}</span></td>
                <td>
                  <div className="actions" style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm btn-icon" onClick={() => onEdit(inv.id)} title="Edit">✏️</button>
                    <button className="btn btn-outline btn-sm btn-icon" onClick={() => duplicate(inv.id)} title="Duplicate">📋</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(inv.id)} title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7}>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No invoices</div>
                  <div>Hit "+ New Invoice" to create your first one</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
