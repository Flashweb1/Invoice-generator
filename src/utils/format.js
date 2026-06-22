import { CUR } from '../constants/templates';

export function fmt(n, cur = 'USD') {
  const sym = CUR[cur] || '$';
  const rounded = Math.round(n * 100) / 100;
  if (cur === 'JPY') return sym + Math.round(rounded).toLocaleString();
  return sym + rounded.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function invTotal(inv) {
  let sub = (inv.items||[]).reduce((s,i) => s + (parseFloat(i.price)||0) * (parseFloat(i.qty)||0), 0);
  let disc = inv.discountType === 'pct' ? sub * ((inv.discount||0)/100) : (inv.discount||0);
  let tax = (sub - disc) * ((inv.tax||0)/100);
  return sub - disc + tax;
}
