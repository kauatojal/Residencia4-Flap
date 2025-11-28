import axios from "axios";
import { getToken, logout } from "../api/auth";

// 🔧 Configuração base da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8090/v1",
});

// 🟢 Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    // Debug: Vamos ver qual URL está sendo chamada
    // console.log("Chamando API:", config.url);

    if (!config.url?.includes("/auth/login")) {
      const token = getToken();

      if (token) {
        console.log("Token encontrado, anexando ao header...");
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("ALERTA: Tentando fazer requisição SEM token!");
      }
      // ========================
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Só faz logout automático se for 401 (Sessão Expirada/Token Inválido)
    if (error.response && error.response.status === 401) {
      console.warn("Sessão expirada (401). Fazendo logout...");
      logout();
      window.location.href = "/";
    }

    // Se for 403 (Sem permissão), NÃO faz logout.
    // Apenas retorna o erro para o CadastroCliente mostrar o alerta.
    return Promise.reject(error);
  }
);
export default api;
