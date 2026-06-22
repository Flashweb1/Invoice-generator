export default function LogoUpload({ logo, onUpload, onClear }) {
  return (
    <div>
      <div className="logo-upload" style={{ maxWidth: 280 }}>
        {logo ? (
          <img src={logo} alt="logo" className="logo-preview" />
        ) : (
          <div>
            <div style={{ fontSize: 20, marginBottom: 4 }}>🖼</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Click to upload logo</div>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onUpload} />
      </div>
      {logo && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 6, fontSize: 11 }} onClick={onClear}>
          Remove logo
        </button>
      )}
    </div>
  );
}
