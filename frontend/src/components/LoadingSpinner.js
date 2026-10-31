import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ text = 'Synthesizing agronomic data via LLM...' }) => (
  <div className="loading-wrap">
    <div className="loading-spinner" />
    <p className="loading-text">{text}</p>
    <p className="loading-sub">Retrieving pgvector guidelines & querying Llama-3.3-70B via Groq</p>
  </div>
);

export default LoadingSpinner;
