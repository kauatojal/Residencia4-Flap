import React, { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, Archive, Plus, CheckSquare } from 'lucide-react';
import './TaskDetailsModal.css';

export default function TaskDetailsModal({ isOpen, onClose, task, onUpdate }) {
  // 1. Hooks devem ser chamados SEMPRE no topo, antes de qualquer return
  const [description, setDescription] = useState("");
  const [checklistInput, setChecklistInput] = useState("");

  // Atualiza o estado local quando a prop 'task' muda
  useEffect(() => {
    if (task) {
      setDescription(task.descricao || task.description || "");
    }
  }, [task]);

  // 2. Só agora podemos fazer o retorno condicional
  if (!isOpen || !task) return null;

  const handleSaveDesc = () => {
    const updated = { ...task, descricao: description };
    onUpdate(updated);
  };
  
  const addCheckItem = () => {
    if (!checklistInput.trim()) return;
    const newItem = { id: Date.now(), text: checklistInput, done: false };
    const updated = { ...task, checklist: [...(task.checklist || []), newItem] };
    onUpdate(updated);
    setChecklistInput("");
  };

  const toggleCheck = (id) => {
    const newChecklist = task.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i);
    onUpdate({ ...task, checklist: newChecklist });
  };

  const handleArchive = async () => {
    if (!window.confirm("Deseja realmente arquivar esta tarefa?")) return;
    
    try {
      const response = await fetch(`http://localhost:8090/v1/tarefa/${task.id}/arquivar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        alert("Tarefa arquivada!");
        onClose();
        window.location.reload(); 
      } else {
        alert("Erro ao arquivar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal-wrapper">
        <div className="modal-header-color"></div>
        <div className="modal-body-content">
           
           {/* COLUNA ESQUERDA */}
           <div className="modal-left-col">
              <div className="modal-title-row">
                 <h2>{task.titulo || task.title}</h2>
                 <button onClick={onClose} className="close-btn-mobile"><X size={24}/></button>
              </div>

              <div className="modal-meta-row">
                 <div className="meta-badge">
                    <Briefcase size={16} /> {task.cliente?.nome || task.cliente || "Cliente"}
                 </div>
                 <div className="meta-badge">
                    Prioridade: <strong>{task.prioridade || task.priority}</strong>
                 </div>
                 <div className="meta-badge">
                    <Calendar size={16} /> {task.prazo || task.dueDate || "Sem prazo"}
                 </div>
              </div>

              <div className="modal-section">
                 <label>Descrição</label>
                 <textarea 
                   className="description-input"
                   rows="4"
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   onBlur={handleSaveDesc}
                   placeholder="Adicione uma descrição..."
                 />
              </div>

              <div className="modal-section">
                 <div className="section-header">
                    <h3><CheckSquare size={18}/> Checklist</h3>
                 </div>
                 
                 <div className="checklist-container">
                    {task.checklist?.map(item => (
                       <div key={item.id} className="checklist-item">
                          <input 
                            type="checkbox" 
                            checked={item.done} 
                            onChange={() => toggleCheck(item.id)} 
                          />
                          <span className={item.done ? 'done' : ''}>{item.text}</span>
                       </div>
                    ))}
                    
                    <div className="add-checklist-row">
                       <input 
                         type="text" 
                         value={checklistInput} 
                         onChange={(e) => setChecklistInput(e.target.value)}
                         placeholder="Novo item..."
                         onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                       />
                       <button onClick={addCheckItem}>Adicionar</button>
                    </div>
                 </div>
              </div>

              <button className="btn-archive" onClick={handleArchive}>
                 <Archive size={16} /> Arquivar Tarefa
              </button>
           </div>

           {/* COLUNA DIREITA */}
           <div className="modal-right-col">
              <button onClick={onClose} className="close-btn-desktop"><X size={24}/></button>
              
              <h3>Comentários</h3>
              
              <div className="comment-mock">
                 <div className="comment-avatar">LS</div>
                 <div className="comment-content">
                    <div className="comment-author">Luciano Silveira <span>Hoje</span></div>
                    <p>Comentários virão da API /v1/comentario em breve.</p>
                 </div>
              </div>

              <div className="comment-box">
                 <textarea placeholder="Escreva um comentário..."></textarea>
                 <button className="btn-send">Enviar</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}