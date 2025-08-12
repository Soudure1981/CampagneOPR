import React from "react";

export default function RuleModal({ open, title, content, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-back">
      <div className="modal">
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <div style={{ whiteSpace: "pre-wrap" }}>{content || "Aucune règle définie."}</div>
        <div className="modal-actions">
          <button className="btn" data-click-sound onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
