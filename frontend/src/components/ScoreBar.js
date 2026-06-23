import React from 'react';
import '../styles/ScoreBar.css';

const ScoreBar = ({ score, color = '#22c55e' }) => (
  <div className="score-bar-wrap" title={`${(score * 100).toFixed(1)}% compatible`}>
    <div
      className="score-bar-fill"
      style={{
        width: `${Math.max(2, score * 100)}%`,
        background: color,
      }}
    />
  </div>
);

export default ScoreBar;
