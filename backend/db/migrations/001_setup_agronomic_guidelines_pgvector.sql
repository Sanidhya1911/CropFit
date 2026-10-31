-- ==============================================================================
-- Migration: Enable pgvector extension and create agronomic_guidelines table
-- ==============================================================================

-- 1. Enable pgvector extension for vector embeddings (RAG pipeline)
CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure UUID generation functions are available (PostgreSQL 13+ has gen_random_uuid() built-in)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create agronomic_guidelines table
CREATE TABLE IF NOT EXISTS agronomic_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name VARCHAR(100) NOT NULL,
    ideal_npk_range JSONB NOT NULL,
    ideal_ph_range JSONB NOT NULL,
    guideline_text TEXT NOT NULL,
    embedding VECTOR(384) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create HNSW index for high-performance approximate nearest neighbor (ANN) vector search (cosine distance)
-- Note: VECTOR(384) commonly corresponds to sentence-transformers models like all-MiniLM-L6-v2 or bge-small
CREATE INDEX IF NOT EXISTS idx_agronomic_guidelines_embedding_hnsw 
ON agronomic_guidelines 
USING hnsw (embedding vector_cosine_ops);

-- 4. B-tree index on crop_name for fast hybrid filtering
CREATE INDEX IF NOT EXISTS idx_agronomic_guidelines_crop_name 
ON agronomic_guidelines (crop_name);
