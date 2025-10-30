import React, { useEffect, useState } from "react";
import "./ListaFuncionarios.css";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { EditarUsuario } from "./EditarUsuario";
import userService from "../services/userService";

export default function ListaFuncionarios({ onAddFuncionario }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);

  const carregarFuncionarios = async () => {
    setLoading(true);
    setErro("");
    try {
      const data = await userService.list();
      setFuncionarios(data);
    } catch {
      setErro("Erro ao carregar funcionários.");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const handleEdit = (id) => {
    const funcionario = funcionarios.find(f => f.id === id);
    setFuncionarioEditando(funcionario);
    setOpenMenuId(null);
  };

  const handleSalvar = async (funcionarioAtualizado) => {
    try {
      await userService.update(funcionarioAtualizado.id, funcionarioAtualizado);
      carregarFuncionarios();
    } catch {
      setErro("Erro ao salvar alteração!");
    }
    setFuncionarioEditando(null);
  };

  const handleCancelar = () => {
    setFuncionarioEditando(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este funcionário?")) {
      try {
        await userService.remove(id);
        carregarFuncionarios();
      } catch {
        setErro("Erro ao excluir funcionário.");
      }
    }
    setOpenMenuId(null);
  };

  const getSetorClass = (setor) => `setor-${setor?.toLowerCase() || ""}`;

  if (loading) return <div>Carregando funcionários...</div>;
  if (erro) return <div>{erro}</div>;

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
                  <img src={func.avatar || "/icon-user.png"} alt={`Avatar de ${func.nome}`} className="user-avatar" />
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
