import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsPanel from './components/ResultsPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBanner from './components/ErrorBanner';
import HeroSection from './components/HeroSection';
import { getRecommendations } from './utils/api';
import './styles/App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleSubmit = async (inputs) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setFormData(inputs);

    try {
      const data = await getRecommendations(inputs);
      setResults(data);
    } catch (err) {
      console.error('Submission error:', err);
      const msg =
        err?.response?.data?.details
          ? err.response.data.details.map((d) => d.message).join('; ')
          : err?.response?.data?.error || err?.message || 'Failed to connect to the backend server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setFormData(null);
  };

  const hasOutput = !!results;

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {!hasOutput && !loading && <HeroSection />}

        <div className={`layout ${hasOutput ? 'layout--results' : 'layout--form'}`}>
          <section className="form-section">
            <InputForm
              onSubmit={handleSubmit}
              onReset={handleReset}
              loading={loading}
              hasResults={hasOutput}
            />
          </section>

          <section className="output-section">
            {loading && <LoadingSpinner text="Synthesizing agronomic data via LLM..." />}
            {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
            {hasOutput && !loading && (
              <ResultsPanel
                results={results}
                inputs={formData}
              />
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>🌾 CropFit — Algorithmic & AI Crop Recommendation Engine</p>
        <p className="footer-sub">Built with React · Node.js · Express · PostgreSQL (pgvector)</p>
      </footer>
    </div>
  );
}

export default App;
