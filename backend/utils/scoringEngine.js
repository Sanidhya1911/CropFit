/**
 * CropFit Deterministic Range-Bound Evaluation Matrix
 *
 * Scoring function for a single variable:
 *   f(x) = 1 - |x_input - x_mid| / Δx
 *   where x_mid = (max + min) / 2, Δx = (max - min) / 2
 *   Clamped to [0, 1]
 *
 * Final Compatibility Score:
 *   Score = 0.4 * f(Rainfall) + 0.4 * f(Humidity) + 0.2 * f(pH)
 */

const WEIGHTS = {
  rainfall: 0.4,
  humidity: 0.4,
  ph: 0.2,
};

/**
 * Calculate variance penalty score for one variable.
 * Returns a value in [0, 1] — 1.0 = perfect center, 0 = at/beyond edge of range.
 */
function scoreVariable(input, min, max) {
  if (input < min || input > max) return 0; // Hard fail — outside tolerance range
  const mid = (max + min) / 2;
  const delta = (max - min) / 2;
  if (delta === 0) return 1; // Single-point range
  const score = 1 - Math.abs(input - mid) / delta;
  return Math.max(0, Math.min(1, score));
}

/**
 * Hard constraint: filter crops by soil texture.
 * Returns true if this crop has at least one cultivation strategy for this soil type.
 */
function passesSoilConstraint(cropName, soilTexture, strategyMap) {
  const strategies = strategyMap[cropName] || [];
  return strategies.some(
    (s) => s.compatible_soil_texture.toLowerCase() === soilTexture.toLowerCase()
  );
}

/**
 * Main scoring engine.
 * @param {Object} inputs - { rainfall, humidity, ph, soilTexture }
 * @param {Array} crops - rows from crop_profiles
 * @param {Object} strategyMap - { crop_name: [strategy rows] }
 * @returns {Array} sorted scored results
 */
function runScoringEngine(inputs, crops, strategyMap) {
  const { rainfall, humidity, ph, soilTexture } = inputs;

  const results = [];

  for (const crop of crops) {
    // ─── Hard Constraint: Soil Texture Filter ──────────────────────────────
    if (!passesSoilConstraint(crop.crop_name, soilTexture, strategyMap)) {
      continue; // Eliminated
    }

    // ─── Soft Scoring: Weighted Compatibility Matrix ────────────────────────
    const fRainfall = scoreVariable(rainfall, crop.min_rainfall, crop.max_rainfall);
    const fHumidity = scoreVariable(humidity, crop.min_humidity, crop.max_humidity);
    const fPh = scoreVariable(ph, crop.min_ph, crop.max_ph);

    // Weighted index
    const compatibilityScore =
      WEIGHTS.rainfall * fRainfall +
      WEIGHTS.humidity * fHumidity +
      WEIGHTS.ph * fPh;

    // Skip crops with 0 compatibility (all metrics out of range)
    if (compatibilityScore <= 0) continue;

    // Get matching strategies for this soil
    const matchingStrategies = (strategyMap[crop.crop_name] || []).filter(
      (s) => s.compatible_soil_texture.toLowerCase() === soilTexture.toLowerCase()
    );

    results.push({
      crop_id: crop.id,
      crop_name: crop.crop_name,
      crop_icon: crop.crop_icon,
      category: crop.category,
      description: crop.description,
      harvest_duration: crop.harvest_duration,
      avg_yield: crop.avg_yield,
      compatibility_score: parseFloat(compatibilityScore.toFixed(4)),
      compatibility_percent: parseFloat((compatibilityScore * 100).toFixed(1)),
      score_breakdown: {
        rainfall: { score: parseFloat(fRainfall.toFixed(4)), weight: WEIGHTS.rainfall, weighted: parseFloat((fRainfall * WEIGHTS.rainfall).toFixed(4)) },
        humidity: { score: parseFloat(fHumidity.toFixed(4)), weight: WEIGHTS.humidity, weighted: parseFloat((fHumidity * WEIGHTS.humidity).toFixed(4)) },
        ph: { score: parseFloat(fPh.toFixed(4)), weight: WEIGHTS.ph, weighted: parseFloat((fPh * WEIGHTS.ph).toFixed(4)) },
      },
      cultivation_strategy: matchingStrategies[0] || null,
      range_info: {
        rainfall: { min: crop.min_rainfall, max: crop.max_rainfall, input: rainfall },
        humidity: { min: crop.min_humidity, max: crop.max_humidity, input: humidity },
        ph: { min: crop.min_ph, max: crop.max_ph, input: ph },
      },
    });
  }

  // Sort by compatibility score descending — O(N log N)
  results.sort((a, b) => b.compatibility_score - a.compatibility_score);

  return results;
}

/**
 * Get compatibility tier label based on score.
 */
function getCompatibilityTier(score) {
  if (score >= 0.85) return { label: 'Excellent', color: 'green' };
  if (score >= 0.65) return { label: 'Good', color: 'lime' };
  if (score >= 0.45) return { label: 'Moderate', color: 'yellow' };
  if (score >= 0.25) return { label: 'Poor', color: 'orange' };
  return { label: 'Very Poor', color: 'red' };
}

module.exports = { runScoringEngine, scoreVariable, getCompatibilityTier };
