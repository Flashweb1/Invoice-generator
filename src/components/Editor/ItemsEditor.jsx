import { useState } from 'react';
import { fmt } from '../../utils/format';

export default function ItemsEditor({ items, currency, onUpdate, onAdd, onRemove, onAISuggest }) {
  const [loadingId, setLoadingId] = useState(null);

  async function handleAISuggest(id, desc) {
    setLoadingId(id);
    await onAISuggest(id, desc);
    setLoadingId(null);
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0', padding: '20px 20px 16px', marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 14 }}>Line Items</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 70px 110px 100px 32px', gap: 8, marginBottom: 6 }}>
        {['Description', '', 'Qty', 'Unit Price', 'Total', ''].map(h => (
          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
        ))}
      </div>
      {items.map(item => (
        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 50px 70px 110px 100px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input value={item.desc} onChange={e => onUpdate(item.id, 'desc', e.target.value)}
              placeholder="Item description" className="form-input" style={{ flex: 1 }} />
          </div>
          <button
            onClick={() => handleAISuggest(item.id, item.desc)}
            disabled={loadingId === item.id || !onAISuggest}
            style={{
              background: 'none', border: 'none', cursor: loadingId === item.id ? 'wait' : 'pointer',
              fontSize: 16, padding: '4px 2px', opacity: loadingId === item.id ? 0.5 : 0.7
            }}
            title="AI suggest description"
          >{loadingId === item.id ? '⏳' : '✨'}</button>
          <input value={item.qty} onChange={e => onUpdate(item.id, 'qty', e.target.value)}
            type="number" min="1" className="form-input" style={{ textAlign: 'right' }} />
          <input value={item.price} onChange={e => onUpdate(item.id, 'price', e.target.value)}
            type="number" placeholder="0.00" className="form-input" style={{ textAlign: 'right' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', textAlign: 'right', paddingRight: 4 }}>
            {fmt((parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0), currency)}
          </div>
          <button onClick={() => onRemove(item.id)} className="remove-item">×</button>
        </div>
      ))}
      <button className="add-item-btn" onClick={onAdd}>+ Add line item</button>
    </div>
  );
}
