import { useEffect, useState } from "react";
import "./KanbanHome.css";
import { FiGrid, FiPlus } from "react-icons/fi";
import kanbanService from "../services/kanbanService";

export default function KanbanHome({ onSelectKanban }) {
  const [quadros, setQuadros] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [quadroSelecionado, setQuadroSelecionado] = useState(null);

  const [novoQuadro, setNovoQuadro] = useState({
    titulo: "",
    descricao: "Description",
    cor: "#4a67ff",
  });

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

  useEffect(() => {
    loadQuadros();
  }, []);

  async function loadQuadros() {
    try {
      const data = await kanbanService.listQuadros();
      const quadrosNaoArquivados = data.filter(quadro => quadro.arquivado == false || quadro.arquivado == null)
      setQuadros(quadrosNaoArquivados);
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
      setNovoQuadro({ titulo: "", descricao: "descricao", cor: "#4a67ff" });
      loadQuadros();
    } catch (error) {
      console.error("Erro ao criar quadro:", error);
    }
  }

  // 🔹 Abrir modal de arquivar
  function abrirModalArquivar(quadro) {
    setQuadroSelecionado(quadro);
    setShowArchiveModal(true);
  }

  // 🔹 Confirmar arquivamento
  async function confirmarArquivar() {
    if (!quadroSelecionado) return;

    try {
      // 🔥 MOCK POR ENQUANTO (chamará /v1/quadro/{id}/arquivar depois)
      kanbanService.archiveQuadro(quadroSelecionado.id)

      const atualizados = quadros.map((q) =>
        q.id === quadroSelecionado.id ? { ...q, arquivado: true } : q
      );

      setQuadros(atualizados);
    } catch (error) {
      console.error("Erro ao arquivar quadro:", error);
    }

    setShowArchiveModal(false);
    setQuadroSelecionado(null);
  }

  return (
    <div className="kanban-home">
      <div className="kanban-home-header">
        <div className="header-title">
          <FiGrid size={24} />
          <h2>Seus Quadros</h2>
        </div>
      </div>

      {/* 🔹 Exibir quadros */}
      <div className="quadros-recentes">
        {quadros.length > 0 ? (
          quadros.map((quadro) => (
            <div
              key={quadro.id}
              className={`quadro-card ${quadro.arquivado ? "arquivado" : ""}`}
              onClick={() => !quadro.arquivado && onSelectKanban(quadro)}
              style={{ background: quadro.cor }}
            >
              <div className="quadro-overlay"></div>

              {/* 🔹 Badge Arquivado */}
              {quadro.arquivado && (
                <span className="quadro-badge-arquivado">Arquivado</span>
              )}

              {/* 🔹 Botão Arquivar */}
              {!quadro.arquivado && (
                <button
                  className="btn-arquivar-quadro"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirModalArquivar(quadro);
                  }}
                >
                  Arquivar
                </button>
              )}

              <h3>{quadro.titulo}</h3>
            </div>
          ))
        ) : (
          <p className="sem-quadros">Nenhum quadro criado ainda.</p>
        )}
      </div>

      {/* 🔹 Seção Criar */}
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
                      onClick={() => setNovoQuadro({ ...novoQuadro, cor })}
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

      {/* 🔹 Modal Arquivar */}
      {showArchiveModal && quadroSelecionado && (
        <div className="modal-overlay" onClick={() => setShowArchiveModal(false)}>
          <div className="modal-arquivar" onClick={(e) => e.stopPropagation()}>
            <svg
              className="modal-alert-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3m0 4h.01M10.29 3.86l-7.07 12.2A1 1 0 004.1 18h15.8a1 1 0 00.87-1.94l-7.07-12.2a1 1 0 00-1.74 0z"
              />
            </svg>

            <h3>Arquivar Quadro</h3>
            <p>
              Tem certeza que deseja arquivar o quadro "
              <strong>{quadroSelecionado.titulo}</strong>"?
              <br />
              Ele ficará oculto, mas poderá ser restaurado depois.
            </p>

            <div className="modal-arquivar-buttons">
              <button
                className="modal-arquivar-cancelar"
                onClick={() => setShowArchiveModal(false)}
              >
                Cancelar
              </button>

              <button
                className="modal-arquivar-confirmar"
                onClick={confirmarArquivar}
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
