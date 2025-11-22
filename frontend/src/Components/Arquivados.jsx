// src/Components/Arquivados.jsx
import React, { useEffect, useState } from "react";
import "./Arquivados.css";
import kanbanService from "../services/kanbanService";

export default function Arquivados() {
  const [arquivados, setArquivados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animRestoreId, setAnimRestoreId] = useState(null);

  useEffect(() => {
    loadArquivados();
  }, []);

  async function loadArquivados() {
    setLoading(true);
    try {
      const quadros = await kanbanService.listQuadros();
      const archivedIds = JSON.parse(localStorage.getItem("quadros_arquivados") || "[]");
      const lista = quadros.filter(q => archivedIds.includes(q.id));
      setArquivados(lista);
    } catch (err) {
      console.error(err);
      setArquivados([]);
    } finally {
      setLoading(false);
    }
  }

  function restaurar(id) {
    const key = "quadros_arquivados";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const novo = list.filter(i => i !== id);
    localStorage.setItem(key, JSON.stringify(novo));
    // anima e recarrega
    setAnimRestoreId(id);
    setTimeout(() => {
      setAnimRestoreId(null);
      loadArquivados();
    }, 360);
  }

  return (
    <div className="arquivados-page">
      <h1>Quadros Arquivados</h1>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : arquivados.length === 0 ? (
        <div className="arquivados-vazio">
          <p>Nenhum quadro arquivado.</p>
        </div>
      ) : (
        <div className="arquivados-grid">
          {arquivados.map((q) => (
            <div key={q.id} className={`arquivado-card ${animRestoreId === q.id ? "anim-restaurar" : ""}`}>
              <span className="badge-arquivado">Arquivado</span>
              <div className="arquivado-header">
                <div className="cliente-avatar">{(q.titulo || "").charAt(0).toUpperCase()}</div>
                <div className="cliente-info">
                  <h3>{q.titulo}</h3>
                  <p className="cliente-empresa">{q.descricao || ""}</p>
                </div>
              </div>
              <button className="btn-restaurar" onClick={() => restaurar(q.id)}>Restaurar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
