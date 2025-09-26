import React, { useState } from "react";
import "./Login.css";

function Login({ onSwitchCadastro, onSwitchRecuperar }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <div className="login-side">
        <img src="/Logo_flap.png" alt="Logo FIAP 15 anos" className="login-logo" />
        <h2>Login</h2>
        <form>
          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            required
            className="login-input"
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              className="login-input"
            />
            <span
              className="show-hide-icon"
              onClick={() => setShowPassword((v) => !v)}
              role="button"
              tabIndex={0}
              style={{ userSelect: "none" }}
            >
              <svg height="22" viewBox="0 0 24 24" width="22" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M2.05 12C3.81 7.61 7.93 4 12 4s8.19 3.61 9.95 8c-1.76 4.39-5.88 8-9.95 8S3.81 16.39 2.05 12z" />
              </svg>
            </span>
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" /> Lembrar-me
            </label>
            <a
              href="#"
              className="forgot"
              onClick={e => {
                e.preventDefault();
                onSwitchRecuperar();
              }}
            >
              Recuperar senha?
            </a>
          </div>
          <button type="submit" className="login-btn">Entrar</button>
        </form>
        <div className="register-link">
          <p>
            Não tem conta?{" "}
            <span
              onClick={onSwitchCadastro}
              style={{ color: "#5865f2", cursor: "pointer", fontWeight: "600" }}
            >
              Cadastre-se
            </span>
          </p>
        </div>
      </div>
      <div className="login-art">
        <img src="/Logo_flap.png" alt="Logo FIAP 15 anos" className="logo-centered" />
      </div>
    </div>
  );
}

export default Login;
