
import React from 'react';
export default function TurnPrompt({ open, title, message, onClose }){
  if(!open) return null;
  return (
    <div className="modal-back">
      <div className="modal">
        <h3 style={{marginTop:0}}>{title}</h3>
        <div style={{whiteSpace:'pre-wrap'}}>{message}</div>
        <div className="modal-actions">
          <button className="btn" data-click-sound onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
