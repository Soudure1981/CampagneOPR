import React from 'react';

export default function RouteSVG({ from, to, cellSize, gap = 8, color = '#39FF14' }) {
  if (!from || !to) return null;
  const cx = (col) => col * (cellSize + gap) + cellSize / 2 + gap / 2;
  const cy = (row) => row * (cellSize + gap) + cellSize / 2 + gap / 2;

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <line
        x1={cx(from.col)} y1={cy(from.row)}
        x2={cx(to.col)}   y2={cy(to.row)}
        stroke={color}
        strokeDasharray="7 7"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}
