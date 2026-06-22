export function loadFromStorage() {
  try {
    return {
      invoices: JSON.parse(localStorage.getItem('ik_invoices') || '[]'),
      clients: JSON.parse(localStorage.getItem('ik_clients') || '[]'),
      settings: JSON.parse(localStorage.getItem('ik_settings') || 'null'),
    };
  } catch {
    return { invoices: [], clients: [], settings: null };
  }
}
