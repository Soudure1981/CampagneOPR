// src/components/online/OnlineGame.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

export default function OnlineGame(){
  const nav = useNavigate()
  const { id } = useParams()
  const [camp, setCamp] = useState(null)
  const [players, setPlayers] = useState([])

  useEffect(()=>{
    let ch1=null, ch2=null
    async function init(){
      const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single()
      if(!error) setCamp(data)
      const { data:pl, error:err2 } = await supabase.from('campaign_players').select('*').eq('campaign_id', id).order('slot')
      if(!err2) setPlayers(pl||[])

      ch1 = supabase.channel('camp-'+id)
        .on('postgres_changes', {event:'UPDATE', schema:'public', table:'campaigns', filter:`id=eq.${id}`}, payload=>{
          setCamp(payload.new)
        }).subscribe()

      ch2 = supabase.channel('players-'+id)
        .on('postgres_changes', {event:'INSERT', schema:'public', table:'campaign_players', filter:`campaign_id=eq.${id}`}, payload=>{
          setPlayers(p=>[...p, payload.new])
        })
        .on('postgres_changes', {event:'DELETE', schema:'public', table:'campaign_players', filter:`campaign_id=eq.${id}`}, payload=>{
          setPlayers(p=>p.filter(x=>x.user_id!==payload.old.user_id))
        })
        .on('postgres_changes', {event:'UPDATE', schema:'public', table:'campaign_players', filter:`campaign_id=eq.${id}`}, payload=>{
          setPlayers(p=>p.map(x=> x.user_id===payload.new.user_id? payload.new : x ))
        })
        .subscribe()
    }
    init()
    return ()=>{
      try{ if(ch1) supabase.removeChannel(ch1); if(ch2) supabase.removeChannel(ch2);}catch(e){}
    }
  }, [id])

  return (
    <div className="container">
      <div className="neon" style={{padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}>
          <h2 className="title" style={{margin:0}}>{camp? camp.title : 'Partie (en ligne)'}</h2>
          <div className="row" style={{gap:8}}>
            <button className="btn" data-click-sound onClick={()=>nav('/lobby')}>Retour lobby</button>
            <button className="btn press" data-click-sound onClick={()=>nav(`/campaign/${id}/play`)}>Jouer</button>
          </div>
        </div>

        <div className="grid-wrap" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="neon" style={{padding:12}}>
            <h3 style={{marginTop:0}}>Joueurs</h3>
            {players.map(p=>(
              <div key={p.user_id} className="row" style={{alignItems:'center', gap:8}}>
                <span style={{width:14,height:14,background:p.color,borderRadius:3, display:'inline-block'}} />
                <div>Slot {p.slot} — {p.name} {p.role==='gm'?'(GM)':''}</div>
              </div>
            ))}
          </div>
          <div className="neon" style={{padding:12}}>
            <h3 style={{marginTop:0}}>Statut</h3>
            <div>Carte synchronisée prête. Clique sur <b>Jouer</b>.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
