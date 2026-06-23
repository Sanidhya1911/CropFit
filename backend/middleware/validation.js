const { body, validationResult } = require('express-validator');

const VALID_SOIL_TEXTURES = ['Sandy', 'Loamy', 'Clayey', 'Silty', 'Sandy Loam', 'Clay Loam'];

const validateRecommendationInput = [
  body('rainfall')
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Rainfall must be a number between 0 and 5000 mm'),

  body('humidity')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be a number between 0 and 100 (%)'),

  body('ph')
    .isFloat({ min: 0, max: 14 })
    .withMessage('Soil pH must be a number between 0 and 14'),

  body('soilTexture')
    .isString()
    .trim()
    .notEmpty()
    .isIn(VALID_SOIL_TEXTURES)
    .withMessage(`Soil texture must be one of: ${VALID_SOIL_TEXTURES.join(', ')}`),

  // Middleware to check validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

module.exports = { validateRecommendationInput, VALID_SOIL_TEXTURES };
