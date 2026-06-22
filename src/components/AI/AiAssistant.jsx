import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/InvoiceContext';
import { callAI, isAIAvailable } from '../../services/ai';

export default function AiAssistant({ toast }) {
  const { state } = useStore();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ik_ai_chat');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ik_ai_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getContext() {
    const totalInvs = state.invoices.length;
    const totalClients = state.clients.length;
    const totalRevenue = state.invoices.reduce((s, inv) => {
      const subtotal = (inv.items || []).reduce((a, i) => a + (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0), 0);
      return s + subtotal;
    }, 0);
    return `User has ${totalInvs} invoices totaling $${totalRevenue.toFixed(0)} and ${totalClients} clients.`;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setLoading(true);
    const system = `You are Invoice Me's AI assistant. Help users with invoicing, billing, and business questions. Keep answers concise. Current app state: ${getContext()}`;
    const result = await callAI(text, system);
    setMessages(prev => [...prev, { role: 'assistant', content: result || 'Sorry, I could not process that. Check your API key.' }]);
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function clearChat() {
    setMessages([]);
    localStorage.removeItem('ik_ai_chat');
  }

  if (!isAIAvailable()) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>AI Invoice Assistant</h2>
        <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 400, margin: '0 auto' }}>
          Add your OpenRouter API key in Settings to enable the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 108px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>🤖 AI Assistant</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Ask about invoices, clients, or billing</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={clearChat}>Clear chat</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>How can I help?</div>
            <div style={{ fontSize: 13 }}>Ask me to draft an invoice, explain features, or summarize your business.</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            background: m.role === 'user' ? '#2563EB' : '#fff',
            color: m.role === 'user' ? '#fff' : '#1F2937',
            border: m.role === 'user' ? 'none' : '1px solid #E5E7EB',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 14,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 12, padding: '10px 14px', fontSize: 14, color: '#6B7280'
          }}>
            Thinking<span style={{ animation: 'dots 1.5s steps(4) infinite' }}>...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your invoices..."
          rows={1}
          style={{ flex: 1, resize: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 14, border: '1.5px solid #E5E7EB', outline: 'none', fontFamily: 'inherit' }}
        />
        <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !input.trim()} style={{ alignSelf: 'flex-end' }}>
          Send
        </button>
      </div>
    </div>
  );
}
