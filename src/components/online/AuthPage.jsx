import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

export default function AuthPage(){
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')

  useEffect(()=>{
    supabase.auth.getSession().then(({ data:{session} })=>{
      if(session) nav('/lobby', { replace:true })
    })
  }, [])

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true); setError('')
    try{
      if(mode==='login'){
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
      }else{
        const { error } = await supabase.auth.signUp({ email, password })
        if(error) throw error
      }
      nav('/lobby')
    }catch(err){
      setError(err.message || 'Erreur')
    }finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <div className="neon wizard" style={{maxWidth:520}}>
        <h2 className="title" style={{textAlign:'center'}}>{mode==='login'?'Connexion':'Créer un compte'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div>Email</div>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="row">
            <div>Mot de passe</div>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          {error && <div className="row" style={{color:'#ff6',whiteSpace:'pre-wrap'}}>{error}</div>}
          <div className="row" style={{justifyContent:'center', gap:10, marginTop:10}}>
            <button className="btn" data-click-sound disabled={loading}>{mode==='login'?'Se connecter':'Créer le compte'}</button>
            <button type="button" className="btn" data-click-sound onClick={()=>setMode(mode==='login'?'signup':'login')}>
              {mode==='login'?'Créer un compte':'J’ai déjà un compte'}
            </button>
          </div>
          <div className="row" style={{justifyContent:'center', marginTop:6}}>
            <button type="button" className="btn" data-click-sound onClick={()=>nav('/')}>⟵ Accueil</button>
          </div>
        </form>
      </div>
    </div>
  )
}
