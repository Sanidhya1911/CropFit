import React from 'react';
import '../styles/ScoreBar.css';

const ScoreBar = ({ score, color = '#22c55e' }) => {
  const normScore = Number(score) > 1 ? Number(score) / 100 : Number(score) || 0;
  const pct = Math.min(100, Math.max(3, Math.round(normScore * 100)));

  return (
    <div className="score-bar-wrap" title={`${pct}% compatible`}>
      <div
        className="score-bar-fill"
        style={{
          width: `${pct}%`,
          background: color,
        }}
      />
    </div>
  );
};

export default ScoreBar;
