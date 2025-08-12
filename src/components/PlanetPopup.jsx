import React from 'react'
export default function PlanetPopup({ planet, players }) {
  if (!planet) return null
  const ownerName = planet.owner ? (players.find(p => p.id === (planet.owner?.id))?.name || planet.owner.name) : 'Aucun'
  return (
    <div>
      <div style={{ fontWeight: 'bold', fontSize: 19 }}>
        {planet.status === 'unknown' ? 'Planète inconnue' : planet.name}
        {planet.isCapital && <span style={{ color: '#FFD700', marginLeft: 10 }}>[Capitale]</span>}
      </div>
      {planet.status !== 'unknown' && (
        <>
          <div>Type : <b>{planet.type}</b></div>
          <div>Installation : <b>{planet.installation}</b></div>
        </>
      )}
      <div>Propriétaire : <b>{ownerName}</b></div>
      <div>Points de victoire : <b>{planet.victoryPoints || 0}</b></div>
    </div>
  )
}
