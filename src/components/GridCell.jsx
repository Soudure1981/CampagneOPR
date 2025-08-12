import React from 'react'
export default function GridCell({ children, isPlanet, onClick }) {
  return (
    <div
      className={'grid-cell' + (isPlanet ? ' planet' : '')}
      onClick={onClick}
      style={{
        width:'64px', height:'64px', border:'2px solid #30e8fc', borderRadius:'12px',
        display:'flex', alignItems:'center', justifyContent:'center',
        background: isPlanet ? 'rgba(60,80,90,0.12)' : 'rgba(10,20,30,0.06)',
        boxShadow: isPlanet ? '0 0 18px 4px #1fd655aa, 0 0 8px #fff3' : '0 0 8px #40e9ff44',
        cursor: onClick ? 'pointer' : 'default', position:'relative'
      }}
    >
      {children}
    </div>
  )
}
