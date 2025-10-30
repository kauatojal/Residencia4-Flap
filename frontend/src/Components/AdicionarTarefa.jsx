import React, { useState, useEffect, useRef } from 'react';
import './AdicionarTarefa.css';
import kanbanService from "../services/kanbanService";

const allFuncionarios = [
  { id: 1, nome: 'Eddie Lobanovskiy', email: 'laboanovskiy@gmail.com', inicial: 'EL' },
  { id: 2, nome: 'Alexey Stave', email: 'alexey_st@gmail.com', inicial: 'AS' },
  { id: 3, nome: 'Anton Tkacheve', email: 'tkachevant@gmail.com', inicial: 'AT' },
];

const clientes = [
  'Tech Solutions Ltda',
  'Inovare Sistemas',
  'CloudBusiness Corp',
  'Digital Marketing Pro',
  'Agência Criativa Design',
  'StartUp Tech Hub',
  'Empresa XYZ Comércio',
  'Consultoria Estratégica',
  'Indústria ABC S.A.',
  'Varejo Online Brasil'
];

const etiquetasPadrao = [
  { nome: 'Normal', cor: '#3B82F6' },
  { nome: 'Urgente', cor: '#EF4444' },
  { nome: 'Baixa Prioridade', cor: '#10B981' },
  { nome: 'Em Revisão', cor: '#F59E0B' },
  { nome: 'Aprovado', cor: '#8B5CF6' },
];

const Calendar = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

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
  const isDateDisabled = (date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < hoje;
  };

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
        {getDaysInMonth(currentMonth).map(({ day, isCurrentMonth }, index) => {
          const disabled = isDateDisabled(day);
          return (
            <button
              key={index}
              type="button"
              className={`calendar-day ${isCurrentMonth ? '' : 'inactive'} ${isSameDay(day, selectedDate) ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (isCurrentMonth && !disabled) {
                  onDateSelect(day);
                  onClose();
                }
              }}
              disabled={disabled}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function AdicionarTarefa({ onClose, onAddTask, taskToEdit }) {
  const [form, setForm] = useState({
    client: '', name: '', descricao: '', sector: 'Design', tag: null,
  });
  const [etiquetas, setEtiquetas] = useState(etiquetasPadrao);
  const [membros, setMembros] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setForm({
        client: taskToEdit.client || '',
        name: taskToEdit.name || '',
        descricao: taskToEdit.descricao || '',
        sector: taskToEdit.sector || 'Design',
        tag: taskToEdit.tag ? { nome: taskToEdit.tag, cor: '#3B82F6' } : null,
      });
      if (taskToEdit.prazo) {
        const [day, month, year] = taskToEdit.prazo.split('/');
        setSelectedDate(new Date(year, month - 1, day));
      }
      if (taskToEdit.membros) {
        setMembros(taskToEdit.membros);
      }
    }
  }, [taskToEdit]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.client) newErrors.client = 'Cliente é obrigatório';
    if (!form.name) newErrors.name = 'Nome da tarefa é obrigatório';
    if (!form.descricao) newErrors.descricao = 'Descrição é obrigatória';
    if (!form.tag) newErrors.tag = 'Etiqueta é obrigatória';
    if (!selectedDate) newErrors.data = 'Data é obrigatória';
    if (membros.length === 0) newErrors.membros = 'Selecione pelo menos um membro';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      client: form.client,
      nome: form.name,
      descricao: form.descricao,
      setor: form.sector,
      tag: form.tag.nome,
      membros,
      prazo: selectedDate.toLocaleDateString('pt-BR'),
    };

    try {
      setLoading(true);
      if (taskToEdit) {
        await kanbanService.update(taskToEdit.id, payload);
      } else {
        await kanbanService.create(payload);
      }
      onAddTask(payload);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      alert("Falha ao salvar a tarefa. Verifique a API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-task-overlay">
      <div className="add-task-modal">
        <button className="add-task-close-btn" onClick={onClose}>✕</button>
        <div className="add-task-content">
          <h2>{taskToEdit ? 'Editar Tarefa' : 'Adicionar Tarefa'}</h2>

          <form className="add-task-form" onSubmit={handleSubmit}>
            <label>Cliente *</label>
            <select name="client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}>
              <option value="">Selecione um cliente</option>
              {clientes.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>

            <label>Título *</label>
            <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <label>Descrição *</label>
            <textarea name="descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />

            <label>Prazo *</label>
            <input type="date" onChange={(e) => setSelectedDate(new Date(e.target.value))} />

            <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
