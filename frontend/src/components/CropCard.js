import React from 'react';
import ScoreBar from './ScoreBar';
import '../styles/CropCard.css';

/**
 * Helper to get dynamic styling according to score:
 * - Green for >= 85%
 * - Yellow for 60-84%
 * - Red for < 60%
 */
export const getScoreStyle = (score) => {
  const num = Math.round(Number(score) || 0);
  if (num >= 85) {
    return {
      color: '#22c55e', // Green
      tier: 'Optimal Match',
    };
  }
  if (num >= 60) {
    return {
      color: '#eab308', // Yellow
      tier: 'Moderate Fit',
    };
  }
  return {
    color: '#ef4444', // Red
    tier: 'Poor Fit',
  };
};

const CropCard = ({ crop, isExpanded, onToggle }) => {
  // Extract the deterministic compatibility_score calculated by the backend validation layer
  const rawScore = crop.compatibility_score ?? crop.compatibility_percent ?? 0;
  const score = Math.round(
    Number(rawScore) <= 1 && Number(rawScore) > 0 ? Number(rawScore) * 100 : Number(rawScore)
  );

  const { color: scoreColor, tier: tierLabel } = getScoreStyle(score);
  const strat = crop.cultivation_strategy;

  return (
    <div className={`crop-card ${isExpanded ? 'crop-card--expanded' : ''}`}>
      {/* Card Header — always visible */}
      <div
        className="crop-card-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
        <div className="crop-rank">#{crop.rank}</div>

        <div className="crop-info">
          <div className="crop-name-row">
            <span className="crop-icon-lg">{crop.crop_icon}</span>
            <div>
              <h3 className="crop-name">{crop.crop_name}</h3>
              <span className="crop-category">{crop.category}</span>
            </div>
          </div>
        </div>

        {/* Dynamic percentage display and color-coded tier badge */}
        <div className="crop-score-col">
          <div className="compat-percent" style={{ color: scoreColor }}>
            {score}% compatible
          </div>
          <div
            className="compat-tier"
            style={{
              background: `${scoreColor}22`,
              color: scoreColor,
              border: `1px solid ${scoreColor}44`,
            }}
          >
            {tierLabel}
          </div>
          <ScoreBar score={score / 100} color={scoreColor} />
        </div>

        <div className="expand-arrow">{isExpanded ? '▲' : '▼'}</div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="crop-card-body">
          <p className="crop-description">{crop.description}</p>

          {/* Score Breakdown */}
          {crop.score_breakdown && (
            <div className="score-breakdown">
              <h4 className="breakdown-title">Deterministic Metric Breakdown</h4>
              <div className="breakdown-grid">
                {Object.entries(crop.score_breakdown).map(([key, val]) => {
                  const subScore = Math.round(((val?.score ?? 0) * 100));
                  return (
                    <div className="breakdown-item" key={key}>
                      <div className="breakdown-label">
                        {key === 'rainfall' ? '🌧️ Rainfall' : key === 'humidity' ? '💧 Humidity' : '🧪 pH'}
                      </div>
                      <div className="breakdown-bar-wrap">
                        <div
                          className="breakdown-bar"
                          style={{ width: `${Math.max(4, subScore)}%`, background: scoreColor }}
                        />
                      </div>
                      <div className="breakdown-score">{subScore}%</div>
                      <div className="breakdown-weight">
                        ×{val.weight} = {((val.weighted || 0) * 100).toFixed(1)}pts
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Range Reference */}
              {crop.range_info && (
                <div className="range-reference">
                  {Object.entries(crop.range_info).map(([key, info]) => (
                    <div className="range-item" key={key}>
                      <span className="range-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span className="range-bounds">{info.min}–{info.max}</span>
                      <span className="range-input">(Input: {info.input})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="crop-stats">
            <div className="crop-stat-item">
              <span className="stat-icon">⏱️</span>
              <div>
                <div className="stat-name">Harvest Duration</div>
                <div className="stat-val">{crop.harvest_duration || 'Standard'}</div>
              </div>
            </div>
            <div className="crop-stat-item">
              <span className="stat-icon">📦</span>
              <div>
                <div className="stat-name">Avg. Yield</div>
                <div className="stat-val">{crop.avg_yield || 'High yield'}</div>
              </div>
            </div>
          </div>

          {/* Cultivation Strategy */}
          {strat ? (
            <div className="cultivation-strategy">
              <h4 className="strategy-title">Cultivation Strategy · {strat.compatible_soil_texture} Soil</h4>
              <div className="strategy-grid">
                <div className="strat-item">
                  <span className="strat-label">💧 Irrigation</span>
                  <span className="strat-val">{strat.irrigation_method || 'Standard schedule'}</span>
                </div>
                <div className="strat-item">
                  <span className="strat-label">📅 Season</span>
                  <span className="strat-val">{strat.best_season || 'All season'}</span>
                </div>
                <div className="strat-item">
                  <span className="strat-label">🧪 Fertilization</span>
                  <span className="strat-val">{strat.fertilizer_cycle || 'Balanced NPK schedule'}</span>
                </div>
                <div className="strat-item">
                  <span className="strat-label">💡 Expert Farming Tip</span>
                  <span className="strat-val">{strat.farming_tip || 'Monitor soil moisture regularly.'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="cultivation-strategy-empty">
              <span>ℹ️ General agronomic management applies.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropCard;
