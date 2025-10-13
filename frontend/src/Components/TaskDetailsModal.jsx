import React, { useState, useRef, useEffect } from 'react';
import './TaskDetailsModal.css';
import { FiCreditCard, FiCheckSquare, FiPaperclip, FiAlignLeft, FiActivity, FiUsers, FiClock, FiTag } from 'react-icons/fi';

// --- Componente para os Pop-ups de Ação ---
const ActionPopup = ({ title, onClose, children }) => {
    return (
        <div className="action-popup">
            <div className="popup-header">
                <h4>{title}</h4>
                <button onClick={onClose} className="popup-close-btn">✕</button>
            </div>
            <div className="popup-content">
                {children}
            </div>
        </div>
    );
};

// --- Componente Principal do Modal ---
export default function TaskDetailsModal({ task, onClose }) {
  const [activePopup, setActivePopup] = useState(null);
  const sidebarRef = useRef(null);

  // Fecha o pop-up se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setActivePopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  if (!task) return null;

  const renderPopup = () => {
    if (!activePopup) return null;

    switch (activePopup) {
        case 'checklist':
            return (
                <ActionPopup title="Adicionar Checklist" onClose={() => setActivePopup(null)}>
                    <label>Título</label>
                    <input type="text" defaultValue="Checklist" />
                    <button className="popup-button">Adicionar</button>
                </ActionPopup>
            );
        case 'etiquetas':
             return (
                <ActionPopup title="Etiquetas" onClose={() => setActivePopup(null)}>
                    <input type="text" placeholder="Buscar etiquetas..." />
                    {/* Aqui viria a lista de etiquetas */}
                    <p>Funcionalidade de etiquetas em breve.</p>
                </ActionPopup>
            );
        // Adicione outros cases para 'datas', 'anexo', etc. aqui
        default:
            return null;
    }
  }

  return (
    <div className="task-details-overlay" onClick={onClose}>
      <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <div className="task-details-header">
          <h2><FiCreditCard className="header-icon" /> {task.name}</h2>
          <p>na lista <strong>{task.column}</strong></p>
        </div>
        
        <div className="task-details-content">
          <div className="task-main-content">
            <div className="section">
              <div className="section-header">
                <FiAlignLeft className="section-icon"/>
                <h3>Descrição</h3>
              </div>
              <div className="description-box">
                <p>{task.descricao || "Adicione uma descrição mais detalhada..."}</p>
              </div>
            </div>
            
            <div className="section">
                <div className="section-header">
                    <FiActivity className="section-icon"/>
                    <h3>Atividade</h3>
                </div>
                <div className="comment-box">
                    <p>Escrever um comentário...</p>
                </div>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-avatar">CJ</div>
                        <div className="activity-content">
                            <p><strong>Caio Jacinto</strong> adicionou este cartão a Iniciar</p>
                            <span className="activity-time">4 de out. de 2025, 10:51</span>
                        </div>
                    </div>
                </div>
            </div>

          </div>
          
          <div className="task-sidebar" ref={sidebarRef}>
            <div className="sidebar-actions">
                <h3>Adicionar ao cartão</h3>
                <button className="sidebar-button" onClick={() => setActivePopup('membros')}><FiUsers className="sidebar-button-icon" /> Membros</button>
                <button className="sidebar-button" onClick={() => setActivePopup('etiquetas')}><FiTag className="sidebar-button-icon" /> Etiquetas</button>
                <button className="sidebar-button" onClick={() => setActivePopup('checklist')}><FiCheckSquare className="sidebar-button-icon" /> Checklist</button>
                <button className="sidebar-button" onClick={() => setActivePopup('datas')}><FiClock className="sidebar-button-icon" /> Datas</button>
                <button className="sidebar-button" onClick={() => setActivePopup('anexo')}><FiPaperclip className="sidebar-button-icon" /> Anexo</button>
            </div>
            {renderPopup()}
          </div>
        </div>
      </div>
    </div>
  );
}