const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { validateRecommendationInput } = require('../middleware/validation');
const { runScoringEngine, getCompatibilityTier } = require('../utils/scoringEngine');

/**
 * POST /api/recommend
 * Main crop recommendation endpoint.
 * Accepts: { rainfall, humidity, ph, soilTexture }
 * Returns: Ranked list of compatible crops with cultivation strategies.
 */
router.post('/', validateRecommendationInput, async (req, res) => {
  const { rainfall, humidity, ph, soilTexture } = req.body;

  try {
    // Fetch all crop profiles
    const cropsResult = await pool.query(
      `SELECT id, crop_name, crop_icon, category, description,
              min_rainfall, max_rainfall, min_humidity, max_humidity,
              min_ph, max_ph, harvest_duration, avg_yield
       FROM crop_profiles
       ORDER BY crop_name`
    );

    // Fetch all cultivation strategies matching the soil texture
    const strategiesResult = await pool.query(
      `SELECT cs.*, cp.crop_name
       FROM cultivation_strategies cs
       JOIN crop_profiles cp ON cs.crop_id = cp.id
       WHERE LOWER(cs.compatible_soil_texture) = LOWER($1)`,
      [soilTexture]
    );

    // Build strategy map for O(1) lookup: { crop_name: [strategy] }
    const strategyMap = {};
    for (const row of strategiesResult.rows) {
      if (!strategyMap[row.crop_name]) strategyMap[row.crop_name] = [];
      strategyMap[row.crop_name].push(row);
    }

    // Run scoring engine
    const scoredCrops = runScoringEngine(
      { rainfall: parseFloat(rainfall), humidity: parseFloat(humidity), ph: parseFloat(ph), soilTexture },
      cropsResult.rows,
      strategyMap
    );

    // Enrich with tier labels
    const enrichedResults = scoredCrops.map((crop, index) => ({
      rank: index + 1,
      ...crop,
      tier: getCompatibilityTier(crop.compatibility_score),
    }));

    return res.json({
      success: true,
      inputs: { rainfall: parseFloat(rainfall), humidity: parseFloat(humidity), ph: parseFloat(ph), soilTexture },
      total_candidates: cropsResult.rows.length,
      matched: enrichedResults.length,
      results: enrichedResults,
    });
  } catch (err) {
    console.error('Recommendation engine error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during crop analysis',
    });
  }
});

module.exports = router;
