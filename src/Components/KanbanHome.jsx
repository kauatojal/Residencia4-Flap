import { useEffect, useState } from "react";
import "./KanbanHome.css";
import { FiGrid, FiPlus } from "react-icons/fi";
import kanbanService from "../services/kanbanService";

export default function KanbanHome({ onSelectKanban }) {
  const [quadros, setQuadros] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [novoQuadro, setNovoQuadro] = useState({ titulo: "", descricao: "Description", cor: "#4a67ff", });

  const cores = [
    "#4a67ff",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
  ];

  // 🔹 Carregar quadros reais do backend
  useEffect(() => {
    loadQuadros();
  }, []);

  async function loadQuadros() {
    try {
      const data = await kanbanService.listQuadros();
      setQuadros(data);
    } catch (error) {
      console.error("Erro ao carregar quadros:", error);
    }
  }

  // 🔹 Criar novo quadro
  async function criarQuadro() {
    if (!novoQuadro.titulo.trim()) return;
    try {
      await kanbanService.createQuadro(novoQuadro);
      setShowCreateModal(false);
      setNovoQuadro({ titulo: "", descricao: "#4a67ff" });
      loadQuadros();
    } catch (error) {
      console.error("Erro ao criar quadro:", error);
    }
  }

  return (
    <div className="kanban-home">
      <div className="kanban-home-header">
        <div className="header-title">
          <FiGrid size={24} />
          <h2>Seus Quadros</h2>
        </div>
      </div>

      {/* 🔹 Exibir os quadros reais */}
      <div className="quadros-recentes">
        {quadros.length > 0 ? (
          quadros.map((quadro) => (
            <div
              key={quadro.id}
              className="quadro-card"
              onClick={() => onSelectKanban(quadro)}
              style={{ background: quadro.cor }}
            >
              <div className="quadro-overlay"></div>
              <h3>{quadro.titulo}</h3>
            </div>
          ))
        ) : (
          <p className="sem-quadros">Nenhum quadro criado ainda.</p>
        )}
      </div>

      {/* 🔹 Seção de criação */}
      <div className="kanban-home-section">
        <div className="criar-quadro-section">
          <h2>Criar Novo Quadro</h2>
          <p>
            Organize suas tarefas criando um novo quadro personalizado para seu
            projeto ou equipe.
          </p>
          <button
            className="btn-criar-novo-quadro"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={20} />
            Criar Quadro
          </button>
        </div>
      </div>

      {/* 🔹 Modal Criar Quadro */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-criar-quadro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Criar Novo Quadro</h2>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-field">
                <label>Nome do Quadro *</label>
                <input
                  type="text"
                  placeholder="Ex: Projetos 2025, Marketing..."
                  value={novoQuadro.titulo}
                  onChange={(e) =>
                    setNovoQuadro({ ...novoQuadro, titulo: e.target.value })
                  }
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label>Cor de Destaque</label>
                <div className="cores-grid">
                  {cores.map((cor) => (
                    <button
                      key={cor}
                      className={`cor-option ${
                        novoQuadro.cor === cor ? "selected" : ""
                      }`}
                      style={{ background: cor }}
                      onClick={() =>
                        setNovoQuadro({ ...novoQuadro, cor })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancelar"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-criar"
                onClick={criarQuadro}
                disabled={!novoQuadro.titulo.trim()}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
