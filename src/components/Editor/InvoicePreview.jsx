import { TEMPLATES } from '../../constants/templates';
import { fmt, escHtml } from '../../utils/format';

export default function InvoicePreview({ inv, template, logo, sidebarValues }) {
  const cur = sidebarValues?.currency || inv.currency || 'USD';
  const taxRate = sidebarValues?.tax ?? inv.tax ?? 0;
  const disc = sidebarValues?.discount ?? inv.discount ?? 0;
  const discType = sidebarValues?.discountType || inv.discountType || 'pct';
  const fromName = sidebarValues?.fromName ?? inv.fromName ?? '';
  const fromEmail = sidebarValues?.fromEmail ?? inv.fromEmail ?? '';
  const fromPhone = sidebarValues?.fromPhone ?? inv.fromPhone ?? '';
  const fromAddr = sidebarValues?.fromAddress ?? inv.fromAddress ?? '';
  const toName = sidebarValues?.toName ?? inv.toName ?? '';
  const toEmail = sidebarValues?.toEmail ?? inv.toEmail ?? '';
  const toPhone = sidebarValues?.toPhone ?? inv.toPhone ?? '';
  const toAddr = sidebarValues?.toAddress ?? inv.toAddress ?? '';
  const notes = sidebarValues?.notes ?? inv.notes ?? '';
  const invNum = sidebarValues?.invNum ?? inv.num ?? '';
  const invDate = sidebarValues?.invDate ?? inv.date ?? '';
  const invDue = sidebarValues?.invDue ?? inv.due ?? '';
  const docType = inv.docType || 'invoice';
  const tpl = template || 'modern';
  const T = TEMPLATES[tpl];
  const logoUrl = logo || inv.logo;

  let subtotal = 0;
  (inv.items || []).forEach(i => subtotal += (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0));
  const discAmt = discType === 'pct' ? subtotal * (disc / 100) : disc;
  const taxed = (subtotal - discAmt) * (taxRate / 100);
  const total = subtotal - discAmt + taxed;

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" style="max-height:60px;max-width:160px;object-fit:contain;display:block;margin-bottom:6px"/>`
    : `<div style="width:48px;height:48px;border-radius:10px;background:${T.accent};margin-bottom:8px"></div>`;

  const isDark = tpl === 'modern' || tpl === 'bold' || tpl === 'slate';
  const detailColor = isDark ? 'rgba(255,255,255,.7)' : '#6b7280';
  const metaColor = isDark ? 'rgba(255,255,255,.5)' : '#9ca3af';

  const fromBlock = `
    ${logoHtml}
    <div style="font-weight:800;font-size:16px;color:${isDark ? T.headerText : '#111'}">${escHtml(fromName || 'Your Company')}</div>
    ${fromEmail ? `<div style="font-size:12px;color:${detailColor}">${escHtml(fromEmail)}</div>` : ''}
    ${fromPhone ? `<div style="font-size:12px;color:${detailColor}">${escHtml(fromPhone)}</div>` : ''}
    ${fromAddr ? `<div style="font-size:12px;color:${detailColor};white-space:pre-line">${escHtml(fromAddr)}</div>` : ''}
  `;

  const titleBlock = `
    <div style="font-size:34px;font-weight:900;letter-spacing:-1.5px;color:${isDark ? T.headerText : T.accent};text-transform:uppercase;line-height:1">${docType === 'receipt' ? 'Receipt' : 'Invoice'}</div>
    <div style="font-size:13px;font-weight:600;color:${isDark ? 'rgba(255,255,255,.6)' : '#6b7280'};margin-top:6px">#${escHtml(invNum)}</div>
    <div style="font-size:12px;color:${metaColor};margin-top:2px">Date: ${invDate}</div>
    ${docType !== 'receipt' && invDue ? `<div style="font-size:12px;color:${metaColor}">Due: ${invDue}</div>` : ''}
  `;

  let header = '';
  if (tpl === 'bold') {
    header = `<div style="background:${T.accent};color:#fff;margin:-60px -64px 32px;padding:40px 64px 32px;display:flex;justify-content:space-between;align-items:flex-start"><div>${fromBlock}</div><div style="text-align:right">${titleBlock}</div></div>`;
  } else if (tpl === 'modern' || tpl === 'slate') {
    header = `<div style="background:${T.headerBg};color:#fff;margin:-60px -64px 32px;padding:36px 64px 28px;display:flex;justify-content:space-between;align-items:flex-start;border-radius:0"><div>${fromBlock}</div><div style="text-align:right">${titleBlock}</div></div>`;
  } else {
    header = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px"><div>${fromBlock}</div><div style="text-align:right">${titleBlock}</div></div><div style="height:3px;background:${T.accent};border-radius:2px;margin-bottom:28px"></div>`;
  }

  const billTo = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:28px">
    <div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:${T.accent};margin-bottom:6px">Bill To</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:4px">${escHtml(toName || 'Client Name')}</div>
      ${toEmail ? `<div style="font-size:12px;color:#6b7280">${escHtml(toEmail)}</div>` : ''}
      ${toPhone ? `<div style="font-size:12px;color:#6b7280">${escHtml(toPhone)}</div>` : ''}
      ${toAddr ? `<div style="font-size:12px;color:#6b7280;white-space:pre-line">${escHtml(toAddr)}</div>` : ''}
    </div>
  </div>`;

  const thead = `<thead><tr style="background:${T.tableHeadBg}">
    <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${T.tableHeadText};border-bottom:2px solid ${T.accent}">Description</th>
    <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${T.tableHeadText};border-bottom:2px solid ${T.accent}">Qty</th>
    <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${T.tableHeadText};border-bottom:2px solid ${T.accent}">Unit Price</th>
    <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${T.tableHeadText};border-bottom:2px solid ${T.accent}">Total</th>
  </tr></thead>`;

  const tbody = (inv.items || []).map((item, i) => `<tr style="background:${i % 2 === 1 ? T.altRow : 'transparent'}">
    <td style="padding:11px 12px;font-size:13px">${escHtml(item.desc || '—')}</td>
    <td style="padding:11px 12px;font-size:13px;text-align:right">${item.qty}</td>
    <td style="padding:11px 12px;font-size:13px;text-align:right">${fmt(parseFloat(item.price) || 0, cur)}</td>
    <td style="padding:11px 12px;font-size:13px;text-align:right;font-weight:600">${fmt((parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0), cur)}</td>
  </tr>`).join('');

  const totals = `<div style="display:flex;justify-content:flex-end;margin-top:16px">
    <div style="min-width:240px">
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#555"><span>Subtotal</span><span>${fmt(subtotal, cur)}</span></div>
      ${disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#059669"><span>Discount ${discType === 'pct' ? `(${disc}%)` : '(flat)'}</span><span>−${fmt(discAmt, cur)}</span></div>` : ''}
      ${taxRate > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#555"><span>Tax (${taxRate}%)</span><span>${fmt(taxed, cur)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:13px 14px;background:${T.accent};border-radius:9px;color:#fff;font-size:16px;font-weight:800;margin-top:8px"><span>Total</span><span>${fmt(total, cur)}</span></div>
    </div>
  </div>`;

  const notesHtml = notes ? `<div style="margin-top:32px;padding-top:18px;border-top:1px solid #e5e7eb">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${T.accent};margin-bottom:6px">Notes</div>
    <div style="font-size:12px;color:#6b7280;white-space:pre-wrap">${escHtml(notes)}</div>
  </div>` : '';

  return (
    <div
      id="preview-doc"
      className="preview-doc"
      style={{ fontFamily: "'Inter', sans-serif" }}
      dangerouslySetInnerHTML={{
        __html: `
          ${header}
          ${billTo}
          <table style="width:100%;border-collapse:collapse">${thead}<tbody>${tbody}</tbody></table>
          ${totals}
          ${notesHtml}
          <div style="margin-top:48px;text-align:center;font-size:11px;color:#d1d5db">Thank you for your business.</div>
        `
      }}
    />
  );
}
