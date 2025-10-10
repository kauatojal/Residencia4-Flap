import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdicionarTarefa from "./AdicionarTarefa";
import "./Kanban.css";

const initialData = {
  "Iniciar": [
    {
      id: "1",
      name: "Revisar Layout",
      client: "Cliente A",
      prazo: "15/10/2025",
      alerta: "No prazo",
      participantes: 3,
      views: 45,
      descricao: "Revisar todo o layout da aplicação conforme feedback do cliente.",
      tag: "Normal",
      sector: "Design",
    },
    {
      id: "2",
      name: "Criar Protótipo",
      client: "Cliente B",
      prazo: "08/10/2025",
      alerta: "No prazo",
      participantes: 5,
      views: 78,
      descricao: "Desenvolver protótipo interativo no Figma.",
      tag: "Urgente",
      sector: "Design",
    },
    {
      id: "3",
      name: "Documentar API",
      client: "Cliente C",
      prazo: "20/10/2025",
      alerta: "No prazo",
      participantes: 2,
      views: 32,
      descricao: "Criar documentação completa da API REST.",
      tag: "Baixa Prioridade",
      sector: "Desenvolvimento",
    },
  ],
  Fazendo: [
    {
      id: "4",
      name: "Implementar API",
      client: "Cliente D",
      prazo: "05/10/2025",
      alerta: "No prazo",
      participantes: 4,
      views: 112,
      descricao: "Criar endpoints REST para integração com o frontend.",
      tag: "Urgente",
      sector: "Desenvolvimento",
    },
    {
      id: "5",
      name: "Desenvolver Dashboard",
      client: "Cliente E",
      prazo: "12/10/2025",
      alerta: "No prazo",
      participantes: 6,
      views: 95,
      descricao: "Desenvolver dashboard administrativo com métricas em tempo real.",
      tag: "Normal",
      sector: "Desenvolvimento",
    },
    {
      id: "6",
      name: "Integrar Pagamento",
      client: "Cliente F",
      prazo: "18/10/2025",
      alerta: "No prazo",
      participantes: 3,
      views: 68,
      descricao: "Integrar gateway de pagamento Stripe no checkout.",
      tag: "Normal",
      sector: "Desenvolvimento",
    },
  ],
  Refação: [
    {
      id: "7",
      name: "Corrigir Bugs",
      client: "Cliente G",
      prazo: "01/10/2025",
      alerta: "Atrasado",
      participantes: 2,
      views: 34,
      descricao: "Corrigir bugs relatados na última sprint.",
      tag: "Urgente",
      sector: "Desenvolvimento",
    },
    {
      id: "8",
      name: "Otimizar Performance",
      client: "Cliente H",
      prazo: "30/09/2025",
      alerta: "Atrasado",
      participantes: 4,
      views: 56,
      descricao: "Melhorar tempo de carregamento das páginas principais.",
      tag: "Normal",
      sector: "Desenvolvimento",
    },
    {
      id: "9",
      name: "Refatorar Código",
      client: "Cliente I",
      prazo: "22/10/2025",
      alerta: "No prazo",
      participantes: 3,
      views: 41,
      descricao: "Refatorar componentes legados para melhor manutenibilidade.",
      tag: "Baixa Prioridade",
      sector: "Desenvolvimento",
    },
  ],
  Revisão: [
    {
      id: "10",
      name: "Testar Funcionalidades",
      client: "Cliente J",
      prazo: "10/10/2025",
      alerta: "No prazo",
      participantes: 6,
      views: 89,
      descricao: "Realizar testes completos de todas as funcionalidades implementadas.",
      tag: "Normal",
      sector: "Desenvolvimento",
    },
    {
      id: "11",
      name: "Revisar Código",
      client: "Cliente K",
      prazo: "07/10/2025",
      alerta: "No prazo",
      participantes: 2,
      views: 52,
      descricao: "Code review dos pull requests abertos.",
      tag: "Normal",
      sector: "Desenvolvimento",
    },
    {
      id: "12",
      name: "Validar Design",
      client: "Cliente L",
      prazo: "14/10/2025",
      alerta: "No prazo",
      participantes: 4,
      views: 73,
      descricao: "Validar implementação do design com o time de UX/UI.",
      tag: "Baixa Prioridade",
      sector: "Design",
    },
  ],
  Concluídos: [
    {
      id: "13",
      name: "Configurar Servidor",
      client: "Cliente M",
      prazo: "25/09/2025",
      alerta: "No prazo",
      participantes: 3,
      views: 125,
      descricao: "Configuração completa do servidor de produção finalizada com sucesso.",
      tag: "Urgente",
      sector: "Desenvolvimento",
    },
    {
      id: "14",
      name: "Implementar Login",
      client: "Cliente N",
      prazo: "28/09/2025",
      alerta: "No prazo",
      participantes: 2,
      views: 98,
      descricao: "Sistema de autenticação e login implementado e testado.",
      tag: "Normal",
      sector: "Desenvolvimento",
    },
    {
      id: "15",
      name: "Deploy Aplicação",
      client: "Cliente O",
      prazo: "01/10/2025",
      alerta: "No prazo",
      participantes: 5,
      views: 156,
      descricao: "Deploy da aplicação realizado com sucesso no ambiente de produção.",
      tag: "Normal",
      sector: "Desenvolvimento",
    },
  ],
};

function Kanban({
  onSwitchKanban,
  onSwitchProjetos,
  onSwitchConfiguracoes,
  onSwitchNotificacoes,
  onLogout,
}) {
  const [columns, setColumns] = useState(initialData);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [activeView, setActiveView] = useState("quadros");
  
  // Estados do calendário
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  // Funções do Calendário
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getTasksForDay = (date) => {
    if (!date) return [];
    const allTasks = [];

    if (columns && typeof columns === 'object') {
      Object.entries(columns).forEach(([columnName, tasks]) => {
        if (Array.isArray(tasks)) {
          tasks.forEach((task) => {
            if (task && task.prazo) {
              const taskDate = parseDateString(task.prazo);
              if (taskDate && isSameDate(date, taskDate)) {
                allTasks.push({ ...task, column: columnName });
              }
            }
          });
        }
      });
    }

    return allTasks;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return isSameDate(date, today);
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const previousYear = () => setCurrentYear(currentYear - 1);
  const nextYear = () => setCurrentYear(currentYear + 1);

  // Função para retornar a cor da etiqueta
  const getTagColor = (tag) => {
    switch (tag) {
      case "Urgente":
        return "#ff6b6b";
      case "Normal":
        return "#ffa500";
      case "Baixa Prioridade":
        return "#4caf50";
      default:
        return "#999";
    }
  };

  // Efeito para fechar o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null) {
        const isClickInsideMenu = event.target.closest('.kanban-card-menu-wrapper');
        if (!isClickInsideMenu) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const onDragEnd = (result) => {
    setIsDragging(false);
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceColumn = Array.from(columns[source.droppableId]);
    const destColumn = Array.from(columns[destination.droppableId]);

    const [movedCard] = sourceColumn.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, movedCard);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
      });
    } else {
      destColumn.splice(destination.index, 0, movedCard);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });
    }
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const handleCardClick = (card) => {
    if (!isDragging && !openMenuId) {
      setSelectedCard(card);
    }
  };

  const handleAddTask = (newTask) => {
    if (taskToEdit) {
      const updatedColumns = { ...columns };
      Object.keys(updatedColumns).forEach((columnId) => {
        updatedColumns[columnId] = updatedColumns[columnId].map((card) =>
          card.id === taskToEdit.id ? { ...newTask, id: taskToEdit.id } : card
        );
      });
      setColumns(updatedColumns);
      setTaskToEdit(null);
    } else {
      setColumns({
        ...columns,
        "Pode fazer": [...columns["Pode fazer"], newTask],
      });
    }
  };

  const handleDeleteCard = (columnId, cardId) => {
    const updatedColumn = columns[columnId].filter((card) => card.id !== cardId);
    setColumns({
      ...columns,
      [columnId]: updatedColumn,
    });
    setOpenMenuId(null);
    setCardToDelete(null);
  };

  const handleEditCard = (card) => {
    setTaskToEdit(card);
    setShowAddTask(true);
    setOpenMenuId(null);
  };

  const handleCloseAddTask = () => {
    setShowAddTask(false);
    setTaskToEdit(null);
  };

  return (
    <div className="kanban-wrapper">
      <aside className="kanban-sidebar">
        <img src="/Logo_flap.png" alt="Flap 15 anos" className="kanban-logo" />

        <nav className="sidebar-main-menu">
          <button onClick={onSwitchKanban} className="sidebar-btn">
            Kanban
          </button>
          <button onClick={onSwitchProjetos} className="sidebar-btn">
            Projetos
          </button>
          <button onClick={onSwitchUsuarios} className="sidebar-btn">
            Usuários
          </button>
          <button onClick={onSwitchClientes} className="sidebar-btn">
            Clientes
          </button>
          <button onClick={onSwitchPerfil} className="sidebar-btn">
            Perfil
          </button>
          <button onClick={onSwitchConfiguracoes} className="sidebar-btn">
            Configurações
          </button>
          <button onClick={onSwitchNotificacoes} className="sidebar-btn">
            Notificação <span className="kanban-notification-dot">1</span>
          </button>
          <button onClick={onLogout} className="sidebar-btn">
            Sair
          </button>
        </nav>

        <div className="kanban-user">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: "#ececec",
                borderRadius: "50%",
                padding: 10,
                fontSize: 20,
              }}
            >
              👤
            </span>
            <div>
              <span style={{ fontWeight: 600 }}>Usuario1</span>
              <br />
              <small style={{ color: "#888" }}>Design</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="kanban-main">
        <div className="kanban-header">
          <div className="kanban-header-left">
            <h1>Flap</h1>
            <div className="kanban-header-switch">
              <button 
                className={`switch-btn ${activeView === "quadros" ? "active" : ""}`}
                onClick={() => setActiveView("quadros")}
              >
                Quadros
              </button>
              <button 
                className={`switch-btn ${activeView === "calendario" ? "active" : ""}`}
                onClick={() => setActiveView("calendario")}
              >
                Calendário
              </button>
            </div>
          </div>
          <div className="kanban-header-controls">
            <input
              type="search"
              placeholder="Pesquisar"
              className="kanban-header-search"
            />
            <button className="kanban-header-btn">Filtrar</button>
            <button
              className="kanban-header-btn add"
              onClick={() => setShowAddTask(true)}
            >
              Add Tarefa
            </button>
          </div>
        </div>

        {/* Visualização Kanban */}
        {activeView === "quadros" && (
          <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <div className="kanban-columns">
              {Object.entries(columns).map(([columnId, cards]) => (
                <Droppable key={columnId} droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      className="kanban-column"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        background: snapshot.isDraggingOver
                          ? "#f0f2ff"
                          : "transparent",
                      }}
                    >
                      <h2>{columnId}</h2>
                      {cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className="kanban-card"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                                cursor: snapshot.isDragging ? "grabbing" : "grab",
                              }}
                              onClick={() => handleCardClick(card)}
                            >
                              <div className="kanban-card-header">
                                <span className="kanban-circle" />
                                <span className="kanban-task">{card.name}</span>
                                <div className="kanban-card-menu-wrapper">
                                  <button
                                    className="kanban-card-more"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(openMenuId === card.id ? null : card.id);
                                    }}
                                  >
                                    ...
                                  </button>
                                  {openMenuId === card.id && (
                                    <div className="kanban-card-dropdown">
                                      <button
                                        className="kanban-dropdown-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditCard(card);
                                        }}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        className="kanban-dropdown-item delete"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardToDelete({ columnId, cardId: card.id });
                                        }}
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="kanban-card-client">{card.client}</div>
                              
                              <div className="kanban-card-prazo" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                                {card.tag && (
                                  <span
                                    style={{
                                      backgroundColor: getTagColor(card.tag),
                                      color: '#fff',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    {card.tag}
                                  </span>
                                )}
                                <span
                                  className={`kanban-alert ${
                                    card.alerta === "Atrasado"
                                      ? "alert-red"
                                      : "alert-green"
                                  }`}
                                >
                                  {card.alerta}
                                </span>
                              </div>
                              
                              <div className="kanban-card-date">
                                Prazo: {card.prazo}
                              </div>
                              <div className="kanban-card-bottom">
                                <div className="kanban-card-users">
                                  <span className="kanban-user-group">
                                    👥 +{card.participantes}
                                  </span>
                                </div>
                                <div className="kanban-card-views">{card.views}</div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}

        {/* Visualização Calendário */}
        {activeView === "calendario" && (
          <div className="calendario-container">
            <div className="calendario-year-navigation">
              <button className="year-nav-btn" onClick={previousYear}>‹</button>
              <h2 className="year-title">{currentYear}</h2>
              <button className="year-nav-btn" onClick={nextYear}>›</button>
            </div>

            <div className="calendario-year-grid">
              {monthNames.map((monthName, monthIndex) => {
                const days = getDaysInMonth(currentYear, monthIndex);
                
                return (
                  <div key={monthIndex} className="calendario-month-card">
                    <h3 className="month-title">{monthName} {currentYear}</h3>
                    
                    <div className="month-weekdays-header">
                      <div>D</div>
                      <div>S</div>
                      <div>T</div>
                      <div>Q</div>
                      <div>Q</div>
                      <div>S</div>
                      <div>S</div>
                    </div>

                    <div className="month-days-grid">
                      {days.map((dayObj, idx) => {
                        const tasksForDay = dayObj.isCurrentMonth && dayObj.date ? getTasksForDay(dayObj.date) : [];
                        const hasTask = tasksForDay.length > 0;
                        const isTodayDay = dayObj.isCurrentMonth && dayObj.date && isToday(dayObj.date);
                        
                        return (
                          <div
                            key={idx}
                            className={`month-day-cell ${!dayObj.isCurrentMonth ? "inactive-day" : ""} ${isTodayDay ? "today-day" : ""} ${hasTask ? "has-task-day" : ""}`}
                            onClick={() => {
                              if (dayObj.isCurrentMonth && dayObj.date) {
                                setSelectedDay(dayObj);
                              }
                            }}
                          >
                            {dayObj.day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal de tarefas do dia */}
            {selectedDay && selectedDay.date && (
              <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
                <div className="modal-content calendario-modal" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setSelectedDay(null)}>✕</button>
                  <h2>Tarefas - {selectedDay.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</h2>
                  <div className="calendario-modal-tasks">
                    {getTasksForDay(selectedDay.date).length > 0 ? (
                      getTasksForDay(selectedDay.date).map((task) => (
                        <div key={task.id} className="calendario-modal-task">
                          <div className="calendario-modal-task-header">
                            <span className="calendario-modal-task-name">{task.name}</span>
                            <span
                              style={{
                                backgroundColor: getTagColor(task.tag),
                                color: "#fff",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {task.tag}
                            </span>
                          </div>
                          <p className="calendario-modal-task-client"><strong>Cliente:</strong> {task.client}</p>
                          <p className="calendario-modal-task-column"><strong>Status:</strong> {task.column}</p>
                          <p className="calendario-modal-task-desc">{task.descricao}</p>
                        </div>
                      ))
                    ) : (
                      <p className="calendario-no-tasks">Nenhuma tarefa agendada para este dia.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Detalhes do Card */}
        {selectedCard && (
          <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setSelectedCard(null)}
              >
                ✕
              </button>
              <h2>{selectedCard.name}</h2>
              <p>
                <strong>Cliente:</strong> {selectedCard.client}
              </p>
              <p>
                <strong>Prazo:</strong> {selectedCard.prazo}
              </p>
              <p>
                <strong>Status:</strong> {selectedCard.alerta}
              </p>
              {selectedCard.tag && (
                <p>
                  <strong>Etiqueta:</strong>{" "}
                  <span
                    style={{
                      backgroundColor: getTagColor(selectedCard.tag),
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontWeight: "600",
                    }}
                  >
                    {selectedCard.tag}
                  </span>
                </p>
              )}
              <p>
                <strong>Participantes:</strong> {selectedCard.participantes}
              </p>
              <p>
                <strong>Visualizações:</strong> {selectedCard.views}
              </p>
              <p>
                <strong>Descrição:</strong> {selectedCard.descricao}
              </p>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {cardToDelete && (
          <div className="modal-overlay" onClick={() => setCardToDelete(null)}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setCardToDelete(null)}
              >
                ✕
              </button>
              <h2>Confirmar Exclusão</h2>
              <p>Tem certeza que deseja excluir esta tarefa?</p>
              <div className="delete-modal-actions">
                <button
                  className="delete-modal-cancel"
                  onClick={() => setCardToDelete(null)}
                >
                  Cancelar
                </button>
                <button
                  className="delete-modal-confirm"
                  onClick={() => handleDeleteCard(cardToDelete.columnId, cardToDelete.cardId)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Adicionar Tarefa */}
        {showAddTask && (
          <AdicionarTarefa
            onClose={handleCloseAddTask}
            onAddTask={handleAddTask}
            taskToEdit={taskToEdit}
          />
        )}
      </main>
    </div>
  );
}

export default Kanban;
