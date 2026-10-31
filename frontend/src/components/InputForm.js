import React, { useState } from 'react';
import '../styles/InputForm.css';

const SOIL_TEXTURES = ['Sandy', 'Loamy', 'Clayey', 'Silty', 'Sandy Loam', 'Clay Loam'];

const FIELD_CONFIG = [
  {
    name: 'n',
    label: 'Nitrogen (N)',
    unit: 'kg/ha',
    icon: '🌱',
    min: 0,
    max: 300,
    step: 5,
    placeholder: 'e.g. 90',
    hint: 'Available soil nitrogen in kg per hectare',
    example: 'Rice: 80–120 | Wheat: 100–150 | Maize: 120–180',
  },
  {
    name: 'p',
    label: 'Phosphorus (P)',
    unit: 'kg/ha',
    icon: '🌾',
    min: 0,
    max: 200,
    step: 5,
    placeholder: 'e.g. 50',
    hint: 'Available soil phosphorus in kg per hectare',
    example: 'Low: <30 | Optimal: 40–70 | High: >80',
  },
  {
    name: 'k',
    label: 'Potassium (K)',
    unit: 'kg/ha',
    icon: '🍂',
    min: 0,
    max: 300,
    step: 5,
    placeholder: 'e.g. 50',
    hint: 'Available soil potassium in kg per hectare',
    example: 'Low: <30 | Optimal: 40–60 | High: >80',
  },
  {
    name: 'ph',
    label: 'Soil pH',
    unit: 'pH',
    icon: '🧪',
    min: 0,
    max: 14,
    step: 0.1,
    placeholder: 'e.g. 6.5',
    hint: 'Soil acidity/alkalinity (7.0 = neutral)',
    example: 'Acidic: <6.0 | Neutral: 6.0–7.0 | Alkaline: >7.5',
  },
  {
    name: 'rainfall',
    label: 'Annual Rainfall / Moisture',
    unit: 'mm',
    icon: '🌧️',
    min: 0,
    max: 5000,
    step: 10,
    placeholder: 'e.g. 800',
    hint: 'Total annual precipitation in millimeters',
    example: 'Semi-arid: 300–700 | Humid: 1000–2000',
  },
  {
    name: 'humidity',
    label: 'Relative Humidity',
    unit: '%',
    icon: '💧',
    min: 0,
    max: 100,
    step: 1,
    placeholder: 'e.g. 65',
    hint: 'Average annual relative humidity percentage',
    example: 'Dry: 20–40% | Moderate: 40–70% | Humid: 70–90%',
  },
];

const InputForm = ({ onSubmit, onReset, loading, hasResults }) => {
  const [values, setValues] = useState({
    n: '90',
    p: '50',
    k: '50',
    ph: '6.5',
    rainfall: '800',
    humidity: '65',
    soilTexture: 'Loamy',
  });
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name) => setTouched((prev) => ({ ...prev, [name]: true }));

  const isValid = (name, val) => {
    if (name === 'soilTexture') return SOIL_TEXTURES.includes(val);
    const cfg = FIELD_CONFIG.find((f) => f.name === name);
    if (!cfg) return false;
    const num = parseFloat(val);
    return !isNaN(num) && num >= cfg.min && num <= cfg.max;
  };

  const allValid = ['n', 'p', 'k', 'ph', 'rainfall', 'humidity', 'soilTexture'].every(
    (k) => isValid(k, values[k])
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allValid) return;
    onSubmit({
      n: parseFloat(values.n),
      p: parseFloat(values.p),
      k: parseFloat(values.k),
      ph: parseFloat(values.ph),
      rainfall: parseFloat(values.rainfall),
      humidity: parseFloat(values.humidity),
      moisture: parseFloat(values.humidity),
      soilTexture: values.soilTexture,
    });
  };

  const handleReset = () => {
    setValues({
      n: '90',
      p: '50',
      k: '50',
      ph: '6.5',
      rainfall: '800',
      humidity: '65',
      soilTexture: 'Loamy',
    });
    setTouched({});
    onReset();
  };

  return (
    <div className="form-card">
      <div className="form-card-header">
        <h2 className="form-title">Soil & Climate Parameters</h2>
        <p className="form-subtitle">Enter your NPK and field metrics for LLM synthesis & compatibility ranking</p>
      </div>

      <form className="input-form" onSubmit={handleSubmit} noValidate>
        {FIELD_CONFIG.map((field) => {
          const hasError = touched[field.name] && !isValid(field.name, values[field.name]) && values[field.name] !== '';
          const isOk = values[field.name] !== '' && isValid(field.name, values[field.name]);

          return (
            <div className={`field-group ${hasError ? 'field-group--error' : ''} ${isOk ? 'field-group--ok' : ''}`} key={field.name}>
              <label className="field-label">
                <span className="field-icon">{field.icon}</span>
                {field.label}
                <span className="field-unit">{field.unit}</span>
              </label>
              <div className="field-input-wrap">
                <input
                  type="number"
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className="field-input"
                  disabled={loading}
                />
                {isOk && <span className="field-check">✓</span>}
              </div>
              <div className="field-hint">{field.hint}</div>
              <div className="field-example">📋 {field.example}</div>
              {hasError && (
                <div className="field-error">
                  Enter a value between {field.min} and {field.max}
                </div>
              )}
            </div>
          );
        })}

        {/* Soil Texture Selector */}
        <div className={`field-group ${touched.soilTexture && !isValid('soilTexture', values.soilTexture) && values.soilTexture !== '' ? 'field-group--error' : ''} ${isValid('soilTexture', values.soilTexture) ? 'field-group--ok' : ''}`}>
          <label className="field-label">
            <span className="field-icon">🏔️</span>
            Soil Texture
            <span className="field-unit">type</span>
          </label>
          <div className="soil-options">
            {SOIL_TEXTURES.map((texture) => (
              <button
                type="button"
                key={texture}
                className={`soil-btn ${values.soilTexture === texture ? 'soil-btn--selected' : ''}`}
                onClick={() => {
                  setValues((prev) => ({ ...prev, soilTexture: texture }));
                  setTouched((prev) => ({ ...prev, soilTexture: true }));
                }}
                disabled={loading}
              >
                {texture}
              </button>
            ))}
          </div>
          <div className="field-hint">Hard constraint — filters crops by soil compatibility first</div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
            disabled={!allValid || loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Synthesizing agronomic data via LLM...
              </>
            ) : (
              <>🔬 Analyze Crop Fit & Run AI</>
            )}
          </button>
          {hasResults && (
            <button type="button" className="btn btn--secondary" onClick={handleReset} disabled={loading}>
              ↺ Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InputForm;
