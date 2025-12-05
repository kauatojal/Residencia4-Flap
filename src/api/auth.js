import api from "../services/api";

const API_URL_AUTH = "/auth";

export const login = async (email, senha) => {
  try {
    const response = await api.post(`${API_URL_AUTH}/login`, { email, senha });
    const token = response.data.token;

    if (token) {
      localStorage.setItem("token", token);
    }

    return token;
  } catch (error) {
    console.error("Erro no login:", error);
    throw error.response?.data || { message: "Erro ao realizar login" };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const getUserInfo = async () => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await api.get(`${API_URL_AUTH}/me`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }
};
