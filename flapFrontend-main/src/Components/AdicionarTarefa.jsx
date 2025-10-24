import React, { useState, useEffect, useRef } from 'react';
import './AdicionarTarefa.css';
import api from '../services/api'; // ASSUMA QUE ESTE É O CAMINHO CORRETO PARA SEU ARQUIVO api.js

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
                                if(isCurrentMonth && !disabled) { 
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

export default function AdicionarTarefa({ onClose, onAddTask, taskToEdit, currentListaId, currentQuadroId }) {
    const [form, setForm] = useState({
        client: '', name: '', descricao: '', sector: 'Design', tag: null,
    });
    const [etiquetas, setEtiquetas] = useState(etiquetasPadrao);
    const [showEtiquetaPopup, setShowEtiquetaPopup] = useState(false);
    const [novaEtiqueta, setNovaEtiqueta] = useState({ nome: '', cor: '#3B82F6' });
    const [criandoEtiqueta, setCriandoEtiqueta] = useState(false);
    const [membros, setMembros] = useState([]);
    const [showMembrosPopup, setShowMembrosPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const sidebarRef = useRef(null);
    const etiquetaRef = useRef(null);
    
    useEffect(() => {
        if (taskToEdit) {
            setForm({
                client: taskToEdit.client || '', 
                name: taskToEdit.name || '',
                descricao: taskToEdit.descricao || '', 
                sector: taskToEdit.sector || 'Design',
                tag: taskToEdit.tag ? { nome: taskToEdit.tag, cor: '#3B82F6' } : null,
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
            if (etiquetaRef.current && !etiquetaRef.current.contains(event.target)) {
                setShowEtiquetaPopup(false);
                setCriandoEtiqueta(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sidebarRef, etiquetaRef]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!form.client) newErrors.client = 'Cliente é obrigatório';
        if (!form.name) newErrors.name = 'Nome da tarefa é obrigatório';
        if (!form.descricao) newErrors.descricao = 'Descrição é obrigatória';
        if (!form.sector) newErrors.sector = 'Setor é obrigatório';
        if (!form.tag) newErrors.tag = 'Etiqueta é obrigatória';
        if (!selectedDate) newErrors.data = 'Data é obrigatória';
        if (membros.length === 0) newErrors.membros = 'Selecione pelo menos um membro';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- FUNÇÃO INTEGRADA À API ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Simulação de IDs para teste, pois o formulário usa strings/nomes
        const clienteId = 1; 
        const setorId = 1; 
        const flagId = 1; 
        const listaId = currentListaId || 1; 
        const quadroId = currentQuadroId || 1; 

        // Formatação da data para o padrão ISO (requerido pelo backend)
        const prazoInicio = selectedDate ? selectedDate.toISOString() : new Date().toISOString();
        const prazoFim = selectedDate ? selectedDate.toISOString() : new Date().toISOString();

        const payload = {
            titulo: form.name,
            descricao: form.descricao,
            prazoInicio: prazoInicio,
            prazoFim: prazoFim,

            // IDs de Foreign Keys que o backend espera
            setor: { id: setorId }, 
            lista: { id: listaId }, 
            quadro: { id: quadroId }, 
            cliente: { id: clienteId }, 
            
            // Mapeia os IDs dos membros para o formato { id: X }
            responsaveisIds: membros.map(m => ({ id: m.id })),
            
            // ID da Flag/Etiqueta (apenas o ID)
            flagsTarefaIds: [ { id: flagId } ] 
        };

        try {
            const response = await api.post('/tarefa', payload);

            console.log("Tarefa criada via API com sucesso:", response.data);
            alert(`Tarefa '${form.name}' criada com sucesso!`);
            
            // Lógica para atualizar a tela e fechar o modal
            onAddTask(response.data); 
            onClose(); 

        } catch (error) {
            console.error("Erro ao criar tarefa via API:", error.response || error);
            
            if (error.response && error.response.status === 403) {
                 alert("Acesso Negado. Você não tem permissão para criar tarefas.");
            } else if (error.response && error.response.data && error.response.data.message) {
                 alert(`Erro ao criar tarefa: ${error.response.data.message}`);
            } else {
                 alert("Erro desconhecido ao comunicar com o servidor.");
            }
            
            throw error;
        }
    };
    
    const toggleMembro = (func) => {
        setMembros(prev => 
            prev.find(m => m.id === func.id)
                ? prev.filter(m => m.id !== func.id)
                : [...prev, func]
        );
        if (errors.membros) {
            setErrors({ ...errors, membros: null });
        }
    };

    const selecionarEtiqueta = (etiqueta) => {
        setForm({ ...form, tag: etiqueta });
        setShowEtiquetaPopup(false);
        if (errors.tag) {
            setErrors({ ...errors, tag: null });
        }
    };

    const criarNovaEtiqueta = () => {
        if (novaEtiqueta.nome.trim()) {
            setEtiquetas([...etiquetas, novaEtiqueta]);
            setForm({ ...form, tag: novaEtiqueta });
            setNovaEtiqueta({ nome: '', cor: '#3B82F6' });
            setCriandoEtiqueta(false);
            setShowEtiquetaPopup(false);
            if (errors.tag) {
                setErrors({ ...errors, tag: null });
            }
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        if (errors.data) {
            setErrors({ ...errors, data: null });
        }
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
                                <select 
                                    name="client" 
                                    value={form.client} 
                                    onChange={handleChange} 
                                    className={errors.client ? 'error' : ''}
                                >
                                    <option value="">Selecione um cliente</option>
                                    {clientes.map((cliente, index) => (
                                        <option key={index} value={cliente}>{cliente}</option>
                                    ))}
                                </select>
                                {errors.client && <span className="error-message">{errors.client}</span>}
                            </div>
                            <div className="form-field">
                                <label>Tarefa *</label>
                                <input 
                                    name="name" 
                                    value={form.name} 
                                    onChange={handleChange} 
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>
                        </div>
                        <div className="form-field full-width" style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                            <label>Descrição da Tarefa *</label>
                            <textarea 
                                name="descricao" 
                                value={form.descricao} 
                                onChange={handleChange} 
                                className={errors.descricao ? 'error' : ''}
                            />
                            {errors.descricao && <span className="error-message">{errors.descricao}</span>}
                        </div>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Setor *</label>
                                <select 
                                    name="sector" 
                                    value={form.sector} 
                                    onChange={handleChange}
                                    className={errors.sector ? 'error' : ''}
                                >
                                    <option>Design</option> 
                                    <option>Desenvolvimento</option> 
                                    <option>Marketing</option>
                                </select>
                                {errors.sector && <span className="error-message">{errors.sector}</span>}
                            </div>
                            <div className="form-field" ref={etiquetaRef}>
                                <label>Etiquetas *</label>
                                <div 
                                    className={`etiqueta-selector ${errors.tag ? 'error' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowEtiquetaPopup(!showEtiquetaPopup);
                                    }}
                                >
                                    {form.tag ? (
                                        <div className="etiqueta-selected" style={{ backgroundColor: form.tag.cor }}>
                                            {form.tag.nome}
                                        </div>
                                    ) : (
                                        <span className="etiqueta-placeholder">Selecione uma etiqueta</span>
                                    )}
                                </div>
                                {errors.tag && <span className="error-message">{errors.tag}</span>}
                                
                                {showEtiquetaPopup && (
                                    <div className="etiqueta-popup">
                                        {!criandoEtiqueta ? (
                                            <>
                                                {etiquetas.map((etiqueta, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="etiqueta-option"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selecionarEtiqueta(etiqueta);
                                                        }}
                                                    >
                                                        <div 
                                                            className="etiqueta-cor-preview" 
                                                            style={{ backgroundColor: etiqueta.cor }}
                                                        ></div>
                                                        <span>{etiqueta.nome}</span>
                                                    </div>
                                                ))}
                                                <button 
                                                    type="button" 
                                                    className="btn-criar-etiqueta"
                                                    onClick={() => setCriandoEtiqueta(true)}
                                                >
                                                    + Criar Nova Etiqueta
                                                </button>
                                            </>
                                        ) : (
                                            <div className="criar-etiqueta-form">
                                                <input 
                                                    type="text" 
                                                    placeholder="Nome da etiqueta"
                                                    value={novaEtiqueta.nome}
                                                    onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, nome: e.target.value })}
                                                />
                                                <div className="cor-selector">
                                                    <label>Cor:</label>
                                                    <input 
                                                        type="color" 
                                                        value={novaEtiqueta.cor}
                                                        onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, cor: e.target.value })}
                                                    />
                                                </div>
                                                <div className="criar-etiqueta-actions">
                                                    <button type="button" onClick={criarNovaEtiqueta}>Criar</button>
                                                    <button type="button" onClick={() => setCriandoEtiqueta(false)}>Cancelar</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-salvar">
                                {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="add-task-sidebar" ref={sidebarRef}>
                    <div className="sidebar-section">
                        <button 
                            type="button" 
                            className={`btn-agendar ${errors.data ? 'error' : ''}`}
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        >
                            + Agendar
                        </button>
                        {errors.data && <span className="error-message">{errors.data}</span>}
                        {isCalendarOpen && (
                            <Calendar 
                                selectedDate={selectedDate} 
                                onDateSelect={handleDateSelect} 
                                onClose={() => setIsCalendarOpen(false)} 
                            />
                        )}
                    </div>
                    {selectedDate && (
                        <div className="date-display">
                            <strong>Data selecionada:</strong>
                            <span>{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                    )}
                    <div className="membros-section">
                        <h3>Membros *</h3>
                        {errors.membros && <span className="error-message">{errors.membros}</span>}
                        <div className="membros-search"> 
                            <input type="text" placeholder="Pesquisar Membros" /> 
                        </div>
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
                            <button type="button" className="btn-add-membro" onClick={() => setShowMembrosPopup(!showMembrosPopup)}>
                                + Add Membro
                            </button>
                            {showMembrosPopup && (
                                <div className="membros-popup">
                                    {allFuncionarios.map(func => (
                                        <div 
                                            key={func.id} 
                                            className={`membro-item ${membros.find(m => m.id === func.id) ? 'selected' : ''}`} 
                                            onClick={() => toggleMembro(func)}
                                        >
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

// O código CSS do AdicionarTarefa.css (que é o que está no seu exemplo, mas está fora do componente aqui)
// é o que define o estilo do modal. Ele deve ser carregado separadamente no arquivo CSS.

// NOTA: O Calendar componente precisa ser importado ou definido, como está acima.