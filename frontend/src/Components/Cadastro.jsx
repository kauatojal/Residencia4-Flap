import React, { useState } from 'react';
import './FormStyle.css';
import RecuperarSenha from './RecuperarSenha';

export default function Cadastro({ onReturn }) {
  const [showRecuperar, setShowRecuperar] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Funcionário cadastrado!");
    onReturn();
  };

  if (showRecuperar) {
    // A tela de Recuperar Senha também precisa do wrapper para centralizar
    return (
      <div className="form-page-wrapper">
        <RecuperarSenha onReturn={() => setShowRecuperar(false)} />
      </div>
    );
  }

  return (
    // Adicionamos o "envoltório" que centraliza tudo na página
    <div className="form-page-wrapper">
      <div className="form-container">
        {/* Logo adicionada para consistência visual */}
        <img src="/Logo_flap.png" alt="Flap Logo" className="form-logo" />
        <h2>Cadastro de Funcionário</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nome</label>
            <input type="text" placeholder="Nome completo do funcionário" required />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" placeholder="email@flap.com" required />
          </div>
          <div className="form-field">
            <label>Senha Provisória</label>
            <input type="password" required />
          </div>
          <button type="submit" className="form-button">Cadastrar</button>
          <button type="button" className="secondary-button" onClick={() => setShowRecuperar(true)}>
            Recuperar Senha de Funcionário
          </button>
        </form>
      </div>
    </div>
  );
}