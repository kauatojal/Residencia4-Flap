import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdicionarTarefa from "./AdicionarTarefa";
import TaskDetailsModal from "./TaskDetailsModal";
import "./KanbanBoard.css";
import CalendarioAnual from "./CalendarioAnual";
import kanbanService from "../services/kanbanService";
import { useParams } from "react-router-dom";

export default function KanbanBoard() {
  const [columns, setColumns] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [currentListId, setCurrentListId] = useState(null)
  const [activeView, setActiveView] = useState("quadros");
  const [loading, setLoading] = useState(true);
  const [listasMap, setListasMap] = useState({}); // map listaNome → listaId

  const { id } = useParams()

  useEffect(() => {
    let intervalId;

    async function loadData() {
      try {
        const quadros = await kanbanService.listQuadros();
        if (!quadros.length) return;

        const quadroId = id

        const listas = await kanbanService.listListasByQuadroId(quadroId)

        // 🟢 salva o map nome → id pra poder mover tarefas depois
        const map = {};
        listas.forEach((l) => (map[l.nome] = l.id));
        setListasMap(map);

        const listasComTarefas = await Promise.all(
          listas.map(async (lista) => ({
            ...lista,
            tarefas: await kanbanService.listTarefasByListaId(lista.id),
          }))
        );

        const grouped = listasComTarefas.reduce((acc, lista) => {
          acc[lista.nome] = lista.tarefas;
          return acc;
        }, {});

        setColumns(grouped);
      } catch (error) {
        console.error("Erro ao carregar Kanban:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    intervalId = setInterval(loadData, 20000);
    return () => clearInterval(intervalId);
  }, []);



  // 🔹 arrastar tarefa entre colunas
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index))
      return;

    const sourceCol = Array.from(columns[source.droppableId] || []);
    const [movedCard] = sourceCol.splice(source.index, 1);
    const destCol = Array.from(columns[destination.droppableId] || []);
    destCol.splice(destination.index, 0, movedCard);

    const updated = {
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    };
    setColumns(updated);

    try {
      const novaListaId = listasMap[destination.droppableId];
      await kanbanService.moveTarefa(movedCard.id, novaListaId, id);

    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
    }
  };

  // 🔹 criar ou atualizar tarefa
  const handleSaveTask = async (taskData) => {
    try {
      if (taskToEdit) {
        const result = await kanbanService.update(taskToEdit.id, { ...taskToEdit, ...taskData });
        setColumns((prev) => {
          const newCols = { ...prev };
          for (const col in newCols) {
            const idx = newCols[col].findIndex((t) => t.id === result.id);
            if (idx > -1) {
              newCols[col][idx] = result;
              break;
            }
          }
          return newCols;
        });
      } else {
        // adiciona nova tarefa na primeira lista ("A Fazer" por padrão)
        const listaDefault = Object.keys(columns)[0];
        const listaId = listasMap[listaDefault];
        const newTask = await kanbanService.createTarefa({ ...taskData, listaId }); //TODO : revisar
        setColumns((prev) => ({
          ...prev,
          [listaDefault]: [newTask, ...(prev[listaDefault] || [])],
        }));
      }
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    } finally {
      setShowAddTask(false);
      setTaskToEdit(null);
    }
  };

  // 🔹 excluir tarefa
  const handleDeleteTask = async (colId, taskId) => {
    try {
      await kanbanService.deleteTarefa(taskId);
      setColumns((prev) => ({
        ...prev,
        [colId]: prev[colId].filter((task) => task.id !== taskId),
      }));
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };

  // 🔹 atualizar pelo modal
  const handleUpdateTaskFromModal = async (updatedTask) => {
    try {
      const result = await kanbanService.updateTarefa(updatedTask.id, updatedTask);
      setColumns((prev) => {
        const newCols = { ...prev };
        for (const col in newCols) {
          const index = newCols[col].findIndex((t) => t.id === result.id);
          if (index > -1) {
            newCols[col][index] = result;
            break;
          }
        }
        return newCols;
      });
      setSelectedCard(result);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  if (loading) return <div className="loading">Carregando Kanban...</div>;

  // 🔹 renderizar quadros
  const renderKanbanView = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-columns">
        {Object.entries(columns).map(([columnId, cards]) => (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided) => (
              <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                <div className="column-header">
                  <h2>{columnId} ({cards.length})</h2>
                </div>
                {cards.map((card, index) => (
                  <Draggable key={String(card.id)} draggableId={String(card.id)} index={index}>
                    {(provided) => (
                      <div
                        className="kanban-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setSelectedCard(card)}
                      >
                        <div className="kanban-card-header">
                          <span className="kanban-task">{card.nome || card.name}</span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskToEdit(card);
                                setShowAddTask(true);
                              }}
                            >
                              ✎
                            </button>
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(columnId, card.id);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p>{card.descricao || "Sem descrição"}</p>
                        <small>Prazo: {card.prazo || "—"}</small>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <button className="btn-adicionar-cartao" onClick={() => {
                  setCurrentListId(listasMap[columnId]);
                  setTaskToEdit(null);
                  setShowAddTask(true);
                }}>
                  + Adicionar
                </button>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );

  return (
    <>
      <div className="kanban-header">
        <div className="kanban-header-left">
          <div className="kanban-header-switch">
            <button className={`switch-btn ${activeView === "quadros" ? "active" : ""}`} onClick={() => setActiveView("quadros")}>
              Quadros
            </button>
            <button className={`switch-btn ${activeView === "calendario" ? "active" : ""}`} onClick={() => setActiveView("calendario")}>
              Calendário
            </button>
          </div>
        </div>
      </div>

      <div style={{ flexGrow: 1 }}>
        {activeView === "quadros"
          ? renderKanbanView()
          : <CalendarioAnual tasks={Object.values(columns).flat()} />}
      </div>

      <TaskDetailsModal
        task={selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdateTask={handleUpdateTaskFromModal}
      />

      {showAddTask && (
        <AdicionarTarefa
          onClose={() => { setShowAddTask(false); setTaskToEdit(null); }}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
          currentListId={currentListId}
        />
      )}
    </>
  );
}
