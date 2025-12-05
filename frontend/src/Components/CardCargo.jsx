import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiLock } from "react-icons/fi";
import "./CardCargo.css";

export function CardCargo({ cargo, permissoes, onEdit, onDelete }) {
  const [expandido, setExpandido] = useState(false);

  // Busca detalhes das permissões pelo ID
  const permissoesDetalhadas = cargo.permissoesIds?.map(permId => {
    return permissoes.find(p => p.id === permId) || { id: permId, nome: "Desconhecida" };
  }) || [];

  const getCor = (index) => {
    const cores = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
    return cores[index % cores.length];
  };

  return (
    <div className="card-cargo">
      <div className="cc-main">
        <div className="cc-left">
          <div
            className="cc-icon"
            style={{ backgroundColor: getCor(cargo.id || 0) }}
          >
            <FiLock size={24} />
          </div>
          <div className="cc-info">
            <h3>{cargo.nome}</h3>
            <p>{permissoesDetalhadas.length} permissões</p>
          </div>
        </div>

        <div className="cc-actions">
          <button className="cc-btn edit" onClick={onEdit} title="Editar">
            <FiEdit2 />
          </button>
          <button className="cc-btn delete" onClick={onDelete} title="Excluir">
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* LISTA DE PERMISSÕES */}
      <div className="cc-permissoes">
        <button
          className="cc-toggle"
          onClick={() => setExpandido(!expandido)}
        >
          <FiLock size={14} />
          {expandido ? "Ocultar" : "Ver"} permissões
        </button>

        {expandido && (
          <div className="cc-perm-list">
            {permissoesDetalhadas.length === 0 ? (
              <span className="cc-sem-perm">Nenhuma permissão atribuída</span>
            ) : (
              permissoesDetalhadas.map(perm => (
                <span key={perm.id} className="cc-perm-badge">
                  {perm.nome}
                </span>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
