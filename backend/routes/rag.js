const express = require('express');
const router = express.Router();
const { analyzeSoilData } = require('../controllers/ragController');

/**
 * POST /api/rag/analyze
 * Endpoint to run the complete RAG pipeline:
 * Ingests user soil test data -> vector retrieval -> llama-3.3-70b-versatile generation.
 */
router.post('/analyze', analyzeSoilData);

module.exports = router;
