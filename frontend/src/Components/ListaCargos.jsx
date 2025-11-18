import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdicionarTarefa from "./AdicionarTarefa";
import TaskDetailsModal from "./TaskDetailsModal";
import "./KanbanBoard.css";
import taskService from "../services/taskService";

export default function KanbanBoard() {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Carregar todas as tarefas da API e organizar em colunas por status
  const carregarTarefas = async () => {
    setLoading(true);
    setErro("");
    try {
      const tasks = await taskService.list();
      // Agrupa tarefas por status (coluna)
      const agrupadas = tasks.reduce((acc, task) => {
        const status = task.status || "Sem Status";
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
      }, {});
      setColumns(agrupadas);
    } catch {
      setErro("Erro ao carregar tarefas.");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  // Movimento no Kanban
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const startCol = Array.from(columns[source.droppableId]);
    const [movedTask] = startCol.splice(source.index, 1);

    // Muda status na API e recarrega
    try {
      await taskService.moveToList(movedTask.id, destination.droppableId);
      await carregarTarefas();
    } catch {
      setErro("Erro ao mover tarefa.");
    }
  };

  // Adição e edição de tarefas
  const handleAddOrEditTask = async (taskData) => {
    try {
      if (taskToEdit) {
        await taskService.update(taskToEdit.id, taskData);
      } else {
        await taskService.create(taskData);
      }
      setShowAddTask(false);
      setTaskToEdit(null);
      await carregarTarefas();
    } catch {
      setErro("Erro ao salvar tarefa.");
    }
  };

  // Exclusão de tarefa
  const handleDeleteCard = async (cardId) => {
    try {
      await taskService.remove(cardId);
      await carregarTarefas();
    } catch {
      setErro("Erro ao excluir tarefa.");
    }
  };

  if (loading) return <div>Carregando tarefas...</div>;
  if (erro) return <div>{erro}</div>;

  const columnsArray = Object.entries(columns);

  return (
    <>
      <div className="kanban-header">
        <h2>Kanban Board</h2>
        <button onClick={() => setShowAddTask(true)}>+ Adicionar Tarefa</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {columnsArray.map(([colName, cards]) => (
            <Droppable droppableId={colName} key={colName}>
              {(provided) => (
                <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                  <h2>{colName} ({cards.length})</h2>
                  {cards.map((card, cardIndex) => (
                    <Draggable key={card.id} draggableId={card.id + ""} index={cardIndex}>
                      {(provided) => (
                        <div
                          className="kanban-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedCard({ ...card, column: colName })}
                        >
                          <div className="kanban-card-header">
                            <span>{card.name}</span>
                          </div>
                          <div className="kanban-card-footer">
                            <button onClick={(e) => { e.stopPropagation(); setTaskToEdit(card); setShowAddTask(true); }}>Editar</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}>Excluir</button>
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
      {showAddTask && (
        <AdicionarTarefa
          onClose={() => setShowAddTask(false)}
          onAddTask={handleAddOrEditTask}
          taskToEdit={taskToEdit}
        />
      )}
      {selectedCard && (
        <TaskDetailsModal
          task={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdateTask={handleAddOrEditTask}
        />
      )}
    </>
  );
}
