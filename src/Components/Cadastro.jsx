import React, { useState } from "react";
import "./Cadastro.css";

function Cadastro({ onSwitchLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode colocar a lógica para enviar os dados do cadastro
    alert("Conta criada! Agora faça login.");
    onSwitchLogin(); // Volta para a tela de login após cadastro
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-center-full">
        <img src="/Logo_flap.png" alt="Logo FIAP 15 anos" className="cadastro-logo" />
        <form onSubmit={handleSubmit}>
          <h2>Criação de contas</h2>
          
          <label>Nome Completo</label>
          <input
            type="text"
            placeholder="Nome completo"
            required
            className="cadastro-input"
          />
          
          <label>Data de Nascimento</label>
          <div className="cadastro-date">
            <input
              type="number"
              placeholder="01"
              required
              className="cadastro-input"
              min="1"
              max="31"
              maxLength={2}
              onInput={(e) => (e.target.value = e.target.value.slice(0, 2))}
            />
            <input
              type="number"
              placeholder="05"
              required
              className="cadastro-input"
              min="1"
              max="12"
              maxLength={2}
              onInput={(e) => (e.target.value = e.target.value.slice(0, 2))}
            />
            <input
              type="number"
              placeholder="1998"
              required
              className="cadastro-input"
              min="1900"
              max="2100"
              maxLength={4}
              onInput={(e) => (e.target.value = e.target.value.slice(0, 4))}
            />
          </div>
          
          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            required
            className="cadastro-input"
          />
          
          <label>Usuário</label>
          <input
            type="text"
            placeholder="johnkevin4362"
            required
            className="cadastro-input"
          />
          
          <label>Senha</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              className="cadastro-input"
            />
            <span
              className="show-hide-icon"
              onClick={() => setShowPassword((v) => !v)}
              role="button"
              tabIndex={0}
              style={{ userSelect: "none" }}
            >
              <svg
                height="22"
                viewBox="0 0 24 24"
                width="22"
                fill="none"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M2.05 12C3.81 7.61 7.93 4 12 4s8.19 3.61 9.95 8c-1.76 4.39-5.88 8-9.95 8S3.81 16.39 2.05 12z" />
              </svg>
            </span>
          </div>
          
          <button type="submit" className="cadastro-btn">
            Criar conta
          </button>
          
          <div className="register-link">
            <p>
              Já tem conta?{" "}
              <span
                onClick={onSwitchLogin}
                style={{ color: "#5865f2", cursor: "pointer", fontWeight: "600" }}
              >
                Entre
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
