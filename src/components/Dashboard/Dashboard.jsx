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

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div style={{ padding: '32px 32px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.4px' }}>{greet}, {name} 👋</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button className="btn btn-primary" onClick={onNewInvoice}>+ New Invoice</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, padding: '24px 32px' }}>
        {[
          { label: 'Total Revenue', value: fmt(revenue), color: '#0B0F1A', sub: 'All time' },
          { label: 'Outstanding', value: fmt(outstanding), color: '#D97706', sub: `${outCount} invoice${outCount !== 1 ? 's' : ''}` },
          { label: 'Paid this month', value: fmt(paid), color: '#059669', sub: `${paidCount} invoice${paidCount !== 1 ? 's' : ''}` },
          { label: 'Overdue', value: fmt(overdue), color: '#DC2626', sub: `${overdueCount} invoice${overdueCount !== 1 ? 's' : ''}` },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 3, height: 32, borderRadius: 3, background: s.color }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px', lineHeight: 1, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 32px 32px' }}>
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
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No invoices yet</div>
                  <div>Create your first invoice to get started</div>
                  <button className="btn btn-primary btn-sm mt-4" onClick={onNewInvoice}>Create invoice</button>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Paid: 'badge-green', Sent: 'badge-blue', Draft: 'badge-gray', Overdue: 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}
