
import React, { useState } from 'react';
import { saveCampaign, loadCampaign, clearCampaign, exportJSON, importJSON } from '../logic/saveManager.js';

export default function MenuModal({ open, onClose, getState, onLoadState, onNewCampaign }){
  const [tab,setTab]=useState('main');
  const [text,setText]=useState('');
  if(!open) return null;
  const state=getState();
  return (
    <div className="modal-back">
      <div className="modal" style={{minWidth:520}}>
        <h3 style={{marginTop:0}}>Menu</h3>
        {tab==='main' && (
          <div style={{display:'grid', gap:10}}>
            <button className="btn" data-click-sound onClick={()=>{ if(saveCampaign(state)) alert('Sauvegardé.'); else alert('Erreur sauvegarde'); }}>Sauvegarder</button>
            <button className="btn" data-click-sound onClick={()=>{ const s=loadCampaign(); if(s){ onLoadState(s); onClose(); } else alert('Pas de sauvegarde'); }}>Charger</button>
            <button className="btn" data-click-sound onClick={()=>{ if(confirm('Nouvelle campagne ?')) onNewCampaign(); }}>Nouvelle campagne</button>
            <button className="btn" data-click-sound onClick={()=>{ setText(exportJSON(state)); setTab('export'); }}>Exporter JSON</button>
            <button className="btn" data-click-sound onClick={()=> setTab('import') }>Importer JSON</button>
            <button className="btn" data-click-sound onClick={()=>{ clearCampaign(); alert('Sauvegarde effacée'); }}>Effacer sauvegarde locale</button>
          </div>
        )}
        {tab==='export' && (
          <div>
            <p>Copie ce JSON :</p>
            <textarea style={{width:'100%',height:180}} readOnly value={text} />
            <div className="modal-actions">
              <button className="btn" data-click-sound onClick={()=>setTab('main')}>Retour</button>
            </div>
          </div>
        )}
        {tab==='import' && (
          <div>
            <p>Colle une sauvegarde JSON :</p>
            <textarea style={{width:'100%',height:180}} value={text} onChange={e=>setText(e.target.value)} />
            <div className="modal-actions">
              <button className="btn" data-click-sound onClick={()=>{ try{ const d=importJSON(text); onLoadState(d); onClose(); }catch(e){ alert('JSON invalide'); } }}>Importer</button>
              <button className="btn" data-click-sound onClick={()=>setTab('main')}>Annuler</button>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn" data-click-sound onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
