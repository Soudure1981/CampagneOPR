// src/utils/globalClickSound.js

let installed = false;
let audio;

/**
 * Installe un "clic" global (boutons, etc.)
 * Utilise un fichier statique depuis /public
 */
export function installGlobalClickSound({ volume = 0.35 } = {}) {
  if (installed) return;
  installed = true;

  // Fichier servi depuis /public
  const clickUrl = '/assets/sounds/click.wav';

  audio = new Audio(clickUrl);
  audio.volume = volume;

  const handler = () => {
    try {
      audio.currentTime = 0;
      // .play() peut être bloqué si pas d'interaction utilisateur encore
      audio.play().catch(() => {});
    } catch {}
  };

  // Tu peux affiner (par ex. sur les .btn seulement). Pour l’instant: global.
  document.addEventListener('click', handler, { passive: true });
}
