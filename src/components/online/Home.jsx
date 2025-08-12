
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home(){
  const nav = useNavigate()
  return (
    <div className="container">
      <div className="neon wizard" style={{maxWidth:560}}>
        <h1 className="title" style={{textAlign:'center'}}>Carte Galactique</h1>
        <p style={{opacity:.9}}>Bienvenue ! Choisis un mode :</p>
        <div className="row" style={{justifyContent:'center', marginTop:10, gap:10}}>
          <button className="btn" data-click-sound onClick={()=>nav('/login')}>Mode en ligne (connexion)</button>
          <button className="btn" data-click-sound onClick={()=>nav('/offline')}>Mode hors‑ligne</button>
        </div>
      </div>
    </div>
  )
}
