import React, { useState, useEffect } from "react";
import "./TaskDetailsModal.css";
import {
  FiCreditCard,
  FiAlignLeft,
  FiActivity,
  FiPaperclip,
  FiCheckSquare,
  FiSend,
} from "react-icons/fi";
import kanbanService from "../services/kanbanService";

export default function TaskDetailsModal({ task, onClose, onUpdateTask }) {
  const [form, setForm] = useState({ ...task });
  const [loading, setLoading] = useState(false);

  // Relacionamentos puros
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [checklists, setChecklists] = useState([]);
  const [novoChecklist, setNovoChecklist] = useState("");
  const [anexos, setAnexos] = useState([]);
  const [novoAnexo, setNovoAnexo] = useState(null);

  // Detecta mudanças não salvas
  const hasChanges = JSON.stringify(form) !== JSON.stringify(task);

  useEffect(() => {
    if (task?.id) {
      setForm({ ...task });
      loadRelacionamentos(task.id);
    }
  }, [task]);

  const loadRelacionamentos = async (id) => {
    try {
      const [coments, checks, files] = await Promise.all([
        kanbanService.listComentarios(id),
        kanbanService.listChecklists(id),
        kanbanService.listAnexos(id),
      ]);
      setComentarios(coments || []);
      setChecklists(checks || []);
      setAnexos(files || []);
    } catch (err) {
      console.error("Erro ao carregar relacionamentos:", err);
    }
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const updated = await kanbanService.updateTarefa(task.id, form);
      onUpdateTask(updated);
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar tarefa", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      const added = await kanbanService.addComentario(task.id, {
        texto: novoComentario,
      });
      setComentarios((prev) => [...prev, added]);
      setNovoComentario("");
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
    }
  };

  const handleAddChecklist = async () => {
    if (!novoChecklist.trim()) return;
    try {
      const added = await kanbanService.addChecklist(task.id, {
        titulo: novoChecklist,
      });
      setChecklists((prev) => [...prev, added]);
      setNovoChecklist("");
    } catch (err) {
      console.error("Erro ao adicionar checklist:", err);
    }
  };

  const handleToggleChecklist = async (check) => {
    try {
      const updated = await kanbanService.updateChecklist(task.id, check.id, {
        ...check,
        concluido: !check.concluido,
      });
      setChecklists((prev) =>
        prev.map((c) => (c.id === check.id ? updated : c))
      );
    } catch (err) {
      console.error("Erro ao atualizar checklist:", err);
    }
  };

  const handleUploadAnexo = async () => {
    if (!novoAnexo) return;
    try {
      const formData = new FormData();
      formData.append("file", novoAnexo);
      const uploaded = await kanbanService.uploadAnexo(task.id, formData);
      setAnexos((prev) => [...prev, uploaded]);
      setNovoAnexo(null);
    } catch (err) {
      console.error("Erro ao enviar anexo:", err);
    }
  };

  if (!task) return null;

  return (
    <div className="task-details-overlay" onClick={onClose}>
      <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>
          <FiCreditCard /> {form.nome}
        </h2>

        {/* Descrição */}
        <label>
          <FiAlignLeft /> Descrição
        </label>
        <textarea
          value={form.descricao || ""}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />

        {/* Prazo */}
        <label>Prazo</label>
        <input
          type="date"
          value={form.prazo ? form.prazo.split("T")[0] : ""}
          onChange={(e) => setForm({ ...form, prazo: e.target.value })}
        />

        <div className="task-actions">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={hasChanges ? "pulse" : ""}
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>

        {/* Checklists */}
        <div className="section">
          <div className="section-header">
            <FiCheckSquare /> <h3>Checklist</h3>
          </div>
          <ul className="checklist-list">
            {checklists.map((c) => (
              <li key={c.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!c.concluido}
                    onChange={() => handleToggleChecklist(c)}
                  />
                  {c.titulo}
                </label>
              </li>
            ))}
          </ul>
          <div className="checklist-input">
            <input
              type="text"
              placeholder="Adicionar item..."
              value={novoChecklist}
              onChange={(e) => setNovoChecklist(e.target.value)}
            />
            <button onClick={handleAddChecklist}>+</button>
          </div>
        </div>

        {/* Comentários */}
        <div className="section">
          <div className="section-header">
            <FiActivity /> <h3>Comentários</h3>
          </div>
          <div className="comentarios-list">
            {comentarios.map((c) => (
              <div key={c.id} className="comentario-item">
                <strong>{c.autor?.nome || "Usuário"}</strong>
                <p>{c.texto}</p>
              </div>
            ))}
          </div>
          <div className="comentario-input">
            <input
              type="text"
              placeholder="Escreva um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
            <button onClick={handleAddComentario}>
              <FiSend />
            </button>
          </div>
        </div>

        {/* Anexos */}
        <div className="section">
          <div className="section-header">
            <FiPaperclip /> <h3>Anexos</h3>
          </div>
          <ul className="anexo-list">
            {anexos.map((a) => (
              <li key={a.id}>
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  📄 {a.nome}
                </a>
              </li>
            ))}
          </ul>
          <div className="anexo-input">
            <input
              type="file"
              onChange={(e) => setNovoAnexo(e.target.files[0])}
            />
            <button onClick={handleUploadAnexo}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
