import { useState, useEffect } from 'react';
import { useStore } from '../../context/InvoiceContext';

const tabs = [
  { id: 'profile', icon: '👤', label: 'Profile' },
  { id: 'business', icon: '🏢', label: 'Business' },
  { id: 'plan', icon: '⭐', label: 'Plan' },
  { id: 'tax', icon: '🧮', label: 'Tax & Currency' },
  { id: 'numbering', icon: '🔢', label: 'Invoice Numbering' },
];

export default function Settings({ toast }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('profile');
  const [s, setS] = useState({ ...state.settings });

  useEffect(() => { setS({ ...state.settings }); }, [state.settings]);

  function update(field, value) { setS(prev => ({ ...prev, [field]: value })); }

  function saveSettings(patch) {
    dispatch({ type: 'SET_SETTINGS', payload: { ...s, ...patch } });
    toast('Saved', 'success');
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', flex: 1 }}>
      <div style={{
        width: 220, background: '#fff', borderRight: '1px solid #E5E7EB',
        padding: '24px 16px', flexShrink: 0
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`settings-nav-item${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 32, maxWidth: 640, flex: 1 }}>
        {/* Profile */}
        {tab === 'profile' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Profile</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Your personal account details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Full name</label><input className="form-input" value={s.name} onChange={e => update('name', e.target.value)} placeholder="Jane Doe" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={s.email} onChange={e => update('email', e.target.value)} placeholder="jane@example.com" /></div>
            </div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={s.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 555 0100" /></div>
            <button className="btn btn-primary" onClick={() => saveSettings({ name: s.name, email: s.email, phone: s.phone })}>Save profile</button>
          </div>
        )}

        {/* Business */}
        {tab === 'business' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Business details</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>These appear on your invoices automatically</div>
            <div className="form-group"><label className="form-label">Business name</label><input className="form-input" value={s.bizName} onChange={e => update('bizName', e.target.value)} placeholder="Acme Design Studio" /></div>
            <div className="form-group"><label className="form-label">Address</label><textarea className="form-input" rows={3} value={s.bizAddress} onChange={e => update('bizAddress', e.target.value)} placeholder="123 Main St, City, State 10001" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={s.bizEmail} onChange={e => update('bizEmail', e.target.value)} placeholder="hello@acme.com" /></div>
              <div className="form-group"><label className="form-label">Website</label><input className="form-input" value={s.bizWeb} onChange={e => update('bizWeb', e.target.value)} placeholder="acme.com" /></div>
            </div>
            <div className="form-group"><label className="form-label">VAT / Tax ID</label><input className="form-input" value={s.bizTax} onChange={e => update('bizTax', e.target.value)} placeholder="GB123456789" /></div>
            <div className="form-group">
              <label className="form-label">Logo</label>
              <div className="logo-upload" style={{ maxWidth: 280 }}>
                {s.logo ? (
                  <img src={s.logo} alt="logo" className="logo-preview" />
                ) : (
                  <div>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🖼</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Upload logo (PNG/SVG)</div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => update('logo', ev.target.result);
                  reader.readAsDataURL(file);
                }} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => saveSettings({ bizName: s.bizName, bizAddress: s.bizAddress, bizEmail: s.bizEmail, bizWeb: s.bizWeb, bizTax: s.bizTax, logo: s.logo })}>Save business</button>
          </div>
        )}

        {/* Plan */}
        {tab === 'plan' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Your Plan</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Upgrade to unlock unlimited invoices and payment collection</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
              <div style={{ border: '2px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>Free</div>
                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>$0<span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>/mo</span></div>
                <ul style={{ listStyle: 'none', margin: '16px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {['5 invoices/month', '3 clients', '2 templates', 'PDF export'].map(f => <li key={f} style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 7 }}>✓ {f}</li>)}
                  {['Payment links', 'Invoice history'].map(f => <li key={f} style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 18 }}>✕ {f}</li>)}
                </ul>
                <button className="btn btn-outline" style={{ width: '100%' }} disabled>Current plan</button>
              </div>
              <div style={{ border: '2px solid #2563EB', borderRadius: 12, padding: 24, background: '#EFF6FF' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>Pro</div>
                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>$12<span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>/mo</span></div>
                <ul style={{ listStyle: 'none', margin: '16px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {['Unlimited invoices', 'Unlimited clients', 'All templates', 'PDF export', 'Stripe payment links', 'Invoice history', 'Custom branding', 'Recurring invoices'].map(f => <li key={f} style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 7 }}>✓ {f}</li>)}
                </ul>
                <button className="btn btn-blue" style={{ width: '100%' }} onClick={() => toast('Stripe integration — connect in Firebase!', 'success')}>Upgrade to Pro →</button>
              </div>
            </div>
          </div>
        )}

        {/* Tax */}
        {tab === 'tax' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Tax & Currency</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Defaults applied to every new invoice</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Default currency</label>
                <select className="form-input" value={s.currency} onChange={e => update('currency', e.target.value)}>
                  <option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option><option value="CAD">CAD — Canadian Dollar</option>
                  <option value="AUD">AUD — Australian Dollar</option><option value="JPY">JPY — Japanese Yen</option>
                  <option value="AED">AED — UAE Dirham</option><option value="INR">INR — Indian Rupee</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Default tax rate (%)</label><input className="form-input" type="number" value={s.taxRate} onChange={e => update('taxRate', parseFloat(e.target.value)||0)} min="0" max="100" /></div>
            </div>
            <div className="form-group"><label className="form-label">Tax label</label><input className="form-input" value={s.taxLabel} onChange={e => update('taxLabel', e.target.value)} placeholder="VAT" /></div>
            <div className="form-group"><label className="form-label">Default payment terms (days)</label>
              <select className="form-input" value={s.terms} onChange={e => update('terms', parseInt(e.target.value))}>
                <option value="0">Due on receipt</option><option value="7">Net 7</option>
                <option value="14">Net 14</option><option value="30">Net 30</option><option value="60">Net 60</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => saveSettings({ currency: s.currency, taxRate: s.taxRate, taxLabel: s.taxLabel, terms: s.terms })}>Save preferences</button>
          </div>
        )}

        {/* Numbering */}
        {tab === 'numbering' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Invoice Numbering</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Control how invoice numbers are generated</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Prefix</label><input className="form-input" value={s.invPrefix} onChange={e => update('invPrefix', e.target.value)} placeholder="INV-" /></div>
              <div className="form-group"><label className="form-label">Next number</label><input className="form-input" type="number" value={s.invNext} onChange={e => update('invNext', parseInt(e.target.value)||1001)} placeholder="1001" /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Preview</label>
              <div style={{ padding: '12px 14px', background: '#F3F4F6', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
                {s.invPrefix}{s.invNext}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => saveSettings({ invPrefix: s.invPrefix, invNext: s.invNext })}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
}
