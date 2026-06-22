import { useState } from 'react';
import { useStore } from '../../context/InvoiceContext';
import { loadFromStorage } from '../../utils/load-storage';
import * as authService from '../../firebase/auth';

function makeUserSession(dispatch, user) {
  dispatch({ type: 'SET_USER', payload: user });
  const data = loadFromStorage();
  const patch = { page: 'dashboard' };
  if (data.invoices.length) patch.invoices = data.invoices;
  if (data.clients.length) patch.clients = data.clients;
  if (data.settings) patch.settings = data.settings;
  dispatch({ type: 'SET_STATE', payload: patch });
}

export default function AuthPage({ showToast }) {
  const { dispatch } = useStore();
  const [view, setView] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  function demoLogin() {
    makeUserSession(dispatch, { uid: 'demo', name: 'Jane Doe', email: 'jane@example.com' });
  }

  async function handleGoogleSignIn() {
    if (authService.isConfigured) {
      try {
        const user = await authService.signInWithGoogle();
        if (user) { makeUserSession(dispatch, user); return; }
      } catch { showToast('Google sign-in failed, using demo', 'error'); }
    }
    demoLogin();
  }

  async function handleEmailSignIn() {
    if (!loginEmail || !loginPass) { showToast('Enter email and password', 'error'); return; }
    if (authService.isConfigured) {
      try {
        const user = await authService.signInWithEmail(loginEmail, loginPass);
        if (user) { makeUserSession(dispatch, user); return; }
      } catch (e) { showToast(e.message || 'Sign-in failed', 'error'); return; }
    }
    makeUserSession(dispatch, { uid: 'demo', name: loginEmail.split('@')[0], email: loginEmail });
  }

  async function handleRegister() {
    if (!regName || !regEmail || !regPass) { showToast('Fill all fields', 'error'); return; }
    if (authService.isConfigured) {
      try {
        const user = await authService.createAccount(regEmail, regPass, regName);
        if (user) { makeUserSession(dispatch, user); return; }
      } catch (e) { showToast(e.message || 'Registration failed', 'error'); return; }
    }
    makeUserSession(dispatch, { uid: 'demo', name: regName, email: regEmail });
  }

  async function handleReset() {
    if (!resetEmail) { showToast('Enter your email', 'error'); return; }
    if (authService.isConfigured) {
      try {
        await authService.sendPasswordReset(resetEmail);
        showToast('Reset link sent!', 'success');
      } catch { showToast('Failed to send reset link', 'error'); }
    } else {
      showToast('Connect Firebase to send password resets', 'success');
    }
    setView('login');
  }

  return (
    <div style={{
      background: '#F8F9FB', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420, margin: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, background: '#0B0F1A', borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#fff',
            fontStyle: 'italic', marginBottom: 12
          }}>I</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.5px' }}>Invoice Me</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Professional invoices, done fast.</div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16,
          padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)'
        }}>
          {view === 'login' && (
            <div>
              <button onClick={handleGoogleSignIn} style={{
                width: '100%', padding: '11px 20px', border: '1.5px solid #E5E7EB',
                borderRadius: 10, background: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: '#9CA3AF', fontSize: 12 }}>
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                or sign in with email
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 5 }}>Email</label>
                <input className="form-input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 5 }}>Password</label>
                <input className="form-input" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handleEmailSignIn}>Sign in</button>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 }}>
                No account? <a style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }} onClick={() => setView('register')}>Create one free →</a>
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 8 }}>
                <a style={{ cursor: 'pointer' }} onClick={() => setView('reset')}>Forgot password?</a>
              </div>
            </div>
          )}

          {view === 'register' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Full name</label>
                <input className="form-input" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Min 8 characters" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handleRegister}>Create account</button>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 }}>
                Have an account? <a style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }} onClick={() => setView('login')}>Sign in</a>
              </div>
            </div>
          )}

          {view === 'reset' && (
            <div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Enter your email and we'll send a reset link.</p>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handleReset}>Send reset link</button>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 }}>
                <a style={{ cursor: 'pointer' }} onClick={() => setView('login')}>← Back to sign in</a>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={demoLogin}>Continue as demo (no account needed)</button>
        </div>
      </div>
    </div>
  );
}
