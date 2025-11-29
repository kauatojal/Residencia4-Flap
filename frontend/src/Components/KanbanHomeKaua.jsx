import React, { useState, useEffect } from "react";
import { Plus, Filter, Briefcase, Calendar, MoreHorizontal, User } from "lucide-react";
import "./KanbanHome.css";
import KanbanFilter from "./KanbanFilter";
import TaskDetailsModal from "./TaskDetailsModal";
import CalendarioAnual from "./CalendarioAnual";
import CreateTaskModal from "./CreateTaskModal"; // Certifique-se de ter criado este arquivo

export default function KanbanHome() {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' ou 'calendar'
  const [tasks, setTasks] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false); // Estado para o modal de criar tarefa
  const [filters, setFilters] = useState({ member: null, company: null });
  const [detailTask, setDetailTask] = useState(null);

  // Helper para headers
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
  };

  // 1. Carregar tarefas da API
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8090/v1/tarefa/all', {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error("Erro ao buscar tarefas:", response.status);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Callback quando uma nova tarefa é criada (adiciona na lista sem reload)
  const handleTaskCreated = (newTask) => {
    setTasks(prev => [...prev, newTask]);
  };

  // 2. Lógica de Filtro (Frontend)
  const filteredTasks = tasks.filter(task => {
    // Filtro por Membro
    const hasMember = filters.member 
      ? task.usuarios?.some(u => u.id === filters.member) 
      : true;
    
    // Filtro por Empresa/Cliente
    const hasCompany = filters.company 
      ? (task.cliente?.nome === filters.company) 
      : true;

    return hasMember && hasCompany;
  });

  // 3. Atualizar Tarefa (PUT)
  const handleUpdateTask = async (updatedTask) => {
    try {
      const response = await fetch('http://localhost:8090/v1/tarefa', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedTask)
      });

      if (response.ok) {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        
        if (detailTask && detailTask.id === updatedTask.id) {
            setDetailTask(updatedTask);
        }
      } else {
        alert("Não foi possível atualizar a tarefa.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  // 4. Agrupamento por Status
  const getTasksByStatus = (statusKey) => {
    return filteredTasks.filter(t => {
      const s = (t.status || "").toUpperCase(); 
      if (statusKey === 'todo') return s === 'A_FAZER' || s === 'TODO' || s === 'PENDENTE';
      if (statusKey === 'doing') return s === 'FAZENDO' || s === 'DOING' || s === 'EM_ANDAMENTO';
      if (statusKey === 'done') return s === 'FEITO' || s === 'DONE' || s === 'CONCLUIDO';
      return false;
    });
  };

  return (
    <div className="kanban-home-container">
      {/* BARRA DE CONTROLE */}
      <div className="kanban-controls">
         <div className="tab-switcher">
            <button 
              onClick={() => setActiveTab('kanban')} 
              className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
            >
              Quadros
            </button>
            <button 
              onClick={() => setActiveTab('calendar')} 
              className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            >
              Calendário
            </button>
         </div>

         {activeTab === 'kanban' && (
            <div className="action-buttons">
               <button onClick={() => setFilterOpen(true)} className="btn-filter">
                 <Filter size={16} /> 
                 <span>{filters.member || filters.company ? 'Filtrado' : 'Filtrar'}</span>
               </button>
               
               {/* BOTÃO PARA ABRIR MODAL DE CRIAÇÃO */}
               <button onClick={() => setCreateOpen(true)} className="btn-new-board">
                 <Plus size={18} /> <span>Novo board</span>
               </button>
            </div>
         )}
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="kanban-board-area">
        {activeTab === 'kanban' ? (
          <div className="kanban-columns-container">
            <KanbanColumn 
              title="A Fazer" 
              tasks={getTasksByStatus('todo')} 
              onTaskClick={setDetailTask} 
              headerColor="#4a67ff" 
            />
            <KanbanColumn 
              title="Fazendo" 
              tasks={getTasksByStatus('doing')} 
              onTaskClick={setDetailTask} 
              headerColor="#f59e0b" 
            />
             <KanbanColumn 
              title="Feito" 
              tasks={getTasksByStatus('done')} 
              onTaskClick={setDetailTask} 
              headerColor="#10b981" 
            />
          </div>
        ) : (
          <div className="calendar-wrapper">
             <CalendarioAnual tasks={tasks} />
          </div>
        )}
      </div>

      {/* MODALS */}
      <KanbanFilter 
        isOpen={filterOpen} 
        onClose={() => setFilterOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
      />
      
      <TaskDetailsModal 
        isOpen={!!detailTask} 
        task={detailTask} 
        onClose={() => setDetailTask(null)} 
        onUpdate={handleUpdateTask} 
      />

      <CreateTaskModal 
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}

// Componente Interno de Coluna
function KanbanColumn({ title, tasks, onTaskClick, headerColor }) {
  return (
    <div className="kanban-column">
       <div className="column-header">
          <span className="header-indicator" style={{ backgroundColor: headerColor }}></span>
          <h2>{title}</h2>
          <span className="task-count">{tasks.length}</span>
       </div>
       
       <div className="tasks-list">
          {tasks.map(task => (
             <div key={task.id} onClick={() => onTaskClick(task)} className="kanban-card">
                <div className="card-header">
                   <h4>{task.titulo}</h4>
                   <button className="more-btn" onClick={(e) => e.stopPropagation()}><MoreHorizontal size={16}/></button>
                </div>

                <div className="card-company">
                   <Briefcase size={12}/> {task.cliente?.nome || "Sem cliente"}
                </div>
  
                {task.flags && task.flags.length > 0 && (
                   <div className="card-tags">
                      {task.flags.map((flag, idx) => (
                         <span key={idx} className="tag green">
                           {flag.nome || flag}
                         </span>
                      ))}
                   </div>
                )}

                <div className="card-footer">
                   {task.usuarios && task.usuarios.length > 0 ? (
                      <div className="card-participants">
                         <User size={10} /> {task.usuarios.length} Partic.
                      </div>
                   ) : <div />}

                   <div className="card-date">
                      <Calendar size={12} />
                      <span>
                        {task.prazo 
                          ? new Date(task.prazo).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}) 
                          : "S/ Prazo"}
                      </span>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  )
}