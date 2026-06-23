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
      const msg =
        err?.response?.data?.details
          ? err.response.data.details.map((d) => d.message).join('; ')
          : err?.response?.data?.error || 'Failed to connect to the server. Is the backend running?';
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

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {!results && !loading && <HeroSection />}

        <div className={`layout ${results ? 'layout--results' : 'layout--form'}`}>
          <section className="form-section">
            <InputForm onSubmit={handleSubmit} onReset={handleReset} loading={loading} hasResults={!!results} />
          </section>

          <section className="output-section">
            {loading && <LoadingSpinner />}
            {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
            {results && !loading && (
              <ResultsPanel results={results} inputs={formData} />
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>🌾 CropFit — Algorithmic Crop Recommendation Engine</p>
        <p className="footer-sub">Built with React · Node.js · Express · PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
