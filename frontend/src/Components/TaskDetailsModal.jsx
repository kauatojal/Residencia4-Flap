import React, { useState, useRef, useEffect } from 'react';
import './TaskDetailsModal.css';
import { FiCreditCard, FiCheckSquare, FiPaperclip, FiAlignLeft, FiActivity, FiUsers, FiClock, FiTag, FiCornerDownRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';

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

// --- Componente Recursivo para Comentários ---
const ComentarioItem = ({ comentario, nivel = 0, onResponder }) => {
    const [respondendo, setRespondendo] = useState(false);
    const [textoResposta, setTextoResposta] = useState('');
    const [mostrarRespostas, setMostrarRespostas] = useState(false);

    const handleResponder = () => {
        if (textoResposta.trim()) {
            onResponder(comentario.id, textoResposta);
            setTextoResposta('');
            setRespondendo(false);
            setMostrarRespostas(true); // Mostra as respostas automaticamente após adicionar uma nova
        }
    };

    const totalRespostas = comentario.respostas ? comentario.respostas.length : 0;

    return (
        <div style={{ marginLeft: nivel > 0 ? '48px' : '0' }}>
            <div className="activity-item">
                {nivel > 0 && <FiCornerDownRight className="reply-icon" />}
                <div className="activity-avatar">{comentario.inicial}</div>
                <div className="activity-content">
                    <div className="activity-header">
                        <p>
                            <strong>{comentario.autor}</strong> 
                            {comentario.isActivity ? ` ${comentario.texto}` : ''}
                        </p>
                        <span className="activity-time">{comentario.data}</span>
                    </div>
                    {!comentario.isActivity && (
                        <>
                            <div className="comment-text">{comentario.texto}</div>
                            <div className="comment-actions">
                                <button 
                                    className="reply-btn"
                                    onClick={() => setRespondendo(!respondendo)}
                                >
                                    {respondendo ? 'Cancelar' : 'Responder'}
                                </button>
                                {totalRespostas > 0 && (
                                    <button 
                                        className="toggle-replies-btn"
                                        onClick={() => setMostrarRespostas(!mostrarRespostas)}
                                    >
                                        {mostrarRespostas ? (
                                            <>
                                                <FiChevronUp size={14} />
                                                Ocultar {totalRespostas} {totalRespostas === 1 ? 'resposta' : 'respostas'}
                                            </>
                                        ) : (
                                            <>
                                                <FiChevronDown size={14} />
                                                Ver {totalRespostas} {totalRespostas === 1 ? 'resposta' : 'respostas'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Campo para responder */}
            {respondendo && (
                <div className="reply-input-container">
                    <div className="comment-avatar">VO</div>
                    <div className="comment-input-wrapper">
                        <textarea 
                            className="comment-input"
                            placeholder="Escrever uma resposta..."
                            value={textoResposta}
                            onChange={(e) => setTextoResposta(e.target.value)}
                            rows={2}
                            autoFocus
                        />
                        <div className="reply-actions">
                            <button 
                                className="comment-submit-btn"
                                onClick={handleResponder}
                                disabled={!textoResposta.trim()}
                            >
                                Salvar
                            </button>
                            <button 
                                className="comment-cancel-btn"
                                onClick={() => {
                                    setRespondendo(false);
                                    setTextoResposta('');
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Renderiza respostas recursivamente - apenas se mostrarRespostas for true */}
            {mostrarRespostas && comentario.respostas && comentario.respostas.length > 0 && (
                <div>
                    {comentario.respostas.map((resposta) => (
                        <ComentarioItem 
                            key={resposta.id} 
                            comentario={resposta} 
                            nivel={nivel + 1}
                            onResponder={onResponder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Componente Principal do Modal ---
export default function TaskDetailsModal({ task, onClose }) {
  const [activePopup, setActivePopup] = useState(null);
  const [comentarios, setComentarios] = useState([
    {
      id: 1,
      autor: 'Caio Jacinto',
      inicial: 'CJ',
      texto: 'adicionou este cartão a Iniciar',
      data: '4 de out. de 2025, 10:51',
      isActivity: true,
      respostas: []
    }
  ]);
  const [novoComentario, setNovoComentario] = useState('');
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

  const adicionarComentario = () => {
    if (novoComentario.trim()) {
      const comentario = {
        id: Date.now(),
        autor: 'Você',
        inicial: 'VO',
        texto: novoComentario,
        data: new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        isActivity: false,
        respostas: []
      };
      setComentarios([...comentarios, comentario]);
      setNovoComentario('');
    }
  };

  // Função recursiva para adicionar resposta em qualquer nível
  const adicionarResposta = (comentarioId, textoResposta) => {
    const resposta = {
      id: Date.now(),
      autor: 'Você',
      inicial: 'VO',
      texto: textoResposta,
      data: new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      isActivity: false,
      respostas: []
    };

    const adicionarRespostaRecursiva = (comentarios) => {
      return comentarios.map(com => {
        if (com.id === comentarioId) {
          return { ...com, respostas: [...com.respostas, resposta] };
        } else if (com.respostas && com.respostas.length > 0) {
          return { ...com, respostas: adicionarRespostaRecursiva(com.respostas) };
        }
        return com;
      });
    };

    setComentarios(adicionarRespostaRecursiva(comentarios));
  };

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
                    <p>Funcionalidade de etiquetas em breve.</p>
                </ActionPopup>
            );
        default:
            return null;
    }
  };

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
                
                <div className="comment-input-container">
                    <div className="comment-avatar">VO</div>
                    <div className="comment-input-wrapper">
                        <textarea 
                            className="comment-input"
                            placeholder="Escrever um comentário..."
                            value={novoComentario}
                            onChange={(e) => setNovoComentario(e.target.value)}
                            rows={3}
                        />
                        <button 
                            className="comment-submit-btn"
                            onClick={adicionarComentario}
                            disabled={!novoComentario.trim()}
                        >
                            Salvar
                        </button>
                    </div>
                </div>

                <div className="activity-list">
                    {comentarios.map((comentario) => (
                        <ComentarioItem 
                            key={comentario.id} 
                            comentario={comentario}
                            onResponder={adicionarResposta}
                        />
                    ))}
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
