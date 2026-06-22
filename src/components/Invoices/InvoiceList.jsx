import { useState } from 'react';
import { useStore } from '../../context/InvoiceContext';
import { invTotal, fmt } from '../../utils/format';

const statusMap = { Paid: 'badge-green', Sent: 'badge-blue', Draft: 'badge-gray', Overdue: 'badge-red' };
const FILTERS = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'];

export default function InvoiceList({ onEdit, onNewInvoice, onDuplicate, onDelete, toast }) {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  let list = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (search) list = list.filter(i => (i.toName + i.num + i.fromName).toLowerCase().includes(search.toLowerCase()));
  if (statusFilter !== 'All') list = list.filter(i => i.status === statusFilter);

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div className="page-header">
        <div>
          <div className="page-header-title">Invoices</div>
          <div className="page-header-sub">Manage and track all your invoices</div>
        </div>
        <button className="btn btn-primary" onClick={onNewInvoice}>+ New Invoice</button>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button key={f} className={`filter-tab${statusFilter === f ? ' active' : ''}`}
              onClick={() => setStatusFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-input" style={{ width: 240 }} placeholder="Search invoices..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-count">{list.length} invoice{list.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="card-table">
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
                    <button className="btn btn-outline btn-sm btn-icon" onClick={() => { onDuplicate(inv.id); toast('Invoice duplicated', 'success'); }} title="Duplicate">📋</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => { onDelete(inv.id); toast('Deleted'); }} title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-icon">🧾</div>
                  <div className="empty-title">No invoices</div>
                  <div className="empty-text">Hit "+ New Invoice" to create your first one</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
