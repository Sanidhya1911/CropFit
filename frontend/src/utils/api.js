import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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