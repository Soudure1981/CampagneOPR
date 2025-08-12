
import React, { useEffect, useState } from 'react';

const defaultColors=['#39FF14','#00e0ff','#FF3D00','#FFD700','#9b59b6','#f39c12'];

export default function CampaignWizard({ onFinish }){
  const [numPlayers,setNumPlayers]=useState(3);
  const [players,setPlayers]=useState([]);
  const [gridSize,setGridSize]=useState(8);
  const [numPlanets,setNumPlanets]=useState(10);
  const [pm,setPm]=useState(3);

  useEffect(()=>{
    setPlayers(prev=>{
      const arr=[...prev];
      while(arr.length<numPlayers){ const i=arr.length; arr.push({id:i+1, name:`Joueur ${i+1}`, color: defaultColors[i%defaultColors.length]}); }
      return arr.slice(0,numPlayers);
    });
  },[numPlayers]);

  const upd=(i,k,v)=>setPlayers(p=>{ const a=[...p]; a[i]={...a[i],[k]:v}; return a; });

  return (
    <div className="container">
      <div className="neon wizard">
        <h1 className="title">Configuration de la campagne</h1>

        <div className="row">
          <div>Nombre de joueurs :</div>
          <input className="number" type="number" min={2} max={6} value={numPlayers} onChange={e=>setNumPlayers(+e.target.value)} />
        </div>

        {players.map((p,i)=>(
          <div className="row" key={i}>
            <div>Nom :</div>
            <input className="input" value={p.name} onChange={e=>upd(i,'name',e.target.value)} />
            <div>Couleur :</div>
            <input className="color" type="color" value={p.color} onChange={e=>upd(i,'color',e.target.value)} />
            <div style={{opacity:.85}}>{p.color}</div>
          </div>
        ))}

        <div className="row">
          <div>Taille de la grille :</div>
          <input className="number" type="number" min={6} max={12} value={gridSize} onChange={e=>setGridSize(+e.target.value)} />
        </div>
        <div className="row">
          <div>Nombre de planètes :</div>
          <input className="number" type="number" min={numPlayers} max={gridSize*gridSize-2} value={numPlanets} onChange={e=>setNumPlanets(+e.target.value)} />
        </div>
        <div className="row">
          <div>PM par tour (mouvements) :</div>
          <input className="number" type="number" min={1} max={8} value={pm} onChange={e=>setPm(+e.target.value)} />
        </div>

        <div className="row" style={{justifyContent:'center', marginTop:16}}>
          <button className="btn" data-click-sound onClick={()=>onFinish({players, gridSize, numPlanets, movesPerTurn: pm})}>
            Générer la carte
          </button>
        </div>
      </div>
    </div>
  );
}
