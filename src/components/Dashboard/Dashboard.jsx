import { useStore } from '../../context/InvoiceContext';
import { invTotal, fmt } from '../../utils/format';

export default function Dashboard({ onNewInvoice, onEdit, onDuplicate, onDelete, onNavigate }) {
  const { state } = useStore();

  const now = new Date();
  const hr = now.getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const name = (state.settings.name || state.user?.name || '').split(' ')[0];

  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let revenue = 0, outstanding = 0, outCount = 0, paid = 0, paidCount = 0, overdue = 0, overdueCount = 0;
  state.invoices.forEach(inv => {
    const total = invTotal(inv);
    if (inv.status === 'Paid') {
      revenue += total;
      const d = new Date(inv.date);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) { paid += total; paidCount++; }
    }
    if (inv.status === 'Sent') { outstanding += total; outCount++; }
    if (inv.status === 'Overdue') { overdue += total; overdueCount++; }
  });

  const recent = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const statusColors = { Paid: 'var(--green)', Sent: 'var(--blue)', Draft: 'var(--ink-4)', Overdue: 'var(--red)' };
  const statusDots = { Paid: '#059669', Sent: '#2563EB', Draft: '#9CA3AF', Overdue: '#DC2626' };
  const activity = [...state.invoices].sort((a, b) => new Date(b.date + 'T' + (b.updatedAt || '00:00')) - new Date(a.date + 'T' + (a.updatedAt || '00:00'))).slice(0, 5);

  const stats = [
    { label: 'Total Revenue', value: fmt(revenue), color: 'var(--ink)', sub: 'All time' },
    { label: 'Outstanding', value: fmt(outstanding), color: 'var(--amber)', sub: `${outCount} invoice${outCount !== 1 ? 's' : ''}` },
    { label: 'Paid this month', value: fmt(paid), color: 'var(--green)', sub: `${paidCount} invoice${paidCount !== 1 ? 's' : ''}` },
    { label: 'Overdue', value: fmt(overdue), color: 'var(--red)', sub: `${overdueCount} invoice${overdueCount !== 1 ? 's' : ''}` },
  ];

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div className="page-header">
        <div>
          <div className="page-header-title">{greet}, {name} 👋</div>
          <div className="page-header-sub">
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button className="btn btn-primary" onClick={onNewInvoice}>+ New Invoice</button>
      </div>

      <div className="bento">
        <div className="bento-row bento-row-4">
          {stats.map(s => (
            <div key={s.label} className="bento-card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div className="stat-bar" style={{ background: s.color }} />
                <div className="stat-label">{s.label}</div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="bento-row bento-row-2">
          <div className="bento-card">
            <div className="stat-label" style={{ marginBottom: 14 }}>Quick Actions</div>
            <button className="action-btn" onClick={onNewInvoice}>
              <div className="action-icon" style={{ background: 'var(--blue-l)' }}>🧾</div>
              New Invoice
            </button>
            <button className="action-btn" onClick={() => onNavigate('clients')}>
              <div className="action-icon" style={{ background: 'var(--green-l)' }}>👤</div>
              Add Client
            </button>
            <button className="action-btn" onClick={() => onNavigate('billing')}>
              <div className="action-icon" style={{ background: 'var(--amber-l)' }}>⭐</div>
              Upgrade Plan
            </button>
          </div>

          <div className="bento-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>Recent Activity</div>
            {activity.length ? activity.map(inv => (
              <div key={inv.id} className="activity-item">
                <div className="activity-dot" style={{ background: statusDots[inv.status] || '#9CA3AF' }} />
                <div className="activity-body">
                  <div className="activity-text">
                    <strong>{inv.num}</strong> to {inv.toName || 'Unknown'}
                    <span className={`badge ${inv.status === 'Paid' ? 'badge-green' : inv.status === 'Sent' ? 'badge-blue' : inv.status === 'Overdue' ? 'badge-red' : 'badge-gray'}`} style={{ marginLeft: 8 }}>{inv.status}</span>
                  </div>
                  <div className="activity-time">{fmt(invTotal(inv), inv.currency || 'USD')} &middot; {inv.date}</div>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                <div className="empty-title">No activity yet</div>
                <div className="empty-text">Create your first invoice</div>
                <button className="btn btn-primary btn-sm" onClick={onNewInvoice}>Create invoice</button>
              </div>
            )}
          </div>
        </div>

        <div className="card-table">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Recent Invoices</div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('invoices')}>View all</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th><th>Client</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? recent.map(inv => (
                <tr key={inv.id}>
                  <td><span style={{ fontWeight: 600 }}>{inv.num}</span></td>
                  <td>{inv.toName || '—'}</td>
                  <td>{inv.date || '—'}</td>
                  <td>{inv.due || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(invTotal(inv), inv.currency || 'USD')}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => onEdit(inv.id)} title="Edit">✏️</button>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => onDuplicate(inv.id)} title="Duplicate">📋</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(inv.id)} title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon">🧾</div>
                    <div className="empty-title">No invoices yet</div>
                    <div className="empty-text">Create your first invoice to get started</div>
                    <button className="btn btn-primary btn-sm" onClick={onNewInvoice}>Create invoice</button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Paid: 'badge-green', Sent: 'badge-blue', Draft: 'badge-gray', Overdue: 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}
