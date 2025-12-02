import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import './UpcomingTasksCard.css';

const UpcomingTasksCard = () => {
  const [tarefas, setTarefas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    const data = await dashboardService.getTarefasProximasVencimento();
    setTarefas(data);
  };

  const formatarData = (data) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDiasRestantes = (dataVencimento) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diff = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { texto: 'Atrasada', classe: 'atrasada' };
    if (diff === 0) return { texto: 'Hoje', classe: 'hoje' };
    if (diff === 1) return { texto: 'Amanhã', classe: 'amanha' };
    return { texto: `${diff} dias`, classe: 'normal' };
  };

  const getPriorityColor = (prioridade) => {
    const colors = {
      CRITICA: '#dc3545',
      ALTA: '#fd7e14',
      MEDIA: '#ffc107',
      BAIXA: '#28a745'
    };
    return colors[prioridade?.toUpperCase()] || '#6c757d';
  };

  const handleTarefaClick = (tarefa) => {
    navigate('/kanban', { state: { tarefaId: tarefa.id } });
  };

  if (tarefas.length === 0) {
    return (
      <div className="upcoming-tasks-card">
        <h3>⏰ Próximas Tarefas</h3>
        <p className="no-tasks">Nenhuma tarefa próxima do vencimento</p>
      </div>
    );
  }

  return (
    <div className="upcoming-tasks-card">
      <h3>⏰ Próximas Tarefas</h3>
      <div className="tasks-list">
        {tarefas.map(tarefa => {
          const diasRestantes = getDiasRestantes(tarefa.dataVencimento);
          return (
            <div
              key={tarefa.id}
              className="task-item"
              onClick={() => handleTarefaClick(tarefa)}
            >
              <div className="task-header">
                <span className="task-title">{tarefa.titulo || 'Sem título'}</span>
                <span
                  className="task-priority"
                  style={{
                    backgroundColor: getPriorityColor(tarefa.flag?.nome),
                    color: 'white'
                  }}
                >
                  {tarefa.flag?.nome || 'SEM PRIORIDADE'}
                </span>
              </div>
              <div className="task-footer">
                <span className="task-date">📅 {formatarData(tarefa.dataVencimento)}</span>
                <span className={`task-days ${diasRestantes.classe}`}>
                  {diasRestantes.texto}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingTasksCard;
