import React, { useState, useEffect, useRef } from 'react';
import './AdicionarTarefa.css';

const allFuncionarios = [
  { id: 1, nome: 'Eddie Lobanovskiy', email: 'laboanovskiy@gmail.com', inicial: 'EL' },
  { id: 2, nome: 'Alexey Stave', email: 'alexey_st@gmail.com', inicial: 'AS' },
  { id: 3, nome: 'Anton Tkacheve', email: 'tkachevant@gmail.com', inicial: 'AT' },
];

const Calendar = ({ selectedDate, onDateSelect, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let days = [];
        for (let i = firstDay.getDay(); i > 0; i--) {
            days.push({ day: new Date(year, month, 1 - i), isCurrentMonth: false });
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ day: new Date(year, month, i), isCurrentMonth: true });
        }
        const grid_size = 42;
        const next_month_days = grid_size - days.length;
        for (let i = 1; i <= next_month_days; i++) {
            days.push({ day: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return days;
    };
    
    const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const isSameDay = (d1, d2) => d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button type="button" onClick={handlePrevMonth} className="calendar-nav-btn">‹</button>
                <span className="calendar-month-year">{`${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}</span>
                <button type="button" onClick={handleNextMonth} className="calendar-nav-btn">›</button>
            </div>
            <div className="calendar-grid labels">
                {daysOfWeek.map((day, i) => <div key={i} className="calendar-day-label">{day}</div>)}
            </div>
            <div className="calendar-grid">
                {getDaysInMonth(currentMonth).map(({ day, isCurrentMonth }, index) => (
                    <button 
                        key={index} 
                        type="button"
                        className={`calendar-day ${isCurrentMonth ? '' : 'inactive'} ${isSameDay(day, selectedDate) ? 'active' : ''}`}
                        onClick={() => { if(isCurrentMonth) { onDateSelect(day); onClose(); } }}
                    >
                        {day.getDate()}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function AdicionarTarefa({ onClose, onAddTask, taskToEdit }) {
  const [form, setForm] = useState({
    client: '', name: '', descricao: '', sector: 'Design', tag: 'Normal',
  });
  const [membros, setMembros] = useState([]);
  const [showMembrosPopup, setShowMembrosPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const sidebarRef = useRef(null);
  
  useEffect(() => {
    if (taskToEdit) {
      setForm({
        client: taskToEdit.client || '', name: taskToEdit.name || '',
        descricao: taskToEdit.descricao || '', sector: taskToEdit.sector || 'Design',
        tag: taskToEdit.tag || 'Normal',
      });
      if (taskToEdit.membros) {
        setMembros(taskToEdit.membros);
      }
      if (taskToEdit.prazo && taskToEdit.prazo.includes('/')) {
        const [day, month, year] = taskToEdit.prazo.split('/');
        setSelectedDate(new Date(year, month - 1, day));
      }
    }
  }, [taskToEdit]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowMembrosPopup(false);
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarRef]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
        ...form,
        membros,
        participantes: membros.length,
        prazo: selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Não definido',
    };
    onAddTask(taskData);
    // onClose(); // A função onAddTask já cuida de fechar o modal
  };
  
  const toggleMembro = (func) => {
    setMembros(prev => 
        prev.find(m => m.id === func.id)
            ? prev.filter(m => m.id !== func.id)
            : [...prev, func]
    );
  };

  return (
    <div className="add-task-overlay">
      <div className="add-task-modal">
        <button className="add-task-close-btn" onClick={onClose}>✕</button>
        
        <div className="add-task-content">
          <div className="add-task-header">
            <h2>{taskToEdit ? 'Editar Tarefa' : 'Adicionar Tarefa'}</h2>
          </div>
          <form className="add-task-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Nome do Cliente *</label>
                <input name="client" value={form.client} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Tarefa *</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-field full-width" style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
              <label>Descrição da Tarefa *</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} required />
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Setor *</label>
                <select name="sector" value={form.sector} onChange={handleChange}>
                  <option>Design</option> <option>Desenvolvimento</option> <option>Marketing</option>
                </select>
              </div>
              <div className="form-field">
                <label>Etiquetas *</label>
                <select name="tag" value={form.tag} onChange={handleChange}>
                  <option>Normal</option> <option>Urgente</option> <option>Baixa Prioridade</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-salvar">{taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}</button>
            </div>
          </form>
        </div>

        <div className="add-task-sidebar" ref={sidebarRef}>
            <div className="sidebar-section">
                <button type="button" className="btn-agendar" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>+ Agendar</button>
                {isCalendarOpen && <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} onClose={() => setIsCalendarOpen(false)} />}
            </div>
            {selectedDate && (
                <div className="date-display">
                    <strong>Data selecionada:</strong>
                    <span>{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
            )}
            <div className="membros-section">
                <h3>Membros *</h3>
                <div className="membros-search"> <input type="text" placeholder="Pesquisar Membros" /> </div>
                <div className="membros-list">
                    {membros.map(membro => (
                        <div key={membro.id} className="membro-item selected">
                            <div className="membro-avatar">{membro.inicial}</div>
                            <div className="membro-info">
                                <span className="membro-nome">{membro.nome}</span>
                                <span className="membro-email">{membro.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="sidebar-section">
                    <button type="button" className="btn-add-membro" onClick={() => setShowMembrosPopup(!showMembrosPopup)}>+ Add Membro</button>
                    {showMembrosPopup && (
                        <div className="membros-popup">
                            {allFuncionarios.map(func => (
                                <div key={func.id} className={`membro-item ${membros.find(m => m.id === func.id) ? 'selected' : ''}`} onClick={() => toggleMembro(func)}>
                                    <div className="membro-avatar">{func.inicial}</div>
                                    <div className="membro-info">
                                        <span className="membro-nome">{func.nome}</span>
                                        <span className="membro-email">{func.email}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}