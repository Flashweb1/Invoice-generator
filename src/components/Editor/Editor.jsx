import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/InvoiceContext';
import { genId, today, addDays } from '../../utils/helpers';
import { callAI, isAIAvailable } from '../../services/ai';
import TemplatePicker from './TemplatePicker';
import LogoUpload from './LogoUpload';
import ItemsEditor from './ItemsEditor';
import InvoicePreview from './InvoicePreview';

export default function Editor({ onClose, toast }) {
  const { state, dispatch } = useStore();

  const isEditing = !!state.currentInvoice;
  const defaults = {
    id: genId(),
    num: state.settings.invPrefix + (state.settings.invNext || 1001),
    date: today(),
    due: addDays(today(), state.settings.terms || 30),
    status: 'Draft',
    docType: 'invoice',
    template: 'modern',
    currency: state.settings.currency || 'USD',
    tax: state.settings.taxRate || 0,
    discount: 0,
    discountType: 'pct',
    fromName: state.settings.bizName || state.settings.name,
    fromEmail: state.settings.bizEmail || state.settings.email,
    fromPhone: state.settings.phone || '',
    fromAddress: state.settings.bizAddress || '',
    toName: '', toEmail: '', toPhone: '', toAddress: '',
    items: [{ id: genId(), desc: '', qty: 1, price: '' }],
    notes: '',
    logo: state.settings.logo || null,
  };

  const [inv, setInv] = useState(state.currentInvoice || defaults);
  const [template, setTemplate] = useState(inv.template || 'modern');
  const [logo, setLogo] = useState(inv.logo || null);
  const [sidebarValues, setSidebarValues] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function fillFromClient(c) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    setVal('to-name', c.name);
    setVal('to-email', c.email);
    setVal('to-phone', c.phone);
    setVal('to-address', c.address);
    setPickerOpen(false);
    triggerRender();
  }

  function readSidebar() {
    const get = id => document.getElementById(id)?.value ?? '';
    const g = id => document.getElementById(id);
    return {
      currency: get('inv-currency'),
      tax: parseFloat(get('inv-tax')) || 0,
      discount: parseFloat(get('inv-discount')) || 0,
      discountType: get('inv-discount-type'),
      fromName: get('from-name'),
      fromEmail: get('from-email'),
      fromPhone: get('from-phone'),
      fromAddress: get('from-address'),
      toName: get('to-name'),
      toEmail: get('to-email'),
      toPhone: get('to-phone'),
      toAddress: get('to-address'),
      notes: get('inv-notes'),
      invNum: get('inv-num'),
      invDate: get('inv-date'),
      invDue: get('inv-due'),
    };
  }

  function triggerRender() {
    setSidebarValues({ ...readSidebar(), _ts: Date.now() });
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setLogo(ev.target.result); };
    reader.readAsDataURL(file);
  }

  function handleClearLogo() { setLogo(null); }

  function handleSetDocType(type) {
    setInv(prev => ({ ...prev, docType: type }));
    const dueGroup = document.getElementById('inv-due')?.closest('.form-group');
    if (dueGroup) dueGroup.style.display = type === 'receipt' ? 'none' : '';
    setTimeout(triggerRender, 0);
  }

  function handleSetTemplate(t) {
    setTemplate(t);
    setTimeout(triggerRender, 0);
  }

  function addItem() {
    setInv(prev => ({ ...prev, items: [...prev.items, { id: genId(), desc: '', qty: 1, price: '' }] }));
    setTimeout(triggerRender, 0);
  }

  function removeItem(id) {
    setInv(prev => {
      if (prev.items.length <= 1) return prev;
      return { ...prev, items: prev.items.filter(i => i.id !== id) };
    });
    setTimeout(triggerRender, 0);
  }

  function updateItem(id, field, val) {
    setInv(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: val } : i)
    }));
    setTimeout(triggerRender, 0);
  }

  async function handleAISuggest(id, desc) {
    if (!isAIAvailable()) { toast('Add OpenRouter API key in Settings for AI features', 'error'); return; }
    const prompt = desc
      ? `Expand this invoice line item description to be more professional and detailed (max 15 words): "${desc}"`
      : `Suggest a professional invoice line item description for a freelance/service business (max 15 words). Return only the text.`;
    const result = await callAI(prompt, 'You write professional invoice line item descriptions. Return ONLY the description text, no quotes, no explanation.');
    if (result) {
      updateItem(id, 'desc', result);
      toast('AI description generated', 'success');
    } else {
      toast('AI suggestion failed — check your API key', 'error');
    }
  }

  async function handleGenerateNotes() {
    if (!isAIAvailable()) { toast('Add OpenRouter API key in Settings for AI features', 'error'); return; }
    const vals = readSidebar();
    const items = inv.items.map(i => i.desc || 'item').join(', ');
    const context = `Invoice for ${vals.toName || 'client'}, items: ${items || 'services'}. Total: ${inv.currency || 'USD'}`;
    const result = await callAI(
      context,
      'Write 2-3 professional invoice notes including payment terms (net-30), accepted payment methods, and a thank-you message. Return ONLY the note text.'
    );
    if (result) {
      const el = document.getElementById('inv-notes');
      if (el) { el.value = result; triggerRender(); }
      toast('AI notes generated', 'success');
    } else {
      toast('AI generation failed — check your API key', 'error');
    }
  }

  function save() {
    const vals = readSidebar();
    const updated = {
      ...inv,
      template,
      logo,
      num: vals.invNum,
      date: vals.invDate,
      due: vals.invDue,
      currency: vals.currency,
      tax: vals.tax,
      discount: vals.discount,
      discountType: vals.discountType,
      fromName: vals.fromName,
      fromEmail: vals.fromEmail,
      fromPhone: vals.fromPhone,
      fromAddress: vals.fromAddress,
      toName: vals.toName,
      toEmail: vals.toEmail,
      toPhone: vals.toPhone,
      toAddress: vals.toAddress,
      notes: vals.notes,
    };

    let newInvs;
    const idx = state.invoices.findIndex(i => i.id === updated.id);
    if (idx >= 0) {
      newInvs = state.invoices.map(i => i.id === updated.id ? updated : i);
    } else {
      newInvs = [...state.invoices, updated];
      dispatch({ type: 'SET_SETTINGS', payload: { invNext: (state.settings.invNext || 1001) + 1 } });
    }
    dispatch({ type: 'SET_INVOICES', payload: newInvs });
    dispatch({ type: 'SET_CURRENT_INVOICE', payload: null });
    toast('Invoice saved!', 'success');
    onClose();
  }

  function exportPDF() {
    const el = document.getElementById('preview-doc');
    if (!el) return;
    const filename = `${inv.num || 'invoice'}.pdf`;
    const opt = {
      margin: [0, 0, 0, 0],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    toast('Generating PDF…');
    import('html2pdf.js').then(m => {
      m.default().set(opt).from(el).save().then(() => toast('PDF downloaded!', 'success'));
    });
  }

  function printDoc() { window.print(); }

  return (
    <div id="page-editor" style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <div className="editor-sidebar">
        <div className="editor-topbar">
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '6px 8px' }}>← Back</button>
          <div className="editor-topbar-title">{inv.docType === 'receipt' ? 'Edit Receipt' : 'Edit Invoice'}</div>
          <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
        </div>
        <div className="sidebar-body">
          {/* Doc type tabs */}
          <div className="doc-type-tabs">
            <button className={`doc-tab${inv.docType === 'invoice' ? ' active' : ''}`} onClick={() => handleSetDocType('invoice')}>Invoice</button>
            <button className={`doc-tab${inv.docType === 'receipt' ? ' active' : ''}`} onClick={() => handleSetDocType('receipt')}>Receipt</button>
          </div>

          {/* Template */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Template</div>
            <TemplatePicker value={template} onChange={handleSetTemplate} />
          </div>

          {/* Logo */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Logo</div>
            <LogoUpload logo={logo} onUpload={handleLogoUpload} onClear={handleClearLogo} />
          </div>

          {/* Invoice details */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Invoice details</div>
            <div className="form-group"><label className="form-label">Invoice #</label><input className="form-input" id="inv-num" defaultValue={inv.num} onInput={triggerRender} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" id="inv-date" defaultValue={inv.date} onInput={triggerRender} /></div>
              <div className="form-group"><label className="form-label">Due date</label><input className="form-input" type="date" id="inv-due" defaultValue={inv.due} onInput={triggerRender} /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" id="inv-status" defaultValue={inv.status}>
                <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Currency</label>
                <select className="form-input" id="inv-currency" defaultValue={inv.currency} onChange={triggerRender}>
                  <option value="USD">USD $</option><option value="EUR">EUR €</option>
                  <option value="GBP">GBP £</option><option value="CAD">CAD $</option>
                  <option value="AED">AED د.إ</option><option value="INR">INR ₹</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Tax (%)</label><input className="form-input" type="number" id="inv-tax" defaultValue={inv.tax} min="0" onInput={triggerRender} /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Discount</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" id="inv-discount" defaultValue={inv.discount} min="0" onInput={triggerRender} style={{ flex: 1 }} />
                <select className="form-input" id="inv-discount-type" defaultValue={inv.discountType} onChange={triggerRender} style={{ width: 80 }}>
                  <option value="pct">%</option>
                  <option value="flat">$</option>
                </select>
              </div>
            </div>
          </div>

          {/* From */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">From (You)</div>
            <div className="form-group"><label className="form-label">Name / Company</label><input className="form-input" id="from-name" defaultValue={inv.fromName} onInput={triggerRender} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" id="from-email" defaultValue={inv.fromEmail} onInput={triggerRender} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" id="from-phone" defaultValue={inv.fromPhone} onInput={triggerRender} /></div>
            <div className="form-group"><label className="form-label">Address</label><textarea className="form-input" id="from-address" rows={2} defaultValue={inv.fromAddress} onInput={triggerRender} /></div>
          </div>

          {/* To */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Bill To</div>
            <div className="form-group" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}><label className="form-label">Client name</label><input className="form-input" id="to-name" defaultValue={inv.toName} onInput={triggerRender} /></div>
              <div ref={pickerRef} style={{ position: 'relative', marginBottom: 1 }}>
                <button className="btn btn-outline btn-sm btn-icon" onClick={() => setPickerOpen(o => !o)} title="Pick from clients">👥</button>
                {pickerOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff',
                    border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.12)',
                    minWidth: 220, maxHeight: 200, overflowY: 'auto', zIndex: 300
                  }}>
                    {!state.clients.length ? (
                      <div style={{ padding: '9px 14px', fontSize: 13, color: '#9CA3AF' }}>No clients saved</div>
                    ) : state.clients.map(c => (
                      <button key={c.id} className="dropdown-item" onClick={() => fillFromClient(c)}>
                        {c.name}{c.company ? <span style={{ color: '#6B7280', fontSize: 11 }}> — {c.company}</span> : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" id="to-email" defaultValue={inv.toEmail} onInput={triggerRender} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" id="to-phone" defaultValue={inv.toPhone} onInput={triggerRender} /></div>
            <div className="form-group"><label className="form-label">Address</label><textarea className="form-input" id="to-address" rows={2} defaultValue={inv.toAddress} onInput={triggerRender} /></div>
          </div>

          {/* Notes */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Notes / Terms</div>
            <textarea className="form-input" id="inv-notes" rows={3} defaultValue={inv.notes} onInput={triggerRender} placeholder="Payment terms, bank details, thank-you note…" />
            {isAIAvailable() && (
              <button className="btn btn-outline btn-sm" onClick={handleGenerateNotes} style={{ marginTop: 8, width: '100%' }}>
                ✨ Generate Notes
              </button>
            )}
          </div>

          <div style={{ paddingBottom: 32 }} />
        </div>
      </div>

      {/* Preview pane */}
      <div className="editor-preview">
        <div className="preview-toolbar">
          <div className="preview-toolbar-left">
            <span>📄</span>
            <span>{inv.docType === 'receipt' ? 'Receipt Preview' : 'Invoice Preview'}</span>
          </div>
          <div className="preview-toolbar-right">
            <button className="btn btn-outline btn-sm" onClick={printDoc} style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>🖨 Print</button>
            <button className="btn btn-blue btn-sm" onClick={exportPDF}>↓ Export PDF</button>
          </div>
        </div>

        <div>
          <ItemsEditor
            items={inv.items}
            currency={sidebarValues.currency || inv.currency || 'USD'}
            onUpdate={updateItem}
            onAdd={addItem}
            onRemove={removeItem}
            onAISuggest={handleAISuggest}
          />

          <InvoicePreview
            inv={inv}
            template={template}
            logo={logo}
            sidebarValues={sidebarValues}
          />
        </div>
      </div>
    </div>
  );
}
