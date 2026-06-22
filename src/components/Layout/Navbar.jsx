import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/InvoiceContext';

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

  const pages = ['dashboard', 'invoices', 'clients', 'settings'];

  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #E5E7EB',
      padding: '0 32px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 60, position: 'sticky',
      top: 0, zIndex: 200
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 15, letterSpacing: '-.3px' }}>
        <div style={{
          width: 32, height: 32, background: '#0B0F1A', borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#fff', fontStyle: 'italic'
        }}>I</div>
        Invoice Me
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {pages.map(p => (
          <button
            key={p}
            className={`nav-link${state.page === p ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_PAGE', payload: p })}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-primary btn-sm" onClick={onNewInvoice}>+ New Invoice</button>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div
            className="avatar"
            onClick={() => setMenuOpen(o => !o)}
            style={{ cursor: 'pointer' }}
          >
            {(state.settings.name || state.user?.name || 'U')[0].toUpperCase()}
          </div>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,.12)', minWidth: 160,
              zIndex: 300, overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 14px', borderBottom: '1px solid #E5E7EB'
              }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{state.settings.name || state.user?.name}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{state.user?.email}</div>
              </div>
              <button
                style={{ width: '100%', padding: '9px 14px', fontSize: 13, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
                onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'billing' }); setMenuOpen(false); }}
              >Billing</button>
              <button
                style={{ width: '100%', padding: '9px 14px', fontSize: 13, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
                onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'settings' }); setMenuOpen(false); }}
              >Settings</button>
              <div style={{ height: 1, background: '#E5E7EB', margin: '4px 0' }} />
              <button
                style={{ width: '100%', padding: '9px 14px', fontSize: 13, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                onClick={() => { dispatch({ type: 'LOGOUT' }); setMenuOpen(false); }}
              >Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
