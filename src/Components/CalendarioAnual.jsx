import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import './CalendarioAnual.css';

export default function CalendarioAnual({ tasks = [] }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const getTasksForDate = (day, month) => {
    const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    return tasks.filter(task => task.prazo === dateStr);
  };

  const isToday = (day, month) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const handleDayClick = (day, month) => {
    const tasksForDay = getTasksForDate(day, month);
    if (tasksForDay.length > 0) {
      setSelectedDay({ day, month, tasks: tasksForDay });
      setShowModal(true);
    }
  };

  const renderMonth = (monthIndex) => {
    const daysInMonth = getDaysInMonth(monthIndex, year);
    const firstDay = getFirstDayOfMonth(monthIndex, year);
    const days = [];

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <button key={`empty-${i}`} className="day-cell inactive" disabled></button>
      );
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const tasksForDay = getTasksForDate(day, monthIndex);
      const hasTasks = tasksForDay.length > 0;
      const today = isToday(day, monthIndex);

      days.push(
        <button
          key={day}
          className={`day-cell ${hasTasks ? 'has-tasks' : ''} ${today ? 'today' : ''}`}
          onClick={() => hasTasks && handleDayClick(day, monthIndex)}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="calendario-container">
      <div className="year-navigation">
        <button className="year-nav-btn" onClick={() => setYear(year - 1)}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="year-title">{year}</h2>
        <button className="year-nav-btn" onClick={() => setYear(year + 1)}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="year-grid">
        {monthNames.map((monthName, monthIndex) => (
          <div key={monthIndex} className="month-card">
            <h3 className="month-title">{monthName}</h3>
            <div className="weekdays-header">
              {weekDays.map((day, idx) => (
                <div key={idx}>{day}</div>
              ))}
            </div>
            <div className="days-grid">{renderMonth(monthIndex)}</div>
          </div>
        ))}
      </div>

      {showModal && selectedDay && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <div>
                <h2 className="modal-day-number">{selectedDay.day}</h2>
                <p className="modal-day-text">
                  {monthNames[selectedDay.month]} {year}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="task-list">
              {selectedDay.tasks.length === 0 ? (
                <div className="no-tasks">
                  <p>Nenhuma tarefa para este dia</p>
                </div>
              ) : (
                selectedDay.tasks.map((task, idx) => (
                  <div key={idx} className="task-item">
                    <div className="task-item-header">
                      <h4>{task.titulo}</h4>
                      {task.prioridade && (
                        <span className="task-priority">{task.prioridade}</span>
                      )}
                    </div>
                    <div className="task-item-footer">
                      <div className="task-company">
                        <Briefcase size={14} />
                        <span>{task.cliente?.nome || 'Sem cliente'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
