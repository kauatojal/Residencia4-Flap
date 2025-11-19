import React, { useState, useEffect } from 'react';
import './AdicionarTarefa.css';
import kanbanService from "../services/kanbanService";

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

const etiquetasIniciais = [
  { id: 1, nome: 'Normal', cor: '#3B82F6' },
  { id: 2, nome: 'Urgente', cor: '#EF4444' },
  { id: 3, nome: 'Baixa Prioridade', cor: '#10B981' },
  { id: 4, nome: 'Em Revisão', cor: '#F59E0B' },
  { id: 5, nome: 'Aprovado', cor: '#8B5CF6' },
];

export default function AdicionarTarefa({ onClose, onAddTask, taskToEdit }) {
  const [form, setForm] = useState({
    client: '',
    name: '',
    descricao: '',
  });

  const [etiquetas, setEtiquetas] = useState(etiquetasIniciais);
  const [etiquetasSelecionadas, setEtiquetasSelecionadas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Estados para criar nova etiqueta
  const [mostrarCriarEtiqueta, setMostrarCriarEtiqueta] = useState(false);
  const [novaEtiqueta, setNovaEtiqueta] = useState({ nome: '', cor: '#3B82F6' });
  const [mostrarPopupEtiquetas, setMostrarPopupEtiquetas] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setForm({
        client: taskToEdit.client || '',
        name: taskToEdit.name || '',
        descricao: taskToEdit.descricao || '',
      });
      if (taskToEdit.prazo) {
        const [day, month, year] = taskToEdit.prazo.split('/');
        setSelectedDate(new Date(year, month - 1, day));
      }
      if (taskToEdit.etiquetas) {
        setEtiquetasSelecionadas(taskToEdit.etiquetas);
      }
    }
  }, [taskToEdit]);

  const toggleEtiqueta = (etiqueta) => {
    setEtiquetasSelecionadas(prev => {
      const existe = prev.find(e => e.id === etiqueta.id);
      if (existe) {
        return prev.filter(e => e.id !== etiqueta.id);
      } else {
        return [...prev, etiqueta];
      }
    });
  };

  const criarNovaEtiqueta = () => {
    if (!novaEtiqueta.nome.trim()) {
      alert('Digite um nome para a etiqueta');
      return;
    }

    const novaEtiquetaObj = {
      id: Date.now(),
      nome: novaEtiqueta.nome,
      cor: novaEtiqueta.cor
    };

    setEtiquetas(prev => [...prev, novaEtiquetaObj]);
    setEtiquetasSelecionadas(prev => [...prev, novaEtiquetaObj]);
    setNovaEtiqueta({ nome: '', cor: '#3B82F6' });
    setMostrarCriarEtiqueta(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.client) newErrors.client = 'Cliente é obrigatório';
    if (!form.name) newErrors.name = 'Nome da tarefa é obrigatório';
    if (!form.descricao) newErrors.descricao = 'Descrição é obrigatória';
    if (!selectedDate) newErrors.data = 'Data é obrigatória';
    if (etiquetasSelecionadas.length === 0) newErrors.etiquetas = 'Selecione pelo menos uma etiqueta';
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
      etiquetas: etiquetasSelecionadas,
      prazo: selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '',
    };

    try {
      setLoading(true);
      if (taskToEdit) {
        await kanbanService.updateTarefa(taskToEdit.id, payload);
      } else {
        await kanbanService.createTarefa(payload);
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
          <div className="add-task-header">
            <h2>{taskToEdit ? 'Editar Tarefa' : 'Adicionar Tarefa'}</h2>
          </div>
          <form className="add-task-form" onSubmit={handleSubmit}>
            <div className="form-field full-width">
              <label className="required" htmlFor="client">Cliente</label>
              <select
                name="client"
                id="client"
                className={errors.client ? "error" : ""}
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
              {errors.client && <span className="error-message">{errors.client}</span>}
            </div>

            <div className="form-field full-width">
              <label className="required" htmlFor="name">Título</label>
              <input
                name="name"
                id="name"
                className={errors.name ? "error" : ""}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-field full-width">
              <label className="required" htmlFor="descricao">Descrição</label>
              <textarea
                name="descricao"
                id="descricao"
                className={errors.descricao ? "error" : ""}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
              {errors.descricao && <span className="error-message">{errors.descricao}</span>}
            </div>

                      <div className="form-field full-width">
            <label className="required" htmlFor="prazo">Prazo</label>
            <input
              type="date"
              id="prazo"
              className={errors.data ? "error" : ""}
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              min={new Date().toISOString().split('T')[0]} // ADICIONE ESTA LINHA
            />
            {errors.data && <span className="error-message">{errors.data}</span>}
          </div>


            {/* SISTEMA DE ETIQUETAS */}
            <div className="form-field full-width etiquetas-field">
              <label className="required">Etiquetas</label>
              <div
                className={`etiqueta-selector ${errors.etiquetas ? "error" : ""}`}
                onClick={() => setMostrarPopupEtiquetas(!mostrarPopupEtiquetas)}
              >
                {etiquetasSelecionadas.length === 0 ? (
                  <span className="etiqueta-placeholder">Selecione as etiquetas</span>
                ) : (
                  <div className="etiquetas-selected-container">
                    {etiquetasSelecionadas.map(etiqueta => (
                      <span
                        key={etiqueta.id}
                        className="etiqueta-badge"
                        style={{ backgroundColor: etiqueta.cor }}
                      >
                        {etiqueta.nome}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {errors.etiquetas && <span className="error-message">{errors.etiquetas}</span>}

              {mostrarPopupEtiquetas && (
                <div className="etiqueta-popup">
                  {etiquetas.map(etiqueta => (
                    <div
                      key={etiqueta.id}
                      className={`etiqueta-option ${etiquetasSelecionadas.find(e => e.id === etiqueta.id) ? 'selected' : ''}`}
                      onClick={() => toggleEtiqueta(etiqueta)}
                    >
                      <div
                        className="etiqueta-cor-preview"
                        style={{ backgroundColor: etiqueta.cor }}
                      />
                      <span>{etiqueta.nome}</span>
                      {etiquetasSelecionadas.find(e => e.id === etiqueta.id) && (
                        <span className="etiqueta-check">✓</span>
                      )}
                    </div>
                  ))}

                  {!mostrarCriarEtiqueta ? (
                    <button
                      type="button"
                      className="btn-criar-etiqueta"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMostrarCriarEtiqueta(true);
                      }}
                    >
                      + Criar Nova Etiqueta
                    </button>
                  ) : (
                    <div className="criar-etiqueta-form" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="Nome da etiqueta"
                        value={novaEtiqueta.nome}
                        onChange={(e) => setNovaEtiqueta({...novaEtiqueta, nome: e.target.value})}
                      />
                      <div className="cor-selector">
                        <label>Cor:</label>
                        <input
                          type="color"
                          value={novaEtiqueta.cor}
                          onChange={(e) => setNovaEtiqueta({...novaEtiqueta, cor: e.target.value})}
                        />
                      </div>
                      <div className="criar-etiqueta-actions">
                        <button type="button" onClick={criarNovaEtiqueta}>Criar</button>
                        <button type="button" onClick={() => {
                          setMostrarCriarEtiqueta(false);
                          setNovaEtiqueta({ nome: '', cor: '#3B82F6' });
                        }}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-salvar" type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
