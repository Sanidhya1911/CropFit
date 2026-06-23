const pool = require('./pool');

const createSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop existing tables
    await client.query(`DROP TABLE IF EXISTS cultivation_strategies CASCADE`);
    await client.query(`DROP TABLE IF EXISTS crop_profiles CASCADE`);

    // Create crop_profiles table
    await client.query(`
      CREATE TABLE crop_profiles (
        id SERIAL PRIMARY KEY,
        crop_name VARCHAR(100) NOT NULL UNIQUE,
        crop_icon VARCHAR(10) DEFAULT '🌱',
        category VARCHAR(50) NOT NULL,
        min_rainfall INT NOT NULL,
        max_rainfall INT NOT NULL,
        min_humidity INT NOT NULL,
        max_humidity INT NOT NULL,
        min_ph NUMERIC(4,1) NOT NULL,
        max_ph NUMERIC(4,1) NOT NULL,
        description TEXT,
        harvest_duration VARCHAR(100),
        avg_yield VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create cultivation_strategies table
    await client.query(`
      CREATE TABLE cultivation_strategies (
        id SERIAL PRIMARY KEY,
        crop_id INT NOT NULL REFERENCES crop_profiles(id) ON DELETE CASCADE,
        compatible_soil_texture VARCHAR(50) NOT NULL,
        irrigation_method VARCHAR(255),
        fertilizer_cycle TEXT,
        farming_tip TEXT,
        water_requirement VARCHAR(100),
        best_season VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await client.query(`CREATE INDEX idx_crop_profiles_name ON crop_profiles(crop_name)`);
    await client.query(`CREATE INDEX idx_cultivation_crop_id ON cultivation_strategies(crop_id)`);
    await client.query(`CREATE INDEX idx_cultivation_soil ON cultivation_strategies(compatible_soil_texture)`);
    await client.query(`CREATE INDEX idx_cultivation_composite ON cultivation_strategies(crop_id, compatible_soil_texture)`);

    await client.query('COMMIT');
    console.log('✅ Schema created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Schema creation failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = createSchema;
