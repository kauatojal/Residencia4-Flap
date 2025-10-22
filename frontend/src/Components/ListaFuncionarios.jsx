import React, { useState, useEffect } from "react";
import "./ListaFuncionarios.css";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { EditarUsuario } from "./EditarUsuario"; 
import api from "../services/api"; 

export default function ListaFuncionarios({ onAddFuncionario }) {
  
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);

  const fetchFuncionarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/users'); 
        setFuncionarios(response.data);
      } catch (err) {
        console.error("Erro ao buscar funcionários:", err);
        if (err.response && err.response.status === 403) {
             setError("Você não tem permissão para ver esta lista.");
        } else {
             setError("Falha ao carregar a lista. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchFuncionarios();
  }, []); 

  const handleEdit = (id) => {
    const funcionario = funcionarios.find(f => f.id === id);
    setFuncionarioEditando(funcionario);
    setOpenMenuId(null); 
  };

  const handleSalvar = async (funcionarioAtualizado) => {
     try {
        const { id, nome, email, celular, setor, avatar, role, password } = funcionarioAtualizado;
        // Monta o objeto SÓ com os campos que o backend espera para Update
        const updateData = { nome, email, celular, setor, avatar, role, password }; 
        
        await api.put(`/users/${id}`, updateData);
        setFuncionarioEditando(null); 
        fetchFuncionarios(); // Recarrega a lista
        alert('Usuário atualizado com sucesso!');
      } catch (err) {
        console.error("Erro ao salvar funcionário:", err);
        alert("Erro ao salvar. Verifique o console.");
      }
  };

  const handleCancelar = () => {
    setFuncionarioEditando(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este funcionário?")) {
      try {
        await api.delete(`/users/${id}`);
        setFuncionarios(funcionarios.filter(f => f.id !== id));
      } catch (err) {
        console.error("Erro ao deletar funcionário:", err);
        alert("Erro ao deletar. Verifique o console.");
      }
    }
    setOpenMenuId(null);
  };

  const getSetorClass = (setor) => {
    return `setor-${setor?.toLowerCase() || 'default'}`;
  };

  if (loading) {
    return ( <div className="funcionarios-container"><h2>Lista de funcionários</h2><p>Carregando dados...</p></div> );
  }

  if (error) {
    return ( <div className="funcionarios-container"><h2>Lista de funcionários</h2><p style={{ color: 'red' }}>{error}</p></div> );
  }

  return (
    <div className="funcionarios-container">
      <div className="funcionarios-header">
        <h2>Lista de funcionários</h2>
        <button className="btn-adicionar" onClick={onAddFuncionario}> + Add Funcionário </button>
      </div>

      <table className="funcionarios-table">
        <thead>
          <tr>
            <th>Nome</th> <th>Email</th> <th>Número de celular</th> <th>Setor</th> <th style={{ textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhum funcionário encontrado.</td></tr>
          ) : (
            funcionarios.map((func) => (
              <tr key={func.id}>
                <td>
                  <div className="user-cell">
                    <img src={func.avatar || `https://placehold.co/100x100/EFEFEF/333?text=${func.nome.substring(0,2)}`} alt={`Avatar de ${func.nome}`} className="user-avatar" />
                    <span className="user-name">{func.nome}</span>
                  </div>
                </td>
                <td>{func.email}</td>
                <td>{func.celular}</td>
                <td> <span className={`setor-tag ${getSetorClass(func.setor)}`}> {func.setor} </span> </td>
                <td className="actions-cell">
                  <button className="btn-actions" onClick={() => setOpenMenuId(openMenuId === func.id ? null : func.id)}> <BsThreeDotsVertical /> </button>
                  {openMenuId === func.id && (
                    <div className="actions-dropdown">
                      <button className="dropdown-item edit" onClick={() => handleEdit(func.id)}>Editar</button>
                      <button className="dropdown-item delete" onClick={() => handleDelete(func.id)}>Deletar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {funcionarioEditando && (
        <EditarUsuario 
          usuario={funcionarioEditando}
          onSave={handleSalvar}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
}