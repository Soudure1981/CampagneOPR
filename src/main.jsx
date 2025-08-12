// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./styles/index.css";

// Pages / composants
import Root from "./Root.jsx";                           // écran d’accueil (en ligne / hors-ligne)
import AuthPage from "./components/online/AuthPage.jsx"; // connexion / inscription
import Lobby from "./components/online/Lobby.jsx";       // lobby des campagnes
import OnlineGame from "./components/online/OnlineGame.jsx"; // fiche campagne (bouton Jouer)
import OnlinePlay from "./components/online/OnlinePlay.jsx"; // *** carte en ligne synchronisée ***
import App from "./App.jsx";                             // mode hors-ligne existant

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/campaign/:id" element={<OnlineGame />} />
      <Route path="/campaign/:id/play" element={<OnlinePlay />} />
      {/* optionnel : route dédiée pour le mode hors-ligne */}
      <Route path="/offline" element={<App />} />
      {/* fallback simple */}
      <Route path="*" element={<Root />} />
    </Routes>
  </BrowserRouter>
);
