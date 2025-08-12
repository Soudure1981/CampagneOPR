// src/components/online/OnlinePlay.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { generateMap } from '../../logic/mapGenerator.js'
import ShipIcon from '../ShipIcon.jsx'

function neighbors4(r,c,size){ const out=[]; if(r>0) out.push([r-1,c]); if(r<size-1) out.push([r+1,c]); if(c>0) out.push([r,c-1]); if(c<size-1) out.push([r,c+1]); return out; }
function isAdj(r1,c1,r2,c2){ return Math.abs(r1-r2)+Math.abs(c1-c2)===1; }

export default function OnlinePlay(){
  const nav = useNavigate()
  const { id } = useParams()
  const [me,setMe] = useState(null)
  const [camp,setCamp] = useState(null)
  const [players,setPlayers] = useState([])
  const [state,setState] = useState(null)
  const [logs,setLogs] = useState([])
  const [battle,setBattle] = useState(null)
  const [loading,setLoading] = useState(true)
  const updating = useRef(false)

  useEffect(()=>{
    let chCamp=null, chLogs=null, chBattles=null;
    async function init(){
      const { data:{ user } } = await supabase.auth.getUser()
      setMe(user)

      const { data: campRow } = await supabase.from('campaigns').select('*').eq('id', id).single()
      setCamp(campRow||null)

      const { data: pl } = await supabase.from('campaign_players').select('*').eq('campaign_id', id).order('slot')
      setPlayers(pl||[])

      if(!campRow?.state || !campRow.state.grid || campRow.state.grid.length===0){
        const gridSize = campRow?.config?.gridSize || 8
        const numPlanets = Math.min((campRow?.config?.numPlanets)||12, gridSize*gridSize-2)
        const m = generateMap({ gridSize, numPlanets })
        const ships = (pl||[]).map((p,i)=>({ id:i+1, name:p.name||`Joueur ${i+1}`, color:p.color||'#39FF14', pos:null, pm:(campRow?.config?.movesPerTurn)||3 }))
        const scores = Object.fromEntries((pl||[]).map(p=>[p.name||`Joueur`,0]))
        const initState = {
          grid:m.grid, players:(pl||[]).map(p=>({name:p.name,color:p.color,id:p.user_id})), ships,
          scores, stargates: [[0,0],[gridSize-1,gridSize-1]], current:0, round:1, phase:'placement', infoOpen:false, infoText:'', pickPlanet:null, target:null
        }
        await supabase.from('campaigns').update({ state:initState }).eq('id', id)
        setState(initState)
      }else{
        setState(campRow.state)
      }

      const { data: lg } = await supabase.from('logs').select('*').eq('campaign_id', id).order('created_at', {ascending:true})
      setLogs(lg||[])

      const { data: bs } = await supabase.from('battles').select('*').eq('campaign_id', id).eq('status','pending').limit(1)
      setBattle((bs&&bs[0])||null)

      chCamp = supabase.channel('camp-'+id)
        .on('postgres_changes', {event:'UPDATE', schema:'public', table:'campaigns', filter:`id=eq.${id}`}, payload=>{
          const n = payload.new
          setCamp(n)
          if(n?.state && !updating.current){
            setState(n.state)
          }
        }).subscribe()

      chLogs = supabase.channel('logs-'+id)
        .on('postgres_changes', {event:'INSERT', schema:'public', table:'logs', filter:`campaign_id=eq.${id}`}, payload=>{
          setLogs(prev => [...prev, payload.new])
        }).subscribe()

      chBattles = supabase.channel('battles-'+id)
        .on('postgres_changes', {event:'INSERT', schema:'public', table:'battles', filter:`campaign_id=eq.${id}`}, payload=> setBattle(payload.new))
        .on('postgres_changes', {event:'UPDATE', schema:'public', table:'battles', filter:`campaign_id=eq.${id}`}, payload=> setBattle(payload.new.status==='pending'?payload.new:null))
        .subscribe()

      setLoading(false)
    }
    init()
    return ()=>{ try{
      if(chCamp) supabase.removeChannel(chCamp);
      if(chLogs) supabase.removeChannel(chLogs);
      if(chBattles) supabase.removeChannel(chBattles);
    }catch(e){} }
  }, [id])

  async function pushState(next){
    updating.current = true
    setState(next)
    await supabase.from('campaigns').update({ state: next }).eq('id', id)
    updating.current = false
  }

  const gridSize = useMemo(()=> state?.grid?.length || (camp?.config?.gridSize)||8, [state,camp])
  const movesPerTurn = useMemo(()=> (camp?.config?.movesPerTurn)||3, [camp])
  const currentPlayer = state?.players?.[state?.current]
  const currentShip = state?.ships?.[state?.current]

  function revealAroundLoc(s, r,c){
    const g=s.grid.map(row=>row.slice())
    for(const [nr,nc] of neighbors4(r,c,gridSize)){
      const cell=g[nr][nc]
      if(cell?.type==='planet' || cell?.type==='stargate'){
        g[nr][nc]={...cell, revealed:true}
      }
    }
    return g
  }

  function recomputeScores(g, players){
    const scores=Object.fromEntries(players.map(p=>[p.name,0]))
    for(const row of g){
      for(const cell of row){
        if(cell?.type==='planet' && cell.owner){ scores[cell.owner]+=(cell.vp||1); }
      }
    }
    return scores
  }

  async function handleCellClick(r,c){
    if(!state || loading) return
    if(battle) return
    const cellObj = state.grid[r][c] || { type:'empty' }

    if(state.phase==='placement'){
      if(!state.pickPlanet){
        if(cellObj.type==='planet'){
          await pushState({...state, pickPlanet:[r,c]})
        }
        return;
      }
      const [pr,pc]=state.pickPlanet;
      if(isAdj(pr,pc,r,c) && state.grid[r][c].type==='empty'){
        const ships=state.ships.map((sh,i)=> i===state.current? {...sh, pos:[r,c]}: sh)
        const g=state.grid.map(row=>row.slice())
        g[pr][pc]={...g[pr][pc], owner: currentPlayer.name, revealed:true}
        const g2 = revealAroundLoc({grid:g}, r,c)
        const scores=recomputeScores(g2,state.players)
        const allHave = ships.every(sh=> !!sh.pos)
        if(allHave){
          await pushState({ ...state, ships, grid:g2, scores, phase:'play', current:0, infoOpen:true, infoText:`Phase de jeu : ${state.players[0].name} commence.`, pickPlanet:null })
        }else{
          const next=(state.current+1)%state.players.length
          await pushState({ ...state, ships, grid:g2, scores, current:next, infoOpen:true, infoText:`${state.players[next].name}, choisis une planète puis une case adjacente.`, pickPlanet:null })
        }
      }
      return;
    }

    if(state.phase==='play'){
      const sh=state.ships[state.current]
      if(!sh?.pos) return
      const [sr,sc]=sh.pos
      if(sh.pm<=0) return
      if(isAdj(sr,sc,r,c) && (state.grid[r][c].type==='empty' || state.grid[r][c].type==='stargate')){
        const ships=state.ships.map((x,i)=> i===state.current? {...x, pos:[r,c], pm: x.pm-1 } : x)
        const g2 = revealAroundLoc(state, r,c)
        await pushState({ ...state, ships, grid:g2, target:null })
        return
      }
    }

    if(cellObj.type==='planet' && state.phase==='play'){
      const sh=state.ships[state.current]
      if(sh?.pos && isAdj(sh.pos[0], sh.pos[1], r, c) && cellObj.owner!==currentPlayer.name){
        await pushState({ ...state, target:{r,c} })
      }
    }
  }

  async function endTurn(){
    if(!state || battle) return
    const next=(state.current+1)%state.players.length
    const round = next===0 ? state.round+1 : state.round
    const ships=state.ships.map((x,i)=> i===next? {...x, pm: movesPerTurn } : x)
    await pushState({ ...state, current: next, round, ships, infoOpen: true, infoText:`À ${state.players[next].name} de jouer. PM : ${movesPerTurn}`, target:null })
  }

  async function conquerTarget(){
    if(!state?.target) return
    const {r,c}=state.target
    const cell=state.grid[r][c]
    const attackerName = currentPlayer.name
    const defenderName = cell.owner || 'Aucun'

    if(defenderName==='Aucun'){
      const g=state.grid.map(row=>row.slice())
      g[r][c]={...g[r][c], owner: attackerName, revealed:true}
      const scores=recomputeScores(g,state.players)
      await supabase.from('logs').insert([{ campaign_id:id, type:'colonize', message:`${attackerName} colonise ${cell.name||'planète'} (${r},${c})`, payload:{r,c, owner:attackerName} }])
      await pushState({ ...state, grid:g, scores, target:null })
      return
    }

    const { data: battleRow } = await supabase.from('battles').insert([{
      campaign_id: id, planet_r: r, planet_c: c,
      attacker_name: attackerName, defender_name: defenderName,
      status: 'pending', confirms: {}
    }]).select().single()

    setBattle(battleRow)
    await supabase.from('logs').insert([{ campaign_id:id, type:'battle_start', message:`Bataille engagée: ${attackerName} attaque ${defenderName} sur (${r},${c}).`, payload:{r,c} }])
  }

  async function useStargate(){
    if(!state) return
    const sh=state.ships[state.current]
    if(!sh?.pos) return
    const [r,c]=sh.pos
    if(state.grid[r][c].type!=='stargate') return
    const other = state.stargates.find(([gr,gc])=> !(gr===r && gc===c))
    if(!other) return
    const ships=state.ships.map((x,i)=> i===state.current? {...x, pos: other } : x)
    const g2 = revealAroundLoc(state, other[0], other[1])
    await pushState({ ...state, ships:ships, grid:g2 })
  }

  const iAmGM = useMemo(()=> camp && me && camp.owner_id===me.id, [camp,me])

  async function sendBattleChoice(winner){
    if(!battle || !me) return
    const conf = {...(battle.confirms||{})}
    conf[me.id] = winner
    const { data } = await supabase.from('battles').update({ confirms: conf }).eq('id', battle.id).select().single()
    const values = Object.values(data.confirms||{})
    if(values.length>=2 && values.every(v=>v===values[0])){
      await finalizeBattle(values[0])
    }
  }
  async function forceResolve(winner){
    await finalizeBattle(winner)
  }
  async function finalizeBattle(winner){
    if(!battle) return
    const r = battle.planet_r, c=battle.planet_c
    const g=state.grid.map(row=>row.slice())
    const cell=g[r][c]
    let msg=''
    if(winner==='attacker'){
      g[r][c]={...cell, owner: currentPlayer.name, revealed:true}
      msg = `Bataille: ${currentPlayer.name} conquiert (${r},${c}).`
    }else{
      msg = `Bataille: ${cell.owner} défend (${r},${c}).`
    }
    const scores=recomputeScores(g,state.players)
    await supabase.from('battles').update({ status: winner==='attacker'?'attacker_win':'defender_win', resolved_at: new Date().toISOString() }).eq('id', battle.id)
    await supabase.from('logs').insert([{ campaign_id:id, type:'battle_end', message: msg, payload:{r,c, winner} }])
    setBattle(null)
    await pushState({ ...state, grid:g, scores, target:null })
  }

  const onGate = !!(currentShip?.pos && state?.grid?.[currentShip.pos[0]]?.[currentShip.pos[0]]?.type==='stargate')

  return (
    <div className="container">
      <div className="topbar">
        <button className="btn press" data-click-sound onClick={endTurn} disabled={!!battle}>Fin du tour</button>
        <button className="btn" data-click-sound onClick={()=>nav(`/campaign/${id}`)}>⟵ Retour</button>
      </div>

      <div className="grid-wrap">
        <div className="neon" style={{padding:16}}>
          <h2 className="title">Carte (en ligne)</h2>
          {!state && <div className="note">Chargement…</div>}
          {state && (
            <div className="grid" style={{'--size':gridSize}}>
              {state.grid.map((row,r)=> row.map((cellObj,c)=>{
                const safe=cellObj||{type:'empty'}
                const isShip=state.ships.some(sh=> sh.pos && sh.pos[0]===r && sh.pos[1]===c)
                const ownerColor = safe.owner ? (state.players.find(p=>p.name===safe.owner)?.color || '#39FF14') : null
                const imgSrc = safe.type==='planet'
                    ? (safe.revealed ? (safe.img||safe.realImg) : '/assets/inconnueV2.png')
                    : safe.type==='stargate' ? '/assets/orbitaleV2.png' : null
                return (
                  <div key={`${r}-${c}`} className="cell" onClick={()=>handleCellClick(r,c)}>
                    {ownerColor && <span className="halo" style={{color: ownerColor}} />}
                    {imgSrc && <img className={safe.type==='stargate'?'stargate':undefined} src={imgSrc} alt={safe.name||safe.type} />}
                    {isShip && <ShipIcon size={22} color={state.ships.find(sh=>sh.pos && sh.pos[0]===r && sh.pos[1]===c)?.color || '#39FF14'} />}
                  </div>
                )
              }))}
            </div>
          )}

          <div className="note" style={{marginTop:8}}>
            {battle ? `⚠️ Bataille en attente de validation — aucun mouvement possible.` :
              state ? (state.phase==='placement'
                ? `Placement : ${currentPlayer?.name} choisit une planète puis une case adjacente.`
                : `Manche ${state.round} — ${currentPlayer?.name} — PM : ${currentShip?.pm}`)
                : ''}
          </div>
        </div>

        <div className="neon sidebar">
          <h3 style={{marginTop:0}}>Infos</h3>
          {state && (
            <>
              <div>Manche : <b>{state.round}</b></div>
              <div>Tour : <b>{currentPlayer?.name}</b> — PM : <b>{currentShip?.pm}</b></div>
              <hr className="sep" />
              <div><b>Points de victoire</b></div>
              {state.players.map(p=> (
                <div key={p.name} className="stat-line" style={{display:'flex',justifyContent:'space-between',gap:8}}>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:12,height:12,background:p.color,borderRadius:2,display:'inline-block'}} /> {p.name}</span>
                  <span>{state.scores?.[p.name]||0}</span>
                </div>
              ))}
              <hr className="sep" />
              <div><b>Actions</b></div>
              {state.target && !battle && <button className="btn" data-click-sound onClick={conquerTarget}>Coloniser / Conquérir</button>}
              {onGate && !battle && <button className="btn" data-click-sound onClick={useStargate}>Utiliser stargate</button>}
              {!state.target && !onGate && !battle && <div className="note">Clique une planète adjacente pour coloniser / conquérir.</div>}
            </>
          )}

          {battle && (
            <div className="neon" style={{padding:10, marginTop:12}}>
              <div style={{fontWeight:'bold'}}>Bataille en attente</div>
              <div>Attaquant : <b>{battle.attacker_name}</b></div>
              <div>Défenseur : <b>{battle.defender_name}</b></div>
              <div>Planète : ({battle.planet_r},{battle.planet_c})</div>
              <div className="row" style={{gap:8, marginTop:8}}>
                <button className="btn" data-click-sound onClick={()=>sendBattleChoice('attacker')}>Victoire attaquant</button>
                <button className="btn" data-click-sound onClick={()=>sendBattleChoice('defender')}>Victoire défenseur</button>
              </div>
              {iAmGM && (
                <div className="row" style={{gap:8, marginTop:8}}>
                  <button className="btn press" data-click-sound onClick={()=>forceResolve('attacker')}>Forcer: attaquant</button>
                  <button className="btn press" data-click-sound onClick={()=>forceResolve('defender')}>Forcer: défenseur</button>
                </div>
              )}
            </div>
          )}

          <div className="neon" style={{padding:10, marginTop:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <b>Journal</b>
              <button className="btn" data-click-sound onClick={()=>{
                const txt = logs.map(l=>`[${new Date(l.created_at).toLocaleString()}] ${l.message}`).join('\\n')
                const blob = new Blob([txt], {type:'text/plain'})
                const url = URL.createObjectURL(blob)
                const a=document.createElement('a'); a.href=url; a.download='journal.txt'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000)
              }}>Exporter .txt</button>
            </div>
            <div style={{maxHeight:220, overflowY:'auto', paddingRight:6}}>
              {logs.map(l=> <div key={l.id} style={{whiteSpace:'pre-wrap'}}>{l.message}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
