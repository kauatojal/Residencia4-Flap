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
    return (
      <div className="form-page-wrapper">
        <RecuperarSenha onReturn={() => setShowRecuperar(false)} />
      </div>
    );
  }

  return (
    <div className="form-page-wrapper">
      <div className="form-container">
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
            <label>Telefone</label>
            <input type="tel" placeholder="+55 79 91234-5678" required />
          </div>
          
          <div className="form-field">
            <label>Setor</label>
            <select required>
              <option value="">Selecione um setor</option>
              <option value="Design">Design</option>
              <option value="Comercial">Comercial</option>
              <option value="Mídia">Mídia</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          
          <div className="form-field">
            <label>Senha Provisória</label>
            <input type="password" required />
          </div>
          
          <button type="submit" className="form-button">Cadastrar</button>

        </form>
      </div>
    </div>
  );
}
