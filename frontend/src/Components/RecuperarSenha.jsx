import React from "react";
import "./RecuperarSenha.css";

function RecuperarSenha({ onSwitchLogin }) {
  return (
    <div className="recuperar-container">
      <div className="recuperar-card">
        <img src="/Logo_flap.png" alt="Logo FIAP 15 anos" className="recuperar-logo" />
        <h2 className="recuperar-title">Recuperação de senha</h2>
        <form>
          <label className="recuperar-label">Email</label>
          <input type="email" placeholder="example@gmail.com" required className="recuperar-input" />
          <button type="submit" className="recuperar-btn">Recupere sua senha</button>
        </form>
        <button type="button" className="recuperar-voltar" onClick={onSwitchLogin}>Voltar para o login</button>
      </div>
    </div>
  );
}

export default RecuperarSenha;
