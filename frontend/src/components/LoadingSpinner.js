import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = () => (
  <div className="loading-wrap">
    <div className="loading-spinner" />
    <p className="loading-text">Running scoring engine…</p>
    <p className="loading-sub">Evaluating {12} crop profiles against your climate matrix</p>
  </div>
);

export default LoadingSpinner;
