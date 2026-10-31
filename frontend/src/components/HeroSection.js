import React from 'react';
import '../styles/HeroSection.css';

const stats = [
  { value: 'pgvector', label: 'Similarity Search' },
  { value: 'LLM', label: 'Dynamic Profiles' },
  { value: 'O(N log N)', label: 'Validation Layer' },
  { value: '100%', label: 'Deterministic' },
];

const HeroSection = () => (
  <section className="hero">
    <div className="hero-text">
      <h1 className="hero-title">
        Find the Right Crop<br />
        <span className="hero-accent">for Your Exact Climate.</span>
      </h1>
      <p className="hero-desc">
        Enter your field's environmental metrics. Our Retrieval-Augmented Generation (RAG) engine synthesizes your data against a localized vector knowledge base, scoring compatibility while enforcing strict, algorithmic guardrails.
      </p>
    </div>
    <div className="hero-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div className="hero-stat" key={s.label}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>

    <div className="hero-formula">
      <code className="formula-eq">
        Score = CosineDistance(EnvVector, CropVector) + DeterministicValidation()
      </code>
    </div>
  </section>
);

export default HeroSection;
