import React, { useState, useEffect } from 'react';
import './EditarUsuario.css';

export function EditarUsuario({ usuario, onSave, onCancel }) {
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    celular: '',
    setor: '',
    role: '',
    avatar: '',
    password: '', 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (usuario) {
      setForm({
        name: usuario.nome || '', 
        email: usuario.email || '',
        celular: usuario.celular || '',
        setor: usuario.setor || '',
        role: usuario.role || 'ROLE_USUARIO',
        avatar: usuario.avatar || '',
        password: ""
      });
    }
  }, [usuario]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const dadosParaSalvar = {
        ...form,
        id: usuario.id,
    };
    
    try {
        await onSave(dadosParaSalvar);
    } catch(error) {
        setError("Erro ao salvar. Tente novamente.");
        setIsLoading(false);
    }
  }

  return (
    <div className="modal-backdrop"> 
      <div className="form-container modal-content">
        <h2>Editar Funcionário</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="form-field">
            <label>Nome</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Telefone</label>
            <input type="tel" name="celular" value={form.celular} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Setor</label>
            <input type="text" name="setor" value={form.setor} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Avatar (URL)</label>
            <input type="text" name="avatar" value={form.avatar} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Função (Permissão)</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="ROLE_USUARIO">Usuário Padrão</option>
              <option value="ROLE_GESTOR">Gestor (Admin)</option>
            </select>
          </div>

          <div className="form-field">
            <label>Nova Senha (deixe em branco para não alterar)</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password"/>
          </div>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          <div className="modal-actions">
             <button type="submit" className="form-button" disabled={isLoading}>
               {isLoading ? 'Salvando...' : 'Salvar Alterações'}
             </button>
             <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
               Cancelar
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}