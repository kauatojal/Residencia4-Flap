import axios from "axios";

const API_URL = "http://localhost:8090/v1/auth"; // ajuste se a rota for diferente

// 🟢 Login do usuário
export const login = async (email, senha) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, senha });

    const token = response.data.token;

    if (token != undefined) {
      localStorage.setItem("token", token);
    }

    return token;
  } catch (error) {
    console.error("Erro no login:", error);
    throw error.response?.data || { message: "Erro ao realizar login" };
  }
};

// 🔴 Logout - remove token do localStorage
export const logout = () => {
  localStorage.removeItem("token");
};

// 🟡 Retorna o token armazenado
export const getToken = () => {
  return localStorage.getItem("token");
};

// 🟣 Salva o token manualmente (usado no contexto)
export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

// ⚫ Remove o token manualmente (usado no contexto)
export const removeToken = () => {
  localStorage.removeItem("token");
};

// 🔵 Recupera informações do usuário autenticado
export const getUserInfo = async () => {
  const token = getToken();
  if (!token) return null;

  /*
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }*/
};
