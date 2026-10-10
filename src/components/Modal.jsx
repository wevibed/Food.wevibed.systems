import React, { useEffect } from "react";

export default function Modal({ open, onClose, label, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet glass-strong" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="chip float-right" onClick={onClose} aria-label="Close">Close</button>
        {children}
      </div>
    </div>
  );
}
