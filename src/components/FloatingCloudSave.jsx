// src/components/FloatingCloudSave.jsx
import { useEffect, useState } from 'react';
import { loadState, saveState, getCurrentStateFallback, applyStateFallback }
  from '../services/campaignStorage.js';

export default function FloatingCloudSave() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  async function onLoad() {
    setBusy(true);
    setMsg('Chargement…');
    try {
      const remote = await loadState();
      if (remote) {
        applyStateFallback(remote);
        setMsg('État chargé depuis le cloud ✅');
        setLastUpdate(new Date().toLocaleString());
      } else {
        setMsg('Aucun état en ligne (table vide).');
      }
    } catch (e) {
      setMsg('Erreur au chargement.');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    setBusy(true);
    setMsg('Sauvegarde…');
    try {
      const state = getCurrentStateFallback();
      await saveState(state ?? {});
      setMsg('Sauvegardé en ligne ✅');
      setLastUpdate(new Date().toLocaleString());
    } catch (e) {
      setMsg('Erreur à la sauvegarde.');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    onLoad().catch(() => {});
    return () => {};
  }, []);

  return (
    <div style={{
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: 9999,
      background: 'rgba(20,20,25,0.9)',
      color: '#fff',
      borderRadius: 12,
      padding: '12px 14px',
      backdropFilter: 'blur(4px)',
      fontFamily: 'system-ui, sans-serif',
      width: 240,
      boxShadow: '0 6px 24px rgba(0,0,0,0.4)'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
        Sauvegarde Cloud
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={onLoad} disabled={busy} style={btnStyle}>
          Charger
        </button>
        <button onClick={onSave} disabled={busy} style={btnStyle}>
          Sauvegarder
        </button>
      </div>

      <div style={{ fontSize: 12, minHeight: 18, opacity: 0.9 }}>
        {busy ? 'Veuillez patienter…' : msg}
      </div>
      {lastUpdate && (
        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>
          Dernière action : {lastUpdate}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  flex: 1,
  appearance: 'none',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  padding: '8px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13
};
