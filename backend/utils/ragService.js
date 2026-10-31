/**
 * ragService.js
 * 
 * Retrieval-Augmented Generation (RAG) retrieval module for CropFit.
 * Encapsulates soil summary vectorization and similarity search using pgvector.
 */

const pool = require('../db/pool');
const { generateEmbedding } = require('./embeddingService');

/**
 * Converts user soil input data into a clear, semantic summary string.
 * Supports various input schemas (flat, nested NPK, etc.).
 *
 * @param {Object} userSoilData - Soil data including NPK, pH, and moisture.
 * @returns {string} Human-readable summary for vector embedding.
 */
function formatSoilDataSummary(userSoilData = {}) {
  // Extract NPK components whether passed flat or nested
  const n = userSoilData.n ?? userSoilData.nitrogen ?? userSoilData.npk?.n ?? userSoilData.npk?.nitrogen ?? 'balanced';
  const p = userSoilData.p ?? userSoilData.phosphorus ?? userSoilData.npk?.p ?? userSoilData.npk?.phosphorus ?? 'moderate';
  const k = userSoilData.k ?? userSoilData.potassium ?? userSoilData.npk?.k ?? userSoilData.npk?.potassium ?? 'moderate';
  
  // Extract pH and moisture
  const ph = userSoilData.ph ?? userSoilData.pH ?? userSoilData.ph_level ?? 6.5;
  const moisture = userSoilData.moisture ?? userSoilData.soil_moisture ?? userSoilData.moisture_percentage ?? 'moderate';

  return `Soil conditions: Nitrogen: ${n} kg/ha, Phosphorus: ${p} kg/ha, Potassium: ${k} kg/ha. Soil pH: ${ph}. Soil moisture level: ${moisture}%. Agronomic management guidelines for optimal crop growth, fertilizer application, and soil health.`;
}

/**
 * Retrieves the top 3 most relevant agronomic guidelines from PostgreSQL
 * based on the user's soil data embedding using the <-> distance operator.
 *
 * @param {Object} userSoilData - User soil parameters (NPK, pH, moisture).
 * @param {number} [limit=3] - Number of top results to return.
 * @returns {Promise<Array<Object>>} Top 3 matching rows from agronomic_guidelines.
 */
async function findRelevantGuidelines(userSoilData, limit = 3) {
  if (!userSoilData || typeof userSoilData !== 'object') {
    throw new Error('findRelevantGuidelines requires a valid userSoilData object.');
  }

  // 1. Convert user soil data into a semantic descriptive summary
  const summaryText = formatSoilDataSummary(userSoilData);

  // 2. Generate 384-dimensional dense vector embedding
  const embedding = await generateEmbedding(summaryText);
  const vectorParam = JSON.stringify(embedding);

  // 3. Parameterized query using the <-> distance operator
  // Explicitly casting $1 to ::vector ensures PostgreSQL uses pgvector distance operators
  const query = `
    SELECT 
      id,
      crop_name,
      ideal_npk_range,
      ideal_ph_range,
      guideline_text,
      (embedding <-> $1::vector) AS distance
    FROM agronomic_guidelines
    WHERE embedding IS NOT NULL
    ORDER BY embedding <-> $1::vector ASC
    LIMIT $2;
  `;

  const { rows } = await pool.query(query, [vectorParam, limit]);

  return rows;
}

module.exports = {
  findRelevantGuidelines,
  formatSoilDataSummary,
};
