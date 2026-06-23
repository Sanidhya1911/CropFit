import React from 'react';
import '../styles/ErrorBanner.css';

const ErrorBanner = ({ message, onDismiss }) => (
  <div className="error-banner" role="alert">
    <span className="error-icon">⚠️</span>
    <div className="error-body">
      <strong>Error</strong>
      <p>{message}</p>
    </div>
    <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
  </div>
);

export default ErrorBanner;
