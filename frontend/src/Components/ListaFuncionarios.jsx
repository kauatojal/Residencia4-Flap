import React, { useEffect, useState } from "react";
import userService from "../services/userService";
import { EditarUsuario } from "./EditarUsuario";
import { FiMoreVertical, FiPlus } from "react-icons/fi";
import "./ListaFuncionarios.css";

export default function ListaFuncionarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [dropdownAtivo, setDropdownAtivo] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: "", mensagem: "" });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setLoading(true);
      const data = await userService.list();
      setUsuarios(data);
    } catch {
      setFeedback({ tipo: "erro", mensagem: "Erro ao carregar usuários." });
    } finally {
      setLoading(false);
    }
  }

  // Fecha feedback automaticamente
  useEffect(() => {
    if (feedback.mensagem) {
      const timer = setTimeout(() => setFeedback({ tipo: "", mensagem: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".actions-cell")) setDropdownAtivo(null);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function handleSalvar(dadosAtualizados) {
    try {
      setLoading(true);
      if (usuarioSelecionado?.id) {
        await userService.update(usuarioSelecionado.id, dadosAtualizados);
        setFeedback({ tipo: "sucesso", mensagem: "Usuário atualizado com sucesso!" });
      } else {
        await userService.create(dadosAtualizados);
        setFeedback({ tipo: "sucesso", mensagem: "Usuário criado com sucesso!" });
      }
      setMostrarModal(false);
      carregarUsuarios();
    } catch {
      setFeedback({ tipo: "erro", mensagem: "Erro ao salvar alterações." });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoverUsuario(id) {
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      setLoading(true);
      await userService.remove(id);
      setFeedback({ tipo: "sucesso", mensagem: "Usuário removido com sucesso!" });
      carregarUsuarios();
    } catch {
      setFeedback({ tipo: "erro", mensagem: "Erro ao remover usuário." });
    } finally {
      setLoading(false);
    }
  }

  function abrirEditarUsuario(usuario) {
    setUsuarioSelecionado(usuario);
    setMostrarModal(true);
  }

  function abrirNovoUsuario() {
    setUsuarioSelecionado({
      nome: "",
      email: "",
      celular: "",
      senha: "",
    });
    setMostrarModal(true);
  }

  function fecharModal() {
    setMostrarModal(false);
    setUsuarioSelecionado(null);
  }

  return (
    <div className="funcionarios-container">
      <div className="funcionarios-header">
        <h2>Lista de Funcionários</h2>
        <button className="btn-adicionar" onClick={abrirNovoUsuario}>
          <FiPlus /> Adicionar Novo
        </button>
      </div>

      {feedback.mensagem && (
        <div
          className={
            feedback.tipo === "sucesso" ? "mensagem-sucesso" : "mensagem-erro"
          }
        >
          {feedback.mensagem}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <table className="funcionarios-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td data-label="Usuário" className="user-cell">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.nome
                    )}&background=random`}
                    alt={user.nome}
                    className="user-avatar"
                  />
                  <span className="user-name">{user.nome}</span>
                </td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Celular">{user.celular}</td>

                <td className="actions-cell">
                  <button
                    className="btn-actions"
                    onClick={() =>
                      setDropdownAtivo(dropdownAtivo === user.id ? null : user.id)
                    }
                  >
                    <FiMoreVertical />
                  </button>

                  {dropdownAtivo === user.id && (
                    <div className="actions-dropdown">
                      <button
                        className="dropdown-item edit"
                        onClick={() => abrirEditarUsuario(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="dropdown-item delete"
                        onClick={() => handleRemoverUsuario(user.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarModal && (
        <EditarUsuario
          usuario={usuarioSelecionado}
          onSave={handleSalvar}
          onCancel={fecharModal}
        />
      )}
    </div>
  );
}
