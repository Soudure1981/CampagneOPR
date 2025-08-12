// src/components/ShipIcon.jsx
import React from "react";

/**
 * Icône de vaisseau recolorable (SVG inline).
 * - color : couleur CSS (ex: "#39FF14")
 * - size  : px
 * - glow  : halo optionnel
 */
export default function ShipIcon({ color = "#39FF14", size = 28, glow = true }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Vaisseau"
      style={{ display: "block" }}
    >
      {glow && (
        <defs>
          <filter id="shipGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.85" />
          </filter>
        </defs>
      )}

      <g fill={color} filter={glow ? "url(#shipGlow)" : undefined}>
        {/* Nez + fuselage (losange / pointe) */}
        <path d="M32 4 L44 34 L32 30 L20 34 Z" />
        {/* Aile gauche */}
        <path d="M20 36 L14 46 L24 42 Z" />
        {/* Aile droite */}
        <path d="M44 36 L40 42 L50 46 Z" />
        {/* Dérive / tuyère */}
        <path d="M30 34 L32 58 L34 34 Z" />
      </g>

      {/* Hublot doux */}
      <circle cx="32" cy="24" r="4" fill="#ffffff" opacity="0.28" />
    </svg>
  );
}
