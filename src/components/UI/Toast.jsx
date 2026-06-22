import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = '') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  const ToastContainer = () => (
    <div id="toast-container" style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8
    }}>
      {toasts.map(t => {
        let bg = '#0B0F1A';
        let prefix = '';
        if (t.type === 'success') { bg = '#064E3B'; prefix = '✓ '; }
        if (t.type === 'error') { bg = '#7F1D1D'; prefix = '✕ '; }
        return (
          <div key={t.id} style={{
            background: bg, color: '#fff', padding: '12px 18px', borderRadius: 10,
            fontSize: 13, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,.12)',
            animation: 'toastIn .2s ease', display: 'flex', alignItems: 'center', gap: 8
          }}>
            {prefix}{t.msg}
          </div>
        );
      })}
    </div>
  );

  return { showToast, ToastContainer };
}
