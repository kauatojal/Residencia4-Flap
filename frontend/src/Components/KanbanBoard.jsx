import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Filter } from "lucide-react";
import kanbanService from "../services/kanbanService";
import KanbanFilter from "./KanbanFilter";
import CalendarioAnual from "./CalendarioAnual";
import AdicionarTarefa from "./AdicionarTarefa";
import "./KanbanBoard.css";


export default function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] = useState("quadros");

  // ✅ NOVO: Filtros avançados
  const [filters, setFilters] = useState({
    member: null,
    company: null,
    flags: []
  });
  const [filterText, setFilterText] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultColumnForTask, setDefaultColumnForTask] = useState(null);

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState(null);
  const [columnTitle, setColumnTitle] = useState("");

  useEffect(() => {
    loadBoard();
  }, []);

  async function loadBoard() {
    try {
      const quadros = await kanbanService.listQuadros();
      if (!quadros.length) return;

      const quadro = quadros[0];
      const listas = await kanbanService.listListasByQuadroId(quadro.id);

      const listasComTarefas = await Promise.all(
        listas.map(async (lista) => {
          const tarefas = await kanbanService.listTarefasByListaId(lista.id);
          return {
            ...lista,
            tarefas: tarefas || []
          };
        })
      );

      setColumns(listasComTarefas);
    } catch (e) {
      console.error("Erro ao carregar kanban:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTask(taskData) {
    try {
      if (taskToEdit) {
        const updated = await kanbanService.updateTarefa({
          id: taskToEdit.id,
          ...taskData
        });

        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            tarefas: col.tarefas.map((t) =>
              t.id === updated.id ? updated : t
            ),
          }))
        );
      } else {
        const newTask = await kanbanService.createTarefa({
          ...taskData,
          listaId: defaultColumnForTask,
        });

        setColumns((prev) =>
          prev.map((col) =>
            col.id === defaultColumnForTask
              ? { ...col, tarefas: [...col.tarefas, newTask] }
              : col
          )
        );
      }
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
    } finally {
      setShowTaskModal(false);
      setTaskToEdit(null);
    }
  }

  function openCreateTaskModal(listaId) {
    setDefaultColumnForTask(listaId);
    setTaskToEdit(null);
    setShowTaskModal(true);
  }

  async function handleSaveColumn() {
    try {
      if (columnToEdit) {
        const updated = await kanbanService.updateLista({
          id: columnToEdit.id,
          titulo: columnTitle,
          quadroId: columnToEdit.quadroId
        });

        setColumns((prev) =>
          prev.map((c) =>
            c.id === updated.id ? { ...c, titulo: updated.titulo } : c
          )
        );
      } else {
        const quadros = await kanbanService.listQuadros();
        const quadro = quadros[0];

        const nova = await kanbanService.createLista({
          titulo: columnTitle,
          descricao: "",
          quadroId: quadro.id,
        });

        setColumns((prev) => [...prev, { ...nova, tarefas: [] }]);
      }
    } catch (err) {
      console.log("Erro coluna:", err);
    } finally {
      setShowColumnModal(false);
      setColumnToEdit(null);
      setColumnTitle("");
    }
  }

  function openEditColumnModal(col) {
    setColumnToEdit(col);
    setColumnTitle(col.titulo);
    setShowColumnModal(true);
  }

  function openCreateColumnModal() {
    setColumnToEdit(null);
    setColumnTitle("");
    setShowColumnModal(true);
  }

  async function onDragEnd(result) {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === "column") {
      const newOrder = Array.from(columns);
      const [moved] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, moved);
      setColumns(newOrder);
      return;
    }

    const sourceCol = columns.find((c) => c.id === Number(source.droppableId));
    const destCol = columns.find((c) => c.id === Number(destination.droppableId));

    if (!sourceCol || !destCol) return;

    const sourceTasks = Array.from(sourceCol.tarefas);
    const [task] = sourceTasks.splice(source.index, 1);

    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : Array.from(destCol.tarefas);
    
    destTasks.splice(destination.index, 0, task);

    const updated = columns.map((col) => {
      if (col.id === sourceCol.id) return { ...col, tarefas: source.droppableId === destination.droppableId ? destTasks : sourceTasks };
      if (col.id === destCol.id && source.droppableId !== destination.droppableId) return { ...col, tarefas: destTasks };
      return col;
    });

    setColumns(updated);

    try {
      if (source.droppableId !== destination.droppableId) {
        const quadros = await kanbanService.listQuadros();
        const quadro = quadros[0];
        await kanbanService.moveTarefa(task.id, destCol.id, quadro.id);
      }
    } catch (e) {
      console.error("Erro ao mover tarefa:", e);
      loadBoard(); // Recarrega em caso de erro
    }
  }

  // ✅ NOVO: Função de filtragem avançada
  function applyFilter(tasks) {
    let filtered = tasks;

    // Filtro por texto
    if (filterText.trim()) {
      filtered = filtered.filter((t) =>
        (t.titulo || t.nome || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (t.descricao || "").toLowerCase().includes(filterText.toLowerCase())
      );
    }

    // Filtro por membro
    if (filters.member) {
      filtered = filtered.filter((t) => 
        t.usuarios?.some(u => u.id === filters.member) ||
        t.usuarioId === filters.member
      );
    }

    // Filtro por empresa/cliente
    if (filters.company) {
      filtered = filtered.filter((t) => 
        t.cliente?.id === filters.company ||
        t.clienteId === filters.company
      );
    }

    // Filtro por flags
    if (filters.flags && filters.flags.length > 0) {
      filtered = filtered.filter((t) => {
        const tarefaFlags = t.flags || t.flagTarefas || [];
        return tarefaFlags.some(flag => 
          filters.flags.includes(flag.id)
        );
      });
    }

    return filtered;
  }

  // ✅ NOVO: Contador de filtros ativos
  const activeFiltersCount = () => {
    let count = 0;
    if (filters.member) count++;
    if (filters.company) count++;
    if (filters.flags && filters.flags.length > 0) count += filters.flags.length;
    if (filterText.trim()) count++;
    return count;
  };

  if (loading) return <div className="loading">Carregando Kanban...</div>;

  return (
    <div className={`kanban-page ${activeView === "calendario" ? "calendar-view" : ""}`}>

      {/* HEADER */}
      <div className="kanban-header">
        <div className="header-left">
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

        <div className="header-right">
          {/* ✅ NOVO: Botão de filtro com contador */}
          <button 
            className={`filter-btn ${activeFiltersCount() > 0 ? 'active' : ''}`}
            onClick={() => setShowFilter(true)}
          >
            <Filter size={18} />
            Filtros
            {activeFiltersCount() > 0 && (
              <span className="filter-badge">{activeFiltersCount()}</span>
            )}
          </button>

          <button
            className="add-btn"
            onClick={() => {
              setDefaultColumnForTask(columns[0]?.id || null);
              setTaskToEdit(null);
              setShowTaskModal(true);
            }}
          >
            + Adicionar Tarefa
          </button>

          <button className="add-btn" onClick={openCreateColumnModal}>
            + Nova Coluna
          </button>
        </div>
      </div>

      {/* ✅ NOVO: Busca rápida */}
      <div className="quick-search">
        <input
          type="text"
          placeholder="Buscar tarefas..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="search-input-board"
        />
      </div>

      {/* QUADROS OU CALENDÁRIO */}
      <div className="kanban-wrapper">
        {activeView === "calendario" ? (
          <CalendarioAnual tasks={columns.flatMap((c) => applyFilter(c.tarefas))} />
        ) : (
          <div className="trello-container">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="all-columns" direction="horizontal" type="column">
                {(provided) => (
                  <div
                    className="columns-wrapper"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {columns.map((col, index) => {
                      const filteredTasks = applyFilter(col.tarefas);
                      
                      return (
                        <Draggable
                          key={String(col.id)}
                          draggableId={String(col.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="column"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <div className="column-header" {...provided.dragHandleProps}>
                                <h2>{col.titulo}</h2>

                                <div className="column-actions">
                                  <button onClick={() => openEditColumnModal(col)}>✎</button>
                                </div>

                                <span className="task-count">
                                  {filteredTasks.length}
                                  {filteredTasks.length !== col.tarefas.length && (
                                    <span className="task-count-total">/{col.tarefas.length}</span>
                                  )}
                                </span>
                              </div>

                              <Droppable droppableId={String(col.id)} type="task">
                                {(provided) => (
                                  <div
                                    className="tasks-list"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {filteredTasks.map((tarefa, idx) => (
                                      <Draggable
                                        key={String(tarefa.id)}
                                        draggableId={String(tarefa.id)}
                                        index={idx}
                                      >
                                        {(provided) => (
                                          <div
                                            className="kanban-card"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() => {
                                              setTaskToEdit(tarefa);
                                              setShowTaskModal(true);
                                            }}
                                          >
                                            <h4>{tarefa.titulo || tarefa.nome}</h4>
                                            <p>{tarefa.descricao || "Sem descrição"}</p>
                                            
                                            {/* ✅ NOVO: Exibir flags no card */}
                                            {(tarefa.flags || tarefa.flagTarefas) && (
                                              <div className="card-flags">
                                                {(tarefa.flags || tarefa.flagTarefas).map(flag => (
                                                  <span 
                                                    key={flag.id} 
                                                    className="card-flag"
                                                    style={{ backgroundColor: flag.cor }}
                                                  >
                                                    {flag.nome}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}

                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>

                              <button
                                className="btn-add-card"
                                onClick={() => openCreateTaskModal(col.id)}
                              >
                                + Adicionar Cartão
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>

      {/* ✅ NOVO: Modal de filtros */}
      <KanbanFilter 
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {showTaskModal && (
        <AdicionarTarefa
          onClose={() => {
            setShowTaskModal(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
        />
      )}

      {showColumnModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>{columnToEdit ? "Editar coluna" : "Nova coluna"}</h3>

            <input
              type="text"
              placeholder="Título..."
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={handleSaveColumn}>Salvar</button>
              <button
                className="cancel"
                onClick={() => setShowColumnModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
