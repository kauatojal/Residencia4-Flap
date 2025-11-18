import React, { useState } from "react";
import useAuth from "../hooks/useAuth";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log(email)
      console.log(password)
      await login(email, password);
      // se seu hook login redireciona, ótimo — caso contrário, você pode navegar manualmente
    } catch (err) {
      console.error(err);
      setError("Falha no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card" role="main" aria-label="Login">
        {/* logo localizada em public/logo.png */}
        <img src="/logo.png" alt="Plataforma Flap" className="logo" />

        <h2>Entrar</h2>

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p style={{ color: "crimson", marginBottom: 8 }}>{error}</p>}

          <button
            className={`btn-login ${loading ? "disabled" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
