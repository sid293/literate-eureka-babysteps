import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password) => api.post('/auth/register', { username, password })
};

export const milestones = {
  getAll: () => api.get('/milestones'),
  getAllPublic: () => api.get('/milestones/public'),
  create: (data) => api.post('/milestones', data),
  update: (id, data) => api.put(`/milestones/${id}`, data),
  delete: (id) => api.delete(`/milestones/${id}`)
};

export const tips = {
  getForMilestone: (milestoneId) => api.get(`/tips/${milestoneId}`),
  create: (milestoneId, tip) => api.post(`/tips/${milestoneId}`, { tip }),
  delete: (tipId) => api.delete(`/tips/${tipId}`)
};

export default api; 