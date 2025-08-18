import React, { useMemo, useState } from 'react';
import { generateMap } from '../logic/mapGenerator.js';
import TurnPrompt from './TurnPrompt.jsx';
import MenuModal from './MenuModal.jsx';
import RuleModal from './RuleModal.jsx';
import { terrainRules } from '../data/terrainRules.js';
import { infrastructureRules } from '../data/infrastructureRules.js';

function neighbors4(r, c, size) {
  const out = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < size - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < size - 1) out.push([r, c + 1]);
  return out;
}
function isAdj(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

export default function GalacticMap({ config, onRestart }) {
  const { gridSize, numPlanets, players, movesPerTurn } = config;

  const [state, setState] = useState(() => {
    const m = generateMap({ gridSize, numPlanets });
    const ships = players.map((p, i) => ({ id: i + 1, name: p.name, color: p.color, pos: null, pm: movesPerTurn }));
    const scores = Object.fromEntries(players.map(p => [p.name, 0]));
    return {
      grid: m.grid,
      players,
      ships,
      scores,
      stargates: [[0, 0], [gridSize - 1, gridSize - 1]],
      current: 0,
      round: 1,
      phase: 'placement',
      infoOpen: true,
      infoText: 'Phase de placement : Joueur 1, choisis une planète (elle devient à toi), puis une case adjacente pour ton vaisseau.',
      menuOpen: false,
      pickPlanet: null,
      target: null,
      selectedPlanet: null
    };
  });

  const [ruleModal, setRuleModal] = useState({ open: false, title: "", content: "" });

  const grid = state.grid;
  const currentPlayer = players[state.current];
  const currentShip = state.ships[state.current];

  function revealAround(r, c) {
    setState(s => {
      const g = s.grid.map(row => row.slice());
      for (const [nr, nc] of neighbors4(r, c, gridSize)) {
        const cell = g[nr][nc];
        if (cell.type === 'planet') {
          g[nr][nc] = { ...cell, revealed: true };
        }
        if (cell.type === 'stargate') {
          g[nr][nc] = { ...cell, revealed: true };
        }
      }
      return { ...s, grid: g };
    });
  }

  function recomputeScores(g) {
    const scores = Object.fromEntries(players.map(p => [p.name, 0]));
    for (const row of g) {
      for (const cell of row) {
        if (cell?.type === 'planet' && cell.owner) { scores[cell.owner] += (cell.vp || 1); }
      }
    }
    return scores;
  }

  function handleCellClick(r, c) {
    const cellObj = grid[r][c] || { type: 'empty' };

    // Sélection pour affichage d'infos (toujours possible si c'est une planète)
    if (cellObj.type === 'planet') {
      // On garde une copie "instantanée" pour l'encadré d'infos
      setState(s => ({ ...s, selectedPlanet: { ...cellObj } }));
    }

    // Placement
    if (state.phase === 'placement') {
      if (!state.pickPlanet) {
        if (cellObj.type === 'planet') {
          setState(s => ({ ...s, pickPlanet: [r, c] }));
        }
        return;
      }
      const [pr, pc] = state.pickPlanet;
      if (isAdj(pr, pc, r, c) && grid[r][c].type === 'empty') {
        setState(s => {
          const ships = s.ships.map((sh, i) => i === s.current ? { ...sh, pos: [r, c] } : sh);
          const g = s.grid.map(row => row.slice());
          g[pr][pc] = { ...g[pr][pc], owner: currentPlayer.name, revealed: true };
          revealAround(r, c);
          const scores = recomputeScores(g);
          const allHave = ships.every(sh => !!sh.pos);
          if (allHave) {
            return { ...s, ships, grid: g, scores, phase: 'play', current: 0, infoOpen: true, infoText: `Phase de jeu : ${s.players[0].name} commence.`, pickPlanet: null };
          } else {
            const next = (s.current + 1) % s.players.length;
            return { ...s, ships, grid: g, scores, current: next, infoOpen: true, infoText: `${s.players[next].name}, choisis une planète puis une case adjacente.`, pickPlanet: null };
          }
        });
      }
      return;
    }

    // Jeu: déplacements
    if (state.phase === 'play') {
      setState(s => {
        const sh = s.ships[s.current];
        if (!sh.pos) return s;
        const [sr, sc] = sh.pos;
        if (sh.pm <= 0) return s;
        if (isAdj(sr, sc, r, c) && (s.grid[r][c].type === 'empty' || s.grid[r][c].type === 'stargate')) {
          const ships = s.ships.map((x, i) => i === s.current ? { ...x, pos: [r, c], pm: x.pm - 1 } : x);
          revealAround(r, c);
          return { ...s, ships, target: null };
        }
        return s;
      });
    }

    // Sélection d'une planète adjacente pour conquête
    if (cellObj.type === 'planet' && state.phase === 'play') {
      const sh = state.ships[state.current];
      if (sh?.pos && isAdj(sh.pos[0], sh.pos[1], r, c) && cellObj.owner !== currentPlayer.name) {
        setState(s => ({ ...s, target: { r, c } }));
      }
    }
  }

  function endTurn() {
    setState(s => {
      const next = (s.current + 1) % players.length;
      const round = next === 0 ? s.round + 1 : s.round;
      const ships = s.ships.map((x, i) => i === next ? { ...x, pm: movesPerTurn } : x);
      return { ...s, current: next, round, ships, infoOpen: true, infoText: `À ${players[next].name} de jouer. PM : ${movesPerTurn}`, target: null };
    });
  }

  function conquerTarget() {
    setState(s => {
      if (!s.target) return s;
      const { r, c } = s.target;
      const g = s.grid.map(row => row.slice());
      g[r][c] = { ...g[r][c], owner: currentPlayer.name, revealed: true };
      const scores = recomputeScores(g);
      return { ...s, grid: g, scores, target: null };
    });
  }

  function useStargate() {
    setState(s => {
      const sh = s.ships[s.current];
      if (!sh?.pos) return s;
      const [r, c] = sh.pos;
      if (s.grid[r][c].type !== 'stargate') return s;
      const other = s.stargates.find(([gr, gc]) => !(gr === r && gc === c));
      if (!other) return s;
      const ships = s.ships.map((x, i) => i === s.current ? { ...x, pos: other } : x);
      revealAround(other[0], other[1]);
      return { ...s, ships };
    });
  }

  const onGate = !!(currentShip.pos && grid[currentShip.pos[0]][currentShip.pos[1]].type === 'stargate');

  // Helpers d’affichage “inconnu” pour la planète sélectionnée
  const sp = state.selectedPlanet;
  const spRevealed = !!sp?.revealed;
  const spImg = sp ? (spRevealed ? (sp.img || sp.realImg) : '/assets/inconnueV2.png') : null;
  const spName = sp ? (spRevealed ? (sp.name || 'Sans nom') : '???') : null;
  const spType = sp ? (spRevealed ? (sp.type || 'planet') : '???') : null;
  const spTerrain = sp ? (spRevealed ? (sp.terrain || '—') : '???') : null;
  const spInfra = sp ? (spRevealed ? (sp.infrastructure || '—') : '???') : null;
  const spOwner = sp ? (spRevealed ? (sp.owner || 'Aucun') : '???') : null;
  const spVP = sp ? (spRevealed ? (sp.vp ?? 0) : '???') : null;

  return (
    <div className="container">
      <div className="topbar">
        <button className="btn press" data-click-sound onClick={endTurn}>Fin du tour</button>
        <button className="btn" data-click-sound onClick={() => setState(s => ({ ...s, menuOpen: true }))}>⚙️ Menu</button>
      </div>

      <div className="grid-wrap">
        <div className="neon" style={{ padding: 16 }}>
          <h2 className="title">Carte Galactique</h2>
          <div className="grid" style={{ '--size': gridSize }}>
            {grid.map((row, r) => row.map((cellObj, c) => {
              const safe = cellObj || { type: 'empty' };
              const isShip = state.ships.some(sh => sh.pos && sh.pos[0] === r && sh.pos[1] === c);
              const ownerColor = safe.owner ? (players.find(p => p.name === safe.owner)?.color || '#39FF14') : null;
              const imgSrc = safe.type === 'planet'
                ? (safe.revealed ? (safe.img || safe.realImg) : '/assets/inconnueV2.png')
                : (safe.type === 'stargate' ? '/assets/orbitaleV2.png' : null);

              return (
                <div key={`${r}-${c}`} className="cell" onClick={() => handleCellClick(r, c)}>
                  {ownerColor && <span className="halo" style={{ color: ownerColor }} />}
                  {imgSrc && <img className={safe.type === 'stargate' ? 'stargate' : undefined} src={imgSrc} alt={safe.name || safe.type} />}
                  {isShip && (
                    <img
                      src="/assets/spaceship.png"
                      alt="Vaisseau"
                      style={{
                        width: '28px',
                        height: '28px',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        filter: `drop-shadow(0 0 4px ${state.ships.find(sh => sh.pos && sh.pos[0] === r && sh.pos[1] === c)?.color})
                                 drop-shadow(0 0 6px ${state.ships.find(sh => sh.pos && sh.pos[0] === r && sh.pos[1] === c)?.color})
                                 saturate(2)`,
                      }}
                    />
                  )}
                </div>
              );
            }))}
          </div>
          <div className="note" style={{ marginTop: 8 }}>
            {state.phase === 'placement'
              ? `Placement : ${currentPlayer.name} choisit une planète puis une case adjacente pour placer son vaisseau.`
              : `Manche ${state.round} — ${currentPlayer.name} — PM restants : ${currentShip.pm}`}
          </div>
        </div>

        <div className="neon sidebar">
          <h3 style={{ marginTop: 0 }}>Infos</h3>
          <div>Manche : <b>{state.round}</b></div>
          <div>Tour : <b>{currentPlayer.name}</b> — PM : <b>{currentShip.pm}</b></div>
          <hr className="sep" />
          <div><b>Points de victoire</b></div>
          {players.map(p => (
            <div key={p.name} className="stat-line" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '14px', background: p.color, borderRadius: '3px', display: 'inline-block' }}></span>
              <span>{p.name}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>{state.scores[p.name] || 0}</span>
            </div>
          ))}
          <hr className="sep" />
          <div><b>Actions</b></div>
          {state.target && <button className="btn" data-click-sound onClick={conquerTarget}>Coloniser / Conquérir</button>}
          {onGate && <button className="btn" data-click-sound onClick={useStargate}>Utiliser stargate</button>}
          {!state.target && !onGate && <div className="note">Clique une planète adjacente pour la coloniser / conquérir. Déplace-toi (N/E/S/O). Stargate = téléportation.</div>}

          {/* Encadré infos planète sélectionnée */}
          {sp && (
            <div style={{ marginTop: 20, padding: 10, border: '1px solid var(--neon)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}>
              <h4 style={{ marginTop: 0 }}>{spName}</h4>
              {spImg && <img src={spImg} alt={spName || 'Planète'} style={{ width: '60px', height: '60px', borderRadius: '50%' }} />}
              <div>Type : <b>{spType}</b></div>
              <div>
                Terrain :{' '}
                <b
                  style={{ cursor: spRevealed ? 'pointer' : 'default', color: spRevealed ? 'var(--accent)' : 'inherit' }}
                  onClick={() => spRevealed && setRuleModal({ open: true, title: `Règle terrain : ${spTerrain}`, content: terrainRules[spTerrain] })}
                >
                  {spTerrain}
                </b>
              </div>
              <div>
                Infrastructure :{' '}
                <b
                  style={{ cursor: spRevealed ? 'pointer' : 'default', color: spRevealed ? 'var(--accent)' : 'inherit' }}
                  onClick={() => spRevealed && setRuleModal({ open: true, title: `Règle infrastructure : ${spInfra}`, content: infrastructureRules[spInfra] })}
                >
                  {spInfra}
                </b>
              </div>
              <div>Propriétaire : <b>{spOwner}</b></div>
              <div>Points de victoire : <b>{spVP}</b></div>
            </div>
          )}
        </div>
      </div>

      <TurnPrompt open={state.infoOpen} title="Info" message={state.infoText} onClose={() => setState(s => ({ ...s, infoOpen: false }))} />
      <MenuModal open={state.menuOpen} onClose={() => setState(s => ({ ...s, menuOpen: false }))}
        getState={() => ({ config, state })} onLoadState={(full) => { if (full?.state) { setState(full.state); } }} onNewCampaign={onRestart} />
      <RuleModal open={ruleModal.open} title={ruleModal.title} content={ruleModal.content} onClose={() => setRuleModal({ open: false, title: "", content: "" })} />
    </div>
  );
}
