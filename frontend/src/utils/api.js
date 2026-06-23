import axios from 'axios';

// FIX: Point directly to your live Render backend production API
const API_BASE = 'https://cropfit-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const getRecommendations = async ({ rainfall, humidity, ph, soilTexture }) => {
  const response = await api.post('/recommend', { rainfall, humidity, ph, soilTexture });
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