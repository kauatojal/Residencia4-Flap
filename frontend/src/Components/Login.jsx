import React, { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) { 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onLogin(email, senha);
    } catch (error) {
      console.error("Falha no login capturada pelo componente:", error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/Logo_flap.png" alt="Flap Logo" className="logo" />
        
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email"
          />
          <label htmlFor="senha">Senha</label>
          <input
            id="senha" type="password" value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required autoComplete="current-password"
          />
          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}