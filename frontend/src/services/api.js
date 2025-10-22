import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api' 
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;