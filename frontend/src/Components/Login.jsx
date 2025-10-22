import React, { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "teste@flap.com" && senha === "123") {
      onLogin();
    } else {
      alert("Credenciais inválidas");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/Logo_flap.png" alt="Flap Logo" className="logo" />

        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit" className="btn-login">Entrar</button>
        </form>
      </div>
    </div>
  );
}
