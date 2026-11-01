/**
 * ragController.js
 * 
 * Generation step of the RAG pipeline using Groq SDK and llama-3.3-70b-versatile.
 * Ingests user soil data, retrieves top guidelines via vector search, and produces
 * grounded agronomic crop & fertilizer recommendations formatted as JSON.
 * 
 * Includes a high-performance deterministic validation layer to catch and intercept
 * AI hallucinations (+/- 15% tolerance) and calculates an authoritative, mathematical
 * compatibility score based on percentage variance against retrieved ideal ranges.
 */

const Groq = require('groq-sdk');
const { findRelevantGuidelines } = require('../utils/ragService');

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GROQ_API_KEY is not defined. Ensure it is set in your .env file.');
    }
    groqClient = new Groq({ apiKey: apiKey || 'missing-groq-key' });
  }
  return groqClient;
}

const TOLERANCE_RATE = 0.15; // 15% hard-boundary tolerance

/**
 * Extracts numeric [min, max] from various JSONB schema variations:
 * e.g., { min: 80, max: 120 }, [80, 120], or { minimum, maximum }
 */
function extractBounds(rangeObj) {
  if (!rangeObj) return null;
  if (Array.isArray(rangeObj) && rangeObj.length >= 2) {
    return { min: Number(rangeObj[0]), max: Number(rangeObj[1]) };
  }
  const min = rangeObj.min ?? rangeObj.minimum ?? rangeObj.low;
  const max = rangeObj.max ?? rangeObj.maximum ?? rangeObj.high;
  if (min !== undefined && max !== undefined) {
    return { min: Number(min), max: Number(max) };
  }
  return null;
}

/**
 * Checks if a value falls within [min * (1 - tolerance), max * (1 + tolerance)]
 */
function isWithinTolerance(val, bounds, tolerance = TOLERANCE_RATE) {
  if (val === null || val === undefined || isNaN(val) || !bounds) {
    return { valid: true };
  }
  const minAllowed = bounds.min * (1 - tolerance);
  const maxAllowed = bounds.max * (1 + tolerance);
  const valid = val >= minAllowed && val <= maxAllowed;
  return {
    valid,
    val,
    min: bounds.min,
    max: bounds.max,
    minAllowed: parseFloat(minAllowed.toFixed(2)),
    maxAllowed: parseFloat(maxAllowed.toFixed(2)),
  };
}

/**
 * Calculates the exact deterministic compatibility score (0 - 100%) based on the
 * percentage variance between the user's raw NPK and pH values and the ideal ranges
 * retrieved from the database.
 *
 * @param {Object} userSoil - Raw user soil input { n, p, k, ph, ... }
 * @param {Object} idealRange - { ideal_npk_range, ideal_ph_range } or guideline row
 * @returns {number} Deterministic compatibility percentage (0 - 100)
 */
function calculateCompatibilityScore(userSoil, idealRange = {}) {
  if (!userSoil || typeof userSoil !== 'object') return 0;

  const npk = idealRange.ideal_npk_range || idealRange.npk || {};
  const phRange = idealRange.ideal_ph_range || idealRange.ph || {};

  const metrics = [
    {
      name: 'nitrogen',
      val: parseFloat(userSoil.n ?? userSoil.nitrogen ?? userSoil.npk?.n),
      bounds: extractBounds(npk.nitrogen || npk.n),
      weight: 0.25,
    },
    {
      name: 'phosphorus',
      val: parseFloat(userSoil.p ?? userSoil.phosphorus ?? userSoil.npk?.p),
      bounds: extractBounds(npk.phosphorus || npk.p),
      weight: 0.25,
    },
    {
      name: 'potassium',
      val: parseFloat(userSoil.k ?? userSoil.potassium ?? userSoil.npk?.k),
      bounds: extractBounds(npk.potassium || npk.k),
      weight: 0.25,
    },
    {
      name: 'ph',
      val: parseFloat(userSoil.ph ?? userSoil.pH ?? userSoil.ph_level),
      bounds: extractBounds(phRange),
      weight: 0.25,
    },
  ];

  let weightedScoreSum = 0;
  let totalWeight = 0;

  for (const m of metrics) {
    if (isNaN(m.val) || !m.bounds) continue;

    const { min, max } = m.bounds;
    const mid = (min + max) / 2;
    const halfWidth = (max - min) / 2 || 1;

    let metricScore;

    if (m.val >= min && m.val <= max) {
      // Input is strictly within ideal range:
      // Perfectly centered = 100%, edge of range = 85%
      const varianceFromCenter = Math.abs(m.val - mid) / halfWidth;
      metricScore = 1.0 - (0.15 * varianceFromCenter);
    } else {
      // Input is outside ideal range: calculate percentage variance beyond nearest boundary
      const diff = m.val < min ? (min - m.val) : (m.val - max);
      const referenceBase = m.val < min ? min : max;
      const percentageVariance = referenceBase > 0 ? (diff / referenceBase) : 1;

      // 85% baseline decays down to 0% based on percentage variance
      metricScore = Math.max(0, 0.85 - percentageVariance);
    }

    weightedScoreSum += metricScore * m.weight;
    totalWeight += m.weight;
  }

  if (totalWeight === 0) return 50;

  const finalPercentage = (weightedScoreSum / totalWeight) * 100;
  return Math.round(Math.max(0, Math.min(100, finalPercentage)));
}

/**
 * Deterministic fallback generator:
 * Selects the best candidate guideline based on closest mathematical fit to user soil
 * and generates rule-based fertilizer adjustments.
 */
function generateHeuristicFallback(userMetrics, guidelines, violationMsg) {
  if (!guidelines || guidelines.length === 0) {
    return {
      recommended_crop: 'General Cereal / Legume',
      fertilizer_adjustments: 'Maintain balanced NPK fertilization and monitor soil moisture.',
      hallucination_detected: true,
      fallback_reason: violationMsg,
    };
  }

  let bestGuideline = guidelines[0];
  let bestScore = -Infinity;

  for (const g of guidelines) {
    const score = calculateCompatibilityScore(userMetrics, g);
    if (score > bestScore) {
      bestScore = score;
      bestGuideline = g;
    }
  }

  const advice = [];
  const npk = bestGuideline.ideal_npk_range || {};
  const nBounds = extractBounds(npk.nitrogen || npk.n);
  const pBounds = extractBounds(npk.phosphorus || npk.p);
  const kBounds = extractBounds(npk.potassium || npk.k);
  const phBounds = extractBounds(bestGuideline.ideal_ph_range);

  if (!isNaN(userMetrics.n) && nBounds) {
    if (userMetrics.n < nBounds.min) {
      advice.push(`Nitrogen deficit: Apply ~${Math.round(nBounds.min - userMetrics.n)} kg/ha of N via split urea applications.`);
    } else if (userMetrics.n > nBounds.max) {
      advice.push(`Nitrogen high: Withhold synthetic nitrogen to avoid vegetative overgrowth.`);
    }
  }

  if (!isNaN(userMetrics.p) && pBounds) {
    if (userMetrics.p < pBounds.min) {
      advice.push(`Phosphorus deficit: Apply DAP or Single Superphosphate during basal soil preparation.`);
    }
  }

  if (!isNaN(userMetrics.k) && kBounds) {
    if (userMetrics.k < kBounds.min) {
      advice.push(`Potassium deficit: Apply MOP (Muriate of Potash) to improve stress tolerance.`);
    }
  }

  if (!isNaN(userMetrics.ph) && phBounds) {
    if (userMetrics.ph < phBounds.min) {
      advice.push(`Acidic soil (pH ${userMetrics.ph}): Incorporate agricultural lime to raise pH closer to ${phBounds.min}.`);
    } else if (userMetrics.ph > phBounds.max) {
      advice.push(`Alkaline soil (pH ${userMetrics.ph}): Apply gypsum or organic compost to buffer pH toward ${phBounds.max}.`);
    }
  }

  const fertilizerText = advice.length > 0 
    ? advice.join(' ') 
    : `Soil parameters are reasonably aligned with ${bestGuideline.crop_name} requirements. Follow standard agronomic schedule.`;

  return {
    recommended_crop: bestGuideline.crop_name,
    fertilizer_adjustments: fertilizerText,
    hallucination_detected: true,
    fallback_reason: violationMsg,
  };
}

/**
 * Controller: analyzeSoilData
 * 
 * 1) Retrieves top 3 agronomic guidelines matching the user's soil data using vector search.
 * 2) Prompts Groq's llama-3.3-70b-versatile with agronomist instructions and retrieved context.
 * 3) Runs deterministic mathematical validation layer (+/- 15% tolerance on NPK & pH).
 * 4) Algorithmically calculates compatibility_score and attaches it, overriding Groq's score.
 * 5) Returns valid JSON to the client.
 */
async function analyzeSoilData(req, res) {
  try {
    const isExpress = req && res && typeof res.status === 'function';
    const soilData = isExpress ? (req.body.userSoilData || req.body) : req;

    if (!soilData || typeof soilData !== 'object' || Object.keys(soilData).length === 0) {
      const errResponse = { error: 'Invalid input. Please provide soil data containing NPK, pH, and moisture.' };
      return isExpress ? res.status(400).json(errResponse) : errResponse;
    }

    // 1) Retrieve top 3 agronomic rules from PostgreSQL using pgvector cosine distance
    const relevantGuidelines = await findRelevantGuidelines(soilData, 3);

    // Format retrieved guidelines as context for the prompt
    const contextText = relevantGuidelines.length > 0
      ? relevantGuidelines.map((g, idx) => `
[Guideline ${idx + 1}]
Crop: ${g.crop_name}
Ideal NPK Range: ${JSON.stringify(g.ideal_npk_range)}
Ideal pH Range: ${JSON.stringify(g.ideal_ph_range)}
Agronomic Best Practices: ${g.guideline_text}
Distance Score: ${parseFloat(g.distance).toFixed(4)}
`).join('\n')
      : 'No prior specific guidelines found in knowledge base.';

    // Parse raw user metrics as floats for mathematical validation
    const rawN = parseFloat(soilData.n ?? soilData.nitrogen ?? soilData.npk?.n ?? soilData.npk?.nitrogen);
    const rawP = parseFloat(soilData.p ?? soilData.phosphorus ?? soilData.npk?.p ?? soilData.npk?.phosphorus);
    const rawK = parseFloat(soilData.k ?? soilData.potassium ?? soilData.npk?.k ?? soilData.npk?.potassium);
    const rawPh = parseFloat(soilData.ph ?? soilData.pH ?? soilData.ph_level);
    const rawMoisture = parseFloat(soilData.moisture ?? soilData.humidity ?? soilData.soil_moisture);
    const soilTexture = soilData.soilTexture || soilData.soil_texture || '';
    const userMetrics = { n: rawN, p: rawP, k: rawK, ph: rawPh, moisture: rawMoisture };

    // 2) Construct prompts for llama-3.3-70b-versatile
    const systemPrompt = `You are an expert agronomist and precision farming advisor.
Your role is to analyze a farmer's soil metrics and provide an authoritative, science-backed recommendation.

RELEVANT AGRONOMIC GUIDELINES (RETRIEVED CONTEXT):
--------------------------------------------------
${contextText}
--------------------------------------------------

INSTRUCTIONS:
1. You must base your recommendation primarily on the retrieved agronomic guidelines provided above.
2. Compare the user's NPK, pH, and moisture levels with the ideal ranges in the context.
3. Recommend the single best crop suited for this soil.
4. Specify tailored fertilizer adjustments (e.g. nitrogen split application, DAP, potassic fertilizer, or pH amendment) to balance the soil for the chosen crop.

OUTPUT FORMAT:
You MUST respond with a valid JSON object only with NO markdown formatting and NO enclosing backticks. The JSON must contain exactly these keys:
{
  "recommended_crop": "<string: name of the recommended crop>",
  "fertilizer_adjustments": "<string: detailed, actionable fertilizer and soil management recommendations>"
}`;

    const userPrompt = `Farmer's Soil Test Data:
- Nitrogen (N): ${isNaN(rawN) ? 'unspecified' : rawN + ' kg/ha'}
- Phosphorus (P): ${isNaN(rawP) ? 'unspecified' : rawP + ' kg/ha'}
- Potassium (K): ${isNaN(rawK) ? 'unspecified' : rawK + ' kg/ha'}
- pH Level: ${isNaN(rawPh) ? 'unspecified' : rawPh}
- Moisture: ${isNaN(rawMoisture) ? 'unspecified' : rawMoisture + '%'}${soilTexture ? `\n- Soil Texture: ${soilTexture}` : ''}`;

    let parsedResult;
    try {
      const chatCompletion = await getGroqClient().chat.completions.create({
        model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1024,
      });

      const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
      try {
        parsedResult = JSON.parse(rawContent);
      } catch {
        const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleaned);
      }
    } catch (groqError) {
      console.warn('⚠️ Groq API error, engaging deterministic fallback:', groqError.message);
      const fallbackResult = generateHeuristicFallback(
        userMetrics,
        relevantGuidelines,
        `AI service unavailable (${groqError.message}). Defaulted to standard heuristics.`
      );
      const targetGuideline = relevantGuidelines.find(g => g.crop_name === fallbackResult.recommended_crop) || relevantGuidelines[0];
      const deterministicScore = calculateCompatibilityScore(userMetrics, targetGuideline);

      const fallbackResponse = {
        recommended_crop: fallbackResult.recommended_crop,
        fertilizer_adjustments: fallbackResult.fertilizer_adjustments,
        compatibility_score: deterministicScore,
        hallucination_detected: true,
        fallback_reason: `AI recommendation unavailable or fell outside safe bounds. Defaulting to standard heuristics.`,
      };

      if (isExpress) return res.status(200).json(fallbackResponse);
      return fallbackResponse;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3) Deterministic Validation & Mathematical Compatibility Scoring
    // ─────────────────────────────────────────────────────────────────────────
    const aiCrop = (parsedResult.recommended_crop || '').trim();

    // Find the guideline matching the AI's recommendation
    const matchedGuideline = relevantGuidelines.find(g =>
      g.crop_name.toLowerCase().includes(aiCrop.toLowerCase()) ||
      aiCrop.toLowerCase().includes(g.crop_name.toLowerCase())
    );

    let isHallucination = false;
    const violations = [];

    if (!matchedGuideline) {
      isHallucination = true;
      violations.push(`Crop "${aiCrop}" is outside the retrieved guideline context.`);
    } else {
      const npk = matchedGuideline.ideal_npk_range || {};
      const nBounds = extractBounds(npk.nitrogen || npk.n);
      const pBounds = extractBounds(npk.phosphorus || npk.p);
      const kBounds = extractBounds(npk.potassium || npk.k);
      const phBounds = extractBounds(matchedGuideline.ideal_ph_range);

      // Verify NPK & pH within 15% tolerance of bounds
      const nCheck = isWithinTolerance(rawN, nBounds, TOLERANCE_RATE);
      const pCheck = isWithinTolerance(rawP, pBounds, TOLERANCE_RATE);
      const kCheck = isWithinTolerance(rawK, kBounds, TOLERANCE_RATE);
      const phCheck = isWithinTolerance(rawPh, phBounds, TOLERANCE_RATE);

      if (!nCheck.valid) {
        violations.push(`Nitrogen (${rawN}) outside allowed range [${nCheck.minAllowed}, ${nCheck.maxAllowed}] for ${matchedGuideline.crop_name}`);
      }
      if (!pCheck.valid) {
        violations.push(`Phosphorus (${rawP}) outside allowed range [${pCheck.minAllowed}, ${pCheck.maxAllowed}] for ${matchedGuideline.crop_name}`);
      }
      if (!kCheck.valid) {
        violations.push(`Potassium (${rawK}) outside allowed range [${kCheck.minAllowed}, ${kCheck.maxAllowed}] for ${matchedGuideline.crop_name}`);
      }
      if (!phCheck.valid) {
        violations.push(`pH (${rawPh}) outside allowed range [${phCheck.minAllowed}, ${phCheck.maxAllowed}] for ${matchedGuideline.crop_name}`);
      }

      if (violations.length > 0) {
        isHallucination = true;
      }
    }

    let finalResponse;

    if (isHallucination) {
      const violationSummary = violations.join('; ');
      console.warn(`🚨 Hallucination Intercepted! AI recommended "${aiCrop}". Reason: ${violationSummary}`);

      const fallbackResult = generateHeuristicFallback(userMetrics, relevantGuidelines, violationSummary);
      const targetGuideline = relevantGuidelines.find(g => g.crop_name === fallbackResult.recommended_crop) || relevantGuidelines[0];
      
      // Calculate exact deterministic compatibility score based on percentage variance
      const deterministicScore = calculateCompatibilityScore(userMetrics, targetGuideline);

      finalResponse = {
        recommended_crop: fallbackResult.recommended_crop,
        fertilizer_adjustments: fallbackResult.fertilizer_adjustments,
        compatibility_score: deterministicScore, // Exact algorithmically calculated score
        hallucination_detected: true,
        fallback_reason: violationSummary,
      };
    } else {
      // Calculate exact deterministic compatibility score based on percentage variance
      // Completely ignoring / overriding any Groq confidence score
      const deterministicScore = calculateCompatibilityScore(userMetrics, matchedGuideline);

      finalResponse = {
        recommended_crop: parsedResult.recommended_crop,
        fertilizer_adjustments: parsedResult.fertilizer_adjustments,
        compatibility_score: deterministicScore, // Exact algorithmically calculated score
        hallucination_detected: false,
      };
    }

    // 4) Return the final response
    if (isExpress) {
      return res.status(200).json(finalResponse);
    }

    return finalResponse;
  } catch (error) {
    console.error('❌ Error in analyzeSoilData controller:', error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({
        error: 'Failed to analyze soil data with Groq RAG pipeline',
        details: error.message,
      });
    }
    throw error;
  }
}

module.exports = {
  analyzeSoilData,
  calculateCompatibilityScore,
  isWithinTolerance,
  extractBounds,
};
