const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { validateRecommendationInput } = require('../middleware/validation');
const { runScoringEngine, getCompatibilityTier } = require('../utils/scoringEngine');
const { calculateCompatibilityScore } = require('../controllers/ragController');

/**
 * POST /api/recommend
 * Main crop recommendation endpoint.
 * Accepts: { rainfall, humidity, ph, soilTexture, n, p, k }
 * Returns: Ranked list of compatible crops with cultivation strategies and deterministic compatibility scores.
 */
router.post('/', validateRecommendationInput, async (req, res) => {
  const { rainfall, humidity, ph, soilTexture, n, p, k } = req.body;

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

    // Fetch agronomic guidelines with ideal NPK and pH ranges
    let guidelinesResult = { rows: [] };
    try {
      guidelinesResult = await pool.query(
        `SELECT crop_name, ideal_npk_range, ideal_ph_range, guideline_text FROM agronomic_guidelines`
      );
    } catch (gErr) {
      console.warn('⚠️ agronomic_guidelines lookup warning:', gErr.message);
    }

    const guidelineMap = {};
    for (const g of guidelinesResult.rows) {
      guidelineMap[g.crop_name.toLowerCase()] = g;
    }

    // Build strategy map for O(1) lookup: { crop_name: [strategy] }
    const strategyMap = {};
    for (const row of strategiesResult.rows) {
      if (!strategyMap[row.crop_name]) strategyMap[row.crop_name] = [];
      strategyMap[row.crop_name].push(row);
    }

    // Run scoring engine on baseline climate ranges
    const scoredCrops = runScoringEngine(
      { rainfall: parseFloat(rainfall), humidity: parseFloat(humidity), ph: parseFloat(ph), soilTexture },
      cropsResult.rows,
      strategyMap
    );

    const userSoil = {
      n: parseFloat(n),
      p: parseFloat(p),
      k: parseFloat(k),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
      humidity: parseFloat(humidity),
      soilTexture,
    };

    // Enrich every crop with the deterministic validation score based on NPK & pH variance
    const enrichedResults = scoredCrops.map((crop) => {
      const guideline = guidelineMap[crop.crop_name.toLowerCase()];
      let finalScore = crop.compatibility_percent;

      if (guideline && (!isNaN(userSoil.n) || !isNaN(userSoil.p) || !isNaN(userSoil.k))) {
        finalScore = calculateCompatibilityScore(userSoil, guideline);
      }

      finalScore = Math.round(Math.max(0, Math.min(100, Number(finalScore) || 0)));

      return {
        ...crop,
        compatibility_score: finalScore,
        compatibility_percent: finalScore,
        tier: getCompatibilityTier(finalScore),
      };
    });

    // Sort descending by deterministic compatibility score
    enrichedResults.sort((a, b) => b.compatibility_score - a.compatibility_score);
    enrichedResults.forEach((c, index) => { c.rank = index + 1; });

    return res.json({
      success: true,
      inputs: { rainfall: parseFloat(rainfall), humidity: parseFloat(humidity), ph: parseFloat(ph), soilTexture, n: userSoil.n, p: userSoil.p, k: userSoil.k },
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
