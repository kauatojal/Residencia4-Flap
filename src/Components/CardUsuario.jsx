import React, { useState } from "react";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./CardUsuario.css";

export function CardUsuario({ usuario, onEdit, onDelete }) {
  const [menuAberto, setMenuAberto] = useState(false);

  const getIniciais = (nome) => {
    return nome
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "?";
  };

  const getCor = (nome) => {
    const cores = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
    const index = nome?.charCodeAt(0) || 0;
    return cores[index % cores.length];
  };

  return (
    <div className="card-usuario">
      <div className="cu-header">
        <div
          className="cu-avatar"
          style={{ backgroundColor: getCor(usuario.name) }}
        >
          {getIniciais(usuario.name)}
        </div>
        <div className="cu-info">
          <h3>{usuario.name}</h3>
          <p>{usuario.email}</p>
        </div>
        <button
          className="cu-menu-btn"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <FiMoreVertical />
        </button>

        {menuAberto && (
          <div className="cu-dropdown">
            <button onClick={() => { onEdit(); setMenuAberto(false); }}>
              <FiEdit2 /> Editar
            </button>
            <button className="delete" onClick={() => { onDelete(); setMenuAberto(false); }}>
              <FiTrash2 /> Excluir
            </button>
          </div>
        )}
      </div>

      <div className="cu-cargos">
        {usuario.cargosIds && usuario.cargosIds.length > 0 ? (
          usuario.cargosIds.map(cargo => (
            <span key={cargo.id} className="cu-cargo-badge">
              {cargo.nome}
            </span>
          ))
        ) : (
          <span className="cu-sem-cargo">Sem cargo</span>
        )}
      </div>

      <div className="cu-footer">
        <small>Criado em {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString() : "N/A"}</small>
      </div>
    </div>
  );
}
