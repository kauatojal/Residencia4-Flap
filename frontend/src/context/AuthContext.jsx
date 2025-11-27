import { createContext, useState, useEffect } from "react";
import { getToken, saveToken, removeToken } from "../api/auth";
import api from "../services/api"; // axios configurado com baseURL

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null)
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔁 Mantém login mesmo após recarregar a página
  useEffect(() => {
    const token = getToken();

    if (token) {
      setAccessToken(token)

      api.defaults.headers.Authorization = `Bearer ${token}`;
      // Opcional: buscar dados do usuário logado
      api.get("/user/me")
        .then((res) => {
          setUser(res.data);
          setAuthenticated(true);
        })
        .catch(() => {
          removeToken();
          setAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 🔐 Login
  const loginUser = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token } = res.data;
      setAccessToken(token)

      saveToken(token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
      const user = await api.get("/user/me").data

      setUser(user);
      setAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error("Erro no login:", err);
      return { success: false, message: err.response?.data?.message || "Falha no login" };
    }
  };

  // 🚪 Logout
  const logoutUser = () => {
    setAccessToken(null)
    removeToken();
    setUser(null);
    setAuthenticated(false);
    delete api.defaults.headers.Authorization;
  };

  // if (loading) return <div>Carregando...</div>;

  return (
    <AuthContext.Provider value={{ user, authenticated, loginUser, logoutUser, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
