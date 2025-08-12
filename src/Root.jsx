
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/online/Home.jsx'
import AuthPage from './components/online/AuthPage.jsx'
import Lobby from './components/online/Lobby.jsx'
import OnlineGame from './components/online/OnlineGame.jsx'
import App from './App.jsx'

export default function Root(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/campaign/:id" element={<OnlineGame />} />
      <Route path="/offline" element={<App />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
