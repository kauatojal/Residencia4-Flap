import React, { useState } from "react";
import "./ListaFuncionarios.css";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { EditarUsuario } from "./EditarUsuario";


export default function ListaFuncionarios({ onAddFuncionario }) {
  // State para os funcionários
  const [funcionarios, setFuncionarios] = useState([
    { id: 1, nome: "João Silva", email: "joao.silva@flap.com", celular: "+55 79 91234-5678", cargo: "Designer", setor: "Design", avatar: "https://placehold.co/100x100/EFEFEF/333?text=JS" },
    { id: 2, nome: "Maria Souza", email: "maria.souza@flap.com", celular: "+55 79 98765-4321", cargo: "Atendimento", setor: "Comercial", avatar: "https://placehold.co/100x100/EFEFEF/333?text=MS" },
    { id: 3, nome: "Carlos Lima", email: "carlos.lima@flap.com", celular: "+55 79 95555-4444", cargo: "Social Media", setor: "Mídia", avatar: "https://placehold.co/100x100/EFEFEF/333?text=CL" },
    { id: 4, nome: "Adriene Watson", email: "adriene.w@flap.com", celular: "+55 79 94444-3333", cargo: "Marketing Lead", setor: "Marketing", avatar: "https://placehold.co/100x100/EFEFEF/333?text=AW" },
  ]);

  // State para controlar qual menu de ações está aberto
  const [openMenuId, setOpenMenuId] = useState(null);

  // State para controlar qual funcionário está sendo editado
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);

  const handleEdit = (id) => {
    const funcionario = funcionarios.find(f => f.id === id);
    setFuncionarioEditando(funcionario);
    setOpenMenuId(null); // Fecha o menu
  };

  const handleSalvar = (funcionarioAtualizado) => {
    setFuncionarios(funcionarios.map(f => 
      f.id === funcionarioAtualizado.id ? funcionarioAtualizado : f
    ));
    setFuncionarioEditando(null); // Fecha o modal
  };

  const handleCancelar = () => {
    setFuncionarioEditando(null); // Fecha o modal
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja realmente excluir este funcionário?")) {
      setFuncionarios(funcionarios.filter(f => f.id !== id));
    }
    setOpenMenuId(null);
  };

  const getSetorClass = (setor) => {
    return `setor-${setor.toLowerCase()}`;
  };

  return (
    <div className="funcionarios-container">
      <div className="funcionarios-header">
        <h2>Lista de funcionários</h2>
        <button className="btn-adicionar" onClick={onAddFuncionario}>
          + Add Funcionário
        </button>
      </div>

      <table className="funcionarios-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Número de celular</th>
            <th>Setor</th>
            <th style={{ textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((func) => (
            <tr key={func.id}>
              <td>
                <div className="user-cell">
                  <img src={func.avatar} alt={`Avatar de ${func.nome}`} className="user-avatar" />
                  <span className="user-name">{func.nome}</span>
                </div>
              </td>
              <td>{func.email}</td>
              <td>{func.celular}</td>
              <td>
                <span className={`setor-tag ${getSetorClass(func.setor)}`}>
                  {func.setor}
                </span>
              </td>
              <td className="actions-cell">
                <button
                  className="btn-actions"
                  onClick={() => setOpenMenuId(openMenuId === func.id ? null : func.id)}
                >
                  <BsThreeDotsVertical />
                </button>
                {openMenuId === func.id && (
                  <div className="actions-dropdown">
                    <button className="dropdown-item edit" onClick={() => handleEdit(func.id)}>Editar</button>
                    <button className="dropdown-item delete" onClick={() => handleDelete(func.id)}>Deletar</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edição - só aparece quando houver um funcionário selecionado */}
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
