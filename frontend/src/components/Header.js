import React from 'react';
import '../styles/Header.css';

const Header = () => (
  <header className="header">
    <div className="header-inner">
      <div className="header-brand">
        <span className="brand-icon">🌾</span>
        <span className="brand-name">CropFit</span>
        <span className="brand-tag">Crop Intelligence Engine</span>
      </div>
      <nav className="header-nav">
        <span className="nav-badge">v1.0</span>
        <span className="nav-badge nav-badge--algo">Deterministic Algorithm</span>
      </nav>
    </div>
  </header>
);

export default Header;
