import axios from 'axios';

// Detect whether the client is running on a local development machine or a production domain
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

// Use environment variable if provided, otherwise route to local backend during development
// and the live Render production backend when accessed on Vercel or any external device.
const API_BASE =
  process.env.REACT_APP_API_URL ||
  (isLocalhost
    ? 'http://localhost:5000/api'
    : 'https://cropfit-backend.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export const analyzeSoilDataWithRAG = async (soilData) => {
  const response = await api.post('/rag/analyze', soilData);
  return response.data;
};

export const getRecommendations = async (params) => {
  const { rainfall, humidity, ph, soilTexture, n, p, k } = params || {};
  const response = await api.post('/recommend', { rainfall, humidity, ph, soilTexture, n, p, k });
  return response.data;
};

export const getAllCrops = async () => {
  const response = await api.get('/crops');
  return response.data;
};

export const getCropDetail = async (id) => {
  const response = await api.get(`/crops/${id}`);
  return response.data;
};

export default api;
