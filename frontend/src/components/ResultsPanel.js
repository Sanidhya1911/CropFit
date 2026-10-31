import React, { useState } from 'react';
import CropCard, { getScoreStyle } from './CropCard';
import '../styles/ResultsPanel.css';

const ResultsPanel = ({ results, inputs }) => {
  const [expanded, setExpanded] = useState(null);
  const { matched = 0, results: crops = [] } = results || {};

  const count = crops.length || matched;
  const cropLabel = count === 1 ? 'compatible crop' : 'compatible crops';

  return (
    <div className="results-panel">
      {/* Summary Header */}
      <div className="results-header">
        <div className="results-meta">
          <h2 className="results-title">Crop Compatibility Results</h2>
          <p className="results-subtitle">
            <span className="meta-highlight">{count}</span> {cropLabel} found for <strong>{inputs?.soilTexture}</strong> soil
          </p>
        </div>

        <div className="inputs-summary">
          {inputs?.n !== undefined && !isNaN(inputs.n) && <div className="input-chip">🌱 N {inputs.n} kg/ha</div>}
          {inputs?.p !== undefined && !isNaN(inputs.p) && <div className="input-chip">🌾 P {inputs.p} kg/ha</div>}
          {inputs?.k !== undefined && !isNaN(inputs.k) && <div className="input-chip">🍂 K {inputs.k} kg/ha</div>}
          {inputs?.ph !== undefined && <div className="input-chip">🧪 pH {inputs.ph}</div>}
          {inputs?.rainfall !== undefined && <div className="input-chip">🌧️ {inputs.rainfall} mm</div>}
          {inputs?.humidity !== undefined && <div className="input-chip">💧 {inputs.humidity}%</div>}
          {inputs?.soilTexture && <div className="input-chip">🏔️ {inputs.soilTexture}</div>}
        </div>
      </div>

      {matched === 0 ? (
        <div className="results-empty">
          <div className="empty-icon">🌵</div>
          <h3>No Compatible Crops Found</h3>
          <p>
            No crops in our database match <strong>{inputs?.soilTexture}</strong> soil texture
            with your climate conditions. Check if your rainfall, pH, and nutrient values are realistic for your region.
          </p>
        </div>
      ) : (
        <>
          {/* Top pick callout with dynamic score and color */}
          {crops[0] && (() => {
            const rawTop = crops[0].compatibility_score ?? crops[0].compatibility_percent ?? 0;
            const topScore = Math.round(
              Number(rawTop) <= 1 && Number(rawTop) > 0 ? Number(rawTop) * 100 : Number(rawTop)
            );
            const { color: topColor } = getScoreStyle(topScore);

            return (
              <div className="top-pick">
                <div className="top-pick-label" style={{ color: topColor }}>
                  🏆 Algorithmic Top Pick
                </div>
                <div className="top-pick-name">
                  {crops[0].crop_icon} {crops[0].crop_name}
                </div>
                <div className="top-pick-score" style={{ color: topColor }}>
                  {topScore}% compatible
                </div>
              </div>
            );
          })()}

          {/* Dynamic Crop Compatibility Cards List */}
          <div className="crop-list">
            {crops.map((crop) => (
              <CropCard
                key={crop.crop_id || crop.id || crop.crop_name}
                crop={crop}
                isExpanded={expanded === (crop.crop_id || crop.id)}
                onToggle={() =>
                  setExpanded(
                    expanded === (crop.crop_id || crop.id) ? null : crop.crop_id || crop.id
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Algorithm Note */}
      <div className="algo-note">
        <span className="algo-note-icon">⚙️</span>
        <span>
          Scores are generated strictly via a <strong>Deterministic Range-Bound Evaluation Matrix</strong> cross-checked
          mathematically against safe NPK & pH agronomic boundaries.
        </span>
      </div>
    </div>
  );
};

export default ResultsPanel;
