import { createContext, useContext, useMemo } from 'react';
import { useStore } from './InvoiceContext';

const FREE_LIMITS = {
  maxInvoicesPerMonth: 5,
  maxClients: 3,
};

const ctx = createContext(null);

export function PlanProvider({ children }) {
  const { state } = useStore();

  const plan = useMemo(() => {
    const userPlan = state.settings.plan || 'free';
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${now.getMonth()}`;

    const invoicesThisMonth = state.invoices.filter(inv => {
      const d = new Date(inv.date);
      return `${d.getFullYear()}-${d.getMonth()}` === thisMonth;
    }).length;

    const clientCount = state.clients.length;

    const limits = userPlan === 'pro' ? null : FREE_LIMITS;

    const canCreateInvoice = userPlan === 'pro' || invoicesThisMonth < FREE_LIMITS.maxInvoicesPerMonth;
    const canCreateClient = userPlan === 'pro' || clientCount < FREE_LIMITS.maxClients;
    const creditsRemaining = state.settings.creditBalance || 0;

    return {
      plan: userPlan,
      invoicesThisMonth,
      clientCount,
      canCreateInvoice: canCreateInvoice || creditsRemaining > 0,
      canCreateClient,
      limits,
      creditsRemaining,
    };
  }, [state.invoices, state.clients, state.settings.plan, state.settings.creditBalance]);

  return <ctx.Provider value={plan}>{children}</ctx.Provider>;
}

export function usePlan() {
  return useContext(ctx);
}
