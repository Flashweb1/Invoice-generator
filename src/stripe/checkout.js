const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise = null;

async function getStripe() {
  if (!STRIPE_PK) return null;
  if (stripePromise) return stripePromise;
  const { loadStripe } = await import('@stripe/stripe-js');
  stripePromise = loadStripe(STRIPE_PK);
  return stripePromise;
}

export async function createCheckoutSession(priceId, mode = 'subscription') {
  const stripe = await getStripe();
  if (!stripe) {
    // Demo mode — simulate success
    return { type: 'demo', message: 'Set VITE_STRIPE_PUBLISHABLE_KEY in .env to enable live payments' };
  }

  // In production, this would call your backend to create a Stripe Checkout Session
  // For now, redirect directly (requires Stripe Price IDs)
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode,
    successUrl: window.location.origin + '/dashboard',
    cancelUrl: window.location.origin + '/billing',
  });

  if (error) throw error;
}

export function isStripeConfigured() {
  return STRIPE_PK.length > 0;
}
