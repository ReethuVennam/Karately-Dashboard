/**
 * Generic .modal-backdrop + .modal wrapper. Rendered conditionally by the
 * caller (no `open` prop / hidden class — React just doesn't mount it).
 * Pass `wide` for content that needs more than the default 420px (e.g. the
 * order audit trail's kv-grids) — adds the .modal-wide class.
 */
export default function Modal({ title, onClose, wide, children }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal${wide ? ' modal-wide' : ''}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
