/**
 * One-off script to fetch guidelines from the agronomic_guidelines table,
 * generate 384-dimensional dense vector embeddings using local all-MiniLM-L6-v2,
 * and update each record's embedding column.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('./pool');
const { generateEmbedding } = require('../utils/embeddingService');

async function updateEmbeddings() {
  const client = await pool.connect();

  try {
    console.log('🔄 Fetching agronomic guidelines requiring embeddings...');

    // Fetch records where embedding is currently null (or limit to 5)
    const selectQuery = `
      SELECT id, crop_name, guideline_text, embedding
      FROM agronomic_guidelines
      ORDER BY created_at ASC
      LIMIT 5;
    `;

    const { rows } = await client.query(selectQuery);

    if (rows.length === 0) {
      console.log('⚠️ No records found in agronomic_guidelines. Run the seed script first: npm run seed:guidelines');
      return;
    }

    console.log(`📋 Found ${rows.length} guideline(s). Generating local embeddings via Xenova/all-MiniLM-L6-v2...\n`);

    const updateQuery = `
      UPDATE agronomic_guidelines
      SET embedding = $1
      WHERE id = $2
      RETURNING id, crop_name;
    `;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`[${i + 1}/${rows.length}] Embedding guideline for "${row.crop_name}"...`);

      // 1. Generate local 384-dim vector
      const vector = await generateEmbedding(row.guideline_text);

      if (!Array.isArray(vector) || vector.length !== 384) {
        throw new Error(`Expected 384-dimensional vector, received length ${vector?.length}`);
      }

      // 2. Format vector for pgvector: JSON.stringify produces '[0.123,-0.456,...]'
      const pgvectorFormat = JSON.stringify(vector);

      // 3. Update the database record
      await client.query(updateQuery, [pgvectorFormat, row.id]);

      console.log(`   ✅ Saved 384-d vector for ${row.crop_name} (ID: ${row.id})`);
    }

    console.log('\n🎉 Successfully updated all guidelines with vector embeddings!');
  } catch (err) {
    console.error('❌ Error updating embeddings:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  updateEmbeddings();
}

module.exports = { updateEmbeddings };
