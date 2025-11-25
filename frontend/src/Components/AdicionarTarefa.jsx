import React, { useState, useEffect } from 'react';
import './AdicionarTarefa.css';
import kanbanService from "../services/kanbanService";
import flagService from "../services/flagService";
import clientService from '../services/clientService';
import { useParams } from 'react-router-dom';

const etiquetasIniciais = [
  { id: 1, nome: 'Normal', cor: '#3B82F6' },
  { id: 2, nome: 'Urgente', cor: '#EF4444' },
  { id: 3, nome: 'Baixa Prioridade', cor: '#10B981' },
  { id: 4, nome: 'Em Revisão', cor: '#F59E0B' },
  { id: 5, nome: 'Aprovado', cor: '#8B5CF6' },
];

export default function AdicionarTarefa({ onClose, onAddTask, taskToEdit, currentListId }) {
  const [form, setForm] = useState({
    cliente: '',
    titulo: '',
    descricao: '',
  });

  const [clientes, setClientes] = useState([]);
  const [etiquetas, setEtiquetas] = useState(etiquetasIniciais);
  const [etiquetasSelecionadas, setEtiquetasSelecionadas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Estados para criar nova etiqueta
  const [mostrarCriarEtiqueta, setMostrarCriarEtiqueta] = useState(false);
  const [novaEtiqueta, setNovaEtiqueta] = useState({ nome: '', cor: '#3B82F6' });
  const [mostrarPopupEtiquetas, setMostrarPopupEtiquetas] = useState(false);

  async function loadClients() {
    const clientes = await clientService.list()
    setClientes(clientes)
  }

  const { id } = useParams()
  const quadroId = id

  useEffect(() => {
    loadClients()

    if (taskToEdit) {
      setForm({
        cliente: taskToEdit.cliente || '',
        titulo: taskToEdit.tituli || '',
        descricao: taskToEdit.descricao || '',
      });
      if (taskToEdit.Fim) {
        const [day, month, year] = taskToEdit.prazoFim.split('/');
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
    if (!form.cliente) newErrors.client = 'Cliente é obrigatório';
    if (!form.titulo) newErrors.name = 'Nome da tarefa é obrigatório';
    if (!form.descricao) newErrors.descricao = 'Descrição é obrigatória';
    if (!selectedDate) newErrors.data = 'Data é obrigatória';
    if (etiquetasSelecionadas.length === 0) newErrors.etiquetas = 'Selecione pelo menos uma etiqueta';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log(selectedDate)
    const payload = {
      cliente: {id: form.cliente},
      titulo: form.titulo,
      descricao: form.descricao,
      // etiquetas: etiquetasSelecionadas,
      flagTarefas: [], // TODO: implementar integração de etiquetas
      quadro: {id: quadroId},
      lista: {id: currentListId},
      prazoFim: selectedDate
    };

    try {
      setLoading(true);
      if (taskToEdit) {
        await kanbanService.updateTarefa(taskToEdit.id, payload);
      } else {
        await kanbanService.createTarefa(payload);
      }
      // onAddTask(payload);
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
                className={errors.cliente ? "error" : ""}
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c, i) => <option key={i} value={c.id}>{c.nome}</option>)}
              </select>
              {errors.cliente && <span className="error-message">{errors.cliente}</span>}
            </div>

            <div className="form-field full-width">
              <label className="required" htmlFor="titulo">Título</label>
              <input
                name="titulo"
                id="name"
                className={errors.titulo ? "error" : ""}
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
              {errors.titulo && <span className="error-message">{errors.titulo}</span>}
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
            <label className="required" htmlFor="prazoFim">Prazo</label>
            <input
              type="date"
              id="prazoFim"
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
