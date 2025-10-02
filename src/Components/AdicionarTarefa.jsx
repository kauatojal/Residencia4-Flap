import React, { useState, useEffect } from "react";
import "./AdicionarTarefa.css";

function AdicionarTarefa({ onClose, onAddTask, taskToEdit }) {
  const [taskData, setTaskData] = useState({
    name: "",
    client: "",
    description: "",
    sector: "",
    tag: "",
    links: "",
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState({});

  const members = [
    { id: 1, name: "Eddie Lobanovskiy", email: "laboanovskiy@gmail.com", avatar: "👤" },
    { id: 2, name: "Alexey Stave", email: "alexeyst@gmail.com", avatar: "👤" },
    { id: 3, name: "Anton Tkacheve", email: "tkachevant@gmail.com", avatar: "👤" },
  ];

  // useEffect para preencher os campos quando estiver editando
  useEffect(() => {
    if (taskToEdit) {
      setTaskData({
        name: taskToEdit.name || "",
        client: taskToEdit.client || "",
        description: taskToEdit.descricao || "",
        sector: taskToEdit.sector || "",
        tag: taskToEdit.tag || "",
        links: taskToEdit.links || "",
      });

      // Converte a string de prazo de volta para Date
      if (taskToEdit.prazo && taskToEdit.prazo !== "Concluído") {
        const prazoStr = taskToEdit.prazo;
        // Verifica se é uma data no formato dd/mm/yyyy
        if (prazoStr.includes("/")) {
          const [day, month, year] = prazoStr.split("/");
          const date = new Date(year, month - 1, day);
          setSelectedDate(date);
          setCurrentMonth(date);
        }
      }

      // Define os membros selecionados
      if (taskToEdit.participantes) {
        const memberIds = members.slice(0, taskToEdit.participantes).map(m => m.id);
        setSelectedMembers(memberIds);
      }
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação completa
    const newErrors = {};
    
    if (!taskData.client.trim()) {
      newErrors.client = "Nome do cliente é obrigatório";
    }
    
    if (!taskData.name.trim()) {
      newErrors.name = "Nome da tarefa é obrigatório";
    }
    
    if (!taskData.description.trim()) {
      newErrors.description = "A descrição é obrigatória";
    }
    
    if (!taskData.sector) {
      newErrors.sector = "Selecione um setor";
    }
    
    if (!taskData.tag) {
      newErrors.tag = "Selecione uma etiqueta";
    }
    
    if (!selectedDate) {
      newErrors.date = "Selecione uma data no calendário";
    }
    
    if (selectedMembers.length === 0) {
      newErrors.members = "Selecione pelo menos um membro";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newTask = {
      id: taskToEdit ? taskToEdit.id : Date.now().toString(),
      name: taskData.name,
      client: taskData.client,
      prazo: selectedDate.toLocaleDateString("pt-BR"),
      alerta: taskData.tag === "Urgente" ? "Atrasado" : "No prazo",
      participantes: selectedMembers.length,
      views: taskToEdit ? taskToEdit.views : 0,
      descricao: taskData.description,
      sector: taskData.sector,
      tag: taskData.tag,
      links: taskData.links,
    };
    onAddTask(newTask);
    onClose();
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) => {
      const newMembers = prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId];
      
      // Limpa erro quando seleciona membro
      if (newMembers.length > 0) {
        setErrors((prevErrors) => ({ ...prevErrors, members: null }));
      }
      
      return newMembers;
    });
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case "Urgente":
        return "#ff6b6b";
      case "Normal":
        return "#ffa500";
      case "Baixa Prioridade":
        return "#4caf50";
      default:
        return "#fff";
    }
  };

  // Funções do calendário
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Dias do próximo mês
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (dayObj) => {
    if (dayObj.isCurrentMonth && dayObj.date) {
      setSelectedDate(dayObj.date);
      setShowCalendar(false);
      setErrors((prev) => ({ ...prev, date: null }));
    }
  };

  const isDateSelected = (dayObj) => {
    if (!selectedDate || !dayObj.date) return false;
    return (
      selectedDate.getDate() === dayObj.date.getDate() &&
      selectedDate.getMonth() === dayObj.date.getMonth() &&
      selectedDate.getFullYear() === dayObj.date.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="adicionar-tarefa-overlay" onClick={onClose}>
      <div className="adicionar-tarefa-modal" onClick={(e) => e.stopPropagation()}>
        {/* Main Content */}
        <div className="adicionar-tarefa-content">
          <div className="adicionar-tarefa-header">
            <h2>{taskToEdit ? "Editar Tarefa" : "Adicionar Tarefa"}</h2>
            <button className="adicionar-tarefa-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="adicionar-tarefa-form">
            <div className="adicionar-tarefa-row">
              <div className="adicionar-tarefa-field">
                <label>Nome do Cliente *</label>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={taskData.client}
                  onChange={(e) => {
                    setTaskData({ ...taskData, client: e.target.value });
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, client: null }));
                    }
                  }}
                  className={errors.client ? "error-field" : ""}
                />
                {errors.client && (
                  <span className="error-message">{errors.client}</span>
                )}
              </div>
              <div className="adicionar-tarefa-field">
                <label>Tarefa *</label>
                <input
                  type="text"
                  placeholder="Nome da tarefa"
                  value={taskData.name}
                  onChange={(e) => {
                    setTaskData({ ...taskData, name: e.target.value });
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, name: null }));
                    }
                  }}
                  className={errors.name ? "error-field" : ""}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>
            </div>

            <div className="adicionar-tarefa-row single">
              <div className="adicionar-tarefa-field full">
                <label>Descrição da Tarefa *</label>
                <textarea
                  placeholder="Descrição da tarefa"
                  value={taskData.description}
                  onChange={(e) => {
                    setTaskData({ ...taskData, description: e.target.value });
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, description: null }));
                    }
                  }}
                  rows="4"
                  className={errors.description ? "error-field" : ""}
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>
            </div>

            <div className="adicionar-tarefa-row">
              <div className="adicionar-tarefa-field">
                <label>Critérios de Aceite</label>
                <ul className="adicionar-tarefa-criteria">
                  <li>Critério 1</li>
                  <li>Critério 2</li>
                  <li>Critério 3</li>
                </ul>
              </div>
              <div className="adicionar-tarefa-field">
                <label>Setor *</label>
                <select
                  value={taskData.sector}
                  onChange={(e) => {
                    setTaskData({ ...taskData, sector: e.target.value });
                    if (e.target.value) {
                      setErrors((prev) => ({ ...prev, sector: null }));
                    }
                  }}
                  className={errors.sector ? "error-field" : ""}
                >
                  <option value="">Selecione setor</option>
                  <option value="Design">Design</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Marketing">Marketing</option>
                </select>
                {errors.sector && (
                  <span className="error-message">{errors.sector}</span>
                )}
              </div>
            </div>

            <div className="adicionar-tarefa-row">
              <div className="adicionar-tarefa-field">
                <label>Links</label>
                <input
                  type="url"
                  placeholder="https://www.link.com/file"
                  value={taskData.links}
                  onChange={(e) =>
                    setTaskData({ ...taskData, links: e.target.value })
                  }
                />
              </div>

              <div className="adicionar-tarefa-field">
                <label>Etiquetas *</label>
                <select
                  value={taskData.tag}
                  onChange={(e) => {
                    setTaskData({ ...taskData, tag: e.target.value });
                    if (e.target.value) {
                      setErrors((prev) => ({ ...prev, tag: null }));
                    }
                  }}
                  style={{
                    backgroundColor: taskData.tag ? getTagColor(taskData.tag) : "#fff",
                    color: taskData.tag ? "#fff" : "#333",
                    fontWeight: 500,
                  }}
                  className={errors.tag ? "error-field" : ""}
                >
                  <option value="">Selecione etiqueta</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Normal">Normal</option>
                  <option value="Baixa Prioridade">Baixa Prioridade</option>
                </select>
                {errors.tag && (
                  <span className="error-message">{errors.tag}</span>
                )}
              </div>
            </div>

            <button type="submit" className="adicionar-tarefa-submit">
              {taskToEdit ? "Salvar Alterações" : "Criar Tarefa"}
            </button>
          </form>
        </div>

        {/* Right Sidebar */}
        <aside className="adicionar-tarefa-right-sidebar">
          <button
            type="button"
            className={`adicionar-tarefa-agenda-btn ${errors.date ? "error-btn" : ""}`}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            + Agendar 
          </button>

          {errors.date && (
            <div className="error-message-calendar">{errors.date}</div>
          )}

          {selectedDate && !showCalendar && (
            <div className="selected-date-display">
              <strong>Data selecionada:</strong>
              <br />
              {selectedDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}

          {showCalendar && (
            <div className="adicionar-tarefa-calendar">
              <div className="calendar-header">
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={previousMonth}
                >
                  ‹
                </button>
                <span className="calendar-month-year">
                  {formatMonthYear(currentMonth)}
                </span>
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={nextMonth}
                >
                  ›
                </button>
              </div>
              <div className="calendar-grid">
                <div className="calendar-day-label">D</div>
                <div className="calendar-day-label">S</div>
                <div className="calendar-day-label">T</div>
                <div className="calendar-day-label">Q</div>
                <div className="calendar-day-label">Q</div>
                <div className="calendar-day-label">S</div>
                <div className="calendar-day-label">S</div>
                {days.map((dayObj, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day ${
                      isDateSelected(dayObj) ? "active" : ""
                    } ${!dayObj.isCurrentMonth ? "inactive" : ""}`}
                    onClick={() => handleDateClick(dayObj)}
                  >
                    {dayObj.day}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="adicionar-tarefa-members">
            <h3>Membros *</h3>
            {errors.members && (
              <div className="error-message-calendar" style={{ marginBottom: "12px" }}>
                {errors.members}
              </div>
            )}
            <input
              type="text"
              placeholder="Pesquisar Membros"
              className="adicionar-tarefa-search-members"
            />
            <div className="adicionar-tarefa-members-list">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`adicionar-tarefa-member ${
                    selectedMembers.includes(member.id) ? "selected" : ""
                  }`}
                  onClick={() => toggleMember(member.id)}
                >
                  <span className="member-avatar">{member.avatar}</span>
                  <div>
                    <div className="member-name">{member.name}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="adicionar-tarefa-add-member" type="button">
              + Add Membro
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdicionarTarefa;
