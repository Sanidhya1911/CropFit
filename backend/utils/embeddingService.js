/**
 * embeddingService.js
 * 
 * Local embedding generation service using @xenova/transformers and the
 * Xenova/all-MiniLM-L6-v2 model (384-dimensional dense vectors).
 * Runs completely locally with ONNX Runtime, eliminating third-party API costs and rate limits.
 */

let pipelinePromise = null;

/**
 * Lazily loads and caches the feature extraction pipeline singleton.
 */
async function getPipeline() {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      // Dynamic import ensures compatibility with both CommonJS and ESM environments
      const { pipeline } = await import('@xenova/transformers');
      return await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    })();
  }
  return pipelinePromise;
}

/**
 * Generates a 384-dimensional normalized vector embedding for the provided text.
 *
 * @param {string} text - The input text to embed.
 * @returns {Promise<number[]>} - An array of 384 floating-point numbers.
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('generateEmbedding requires a valid non-empty string as input.');
  }

  const pipe = await getPipeline();

  // Run feature extraction with mean pooling and L2 normalization for cosine similarity
  const output = await pipe(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert Float32Array tensor data to a standard JavaScript array
  return Array.from(output.data);
}

module.exports = {
  generateEmbedding,
  get findRelevantGuidelines() {
    return require('./ragService').findRelevantGuidelines;
  },
};
