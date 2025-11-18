import React, { useState, useMemo } from 'react';
import './CalendarioAnual.css';

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
    
    return (
        <div className="month-card">
            <h3 className="month-title">{monthNames[month]} {year}</h3>
            <div className="weekdays-header">{weekdays.map(d => <div key={d}>{d}</div>)}</div>
            <div className="days-grid">
                {days.map(({ date, isCurrentMonth }, index) => {
                    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const hasTasks = tasksByDate[dateString];
                    
                    return (
                        <button 
                            key={index} 
                            className={`day-cell ${isCurrentMonth ? '' : 'inactive'} ${isSameDay(date, today) ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`}
                            onClick={() => isCurrentMonth && onDayClick(date)}
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

    const tasksByDate = useMemo(() => {
        const groupedTasks = {};
        tasks.forEach(task => {
            if (task.prazo && task.prazo.includes('/')) {
                const [day, month, year] = task.prazo.split('/');
                const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                if (!groupedTasks[dateString]) {
                    groupedTasks[dateString] = [];
                }
                groupedTasks[dateString].push(task);
            }
        });
        return groupedTasks;
    }, [tasks]);

    const tasksForSelectedDay = selectedDay ? tasksByDate[`${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.getDate()).padStart(2, '0')}`] || [] : [];

    return (
        <div className="calendario-container">
            <div className="year-navigation">
                <button className="year-nav-btn" onClick={() => setCurrentYear(y => y - 1)}>‹</button>
                <h2 className="year-title">{currentYear}</h2>
                <button className="year-nav-btn" onClick={() => setCurrentYear(y => y + 1)}>›</button>
            </div>
            <div className="year-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Month key={i} year={currentYear} month={i} tasksByDate={tasksByDate} onDayClick={setSelectedDay} />
                ))}
            </div>

            {selectedDay && (
                <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
                    <div className="modal-content task-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="task-modal-header">
                            <h3>Tarefas de {selectedDay.toLocaleDateString('pt-BR')}</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedDay(null)}>✕</button>
                        </div>
                        {tasksForSelectedDay.length > 0 ? (
                             <div className="task-list">
                                {tasksForSelectedDay.map(task => (
                                    <div key={task.id} className="task-item">
                                        <div className="task-item-header">
                                            <span>{task.name}</span>
                                            <span>{task.tag}</span>
                                        </div>
                                        <p className="task-item-body">{task.descricao}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Nenhuma tarefa para este dia.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}