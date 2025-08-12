import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

async function getUser(){
  const { data:{ user } } = await supabase.auth.getUser()
  return user
}

export default function Lobby(){
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [camps, setCamps] = useState([])
  const [title, setTitle] = useState('Nouvelle campagne')
  const [joinId, setJoinId] = useState('')
  const [slot, setSlot] = useState(1)
  const [color, setColor] = useState('#39FF14')
  const [name, setName] = useState('Joueur')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    supabase.auth.getSession().then(async ({data:{session}})=>{
      if(!session){ nav('/login'); return }
      setUser(session.user)
      await load()
    })
    const { data: sub } = supabase.auth.onAuthStateChange((evt, session)=>{
      if(!session) nav('/login')
    })
    return ()=>{ sub.subscription.unsubscribe() }
  }, [])

  async function load(){
    const u = await getUser()
    const { data, error } = await supabase
      .from('campaign_players')
      .select('campaigns:campaign_id(id,title,updated_at)')
      .eq('user_id', u.id)
    if(!error){
      const arr = (data||[]).map(d=>d.campaigns).filter(Boolean)
      arr.sort((a,b)=> new Date(b.updated_at||0) - new Date(a.updated_at||0))
      setCamps(arr)
    }
  }

  async function createCampaign(){
    setLoading(true)
    try{
      const u = await getUser()
      const defaultConfig = { gridSize:8, movesPerTurn:3 }
      const defaultState = { grid:[], round:1, current:0, phase:'placement', scores:{} }
      const { data: camp, error } = await supabase
        .from('campaigns')
        .insert([{ title, owner_id: u.id, config: defaultConfig, state: defaultState }])
        .select().single()
      if(error) throw error
      await supabase.from('campaign_players').insert([
        { campaign_id: camp.id, user_id: u.id, slot: 1, name: 'GM', color:'#39FF14', role:'gm' }
      ])
      setTitle('Nouvelle campagne')
      await load()
    }catch(e){
      alert(e.message || 'Erreur création')
    }finally{ setLoading(false) }
  }

  async function joinCampaign(){
    setLoading(true)
    try{
      const u = await getUser()
      const { error } = await supabase.from('campaign_players').insert([
        { campaign_id: joinId, user_id: u.id, slot, name, color, role:'player' }
      ])
      if(error) throw error
      setJoinId('')
      await load()
    }catch(e){
      alert(e.message || 'Erreur join')
    }finally{ setLoading(false) }
  }

  function openCampaign(id){
    nav(`/campaign/${id}`)
  }

  async function logout(){
    await supabase.auth.signOut()
    nav('/')
  }

  return (
    <div className="container">
      <div className="neon" style={{padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}>
          <h2 className="title" style={{margin:0}}>Lobby</h2>
          <div className="row" style={{gap:8}}>
            <button className="btn" data-click-sound onClick={()=>nav('/')}>Accueil</button>
            <button className="btn" data-click-sound onClick={logout}>Se déconnecter</button>
          </div>
        </div>

        <div className="grid-wrap" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="neon" style={{padding:12}}>
            <h3 style={{marginTop:0}}>Mes campagnes</h3>
            {camps.length===0 && <div className="note">Aucune. Crée une campagne ou rejoins avec un ID.</div>}
            {camps.map(c=>(
              <div key={c.id} className="row" style={{justifyContent:'space-between'}}>
                <div>{c.title}</div>
                <button className="btn" data-click-sound onClick={()=>openCampaign(c.id)}>Ouvrir</button>
              </div>
            ))}
          </div>

          <div className="neon" style={{padding:12}}>
            <h3 style={{marginTop:0}}>Créer une campagne</h3>
            <div className="row">
              <div>Nom :</div>
              <input className="input" value={title} onChange={e=>setTitle(e.target.value)} />
            </div>
            <button className="btn" data-click-sound disabled={loading} onClick={createCampaign}>Créer</button>

            <hr className="sep" />
            <h3>Rejoindre par ID</h3>
            <div className="row"><div>ID :</div><input className="input" value={joinId} onChange={e=>setJoinId(e.target.value)} /></div>
            <div className="row"><div>Nom :</div><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div className="row"><div>Couleur :</div><input className="color" type="color" value={color} onChange={e=>setColor(e.target.value)} /></div>
            <div className="row"><div>Slot :</div><input className="number" type="number" min={1} max={6} value={slot} onChange={e=>setSlot(+e.target.value)} /></div>
            <button className="btn" data-click-sound disabled={loading || !joinId} onClick={joinCampaign}>Rejoindre</button>
          </div>
        </div>
      </div>
    </div>
  )
}
