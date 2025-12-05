import { createContext, useState, useEffect } from "react";
import { getToken, saveToken, removeToken } from "../api/auth";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔁 Mantém login mesmo após recarregar
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;

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
      const token = res.data.token;

      saveToken(token);
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const userResponse = await api.get("/user/me");
      setUser(userResponse.data);
      setAuthenticated(true);

      return { success: true };
    } catch (err) {
      console.error("Erro no login:", err);
      return { success: false, message: err.response?.data?.message || "Falha no login" };
    }
  };

  // 🚪 Logout
  const logoutUser = () => {
    removeToken();
    setUser(null);
    setAuthenticated(false);
    delete api.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, authenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
