import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Briefcase, Clock } from 'lucide-react';
import './CalendarioAnual.css';


// Subcomponente de Mês
const Month = ({ year, month, tasksByDate, onDayClick }) => {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    const days = useMemo(() => {
        const date = new Date(year, month, 1);
        const daysArray = [];
        const firstDayOfWeek = date.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Dias do mês anterior
        for (let i = firstDayOfWeek; i > 0; i--) {
            daysArray.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
        }
        // Dias do mês atual
        for (let i = 1; i <= daysInMonth; i++) {
            daysArray.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        // Dias do próximo mês
        const remaining = 42 - daysArray.length;
        for (let i = 1; i <= remaining; i++) {
            daysArray.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return daysArray;
    }, [year, month]);

    const today = new Date();
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
    // Função auxiliar para gerar a chave de data (YYYY-MM-DD)
    const formatDateKey = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="month-card">
            <h3 className="month-title">{monthNames[month]}</h3>
            <div className="weekdays-header">
                {weekdays.map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="days-grid">
                {days.map(({ date, isCurrentMonth }, index) => {
                    const dateString = formatDateKey(date);
                    const hasTasks = tasksByDate[dateString] && tasksByDate[dateString].length > 0;
                    
                    return (
                        <button 
                            key={index} 
                            disabled={!isCurrentMonth}
                            onClick={() => isCurrentMonth && onDayClick(date)}
                            className={`day-cell 
                                ${!isCurrentMonth ? 'inactive' : ''}
                                ${isSameDay(date, today) ? 'today' : ''}
                                ${hasTasks ? 'has-tasks' : ''}
                            `}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default function CalendarioAnual({ tasks }) {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState(null);

    // Agrupa tarefas por data para performance
    const tasksByDate = useMemo(() => {
        const groupedTasks = {};
        tasks.forEach(task => {
            const dateToUse = task.prazo || task.dueDate;
            if (!dateToUse) return; 
            
            let dateString = dateToUse;
            // Se a data vier no formato DD/MM/YYYY, converte para YYYY-MM-DD
            if (dateToUse.includes('/')) {
                const [day, month, year] = dateToUse.split('/');
                dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            if (!groupedTasks[dateString]) {
                groupedTasks[dateString] = [];
            }
            groupedTasks[dateString].push(task);
        });
        return groupedTasks;
    }, [tasks]);

    // Busca as tarefas do dia selecionado
    const getSelectedDayTasks = () => {
        if (!selectedDay) return [];
        const key = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.getDate()).padStart(2, '0')}`;
        return tasksByDate[key] || [];
    };

    const tasksForSelectedDay = getSelectedDayTasks();

    return (
        <div className="calendario-container">
            <div className="year-navigation">
                <button onClick={() => setCurrentYear(y => y - 1)} className="year-nav-btn">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="year-title">{currentYear}</h2>
                <button onClick={() => setCurrentYear(y => y + 1)} className="year-nav-btn">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="year-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Month 
                        key={i} 
                        year={currentYear} 
                        month={i} 
                        tasksByDate={tasksByDate} 
                        onDayClick={setSelectedDay} 
                    />
                ))}
            </div>

            {selectedDay && (
                <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
                    <div className="modal-content task-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="task-modal-header">
                            <div>
                                <h3 className="modal-day-number">{selectedDay.getDate()}</h3>
                                <p className="modal-day-text">
                                    {selectedDay.toLocaleDateString('pt-BR', { month: 'long', weekday: 'long' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDay(null)} className="modal-close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="task-list">
                            {tasksForSelectedDay.length > 0 ? (
                                <>
                                    {tasksForSelectedDay.map(task => (
                                        <div key={task.id} className="task-item">
                                            <div className="task-item-header">
                                                <h4>{task.titulo || task.title}</h4>
                                                {(task.prioridade || task.priority) && 
                                                  <span className="task-priority">
                                                    {task.prioridade || task.priority}
                                                  </span>
                                                }
                                            </div>
                                            <div className="task-item-footer">
                                                <div className="task-company">
                                                    <Briefcase size={12} />
                                                    <span>{task.cliente?.nome || task.cliente || "Cliente"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="no-tasks">
                                    <Clock size={32} />
                                    <p>Nenhuma tarefa para este dia.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}