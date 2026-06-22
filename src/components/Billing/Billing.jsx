import { usePlan } from '../../context/PlanContext';
import { useStore } from '../../context/InvoiceContext';
import { createCheckoutSession, isStripeConfigured } from '../../stripe/checkout';

const PRO_PRICE_ID = import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '';
const CREDIT_10_PRICE_ID = import.meta.env.VITE_STRIPE_CREDIT_10_PRICE_ID || '';
const CREDIT_50_PRICE_ID = import.meta.env.VITE_STRIPE_CREDIT_50_PRICE_ID || '';

export default function Billing({ toast }) {
  const plan = usePlan();
  const { dispatch } = useStore();

  async function handleProUpgrade() {
    if (!isStripeConfigured()) {
      dispatch({ type: 'SET_SETTINGS', payload: { plan: 'pro' } });
      toast('Upgraded to Pro (demo mode — set Stripe keys for live payments)', 'success');
      return;
    }
    const result = await createCheckoutSession(PRO_PRICE_ID, 'subscription');
    if (result?.type === 'demo') toast(result.message, 'success');
  }

  async function handleBuyCredits(priceId, qty) {
    if (!isStripeConfigured()) {
      dispatch({ type: 'SET_SETTINGS', payload: { creditBalance: (plan.creditsRemaining || 0) + qty } });
      toast(`Added ${qty} invoice credits (demo mode)`, 'success');
      return;
    }
    const result = await createCheckoutSession(priceId, 'payment');
    if (result?.type === 'demo') toast(result.message, 'success');
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.4px' }}>Billing & Plan</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Manage your subscription and invoice credits.</div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 640 }}>
        {/* Current plan */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Current Plan</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px', textTransform: 'capitalize' }}>{plan.plan}</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            {plan.invoicesThisMonth} / {plan.limits?.maxInvoicesPerMonth || '∞'} invoices this month · {plan.clientCount} / {plan.limits?.maxClients || '∞'} clients
            {plan.creditsRemaining > 0 && ` · ${plan.creditsRemaining} credit${plan.creditsRemaining !== 1 ? 's' : ''} remaining`}
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ border: '2px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>Free</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>$0</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ 5 invoices/month</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ 3 clients</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ 2 templates</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ PDF export</li>
            </ul>
            {plan.plan === 'free' ? (
              <button className="btn btn-outline" style={{ width: '100%' }} disabled>Current</button>
            ) : null}
          </div>
          <div style={{ border: '2px solid #2563EB', borderRadius: 12, padding: 24, background: '#EFF6FF' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>Pro</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>$12<span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ Unlimited invoices</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ Unlimited clients</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ All 6 templates</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ Custom branding</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ Recurring invoices</li>
              <li style={{ fontSize: 12, color: '#374151' }}>✓ Stripe payment links</li>
            </ul>
            <button className="btn btn-blue" style={{ width: '100%' }} onClick={handleProUpgrade}>
              {plan.plan === 'pro' ? 'Current' : 'Upgrade →'}
            </button>
          </div>
        </div>

        {/* Credit packs */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>Invoice Credit Packs</div>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Buy extra invoices without upgrading to Pro. Credits never expire.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleBuyCredits(CREDIT_10_PRICE_ID, 10)}>Buy 10 — $10</button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleBuyCredits(CREDIT_50_PRICE_ID, 50)}>Buy 50 — $40</button>
          </div>
        </div>
      </div>
    </div>
  );
}
