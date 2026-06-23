import React from 'react';
import ScoreBar from './ScoreBar';
import '../styles/CropCard.css';

const TIER_COLORS = {
  Excellent: '#22c55e',
  Good: '#84cc16',
  Moderate: '#eab308',
  Poor: '#f97316',
  'Very Poor': '#ef4444',
};

const CropCard = ({ crop, isExpanded, onToggle }) => {
  const tierColor = TIER_COLORS[crop.tier?.label] || '#6b7280';
  const strat = crop.cultivation_strategy;

  return (
    <div className={`crop-card ${isExpanded ? 'crop-card--expanded' : ''}`}>
      {/* Card Header — always visible */}
      <div className="crop-card-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}>
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

        <div className="crop-score-col">
          <div className="compat-percent" style={{ color: tierColor }}>
            {crop.compatibility_percent}%
          </div>
          <div className="compat-tier" style={{ background: tierColor + '22', color: tierColor }}>
            {crop.tier?.label}
          </div>
          <ScoreBar score={crop.compatibility_score} color={tierColor} />
        </div>

        <div className="expand-arrow">{isExpanded ? '▲' : '▼'}</div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="crop-card-body">
          <p className="crop-description">{crop.description}</p>

          {/* Score Breakdown */}
          <div className="score-breakdown">
            <h4 className="breakdown-title">Score Breakdown</h4>
            <div className="breakdown-grid">
              {Object.entries(crop.score_breakdown).map(([key, val]) => (
                <div className="breakdown-item" key={key}>
                  <div className="breakdown-label">
                    {key === 'rainfall' ? '🌧️ Rainfall' : key === 'humidity' ? '💧 Humidity' : '🧪 pH'}
                  </div>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-bar" style={{ width: `${val.score * 100}%`, background: tierColor }} />
                  </div>
                  <div className="breakdown-score">{(val.score * 100).toFixed(0)}%</div>
                  <div className="breakdown-weight">×{val.weight} = {(val.weighted * 100).toFixed(1)}pts</div>
                </div>
              ))}
            </div>

            {/* Range Reference */}
            <div className="range-reference">
              {Object.entries(crop.range_info).map(([key, info]) => (
                <div className="range-item" key={key}>
                  <span className="range-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span className="range-bounds">{info.min}–{info.max}</span>
                  <span className="range-input">(Your input: {info.input})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="crop-stats">
            <div className="crop-stat-item">
              <span className="stat-icon">⏱️</span>
              <div>
                <div className="stat-name">Harvest Duration</div>
                <div className="stat-val">{crop.harvest_duration}</div>
              </div>
            </div>
            <div className="crop-stat-item">
              <span className="stat-icon">📦</span>
              <div>
                <div className="stat-name">Avg. Yield</div>
                <div className="stat-val">{crop.avg_yield}</div>
              </div>
            </div>
          </div>

          {/* Cultivation Strategy */}
          {strat ? (
            <div className="strategy-section">
              <h4 className="strategy-title">
                🌱 Cultivation Strategy for <em>{strat.compatible_soil_texture}</em> Soil
              </h4>
              <div className="strategy-grid">
                <div className="strategy-card">
                  <div className="strategy-card-label">💦 Irrigation Method</div>
                  <div className="strategy-card-value">{strat.irrigation_method}</div>
                </div>
                <div className="strategy-card">
                  <div className="strategy-card-label">🌿 Water Requirement</div>
                  <div className="strategy-card-value">{strat.water_requirement}</div>
                </div>
                <div className="strategy-card">
                  <div className="strategy-card-label">📅 Best Season</div>
                  <div className="strategy-card-value">{strat.best_season}</div>
                </div>
                <div className="strategy-card strategy-card--full">
                  <div className="strategy-card-label">⚗️ Fertilizer Cycle</div>
                  <div className="strategy-card-value">{strat.fertilizer_cycle}</div>
                </div>
                <div className="strategy-card strategy-card--full strategy-card--tip">
                  <div className="strategy-card-label">💡 Pro Farming Tip</div>
                  <div className="strategy-card-value">{strat.farming_tip}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="strategy-missing">
              No specific cultivation guide for this soil type yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropCard;
