import { useState } from "react";
import authService from "../services/authService";

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(authService.isAuthenticated());

  const login = async (email, password) => {
    await authService.login(email, password);
    setAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setAuthenticated(false);
  };

  return { authenticated, login, logout };
}
