import api from "./api";

const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const access_token = res.data.token;
    localStorage.setItem("token", access_token);

    return access_token;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};

export default authService;
