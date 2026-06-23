const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/**
 * GET /api/crops
 * Returns all crop profiles for display/reference.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cp.*, 
              json_agg(DISTINCT cs.compatible_soil_texture) AS compatible_soils
       FROM crop_profiles cp
       LEFT JOIN cultivation_strategies cs ON cp.id = cs.crop_id
       GROUP BY cp.id
       ORDER BY cp.category, cp.crop_name`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      crops: result.rows,
    });
  } catch (err) {
    console.error('Crops fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch crops' });
  }
});

/**
 * GET /api/crops/:id
 * Returns a single crop with all its cultivation strategies.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, error: 'Invalid crop ID' });
  }

  try {
    const cropResult = await pool.query(
      `SELECT * FROM crop_profiles WHERE id = $1`,
      [id]
    );

    if (cropResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }

    const strategiesResult = await pool.query(
      `SELECT * FROM cultivation_strategies WHERE crop_id = $1 ORDER BY compatible_soil_texture`,
      [id]
    );

    return res.json({
      success: true,
      crop: cropResult.rows[0],
      strategies: strategiesResult.rows,
    });
  } catch (err) {
    console.error('Crop detail fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch crop details' });
  }
});

module.exports = router;
