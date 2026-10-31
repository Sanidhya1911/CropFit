/**
 * Seed script to insert 5 sample agronomic guidelines into the agronomic_guidelines table.
 * Embeddings are left as null for future RAG embedding pipeline generation.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

// Initialize connection pool (or reuse existing pool if available)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const sampleGuidelines = [
  {
    crop_name: 'Rice',
    ideal_npk_range: {
      nitrogen: { min: 80, max: 120, unit: 'kg/ha' },
      phosphorus: { min: 40, max: 60, unit: 'kg/ha' },
      potassium: { min: 40, max: 60, unit: 'kg/ha' },
    },
    ideal_ph_range: { min: 5.5, max: 7.0, optimal: 6.5 },
    guideline_text:
      'Rice requires standing water during early vegetative stages. Apply nitrogen in split doses: 50% basal, 25% at tillering, and 25% at panicle initiation. Ensure phosphorus is incorporated fully into the soil during land preparation to stimulate deep root branching. Maintain saturated puddled conditions until 10-14 days before harvest.',
  },
  {
    crop_name: 'Wheat',
    ideal_npk_range: {
      nitrogen: { min: 100, max: 150, unit: 'kg/ha' },
      phosphorus: { min: 50, max: 75, unit: 'kg/ha' },
      potassium: { min: 40, max: 60, unit: 'kg/ha' },
    },
    ideal_ph_range: { min: 6.0, max: 7.5, optimal: 6.8 },
    guideline_text:
      'Wheat thrives in well-aerated, loamy soils. The Crown Root Initiation (CRI) stage at 20-25 days post-sowing is the most critical irrigation window; water stress here sharply reduces tillering. Avoid waterlogging during vegetative stages. Apply balanced potassium to increase lodging resistance and frost tolerance in late winter.',
  },
  {
    crop_name: 'Maize',
    ideal_npk_range: {
      nitrogen: { min: 120, max: 180, unit: 'kg/ha' },
      phosphorus: { min: 60, max: 80, unit: 'kg/ha' },
      potassium: { min: 40, max: 60, unit: 'kg/ha' },
    },
    ideal_ph_range: { min: 5.8, max: 7.2, optimal: 6.5 },
    guideline_text:
      'Maize is a heavy feeder with peak moisture and nitrogen demand between silking and tasseling stages. Side-dress nitrogen when the crop reaches knee-high (V6 stage). Maintain soil moisture near 70% field capacity. Avoid overly saline or compact soils to prevent poor cob filling and stunted stalk growth.',
  },
  {
    crop_name: 'Cotton',
    ideal_npk_range: {
      nitrogen: { min: 60, max: 100, unit: 'kg/ha' },
      phosphorus: { min: 30, max: 50, unit: 'kg/ha' },
      potassium: { min: 30, max: 60, unit: 'kg/ha' },
    },
    ideal_ph_range: { min: 6.0, max: 8.0, optimal: 7.0 },
    guideline_text:
      'Cotton requires warm conditions and deep black cotton (vertisol) or alluvial soils with good drainage. Excessive early nitrogen causes vegetative rank growth at the expense of boll formation. Monitor square formation and boll development closely for bollworm infestation; terminate irrigation 3 weeks before first picking to hasten boll opening.',
  },
  {
    crop_name: 'Tomato',
    ideal_npk_range: {
      nitrogen: { min: 100, max: 150, unit: 'kg/ha' },
      phosphorus: { min: 60, max: 100, unit: 'kg/ha' },
      potassium: { min: 100, max: 150, unit: 'kg/ha' },
    },
    ideal_ph_range: { min: 6.0, max: 6.8, optimal: 6.4 },
    guideline_text:
      'Tomatoes are sensitive to calcium deficiency and fluctuating soil moisture, which induces Blossom End Rot. Drip fertigation with regular calcium nitrate supplements is recommended. High potassium levels during fruit development are essential for fruit firmness, uniform coloration, and soluble solid content (Brix).',
  },
];

async function seedAgronomicGuidelines() {
  const client = await pool.connect();
  try {
    console.log('🌾 Starting insertion of sample agronomic guidelines...');
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO agronomic_guidelines (
        crop_name,
        ideal_npk_range,
        ideal_ph_range,
        guideline_text,
        embedding
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, crop_name, created_at;
    `;

    for (const item of sampleGuidelines) {
      const res = await client.query(insertQuery, [
        item.crop_name,
        JSON.stringify(item.ideal_npk_range),
        JSON.stringify(item.ideal_ph_range),
        item.guideline_text,
        null, // embedding left null for now
      ]);

      console.log(`  ✅ Inserted guideline for "${res.rows[0].crop_name}" [ID: ${res.rows[0].id}]`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 Successfully inserted 5 agronomic guidelines with null embeddings!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to insert sample agronomic guidelines:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedAgronomicGuidelines();
}

module.exports = { seedAgronomicGuidelines, sampleGuidelines };
