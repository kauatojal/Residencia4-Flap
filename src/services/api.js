import axios from "axios";
import { getToken, logout } from "../api/auth";

// 🔧 Configuração base da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://flap-backend-production.up.railway.app/v1",
  timeout: 15000, // ✅ Timeout de 15 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// 🟢 Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    // Não adiciona Authorization no endpoint de login
    if (!config.url?.includes("/auth/login")) {
      const token = getToken();

      // Só adiciona SE o token realmente existir e for válido
      if (token && token !== "undefined" && token !== "null") {
        console.log("✅ Token válido → anexando ao header");
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("⚠️ Token inválido ou ausente");
        delete config.headers.Authorization;
      }
    }

    // ✅ Log da requisição (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("❌ Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

// 🔴 Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    // ✅ Log da resposta (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // 🔥 401 → Token inválido ou expirado → força logout
    if (status === 401) {
      console.warn("🔒 Sessão expirada (401). Fazendo logout...");
      logout();
      window.location.href = "/";
      return Promise.reject(error);
    }

    // ❗ 403 → Sem permissão
    if (status === 403) {
      console.error(`🚫 Acesso negado (403) para: ${url}`);
      console.error("Verifique se o usuário tem permissão para acessar este recurso");
    }

    // ❗ 404 → Recurso não encontrado
    if (status === 404) {
      console.error(`❓ Recurso não encontrado (404): ${url}`);
    }

    // ❗ 500 → Erro no servidor
    if (status >= 500) {
      console.error(`💥 Erro no servidor (${status}): ${url}`);
    }

    // ❗ Erro de rede
    if (!error.response) {
      console.error("🌐 Erro de rede. Verifique sua conexão ou se o backend está rodando.");
    }

    return Promise.reject(error);
  }
);

export default api;
