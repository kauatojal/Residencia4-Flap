import React, { useState } from 'react';
import './FormStyle.css'; 
import api from '../services/api'; 

export default function Cadastro({ onReturn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState(''); 
  const [setor, setSetor] = useState('');
  const [password, setPassword] = useState(''); 
  const [role, setRole] = useState('ROLE_USUARIO'); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password || !role) {
      setError('Nome, Email, Senha e Função são obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/users', { 
        name, email, password, celular, setor, role 
      });

      alert('Funcionário cadastrado com sucesso!');
      onReturn(); 

    } catch (err) {
      console.error('Erro ao cadastrar funcionário:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 400) {
         setError("Dados inválidos. Verifique os campos.");
      } else if (err.response && err.response.status === 403) {
         setError("Acesso negado. Você precisa ser administrador.");
      } else {
        setError('Erro ao conectar com o servidor.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="form-page-wrapper">
      <div className="form-container">
        <img src="/Logo_flap.png" alt="Flap Logo" className="form-logo" />
        <h2>Cadastro de Funcionário</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="form-field">
            <label>Nome</label>
            <input type="text" placeholder="Nome completo do funcionário" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div className="form-field">
            <label>Email</label>
            <input type="email" placeholder="email@flap.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div className="form-field">
            <label>Telefone</label>
            <input type="tel" placeholder="+55 79 91234-5678" value={celular} onChange={(e) => setCelular(e.target.value)} />
          </div>
          
          <div className="form-field">
            <label>Setor</label>
             <input type="text" placeholder="Setor do funcionário" value={setor} onChange={(e) => setSetor(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Função (Permissão)</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="ROLE_USUARIO">Usuário Padrão</option>
              <option value="ROLE_GESTOR">Gestor (Admin)</option>
            </select>
          </div>
          
          <div className="form-field">
            <label>Senha Inicial</label> 
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          
          <button type="submit" className="form-button" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

           <button type="button" className="btn-register-link" style={{marginTop: '10px'}} onClick={onReturn}>
            Cancelar
          </button>

        </form>
      </div>
    </div>
  );
}