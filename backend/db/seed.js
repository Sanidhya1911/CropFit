require('dotenv').config();
const pool = require('./pool');
const createSchema = require('./schema');

const crops = [
  {
    crop_name: 'Rice',
    crop_icon: '🌾',
    category: 'Cereal',
    min_rainfall: 1000,
    max_rainfall: 2000,
    min_humidity: 70,
    max_humidity: 90,
    min_ph: 5.5,
    max_ph: 7.0,
    description: 'Staple grain crop requiring abundant water. Thrives in warm, humid climates with standing water conditions.',
    harvest_duration: '90–150 days',
    avg_yield: '3–5 tonnes/hectare',
  },
  {
    crop_name: 'Wheat',
    crop_icon: '🌿',
    category: 'Cereal',
    min_rainfall: 375,
    max_rainfall: 875,
    min_humidity: 40,
    max_humidity: 70,
    min_ph: 6.0,
    max_ph: 7.5,
    description: 'Cool-season cereal crop. Grows best in dry to semi-humid conditions with well-drained soils.',
    harvest_duration: '100–130 days',
    avg_yield: '2–4 tonnes/hectare',
  },
  {
    crop_name: 'Maize (Corn)',
    crop_icon: '🌽',
    category: 'Cereal',
    min_rainfall: 500,
    max_rainfall: 1200,
    min_humidity: 50,
    max_humidity: 80,
    min_ph: 5.8,
    max_ph: 7.0,
    description: 'Versatile cereal adaptable to diverse conditions. Requires moderate rainfall and well-drained soils.',
    harvest_duration: '60–100 days',
    avg_yield: '4–8 tonnes/hectare',
  },
  {
    crop_name: 'Sugarcane',
    crop_icon: '🎋',
    category: 'Cash Crop',
    min_rainfall: 1500,
    max_rainfall: 2500,
    min_humidity: 70,
    max_humidity: 95,
    min_ph: 6.0,
    max_ph: 7.5,
    description: 'High-value tropical cash crop requiring abundant rainfall and warmth. Long growing season but high yield.',
    harvest_duration: '10–14 months',
    avg_yield: '60–80 tonnes/hectare',
  },
  {
    crop_name: 'Cotton',
    crop_icon: '🌸',
    category: 'Fiber Crop',
    min_rainfall: 500,
    max_rainfall: 1000,
    min_humidity: 40,
    max_humidity: 65,
    min_ph: 5.8,
    max_ph: 8.0,
    description: 'Major fiber and oilseed crop. Requires warm, dry climate with moderate rainfall and long frost-free seasons.',
    harvest_duration: '150–180 days',
    avg_yield: '1.5–2.5 tonnes/hectare',
  },
  {
    crop_name: 'Soybean',
    crop_icon: '🫘',
    category: 'Legume',
    min_rainfall: 450,
    max_rainfall: 900,
    min_humidity: 45,
    max_humidity: 75,
    min_ph: 6.0,
    max_ph: 7.0,
    description: 'High-protein legume with excellent soil nitrogen-fixing properties. Key in crop rotation systems.',
    harvest_duration: '80–120 days',
    avg_yield: '2–3 tonnes/hectare',
  },
  {
    crop_name: 'Tomato',
    crop_icon: '🍅',
    category: 'Vegetable',
    min_rainfall: 400,
    max_rainfall: 800,
    min_humidity: 45,
    max_humidity: 70,
    min_ph: 6.0,
    max_ph: 7.0,
    description: 'Popular high-value vegetable crop. Sensitive to frost and excessive moisture. Needs well-drained soils.',
    harvest_duration: '60–90 days',
    avg_yield: '20–50 tonnes/hectare',
  },
  {
    crop_name: 'Potato',
    crop_icon: '🥔',
    category: 'Vegetable',
    min_rainfall: 500,
    max_rainfall: 1000,
    min_humidity: 70,
    max_humidity: 85,
    min_ph: 4.8,
    max_ph: 6.0,
    description: 'Cool-season tuber crop with high caloric yield. Prefers loose, slightly acidic, well-drained soils.',
    harvest_duration: '70–120 days',
    avg_yield: '15–35 tonnes/hectare',
  },
  {
    crop_name: 'Groundnut (Peanut)',
    crop_icon: '🥜',
    category: 'Oilseed',
    min_rainfall: 500,
    max_rainfall: 1200,
    min_humidity: 45,
    max_humidity: 70,
    min_ph: 6.0,
    max_ph: 7.0,
    description: 'High-protein, high-oil legume. Fixes atmospheric nitrogen and thrives in warm, well-drained sandy soils.',
    harvest_duration: '90–130 days',
    avg_yield: '1.5–3 tonnes/hectare',
  },
  {
    crop_name: 'Sunflower',
    crop_icon: '🌻',
    category: 'Oilseed',
    min_rainfall: 400,
    max_rainfall: 900,
    min_humidity: 35,
    max_humidity: 65,
    min_ph: 6.0,
    max_ph: 7.5,
    description: 'Drought-tolerant oilseed crop with deep taproot. Excellent for dry climates. Used for oil and bird feed.',
    harvest_duration: '70–100 days',
    avg_yield: '1.5–2.5 tonnes/hectare',
  },
  {
    crop_name: 'Banana',
    crop_icon: '🍌',
    category: 'Fruit',
    min_rainfall: 1200,
    max_rainfall: 2200,
    min_humidity: 75,
    max_humidity: 95,
    min_ph: 5.5,
    max_ph: 7.0,
    description: 'Tropical fruit crop thriving in high humidity with consistent rainfall. Produces year-round in ideal conditions.',
    harvest_duration: '9–12 months',
    avg_yield: '20–40 tonnes/hectare',
  },
  {
    crop_name: 'Chickpea',
    crop_icon: '🫛',
    category: 'Legume',
    min_rainfall: 300,
    max_rainfall: 800,
    min_humidity: 30,
    max_humidity: 60,
    min_ph: 6.0,
    max_ph: 8.0,
    description: 'Drought-tolerant legume ideal for semi-arid regions. Nitrogen-fixing and highly nutritious grain legume.',
    harvest_duration: '90–110 days',
    avg_yield: '0.8–1.5 tonnes/hectare',
  },
];

// Cultivation strategies: each crop gets strategies for multiple soil types
const strategies = {
  'Rice': [
    {
      compatible_soil_texture: 'Clayey',
      irrigation_method: 'Flood Irrigation — clay retains water for paddy conditions',
      fertilizer_cycle: 'Apply 120 kg/ha Urea split into 3 doses: transplanting, tillering, panicle initiation. Use 60 kg/ha P₂O₅ and 40 kg/ha K₂O at basal.',
      farming_tip: 'Maintain 5–7 cm standing water during vegetative stage. Drain field 2 weeks before harvest to harden soil.',
      water_requirement: 'Very High (1200–1800 mm/season)',
      best_season: 'Kharif (June–November) in India',
    },
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Furrow Irrigation with frequent intervals to maintain field capacity',
      fertilizer_cycle: 'Apply 100 kg/ha Urea, 50 kg/ha SSP, 30 kg/ha MOP at transplanting. Top-dress with 40 kg/ha Urea at tillering.',
      farming_tip: 'Loamy soil drains faster — monitor water levels daily. Use SRI (System of Rice Intensification) for better yields.',
      water_requirement: 'High (1000–1500 mm/season)',
      best_season: 'Kharif season with supplemental irrigation',
    },
  ],
  'Wheat': [
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Sprinkler Irrigation or furrow irrigation. 4–6 critical irrigations: Crown Root Initiation, Tillering, Jointing, Flowering, Grain Filling.',
      fertilizer_cycle: 'Apply 120 kg/ha N (split: 60 basal + 60 top-dress at CRI), 60 kg/ha P₂O₅, 40 kg/ha K₂O before sowing.',
      farming_tip: 'Do not irrigate after jointing during hot dry winds. Zero-till sowing conserves moisture and reduces input costs.',
      water_requirement: 'Moderate (450–650 mm/season)',
      best_season: 'Rabi season (October–March)',
    },
    {
      compatible_soil_texture: 'Clayey',
      irrigation_method: 'Furrow irrigation with longer intervals — clay holds moisture well. Avoid waterlogging at crown root stage.',
      fertilizer_cycle: 'Reduce N by 10–15% as clay retains nutrients better. Apply 100 kg/ha N, 50 kg/ha P₂O₅, 40 kg/ha K₂O.',
      farming_tip: 'Plow early to allow clay clods to break. Avoid sowing in wet clay — wait for friable condition (Ghora condition).',
      water_requirement: 'Moderate (400–600 mm/season)',
      best_season: 'Rabi season; avoid late sowing beyond November 25',
    },
  ],
  'Maize (Corn)': [
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Drip or furrow irrigation at 6–7 day intervals. Critical stages: knee-high, tasseling, silking, grain fill.',
      fertilizer_cycle: 'Apply 180 kg/ha N (60 basal + 60 at knee-high + 60 at tasseling), 60 kg/ha P₂O₅, 60 kg/ha K₂O basal.',
      farming_tip: 'Plant in rows 60cm apart with 25cm spacing. Use weed control in first 6 weeks — maize is very competitive after.',
      water_requirement: 'Moderate (500–800 mm/season)',
      best_season: 'Kharif (June–Sept) or Spring (Feb–May)',
    },
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Drip irrigation preferred — sandy soil has very low retention. Irrigate every 3–4 days during dry spells.',
      fertilizer_cycle: 'Increase K₂O to 80 kg/ha. Split nitrogen into 4 doses to prevent leaching in sandy soil. Use slow-release urea.',
      farming_tip: 'Add organic matter (FYM 10 t/ha) before sowing to improve sandy soil water-holding capacity significantly.',
      water_requirement: 'High due to sandy drainage (irrigation every 3–5 days)',
      best_season: 'Spring season recommended for better moisture management',
    },
    {
      compatible_soil_texture: 'Silty',
      irrigation_method: 'Sprinkler or furrow irrigation. Silt has good moisture retention — moderate irrigation intervals of 5–7 days.',
      fertilizer_cycle: 'Standard NPK: 150 kg/ha N, 60 kg/ha P₂O₅, 50 kg/ha K₂O. Good natural fertility in silt reduces fertilizer need.',
      farming_tip: 'Silty soils compact easily when wet — avoid heavy machinery after rain. Minimum tillage helps preserve structure.',
      water_requirement: 'Moderate (450–700 mm/season)',
      best_season: 'Kharif or Spring with adequate drainage infrastructure',
    },
  ],
  'Sugarcane': [
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Drip irrigation (sub-surface) highly recommended — saves 30–40% water vs. flood. Irrigate at 7–10 day intervals.',
      fertilizer_cycle: 'Apply 300 kg/ha N (3 splits), 120 kg/ha P₂O₅, 120 kg/ha K₂O. Use pressmud/filter cake as organic amendment.',
      farming_tip: 'Practice ratoon cropping — leave stubble after first harvest for 2–3 ratoon crops, cutting input costs by 40%.',
      water_requirement: 'Very High (2000–2500 mm/year)',
      best_season: 'Plant February–March (spring) or October–November (autumn)',
    },
    {
      compatible_soil_texture: 'Clayey',
      irrigation_method: 'Furrow irrigation at wider intervals — clay holds moisture. Monitor for waterlogging, which kills sugarcane roots.',
      fertilizer_cycle: 'Similar to loamy but reduce frequency. Apply all P and K as basal, split N into 4 applications over 12 months.',
      farming_tip: 'Raise bed planting in clay prevents waterlogging. Deep plowing (45–60 cm) needed to break hardpan before planting.',
      water_requirement: 'High (1800–2200 mm/year) but less irrigation needed due to clay retention',
      best_season: 'Avoid planting before monsoon in heavy clay — drainage must be ensured first',
    },
  ],
  'Cotton': [
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Drip irrigation is ideal — prevents boll rot from excess moisture. Irrigate at first square, flowering, and boll development.',
      fertilizer_cycle: 'Apply 120 kg/ha N (3 splits), 60 kg/ha P₂O₅, 60 kg/ha K₂O. Use foliar boron (0.2%) during flower initiation.',
      farming_tip: 'Practice IPM for bollworm control. Bt cotton varieties reduce pesticide use significantly. Harvest before frost.',
      water_requirement: 'Moderate (600–900 mm/season)',
      best_season: 'Kharif (sow May–June, harvest November–December)',
    },
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Furrow irrigation at 10–14 day intervals. Reduce irrigation 3–4 weeks before harvest to improve fiber quality.',
      fertilizer_cycle: 'Apply 150 kg/ha N, 75 kg/ha P₂O₅, 75 kg/ha K₂O. Top-dress with sulfur (25 kg/ha) for fiber strength improvement.',
      farming_tip: 'Deep tillage (30–45 cm) before sowing improves root penetration. Wider spacing (90×60 cm) allows airflow and reduces disease.',
      water_requirement: 'Moderate (500–800 mm/season)',
      best_season: 'Kharif season with good drainage management',
    },
  ],
  'Soybean': [
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Supplemental irrigation at flowering and pod fill. Sprinkler preferred to avoid soil crust formation.',
      fertilizer_cycle: 'Minimal N (20 kg/ha starter) — Rhizobium inoculation of seeds provides biological N. Apply 80 kg/ha P₂O₅ and 60 kg/ha K₂O.',
      farming_tip: 'Always inoculate seeds with Bradyrhizobium japonicum before sowing. This alone can fix 50–300 kg N/ha free of cost.',
      water_requirement: 'Moderate (500–700 mm/season)',
      best_season: 'Kharif (June–October) — warm season legume',
    },
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Drip irrigation essential in sandy soils — irrigate every 3–4 days. Critical at flowering and pod development.',
      fertilizer_cycle: 'Increase P to 90 kg/ha. Sandy soils lose nutrients — split applications required. Use slow-release fertilizers.',
      farming_tip: 'Add 5 tonnes FYM/ha to sandy soil before sowing. Mulching reduces water evaporation by 30%.',
      water_requirement: 'Moderate-High in sandy conditions (more frequent irrigation)',
      best_season: 'Kharif with good soil preparation',
    },
  ],
  'Tomato': [
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Drip irrigation with fertigation. Irrigate every 2–3 days. Maintain consistent moisture — irregular watering causes blossom end rot.',
      fertilizer_cycle: 'Apply 200 kg/ha N, 150 kg/ha P₂O₅, 200 kg/ha K₂O via fertigation. Increase K during fruit development for sweetness.',
      farming_tip: 'Use mulching (black LDPE film) to retain moisture and suppress weeds. Stake plants at 30 cm height.',
      water_requirement: 'Moderate (600–1200 mm/season)',
      best_season: 'Oct–Feb (winter) for best quality; avoid monsoon sowing',
    },
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Drip irrigation mandatory — irrigate daily in hot weather. Sandy soil dries out fast, causing blossom drop.',
      fertilizer_cycle: 'Higher frequency fertigation needed — split 200 kg/ha N into 10+ applications. Sandy soil cannot hold nutrients between waterings.',
      farming_tip: 'Add cocopeat or vermicompost to sandy beds before transplanting. Raised beds with drip are the best setup.',
      water_requirement: 'High in sandy conditions — daily monitoring required',
      best_season: 'Cooler season (Oct–Jan) for higher marketable yield',
    },
    {
      compatible_soil_texture: 'Silty',
      irrigation_method: 'Sprinkler or drip at 2–3 day intervals. Silty soils hold moisture well but compact — avoid overhead irrigation excess.',
      fertilizer_cycle: 'Standard tomato nutrition program applies. Silty soils have better CEC so nutrient holding is good.',
      farming_tip: 'Avoid working soil when wet to prevent compaction. Good internal drainage critical for tomatoes in silt.',
      water_requirement: 'Moderate with good soil management',
      best_season: 'Winter crop for best results',
    },
  ],
  'Potato': [
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Drip or sprinkler irrigation every 4–5 days. Consistent moisture critical from tuber initiation to bulking. Avoid waterlogging.',
      fertilizer_cycle: 'Apply 180 kg/ha N (3 splits), 150 kg/ha P₂O₅, 200 kg/ha K₂O. Potassium is critical for tuber starch and size.',
      farming_tip: 'Sandy soil makes earthing-up easier. Harvest promptly as potatoes skin well in sandy conditions. Avoid green tubers.',
      water_requirement: 'Moderate-High (600–1000 mm/season)',
      best_season: 'Rabi season (October–January planting)',
    },
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Furrow irrigation at 7–10 day intervals. Maintain 60–70% field capacity throughout growing period.',
      fertilizer_cycle: 'Apply 200 kg/ha N, 150 kg/ha P₂O₅, 200 kg/ha K₂O. Use split N application (50% at planting, 50% at earthing-up).',
      farming_tip: 'Ridge planting at 60–75 cm spacing allows earthing-up. Certified disease-free seed potatoes are essential for good yield.',
      water_requirement: 'Moderate (550–850 mm/season)',
      best_season: 'Cool season (Rabi); maintain soil temperature 15–20°C for tuber formation',
    },
  ],
  'Groundnut (Peanut)': [
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Sprinkler or furrow irrigation at 7–10 day intervals. Critical irrigation at pegging, pod development, and pod filling stages.',
      fertilizer_cycle: 'Apply minimal N (25 kg/ha — rhizobium fixes rest), 60 kg/ha P₂O₅, 30 kg/ha K₂O, 500 kg/ha gypsum at pegging.',
      farming_tip: 'Gypsum application at pegging is CRITICAL — provides calcium directly to developing pods. Sandy soil is ideal for pod penetration.',
      water_requirement: 'Moderate (500–700 mm/season)',
      best_season: 'Kharif (June–October) or Summer (February–May)',
    },
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Furrow irrigation at 10–14 day intervals. Reduce watering 2–3 weeks before harvest to facilitate easy digging.',
      fertilizer_cycle: 'Same as sandy with gypsum at pegging. Well-inoculated seeds need very little added nitrogen.',
      farming_tip: 'Dig carefully — pods detach easily from runners when soil is too dry. Cure harvested plants in field for 4–5 days before threshing.',
      water_requirement: 'Moderate (450–650 mm/season)',
      best_season: 'Kharif season for rain-fed conditions',
    },
  ],
  'Sunflower': [
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Furrow irrigation at 10–14 day intervals. Critical stages: vegetative V6, pre-flowering R1, seed fill R5. Skip irrigation at mature stage.',
      fertilizer_cycle: 'Apply 90 kg/ha N (2 splits), 60 kg/ha P₂O₅, 30 kg/ha K₂O. Use 1.5 kg/ha boron foliar spray at bud stage for better seed set.',
      farming_tip: 'Sunflower is self-incompatible — introduce beehives (2–3/ha) during flowering to improve pollination and seed yield by 15–20%.',
      water_requirement: 'Low-Moderate (400–700 mm/season)',
      best_season: 'Kharif or Rabi; very adaptable',
    },
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Drip irrigation every 5–7 days. Deep taproot reduces irrigation need compared to other crops — drought-tolerant but responds to water.',
      fertilizer_cycle: 'Increase N to 100 kg/ha in sandy soil. Apply in 3 splits to prevent leaching. Boron foliar spray critical for oilseed quality.',
      farming_tip: 'Ideal rotation crop after cereals in sandy soils. Deep roots break hardpan and improve soil structure for next crop.',
      water_requirement: 'Low-Moderate — deep roots access subsoil moisture',
      best_season: 'Summer/Rabi for best oil content',
    },
  ],
  'Banana': [
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Drip irrigation (micro-sprinkler for cooling) at daily intervals in dry season. Banana needs 25–35 liters/plant/day at peak.',
      fertilizer_cycle: 'Apply 200 g N, 60 g P₂O₅, 300 g K₂O per plant annually. High K demand — use MOP or SOP in 4 splits over the growing season.',
      farming_tip: 'Remove suckers, keeping only 1 follower at a time. Prop the bunch after emergence to prevent toppling. Bag the bunch for quality.',
      water_requirement: 'Very High (2000–2500 mm/year)',
      best_season: 'Year-round in tropics; plant at onset of wet season',
    },
    {
      compatible_soil_texture: 'Silty',
      irrigation_method: 'Drip or flood irrigation. Silty loam with good drainage is excellent for banana — monitor for Fusarium wilt in waterlogged conditions.',
      fertilizer_cycle: 'Same high K requirement. Silty soils hold nutrients well — reduce K split frequency to 3 applications. Add 10 kg FYM/plant/year.',
      farming_tip: 'Windbreaks essential in open silt fields — banana is highly susceptible to wind damage. Plant at 1.5 × 1.5 m spacing.',
      water_requirement: 'Very High — do not let soil dry out between irrigations',
      best_season: 'Plant before monsoon for rain-fed advantage',
    },
  ],
  'Chickpea': [
    {
      compatible_soil_texture: 'Sandy',
      irrigation_method: 'Rain-fed preferred; 1–2 supplemental irrigations at pre-flowering and pod fill if rainfall is insufficient.',
      fertilizer_cycle: 'Apply 20 kg/ha N (starter), 60 kg/ha P₂O₅, 20 kg/ha K₂O. Rhizobium inoculation provides 70–80% of nitrogen need.',
      farming_tip: 'Chickpea is extremely drought-tolerant once established. Over-irrigation causes excessive vegetative growth and reduces yield.',
      water_requirement: 'Low (300–500 mm/season) — highly drought-tolerant',
      best_season: 'Rabi season (October–February)',
    },
    {
      compatible_soil_texture: 'Loamy',
      irrigation_method: 'Minimum irrigation — avoid pre-sowing irrigation if adequate soil moisture. 1 irrigation at branching, 1 at pod filling if dry.',
      fertilizer_cycle: 'Same as sandy variety. Good loamy soil with Rhizobium needs almost no N input — seed inoculation is the key.',
      farming_tip: 'Excellent rotation crop after paddy or maize — replenishes soil nitrogen. Shallow-rooted; do not disturb soil after sowing.',
      water_requirement: 'Low-Moderate (350–600 mm/season)',
      best_season: 'Post-kharif Rabi — use residual soil moisture from previous crop',
    },
  ],
};

const seedDatabase = async () => {
  try {
    // Create fresh schema
    await createSchema();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const cropIdMap = {};

      // Insert crop profiles
      for (const crop of crops) {
        const result = await client.query(
          `INSERT INTO crop_profiles 
            (crop_name, crop_icon, category, min_rainfall, max_rainfall, 
             min_humidity, max_humidity, min_ph, max_ph, description, 
             harvest_duration, avg_yield)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           RETURNING id`,
          [
            crop.crop_name, crop.crop_icon, crop.category,
            crop.min_rainfall, crop.max_rainfall,
            crop.min_humidity, crop.max_humidity,
            crop.min_ph, crop.max_ph,
            crop.description, crop.harvest_duration, crop.avg_yield,
          ]
        );
        cropIdMap[crop.crop_name] = result.rows[0].id;
        console.log(`  ✅ Inserted crop: ${crop.crop_name} (id=${result.rows[0].id})`);
      }

      // Insert cultivation strategies
      for (const [cropName, strategyList] of Object.entries(strategies)) {
        const cropId = cropIdMap[cropName];
        if (!cropId) {
          console.warn(`  ⚠️  No crop id found for ${cropName}`);
          continue;
        }
        for (const strategy of strategyList) {
          await client.query(
            `INSERT INTO cultivation_strategies
              (crop_id, compatible_soil_texture, irrigation_method,
               fertilizer_cycle, farming_tip, water_requirement, best_season)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
              cropId, strategy.compatible_soil_texture,
              strategy.irrigation_method, strategy.fertilizer_cycle,
              strategy.farming_tip, strategy.water_requirement,
              strategy.best_season,
            ]
          );
        }
        console.log(`  ✅ Inserted ${strategyList.length} strategies for ${cropName}`);
      }

      await client.query('COMMIT');
      console.log('\n🌾 Database seeded successfully!');
      console.log(`   📊 ${crops.length} crops inserted`);
      console.log(`   🌱 ${Object.values(strategies).flat().length} cultivation strategies inserted`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    pool.end();
  }
};

seedDatabase();
