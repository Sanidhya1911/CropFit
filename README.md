# 🌾 CropFit — Algorithmic Crop Recommendation Engine

A full-stack decision-support platform that analyzes multi-dimensional environmental metrics to optimize regional agricultural yields using a **Deterministic Range-Bound Evaluation Matrix**.

---

## 🧮 The Algorithm

For each environmental variable, a variance penalty is calculated:

```
f(x) = 1 - |x_input - x_mid| / Δx
```

Final weighted compatibility score:

```
Score = (0.4 × f(Rainfall)) + (0.4 × f(Humidity)) + (0.2 × f(pH))
```

Before scoring, a **hard soil constraint** eliminates crops incompatible with the given soil texture.

---

## 🏗️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Axios                   |
| Backend   | Node.js, Express 4                |
| Database  | PostgreSQL                        |
| Validation| express-validator                 |
| Algorithm | Custom deterministic scoring engine |

---

## 📁 Project Structure

```
cropfit/
├── backend/
│   ├── db/
│   │   ├── pool.js          # PostgreSQL connection pool
│   │   ├── schema.js        # Table creation (drop + recreate)
│   │   └── seed.js          # 12 crops + cultivation strategies
│   ├── middleware/
│   │   └── validation.js    # express-validator input sanitization
│   ├── routes/
│   │   ├── recommend.js     # POST /api/recommend
│   │   └── crops.js         # GET /api/crops, GET /api/crops/:id
│   ├── utils/
│   │   └── scoringEngine.js # Core Range-Bound Evaluation Matrix
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── HeroSection.js
    │   │   ├── InputForm.js      # 4-field form with validation
    │   │   ├── ResultsPanel.js   # Ranked results container
    │   │   ├── CropCard.js       # Expandable crop result card
    │   │   ├── ScoreBar.js       # Visual compatibility bar
    │   │   ├── LoadingSpinner.js
    │   │   └── ErrorBanner.js
    │   ├── styles/               # One CSS file per component
    │   ├── utils/
    │   │   └── api.js            # Axios wrapper
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & install dependencies

```bash
git clone <your-repo>
cd cropfit
npm run install:all
```

### 2. Set up PostgreSQL database

```sql
-- In psql:
CREATE DATABASE cropfit;
```

### 3. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/cropfit
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Seed the database

```bash
npm run seed
# From root, or:
cd backend && npm run seed
```

You should see:
```
✅ Schema created successfully
✅ Inserted crop: Rice (id=1)
... (12 crops)
✅ Inserted strategies for all crops
🌾 Database seeded successfully!
```

### 5. Configure frontend environment

```bash
cd frontend
cp .env.example .env
```

`.env` defaults to:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
(The `proxy` field in `package.json` also handles this in dev.)

### 6. Run both servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# → http://localhost:3000
```

---

## 🌐 API Reference

### `POST /api/recommend`
Analyze crop compatibility for given climate inputs.

**Request body:**
```json
{
  "rainfall": 800,
  "humidity": 65,
  "ph": 6.5,
  "soilTexture": "Loamy"
}
```

**Response:**
```json
{
  "success": true,
  "inputs": { "rainfall": 800, "humidity": 65, "ph": 6.5, "soilTexture": "Loamy" },
  "total_candidates": 12,
  "matched": 7,
  "results": [
    {
      "rank": 1,
      "crop_name": "Wheat",
      "compatibility_percent": 87.5,
      "tier": { "label": "Excellent", "color": "green" },
      "score_breakdown": {
        "rainfall": { "score": 0.91, "weight": 0.4, "weighted": 0.364 },
        "humidity": { "score": 0.87, "weight": 0.4, "weighted": 0.348 },
        "ph": { "score": 0.81, "weight": 0.2, "weighted": 0.163 }
      },
      "cultivation_strategy": { ... }
    }
  ]
}
```

**Validation rules:**
- `rainfall`: 0–5000 mm (numeric)
- `humidity`: 0–100 % (numeric)
- `ph`: 0–14 (numeric)
- `soilTexture`: Sandy | Loamy | Clayey | Silty | Sandy Loam | Clay Loam

### `GET /api/crops`
Returns all 12 crop profiles with compatible soil types.

### `GET /api/crops/:id`
Returns a single crop with all its cultivation strategies.

### `GET /api/health`
Health check endpoint.

---

## 💾 Database Schema

### `crop_profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| crop_name | VARCHAR(100) | e.g. 'Rice' |
| crop_icon | VARCHAR(10) | Emoji |
| category | VARCHAR(50) | Cereal / Legume / etc |
| min_rainfall, max_rainfall | INT | mm |
| min_humidity, max_humidity | INT | % |
| min_ph, max_ph | NUMERIC(4,1) | |
| description | TEXT | |
| harvest_duration | VARCHAR | |
| avg_yield | VARCHAR | |

### `cultivation_strategies`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| crop_id | INT FK | → crop_profiles.id |
| compatible_soil_texture | VARCHAR(50) | Hard constraint key |
| irrigation_method | VARCHAR | |
| fertilizer_cycle | TEXT | NPK schedule |
| farming_tip | TEXT | Expert advice |
| water_requirement | VARCHAR | |
| best_season | VARCHAR | |

**Indexes:** composite index on `(crop_id, compatible_soil_texture)` enables instant O(1) lookup.

---

## 🌱 Crops Database

| Crop | Category | Rainfall (mm) | Humidity (%) | pH |
|------|----------|---------------|--------------|-----|
| Rice | Cereal | 1000–2000 | 70–90 | 5.5–7.0 |
| Wheat | Cereal | 375–875 | 40–70 | 6.0–7.5 |
| Maize | Cereal | 500–1200 | 50–80 | 5.8–7.0 |
| Sugarcane | Cash Crop | 1500–2500 | 70–95 | 6.0–7.5 |
| Cotton | Fiber | 500–1000 | 40–65 | 5.8–8.0 |
| Soybean | Legume | 450–900 | 45–75 | 6.0–7.0 |
| Tomato | Vegetable | 400–800 | 45–70 | 6.0–7.0 |
| Potato | Vegetable | 500–1000 | 70–85 | 4.8–6.0 |
| Groundnut | Oilseed | 500–1200 | 45–70 | 6.0–7.0 |
| Sunflower | Oilseed | 400–900 | 35–65 | 6.0–7.5 |
| Banana | Fruit | 1200–2200 | 75–95 | 5.5–7.0 |
| Chickpea | Legume | 300–800 | 30–60 | 6.0–8.0 |

---

## 🧪 Sample Test Inputs

**Typical Indian semi-arid region (Rajasthan):**
- Rainfall: 450, Humidity: 40%, pH: 7.2, Soil: Sandy
- Expected top results: Chickpea, Sunflower, Groundnut

**Humid tropical (Kerala / West Bengal):**
- Rainfall: 1800, Humidity: 85%, pH: 5.8, Soil: Loamy
- Expected top results: Rice, Banana, Sugarcane

**Indo-Gangetic plain (Punjab/UP):**
- Rainfall: 700, Humidity: 60%, pH: 7.0, Soil: Loamy
- Expected top results: Wheat, Maize, Soybean
