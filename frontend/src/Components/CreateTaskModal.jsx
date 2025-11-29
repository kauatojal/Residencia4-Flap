import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './CreateTaskModal.css';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'Média',
    prazo: '',
    clienteId: ''
  });
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar clientes para o Select
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:8090/v1/cliente/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setClientes(data))
      .catch(err => console.error("Erro ao carregar clientes", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Monta o payload conforme esperado pelo seu backend (ajuste se necessário)
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade, // Alta, Média, Baixa
        prazo: formData.prazo, // YYYY-MM-DD
        status: "A_FAZER", // Status inicial padrão
        cliente: formData.clienteId ? { id: formData.clienteId } : null
      };

      const response = await fetch('http://localhost:8090/v1/tarefa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newTask = await response.json();
        onTaskCreated(newTask); // Atualiza a lista na Home
        onClose();
        setFormData({ titulo: '', descricao: '', prioridade: 'Média', prazo: '', clienteId: '' });
      } else {
        alert("Erro ao criar tarefa. Verifique os dados.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-modal-overlay">
      <div className="create-modal-container">
        <div className="create-modal-header">
          <h2>Nova Tarefa</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-modal-body">
          <div className="form-group">
            <label>Título da Tarefa *</label>
            <input 
              type="text" 
              name="titulo" 
              value={formData.titulo} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Criar Landing Page"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cliente / Empresa</label>
              <select name="clienteId" value={formData.clienteId} onChange={handleChange}>
                <option value="">Selecione um cliente...</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Prioridade</label>
              <select name="prioridade" value={formData.prioridade} onChange={handleChange}>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Prazo de Entrega</label>
            <input 
              type="date" 
              name="prazo" 
              value={formData.prazo} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea 
              name="descricao" 
              value={formData.descricao} 
              onChange={handleChange} 
              rows="4" 
              placeholder="Detalhes da tarefa..."
            />
          </div>

          <div className="create-modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Salvando...' : <><Save size={18}/> Criar Tarefa</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}