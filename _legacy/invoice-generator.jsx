import { useState, useRef } from "react";

const TEMPLATES = {
  modern: {
    name: "Modern",
    accent: "#2563EB",
    bg: "#EFF6FF",
    headerText: "#1E3A5F",
    fontFamily: "'Inter', sans-serif",
  },
  minimal: {
    name: "Minimal",
    accent: "#111111",
    bg: "#FAFAFA",
    headerText: "#111111",
    fontFamily: "'Georgia', serif",
  },
  bold: {
    name: "Bold",
    accent: "#7C3AED",
    bg: "#F5F3FF",
    headerText: "#3B0764",
    fontFamily: "'Inter', sans-serif",
  },
  warm: {
    name: "Warm",
    accent: "#D97706",
    bg: "#FFFBEB",
    headerText: "#78350F",
    fontFamily: "'Georgia', serif",
  },
};

const defaultItems = [{ id: 1, description: "", qty: 1, price: "" }];

function generateId() {
  return "INV-" + Math.floor(10000 + Math.random() * 90000);
}

export default function App() {
  const [docType, setDocType] = useState("invoice");
  const [template, setTemplate] = useState("modern");
  const [step, setStep] = useState("edit"); // edit | preview
  const [invoiceNum] = useState(generateId);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [from, setFrom] = useState({ name: "", email: "", address: "", phone: "" });
  const [to, setTo] = useState({ name: "", email: "", address: "", phone: "" });
  const [items, setItems] = useState(defaultItems);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [logo, setLogo] = useState(null);
  const printRef = useRef();

  const t = TEMPLATES[template];
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  function addItem() {
    setItems(prev => [...prev, { id: Date.now(), description: "", qty: 1, price: "" }]);
  }
  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }
  function updateItem(id, field, val) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handlePrint() {
    window.print();
  }

  const fmt = n => "$" + n.toFixed(2);

  // ---- PREVIEW / PRINT DOCUMENT ----
  const InvoiceDoc = () => (
    <div
      id="invoice-doc"
      style={{
        fontFamily: t.fontFamily,
        background: "#fff",
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 52px",
        boxSizing: "border-box",
        color: "#1a1a1a",
        minHeight: 900,
        borderRadius: step === "preview" ? 12 : 0,
        boxShadow: step === "preview" ? "0 8px 48px rgba(0,0,0,0.10)" : "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          {logo
            ? <img src={logo} alt="logo" style={{ maxHeight: 60, maxWidth: 160, marginBottom: 8, objectFit: "contain" }} />
            : <div style={{ width: 56, height: 56, borderRadius: 10, background: t.accent, marginBottom: 8 }} />
          }
          <div style={{ fontWeight: 700, fontSize: 18, color: t.headerText }}>{from.name || "Your Company"}</div>
          {from.email && <div style={{ fontSize: 12, color: "#666" }}>{from.email}</div>}
          {from.phone && <div style={{ fontSize: 12, color: "#666" }}>{from.phone}</div>}
          {from.address && <div style={{ fontSize: 12, color: "#666", maxWidth: 200 }}>{from.address}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 32, fontWeight: 800, letterSpacing: "-1px",
            color: t.accent, textTransform: "uppercase"
          }}>
            {docType === "invoice" ? "Invoice" : "Receipt"}
          </div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>#{invoiceNum}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Date: {date}</div>
          {docType === "invoice" && dueDate && (
            <div style={{ fontSize: 12, color: "#888" }}>Due: {dueDate}</div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 3, background: t.accent, borderRadius: 2, marginBottom: 28 }} />

      {/* Bill To */}
      <div style={{ display: "flex", gap: 48, marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Bill To</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{to.name || "Client Name"}</div>
          {to.email && <div style={{ fontSize: 12, color: "#555" }}>{to.email}</div>}
          {to.phone && <div style={{ fontSize: 12, color: "#555" }}>{to.phone}</div>}
          {to.address && <div style={{ fontSize: 12, color: "#555", maxWidth: 200 }}>{to.address}</div>}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr style={{ background: t.bg }}>
            {["Description", "Qty", "Unit Price", "Total"].map((h, i) => (
              <th key={h} style={{
                padding: "10px 12px", textAlign: i === 0 ? "left" : "right",
                fontSize: 11, fontWeight: 700, color: t.headerText,
                textTransform: "uppercase", letterSpacing: 0.5,
                borderBottom: `2px solid ${t.accent}`
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} style={{ background: idx % 2 === 1 ? t.bg + "55" : "transparent" }}>
              <td style={{ padding: "11px 12px", fontSize: 13 }}>{item.description || "—"}</td>
              <td style={{ padding: "11px 12px", fontSize: 13, textAlign: "right" }}>{item.qty}</td>
              <td style={{ padding: "11px 12px", fontSize: 13, textAlign: "right" }}>{fmt(parseFloat(item.price) || 0)}</td>
              <td style={{ padding: "11px 12px", fontSize: 13, textAlign: "right", fontWeight: 500 }}>
                {fmt((parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
        <div style={{ minWidth: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#444" }}>
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#444" }}>
              <span>Tax ({taxRate}%)</span><span>{fmt(tax)}</span>
            </div>
          )}
          <div style={{
            display: "flex", justifyContent: "space-between", padding: "10px 12px",
            marginTop: 6, background: t.accent, borderRadius: 8,
            color: "#fff", fontSize: 16, fontWeight: 700
          }}>
            <span>Total</span><span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{
          borderTop: `1px solid #e5e7eb`, paddingTop: 20, fontSize: 12, color: "#666"
        }}>
          <div style={{ fontWeight: 700, color: t.headerText, marginBottom: 4, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Notes</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{notes}</div>
        </div>
      )}

      <div style={{ marginTop: 48, textAlign: "center", fontSize: 11, color: "#ccc" }}>
        Thank you for your business.
      </div>
    </div>
  );

  // ---- EDITOR SIDEBAR ----
  const inputStyle = {
    width: "100%", padding: "8px 11px", borderRadius: 7,
    border: "1.5px solid #e2e8f0", fontSize: 13,
    background: "#fff", boxSizing: "border-box", outline: "none",
    transition: "border-color 0.15s",
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );

  const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div style={{ marginBottom: 8 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 3 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: #f1f5f9; }
        input:focus { border-color: #2563EB !important; }
        @media print {
          body * { visibility: hidden; }
          #invoice-doc, #invoice-doc * { visibility: visible; }
          #invoice-doc { position: fixed; top: 0; left: 0; width: 100%; box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Topbar */}
      <div style={{
        background: "#0f172a", color: "#fff", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 54, position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.18)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "#2563EB", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13
          }}>I</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>InvoiceKit</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {step === "preview" && (
            <button onClick={() => setStep("edit")} style={{
              background: "transparent", color: "#cbd5e1", border: "1.5px solid #334155",
              borderRadius: 7, padding: "6px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600
            }}>← Edit</button>
          )}
          {step === "edit" && (
            <button onClick={() => setStep("preview")} style={{
              background: "#2563EB", color: "#fff", border: "none",
              borderRadius: 7, padding: "6px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600
            }}>Preview →</button>
          )}
          {step === "preview" && (
            <button onClick={handlePrint} style={{
              background: "#2563EB", color: "#fff", border: "none",
              borderRadius: 7, padding: "6px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6
            }}>🖨 Print / Export PDF</button>
          )}
        </div>
      </div>

      {step === "edit" ? (
        <div style={{ display: "flex", minHeight: "calc(100vh - 54px)" }}>
          {/* Sidebar */}
          <div style={{
            width: 320, flexShrink: 0, background: "#fff",
            borderRight: "1.5px solid #e2e8f0", padding: "24px 20px",
            overflowY: "auto", maxHeight: "calc(100vh - 54px)", position: "sticky", top: 54
          }}>
            {/* Doc type */}
            <Section title="Document Type">
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                {["invoice", "receipt"].map(dt => (
                  <button key={dt} onClick={() => setDocType(dt)} style={{
                    flex: 1, padding: "8px 0", borderRadius: 7, cursor: "pointer",
                    border: "1.5px solid", fontWeight: 600, fontSize: 13,
                    borderColor: docType === dt ? "#2563EB" : "#e2e8f0",
                    background: docType === dt ? "#EFF6FF" : "#fff",
                    color: docType === dt ? "#2563EB" : "#64748b",
                    textTransform: "capitalize"
                  }}>{dt}</button>
                ))}
              </div>
            </Section>

            {/* Template */}
            <Section title="Template">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                  <button key={key} onClick={() => setTemplate(key)} style={{
                    padding: "10px 8px", borderRadius: 8, cursor: "pointer",
                    border: `2px solid ${template === key ? tmpl.accent : "#e2e8f0"}`,
                    background: tmpl.bg, color: tmpl.headerText,
                    fontWeight: 700, fontSize: 12, display: "flex",
                    alignItems: "center", gap: 7
                  }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: tmpl.accent, display: "inline-block", flexShrink: 0
                    }} />
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </Section>

            {/* Logo */}
            <Section title="Logo (optional)">
              <label style={{
                display: "block", border: "1.5px dashed #cbd5e1", borderRadius: 8,
                padding: "12px", textAlign: "center", cursor: "pointer", color: "#94a3b8",
                fontSize: 12, fontWeight: 500
              }}>
                {logo ? <img src={logo} alt="logo" style={{ maxHeight: 40, objectFit: "contain" }} /> : "Click to upload logo"}
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </label>
            </Section>

            {/* Dates */}
            <Section title="Dates">
              <Field label="Invoice Date" type="date" value={date} onChange={setDate} />
              {docType === "invoice" && (
                <Field label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
              )}
            </Section>

            {/* From */}
            <Section title="From (You)">
              <Field label="Name / Company" value={from.name} onChange={v => setFrom(p => ({ ...p, name: v }))} placeholder="Acme Inc." />
              <Field label="Email" value={from.email} onChange={v => setFrom(p => ({ ...p, email: v }))} placeholder="hello@acme.com" />
              <Field label="Phone" value={from.phone} onChange={v => setFrom(p => ({ ...p, phone: v }))} placeholder="+1 555 0100" />
              <Field label="Address" value={from.address} onChange={v => setFrom(p => ({ ...p, address: v }))} placeholder="123 Main St, City" />
            </Section>

            {/* To */}
            <Section title="Bill To">
              <Field label="Client Name" value={to.name} onChange={v => setTo(p => ({ ...p, name: v }))} placeholder="Jane Doe" />
              <Field label="Email" value={to.email} onChange={v => setTo(p => ({ ...p, email: v }))} placeholder="jane@email.com" />
              <Field label="Phone" value={to.phone} onChange={v => setTo(p => ({ ...p, phone: v }))} placeholder="+1 555 0200" />
              <Field label="Address" value={to.address} onChange={v => setTo(p => ({ ...p, address: v }))} placeholder="456 Oak Ave, City" />
            </Section>

            {/* Tax */}
            <Section title="Tax">
              <Field label="Tax Rate (%)" type="number" value={taxRate} onChange={v => setTaxRate(Number(v))} placeholder="0" />
            </Section>

            {/* Notes */}
            <Section title="Notes / Terms">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Payment terms, thank-you note, bank details..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />
            </Section>
          </div>

          {/* Live Preview */}
          <div style={{ flex: 1, padding: "32px 24px", overflowY: "auto" }}>
            {/* Items editor */}
            <div style={{
              background: "#fff", borderRadius: 12, border: "1.5px solid #e2e8f0",
              padding: "20px 20px 16px", marginBottom: 24, maxWidth: 720
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 14 }}>Line Items</div>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 110px 100px 32px", gap: 8, marginBottom: 6 }}>
                {["Description", "Qty", "Unit Price", "Total", ""].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {items.map(item => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 110px 100px 32px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)}
                    placeholder="Item description" style={inputStyle} />
                  <input value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)}
                    type="number" min="1" style={inputStyle} />
                  <input value={item.price} onChange={e => updateItem(item.id, "price", e.target.value)}
                    type="number" placeholder="0.00" style={inputStyle} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", textAlign: "right", paddingRight: 4 }}>
                    {fmt((parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0))}
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{
                    background: "transparent", border: "none", color: "#cbd5e1",
                    cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1
                  }}>×</button>
                </div>
              ))}
              <button onClick={addItem} style={{
                marginTop: 6, background: "transparent", border: "1.5px dashed #cbd5e1",
                borderRadius: 7, padding: "7px 16px", cursor: "pointer", fontSize: 12,
                fontWeight: 600, color: "#64748b", width: "100%"
              }}>+ Add Item</button>
            </div>

            {/* Live preview */}
            <div style={{ maxWidth: 720 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Live Preview</div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
                <InvoiceDoc />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div style={{ minHeight: "calc(100vh - 54px)", background: "#f1f5f9", padding: "40px 20px" }}>
          <div ref={printRef}>
            <InvoiceDoc />
          </div>
        </div>
      )}
    </>
  );
}
