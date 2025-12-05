import React, { useState, useEffect } from "react";
import { FiX, FiLock, FiCheck } from "react-icons/fi";
import "./ModalCargo.css";

export function ModalCargo({ cargo, permissoes, onSave, onCancel }) {
  const [nome, setNome] = useState("");
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);
  const [modalPermissoes, setModalPermissoes] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const isEditando = !!cargo?.id;

  useEffect(() => {
    if (cargo) {
      setNome(cargo.nome || "");
      setPermissoesSelecionadas(cargo.permissoesIds || []);
    }
  }, [cargo]);

  const handleTogglePermissao = (permId) => {
    setPermissoesSelecionadas(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("O nome do cargo é obrigatório");
      return;
    }

    setSalvando(true);
    try {
      await onSave({
        nome: nome.trim(),
        permissoesIds: permissoesSelecionadas
      });
      // ✅ Modal fecha automaticamente no componente pai
    } catch (err) {
      setErro("Erro ao salvar cargo");
      setSalvando(false); // ✅ Libera botão em caso de erro
    }
  };

  // ✅ Fecha modal ao clicar no overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick} />
      <div className="modal-cargo">
        <div className="mc-header">
          <h2>{isEditando ? "Editar Cargo" : "Novo Cargo"}</h2>
          <button className="mc-close" onClick={onCancel} type="button">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mc-field">
            <label htmlFor="nome-cargo">Nome do Cargo *</label>
            <input
              id="nome-cargo"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Gerente, Estagiário..."
              autoFocus
              required
            />
          </div>

          <div className="mc-field">
            <label>Permissões</label>
            <button
              type="button"
              className="mc-config-btn"
              onClick={() => setModalPermissoes(true)}
            >
              <FiLock />
              Configurar Permissões ({permissoesSelecionadas.length})
            </button>
            <p className="mc-info">
              ⚠️ <strong>Funcionalidade em criação no backend</strong>
              <br />
              As permissões serão salvas quando o backend estiver pronto.
            </p>
          </div>

          {erro && <div className="mc-erro">{erro}</div>}

          <div className="mc-actions">
            <button type="button" onClick={onCancel} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={salvando}>
              {salvando ? "Salvando..." : isEditando ? "Atualizar Cargo" : "Criar Cargo"}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL DE PERMISSÕES */}
      {modalPermissoes && (
        <>
          <div className="modal-overlay" onClick={() => setModalPermissoes(false)} />
          <div className="modal-permissoes">
            <div className="mp-header">
              <h3>Selecionar Permissões - {nome || "Cargo"}</h3>
              <button className="mc-close" onClick={() => setModalPermissoes(false)} type="button">
                <FiX />
              </button>
            </div>

            <div className="mp-grid">
              {permissoes.length === 0 ? (
                <p className="mp-empty">Nenhuma permissão disponível</p>
              ) : (
                permissoes.map(perm => (
                  <label key={perm.id} className="mp-item">
                    <input
                      type="checkbox"
                      checked={permissoesSelecionadas.includes(perm.id)}
                      onChange={() => handleTogglePermissao(perm.id)}
                    />
                    <div className="mp-content">
                      <FiCheck className="mp-check" />
                      <div>
                        <strong>{perm.nome}</strong>
                        <small>{perm.descricao || "Permissão do sistema"}</small>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="mp-footer">
              <button
                type="button"
                className="btn-confirmar"
                onClick={() => setModalPermissoes(false)}
              >
                Confirmar Permissões
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
