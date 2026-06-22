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
    <div>
      <div className="editor-items-header">
        <div className="editor-items-title">Line Items</div>
      </div>
      <div className="items-inline">
        <div className="items-inline-head">
          <span>Description</span>
          <span></span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
          <span></span>
        </div>
        {items.map(item => (
          <div key={item.id} className="item-row">
            <input value={item.desc} onChange={e => onUpdate(item.id, 'desc', e.target.value)}
              placeholder="Item description" className="form-input" />
            <button
              onClick={() => handleAISuggest(item.id, item.desc)}
              disabled={loadingId === item.id || !onAISuggest}
              className="item-ai-btn"
              title="AI suggest description"
            >{loadingId === item.id ? '⏳' : '✨'}</button>
            <input value={item.qty} onChange={e => onUpdate(item.id, 'qty', e.target.value)}
              type="number" min="1" className="form-input" style={{ textAlign: 'right' }} />
            <input value={item.price} onChange={e => onUpdate(item.id, 'price', e.target.value)}
              type="number" placeholder="0.00" className="form-input" style={{ textAlign: 'right' }} />
            <div className="item-total">
              {fmt((parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0), currency)}
            </div>
            <button onClick={() => onRemove(item.id)} className="remove-item">×</button>
          </div>
        ))}
        <button className="add-item-btn" onClick={onAdd}>+ Add line item</button>
      </div>
    </div>
  );
}
