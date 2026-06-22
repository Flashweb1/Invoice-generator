export function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(d, days) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function randomColor() {
  const colors = ['#2563EB','#059669','#7C3AED','#D97706','#DC2626','#0891B2','#9333EA'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function statusBadge(s) {
  const map = { Paid:'badge-green', Sent:'badge-blue', Draft:'badge-gray', Overdue:'badge-red' };
  return `<span class="badge ${map[s]||'badge-gray'}">${s}</span>`;
}
