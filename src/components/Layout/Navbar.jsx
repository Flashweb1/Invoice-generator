import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/InvoiceContext';

const navItems = [
  { id: 'dashboard', icon: '◨', label: 'Dashboard' },
  { id: 'invoices', icon: '📄', label: 'Invoices' },
  { id: 'clients', icon: '👥', label: 'Clients' },
  { id: 'ai', icon: '🤖', label: 'AI Assistant' },
  { id: 'billing', icon: '💳', label: 'Billing' },
];

export default function Navbar({ onNewInvoice }) {
  const { state, dispatch } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function handleNav(page) {
    dispatch({ type: 'SET_PAGE', payload: page });
  }

  const name = state.settings.name || state.user?.name || 'User';
  const email = state.user?.email || '';
  const initial = name[0].toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">I</div>
        <span className="sidebar-brand">Invoice Me</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-link${state.page === item.id ? ' active' : ''}`}
            onClick={() => handleNav(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-primary btn-sm" onClick={onNewInvoice} style={{ width: '100%', marginBottom: 8 }}>
          + New Invoice
        </button>
        <button
          className="sidebar-link"
          onClick={() => handleNav('settings')}
          style={{ padding: '8px 12px' }}
        >
          <span className="sidebar-icon">⚙</span>
          <span className="sidebar-label">Settings</span>
        </button>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="sidebar-link"
            onClick={() => setMenuOpen(o => !o)}
            style={{ padding: '8px 12px' }}
          >
            <span className="sidebar-icon">
              <span className="avatar" style={{ width: 26, height: 26, fontSize: 11, display: 'inline-flex' }}>{initial}</span>
            </span>
            <span className="sidebar-label" style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', left: 0, bottom: 'calc(100% + 4px)',
              background: '#fff', border: '1px solid var(--line)', borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,.12)', minWidth: 180,
              zIndex: 300, overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{email}</div>
              </div>
              <button
                className="dropdown-item"
                onClick={() => { setMenuOpen(false); handleNav('settings'); }}
              >Settings</button>
              <div style={{ height: 1, background: '#E5E7EB' }} />
              <button
                className="dropdown-item"
                style={{ color: '#DC2626' }}
                onClick={() => { dispatch({ type: 'LOGOUT' }); setMenuOpen(false); }}
              >Sign out</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
