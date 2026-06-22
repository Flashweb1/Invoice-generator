import { TEMPLATES } from '../../constants/templates';

const swatches = {
  modern: 'linear-gradient(90deg,#0B0F1A,#2563EB)',
  classic: 'linear-gradient(90deg,#059669,#064E3B)',
  minimal: 'linear-gradient(90deg,#111,#6b7280)',
  bold: 'linear-gradient(90deg,#7C3AED,#C4B5FD)',
  warm: 'linear-gradient(90deg,#D97706,#FDE68A)',
  slate: 'linear-gradient(90deg,#334155,#94A3B8)',
};

export default function TemplatePicker({ value, onChange }) {
  return (
    <div className="template-grid">
      {Object.entries(TEMPLATES).map(([key]) => (
        <button
          key={key}
          className={`template-btn${value === key ? ' selected' : ''}`}
          onClick={() => onChange(key)}
        >
          <div className="template-swatch" style={{ background: swatches[key] }} />
          <div className="template-name">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
        </button>
      ))}
    </div>
  );
}
