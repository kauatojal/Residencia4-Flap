import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdicionarTarefa from "./AdicionarTarefa";
import TaskDetailsModal from "./TaskDetailsModal";
import "./KanbanBoard.css";
import CalendarioAnual from "./CalendarioAnual";
import { FiMoreHorizontal } from "react-icons/fi";

const initialData = {
    "Iniciar": [
        { id: "1", name: "Revisar Layout", client: "Cliente A", prazo: "15/10/2025", alerta: "No prazo", participantes: 3, views: 45, descricao: "Revisar todo o layout da aplicação conforme feedback do cliente.", tag: "Normal", sector: "Design", membros: [], checklist: [], comentarios: [], anexos: [] },
        { id: "2", name: "Criar Protótipo", client: "Cliente B", prazo: "08/10/2025", alerta: "No prazo", participantes: 5, views: 78, descricao: "Desenvolver protótipo interativo no Figma.", tag: "Urgente", sector: "Design", membros: [], checklist: [], comentarios: [], anexos: [] },
    ],
    "Fazendo": [ { id: "4", name: "Implementar API", client: "Cliente D", prazo: "05/10/2025", alerta: "No prazo", participantes: 4, views: 112, descricao: "Criar endpoints REST para integração com o frontend.", tag: "Urgente", sector: "Desenvolvimento", membros: [], checklist: [], comentarios: [], anexos: [] }, ],
    "Refação": [ { id: "7", name: "Corrigir Bugs", client: "Cliente G", prazo: "01/10/2025", alerta: "Atrasado", participantes: 2, views: 34, descricao: "Corrigir bugs relatados na última sprint.", tag: "Urgente", sector: "Desenvolvimento", membros: [], checklist: [], comentarios: [], anexos: [] }, ],
    "Revisão": [ { id: "10", name: "Testar Funcionalidades", client: "Cliente J", prazo: "10/10/2025", alerta: "No prazo", participantes: 6, views: 89, descricao: "Realizar testes completos de todas as funcionalidades implementadas.", tag: "Normal", sector: "Desenvolvimento", membros: [], checklist: [], comentarios: [], anexos: [] }, ],
    "Concluídos": [ { id: "13", name: "Configurar Servidor", client: "Cliente M", prazo: "25/09/2025", alerta: "No prazo", participantes: 3, views: 125, descricao: "Configuração completa do servidor de produção finalizada com sucesso.", tag: "Urgente", sector: "Desenvolvimento", membros: [], checklist: [], comentarios: [], anexos: [] }, ],
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialData);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openColumnMenu, setOpenColumnMenu] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [activeView, setActiveView] = useState("quadros");
  const [editingColumn, setEditingColumn] = useState(null);
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [columnaSelecionadaParaNovaTarefa, setColumnaSelecionadaParaNovaTarefa] = useState(null);
  const [addColumnAfterIndex, setAddColumnAfterIndex] = useState(null);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    const startCol = Array.from(columns[source.droppableId]);
    const [movedCard] = startCol.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
        startCol.splice(destination.index, 0, movedCard);
        setColumns({ ...columns, [source.droppableId]: startCol });
    } else {
        const finishCol = Array.from(columns[destination.droppableId]);
        finishCol.splice(destination.index, 0, movedCard);
        setColumns({ ...columns, [source.droppableId]: startCol, [destination.droppableId]: finishCol });
    }
  };
  
  const getTagColor = (tag) => {
    switch (tag) {
      case "Urgente": return { bg: '#fff5f5', text: '#fa5252' };
      case "Normal": return { bg: '#fff9db', text: '#f08c00' };
      case "Baixa Prioridade": return { bg: '#ebfbee', text: '#2f9e44' };
      default: return { bg: '#f1f3f5', text: '#495057' };
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.kanban-card-menu-wrapper')) {
        setOpenMenuId(null);
      }
      if (openColumnMenu && !event.target.closest('.column-menu-wrapper')) {
        setOpenColumnMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId, openColumnMenu]);

  const handleUpdateTask = (updatedTask) => {
    setColumns(prev => {
      const newCols = { ...prev };
      for (const colId in newCols) {
        const cardIndex = newCols[colId].findIndex(c => c.id === updatedTask.id);
        if (cardIndex > -1) {
          newCols[colId][cardIndex] = updatedTask;
          if(selectedCard && selectedCard.id === updatedTask.id) {
            setSelectedCard(updatedTask);
          }
          break;
        }
      }
      return newCols;
    });
  };

  const handleAddTask = (taskData) => {
    if (taskToEdit) {
      const updatedTask = { ...taskToEdit, ...taskData };
      handleUpdateTask(updatedTask);
    } else {
      const newTask = { 
        id: String(Date.now()), 
        views: 0, 
        alerta: 'No prazo', 
        checklist: [], 
        comentarios: [], 
        anexos: [], 
        ...taskData 
      };
      
      const targetColumn = columnaSelecionadaParaNovaTarefa || Object.keys(columns)[0];
      setColumns(prev => ({
        ...prev, 
        [targetColumn]: [newTask, ...prev[targetColumn]]
      }));
    }
    setShowAddTask(false);
    setTaskToEdit(null);
    setColumnaSelecionadaParaNovaTarefa(null);
  };

  const handleDeleteCard = () => {
    if(!cardToDelete) return;
    const { columnId, cardId } = cardToDelete;
    setColumns(prev => ({...prev, [columnId]: prev[columnId].filter(c => c.id !== cardId)}));
    setCardToDelete(null);
  };

  const handleEditCard = (card) => {
    setTaskToEdit(card);
    setShowAddTask(true);
    setOpenMenuId(null);
  };

  const handleRenameColumn = (oldName, newName) => {
    if (!newName.trim() || newName === oldName) {
      setEditingColumn(null);
      return;
    }
    
    const newColumns = {};
    Object.keys(columns).forEach(key => {
      if (key === oldName) {
        newColumns[newName] = columns[key];
      } else {
        newColumns[key] = columns[key];
      }
    });
    setColumns(newColumns);
    setEditingColumn(null);
  };

  const handleDeleteColumn = () => {
    if (!columnToDelete) return;
    const newColumns = { ...columns };
    delete newColumns[columnToDelete];
    setColumns(newColumns);
    setColumnToDelete(null);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    const columnsArray = Object.entries(columns);
    const newColumns = {};
    
    columnsArray.forEach(([key, value], index) => {
      newColumns[key] = value;
      if (index === addColumnAfterIndex) {
        newColumns[newColumnName] = [];
      }
    });
    
    setColumns(newColumns);
    setNewColumnName("");
    setShowAddColumn(false);
    setAddColumnAfterIndex(null);
  };
  
  const renderKanbanView = () => {
    const columnsArray = Object.entries(columns);
    
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {columnsArray.map(([columnId, cards], index) => (
            <React.Fragment key={columnId}>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                    <div className="column-header">
                      {editingColumn === columnId ? (
                        <input
                          type="text"
                          defaultValue={columnId}
                          autoFocus
                          onBlur={(e) => handleRenameColumn(columnId, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameColumn(columnId, e.target.value);
                            }
                          }}
                          className="column-title-input"
                        />
                      ) : (
                        <h2>{columnId} ({cards.length})</h2>
                      )}
                      
                      <div className="column-menu-wrapper">
                        <button 
                          className="column-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenColumnMenu(openColumnMenu === columnId ? null : columnId);
                          }}
                        >
                          <FiMoreHorizontal />
                        </button>
                        {openColumnMenu === columnId && (
                          <div className="column-dropdown">
                            <button onClick={() => {
                              setEditingColumn(columnId);
                              setOpenColumnMenu(null);
                            }}>
                              Renomear
                            </button>
                            <button 
                              className="delete" 
                              onClick={() => {
                                setColumnToDelete(columnId);
                                setOpenColumnMenu(null);
                              }}
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {cards.map((card, cardIndex) => (
                      <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                        {(provided) => (
                          <div
                            className="kanban-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedCard({...card, column: columnId })}
                          >
                            <div className="kanban-card-header">
                              <div className="kanban-card-title">
                                  <span className="kanban-circle"></span>
                                  <span className="kanban-task">{card.name}</span>
                              </div>
                              <div className="kanban-card-menu-wrapper">
                                <button className="kanban-card-more" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === card.id ? null : card.id); }}>...</button>
                                {openMenuId === card.id && (
                                  <div className="kanban-card-dropdown">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditCard(card); }}>Editar</button>
                                    <button className="delete" onClick={(e) => { e.stopPropagation(); setCardToDelete({ columnId, cardId: card.id }); }}>Excluir</button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="kanban-card-client">{card.client}</p>
                            <div className="kanban-card-tags">
                              <span className="kanban-tag" style={{ backgroundColor: getTagColor(card.tag).bg, color: getTagColor(card.tag).text }}>{card.tag}</span>
                              <span className={`kanban-alert ${card.alerta === 'Atrasado' ? 'alert-red' : 'alert-green'}`}>{card.alerta}</span>
                            </div>
                            <div className="kanban-card-footer">
                              <span>Prazo: {card.prazo}</span>
                              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                  <span className="kanban-card-participants">👥 +{card.participantes}</span>
                                  <span>{card.views}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    <button 
                      className="btn-adicionar-cartao"
                      onClick={() => {
                        setTaskToEdit(null);
                        setColumnaSelecionadaParaNovaTarefa(columnId);
                        setShowAddTask(true);
                      }}
                    >
                      + Adicionar um cartão
                    </button>
                  </div>
                )}
              </Droppable>

              <div className="column-divider">
                {showAddColumn && addColumnAfterIndex === index ? (
                  <div className="add-column-inline">
                    <input
                      type="text"
                      placeholder="Nome da coluna..."
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddColumn();
                        if (e.key === 'Escape') {
                          setShowAddColumn(false);
                          setNewColumnName("");
                          setAddColumnAfterIndex(null);
                        }
                      }}
                      onBlur={() => {
                        if (!newColumnName.trim()) {
                          setShowAddColumn(false);
                          setAddColumnAfterIndex(null);
                        }
                      }}
                      autoFocus
                      className="inline-column-input"
                    />
                    <button onClick={handleAddColumn} className="btn-confirm-inline">✓</button>
                    <button onClick={() => { 
                      setShowAddColumn(false); 
                      setNewColumnName(""); 
                      setAddColumnAfterIndex(null);
                    }} className="btn-cancel-inline">✕</button>
                  </div>
                ) : (
                  <button 
                    className="btn-add-column-divider"
                    onClick={() => {
                      setShowAddColumn(true);
                      setAddColumnAfterIndex(index);
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </DragDropContext>
    );
  };

  return (
    <>
      <div className="kanban-header">
        <div className="kanban-header-left">

          <div className="kanban-header-switch">
            <button className={`switch-btn ${activeView === "quadros" ? "active" : ""}`} onClick={() => setActiveView("quadros")}>Quadros</button>
            <button className={`switch-btn ${activeView === "calendario" ? "active" : ""}`} onClick={() => setActiveView("calendario")}>Calendário</button>
          </div>
        </div>
        <div className="kanban-header-controls">
          <input type="search" placeholder="Pesquisar" className="kanban-header-search" />
          <button className="kanban-header-btn">Filtrar</button>
        </div>
      </div>

      <div style={{flexGrow: 1}}>
        {activeView === 'quadros' ? renderKanbanView() : <CalendarioAnual tasks={Object.values(columns).flat()} />}
      </div>
      
      <TaskDetailsModal 
        task={selectedCard} 
        onClose={() => setSelectedCard(null)} 
        onUpdateTask={handleUpdateTask} 
      />

      {cardToDelete && (
        <div className="modal-overlay" onClick={() => setCardToDelete(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setCardToDelete(null)}>✕</button>
            <h2>Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir esta tarefa?</p>
            <div className="delete-modal-actions">
              <button onClick={() => setCardToDelete(null)}>Cancelar</button>
              <button className="delete" onClick={handleDeleteCard}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {columnToDelete && (
        <div className="modal-overlay" onClick={() => setColumnToDelete(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setColumnToDelete(null)}>✕</button>
            <h2>Excluir Coluna</h2>
            <p>Tem certeza que deseja excluir a coluna "{columnToDelete}"? Todas as tarefas serão removidas.</p>
            <div className="delete-modal-actions">
              <button onClick={() => setColumnToDelete(null)}>Cancelar</button>
              <button className="delete" onClick={handleDeleteColumn}>Excluir</button>
            </div>
          </div>
        </div>
      )}
      
      {showAddTask && (
        <AdicionarTarefa 
          onClose={() => setShowAddTask(false)} 
          onAddTask={handleAddTask} 
          taskToEdit={taskToEdit}
        />
      )}
    </>
  );
}
