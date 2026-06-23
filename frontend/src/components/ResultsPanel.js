import React, { useState } from 'react';
import CropCard from './CropCard';
import ScoreSummary from './ScoreSummary';
import '../styles/ResultsPanel.css';

const ResultsPanel = ({ results, inputs }) => {
  const [expanded, setExpanded] = useState(null);
  const { matched, total_candidates, results: crops } = results;

  if (matched === 0) {
    return (
      <div className="results-panel">
        <div className="results-empty">
          <div className="empty-icon">🌵</div>
          <h3>No Compatible Crops Found</h3>
          <p>
            No crops in our database match <strong>{inputs.soilTexture}</strong> soil texture
            with your climate conditions. Try adjusting the soil type or check if your
            rainfall and humidity values are realistic for your region.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-panel">
      {/* Summary Header */}
      <div className="results-header">
        <div className="results-meta">
          <h2 className="results-title">Crop Compatibility Results</h2>
          <p className="results-subtitle">
            <span className="meta-highlight">{matched}</span> compatible crops found out of {total_candidates} analyzed
            for <strong>{inputs.soilTexture}</strong> soil
          </p>
        </div>

        <div className="inputs-summary">
          <div className="input-chip">🌧️ {inputs.rainfall} mm</div>
          <div className="input-chip">💧 {inputs.humidity}%</div>
          <div className="input-chip">🧪 pH {inputs.ph}</div>
          <div className="input-chip">🏔️ {inputs.soilTexture}</div>
        </div>
      </div>

      {/* Top pick callout */}
      {crops[0] && (
        <div className="top-pick">
          <div className="top-pick-label">🏆 Best Match</div>
          <div className="top-pick-name">
            {crops[0].crop_icon} {crops[0].crop_name}
          </div>
          <div className="top-pick-score">{crops[0].compatibility_percent}% compatible</div>
        </div>
      )}

      {/* Crop Cards */}
      <div className="crop-list">
        {crops.map((crop) => (
          <CropCard
            key={crop.crop_id}
            crop={crop}
            isExpanded={expanded === crop.crop_id}
            onToggle={() => setExpanded(expanded === crop.crop_id ? null : crop.crop_id)}
          />
        ))}
      </div>

      {/* Algorithm Note */}
      <div className="algo-note">
        <span className="algo-note-icon">⚙️</span>
        <span>
          Ranked via a <strong>Deterministic Range-Bound Evaluation Matrix</strong>.
          Scores reflect how close your climate data sits to each crop's optimal agronomic window.
          Crops incompatible with <strong>{inputs.soilTexture}</strong> soil were filtered before scoring.
        </span>
      </div>
    </div>
  );
};

export default ResultsPanel;
