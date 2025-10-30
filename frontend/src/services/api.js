import axios from "axios";
import { getToken, logout } from "../api/auth";

// 🔧 Configuração base da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8090/v1",
});

// 🟢 Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔴 Interceptor para tratar respostas (ex: token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sessão expirada. Fazendo logout automático...");
      logout();
      window.location.href = "/"; // redireciona para login
    }
    return Promise.reject(error);
  }
);

export default api;
