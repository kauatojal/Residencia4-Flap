import React from 'react';
import './FormStyle.css'; // Usando o nosso CSS unificado!

// Este componente agora recebe uma prop 'onReturn' para voltar à tela anterior.
export default function RecuperarSenha({ onReturn }) {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Instruções de recuperação enviadas com sucesso!");
    onReturn(); // Volta para a tela de Cadastro de Funcionário
  };

  return (
    <div className="form-container">
      <img src="/Logo_flap.png" alt="Flap Logo" className="form-logo" />
      <h2>Recuperação de senha</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Email do Funcionário</label>
          <input type="email" placeholder="email.do.funcionario@flap.com" required />
        </div>
        <button type="submit" className="form-button">Recuperar Senha</button>
        <button type="button" className="secondary-button" onClick={onReturn}>
          Voltar
        </button>
      </form>
    </div>
  );
}