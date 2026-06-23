import React from 'react';
import '../styles/HeroSection.css';

const stats = [
  { value: '12', label: 'Crops Indexed' },
  { value: '4', label: 'Soil Textures' },
  { value: '3-var', label: 'Weight Matrix' },
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
        Enter your field's rainfall, humidity, soil pH, and texture. Our scoring engine
        evaluates {stats[0].value} crop profiles against your environment and ranks
        compatibility using a multi-variable weighted matrix.
      </p>
    </div>
    <div className="hero-stats">
      {stats.map((s) => (
        <div className="hero-stat" key={s.label}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>

    <div className="hero-formula">
      <span className="formula-label">Compatibility Score =</span>
      <span className="formula-eq">
        <span className="formula-weight">0.4</span> × f(Rainfall)
        &nbsp;+&nbsp;
        <span className="formula-weight">0.4</span> × f(Humidity)
        &nbsp;+&nbsp;
        <span className="formula-weight">0.2</span> × f(pH)
      </span>
    </div>
  </section>
);

export default HeroSection;
