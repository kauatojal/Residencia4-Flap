import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
  HiX, HiUser, HiTag, HiClock, HiDocumentText, 
  HiPaperClip, HiLink, HiCheckCircle, HiPlus 
} from 'react-icons/hi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CreateTaskModal.css';

const API_URL = 'http://localhost:8090/v1';

const CreateTaskModal = ({ isOpen, onClose, listaId, quadroId, onTaskCreated }) => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    dataVencimento: null,
    clienteId: '',
    flagId: '',
    membros: [],
    links: [],
    checklists: []
  });

  const [clientes, setClientes] = useState([]);
  const [flags, setFlags] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para UI
  const [showMembrosPicker, setShowMembrosPicker] = useState(false);
  const [novoLink, setNovoLink] = useState('');
  const [novaChecklist, setNovaChecklist] = useState('');
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (isOpen) {
      carregarDados();
      adicionarHistorico('Tarefa em criação');
    }
  }, [isOpen]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const carregarDados = async () => {
    try {
      const [clientesRes, flagsRes, usuariosRes] = await Promise.all([
        axios.get(`${API_URL}/cliente/all`, getAuthHeaders()),
        axios.get(`${API_URL}/flag/all`, getAuthHeaders()),
        axios.get(`${API_URL}/user`, getAuthHeaders())
      ]);

      setClientes(clientesRes.data);
      setFlags(flagsRes.data);
      setUsuarios(usuariosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const adicionarHistorico = (acao) => {
    const dataHora = new Date().toLocaleString('pt-BR');
    setHistorico(prev => [...prev, { acao, dataHora }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar a tarefa
      const tarefaPayload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        dataVencimento: formData.dataVencimento ? formData.dataVencimento.toISOString() : null,
        listaId: listaId,
        quadroId: quadroId,
        clienteId: formData.clienteId || null,
        flagId: formData.flagId || null
      };

      const tarefaResponse = await axios.post(
        `${API_URL}/tarefa`,
        tarefaPayload,
        getAuthHeaders()
      );

      const tarefaId = tarefaResponse.data.id;

      // 2. Adicionar membros (se houver)
      if (formData.membros.length > 0) {
        await Promise.all(
          formData.membros.map(membroId =>
            axios.post(
              `${API_URL}/tarefa/${tarefaId}/membros`,
              { usuarioId: membroId },
              getAuthHeaders()
            )
          )
        );
      }

      // 3. Adicionar checklists (se houver)
      if (formData.checklists.length > 0) {
        await Promise.all(
          formData.checklists.map(checklist =>
            axios.post(
              `${API_URL}/checklists`,
              {
                nome: checklist,
                tarefaId: tarefaId
              },
              getAuthHeaders()
            )
          )
        );
      }

      alert('Tarefa criada com sucesso!');
      onTaskCreated(tarefaResponse.data);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      descricao: '',
      dataVencimento: null,
      clienteId: '',
      flagId: '',
      membros: [],
      links: [],
      checklists: []
    });
    setHistorico([]);
    onClose();
  };

  const handleMembroToggle = (membroId) => {
    setFormData(prev => ({
      ...prev,
      membros: prev.membros.includes(membroId)
        ? prev.membros.filter(id => id !== membroId)
        : [...prev.membros, membroId]
    }));
    adicionarHistorico(`Membro ${membroId === user.id ? 'você' : 'adicionado'}`);
  };

  const adicionarLink = () => {
    if (novoLink.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, novoLink]
      }));
      setNovoLink('');
      adicionarHistorico('Link adicionado');
    }
  };

  const adicionarChecklist = () => {
    if (novaChecklist.trim()) {
      setFormData(prev => ({
        ...prev,
        checklists: [...prev.checklists, novaChecklist]
      }));
      setNovaChecklist('');
      adicionarHistorico('Checklist adicionada');
    }
  };

  const conectarDropbox = () => {
    // Integração Dropbox OAuth 2.0
    const DROPBOX_APP_KEY = 'SEU_APP_KEY_AQUI'; // Substitua pelo seu App Key
    const REDIRECT_URI = encodeURIComponent(window.location.origin + '/dropbox-callback');
    
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&response_type=token&redirect_uri=${REDIRECT_URI}`;
    
    window.open(authUrl, 'dropboxAuth', 'width=600,height=700');
  };

  const getPrioridadeColor = (flagNome) => {
    const colors = {
      'CRITICA': '#8B0000',
      'ALTA': '#fd7e14',
      'MEDIA': '#ffc107',
      'BAIXA': '#28a745'
    };
    return colors[flagNome?.toUpperCase()] || '#6c757d';
  };

  const getMembrosDisplay = () => {
    return formData.membros.map(membroId => {
      const usuario = usuarios.find(u => u.id === membroId);
      if (!usuario) return null;
      
      const nome = usuario.name || usuario.nome || '';
      const iniciais = nome.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
      
      return (
        <div key={membroId} className="membro-avatar" title={nome}>
          {iniciais}
        </div>
      );
    }).filter(Boolean);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-task" onClick={handleClose}>
      <div className="modal-content-task" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-modal-task" onClick={handleClose}>
          <HiX />
        </button>

        <div className="modal-layout">
          {/* COLUNA ESQUERDA - FORMULÁRIO */}
          <div className="modal-left">
            <form onSubmit={handleSubmit}>
              {/* Título */}
              <div className="form-group-task">
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => {
                    setFormData({ ...formData, titulo: e.target.value });
                    adicionarHistorico('Título alterado');
                  }}
                  placeholder="Título da Tarefa"
                  className="input-title-task"
                  required
                />
              </div>

              {/* Linha: Cliente e Prioridade */}
              <div className="form-row-task">
                <div className="form-group-task">
                  <label>
                    <HiUser /> Cliente / Empresa
                  </label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => {
                      setFormData({ ...formData, clienteId: e.target.value });
                      adicionarHistorico('Cliente selecionado');
                    }}
                    className="select-task"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-task">
                  <label>
                    <HiTag /> Prioridade
                  </label>
                  <select
                    value={formData.flagId}
                    onChange={(e) => {
                      setFormData({ ...formData, flagId: e.target.value });
                      adicionarHistorico('Prioridade definida');
                    }}
                    className="select-task"
                  >
                    <option value="">Selecione prioridade...</option>
                    {flags.map(flag => (
                      <option key={flag.id} value={flag.id}>
                        {flag.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prazo com DatePicker */}
              <div className="form-group-task">
                <label>
                  <HiClock /> Prazo de Entrega
                </label>
                <DatePicker
                  selected={formData.dataVencimento}
                  onChange={(date) => {
                    setFormData({ ...formData, dataVencimento: date });
                    adicionarHistorico('Prazo definido');
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/aaaa"
                  className="datepicker-task"
                  todayButton="Hoje"
                  clearButtonTitle="Limpar"
                  isClearable
                />
              </div>

              {/* Descrição */}
              <div className="form-group-task">
                <label>
                  <HiDocumentText /> Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Nenhuma descrição adicionada"
                  rows="5"
                  className="textarea-task"
                />
              </div>

              {/* Links */}
              <div className="form-group-task">
                <label>
                  <HiLink /> Links
                </label>
                <div className="input-with-btn">
                  <input
                    type="url"
                    value={novoLink}
                    onChange={(e) => setNovoLink(e.target.value)}
                    placeholder="Cole o link aqui (https://...)"
                    className="input-task"
                  />
                  <button type="button" onClick={adicionarLink} className="btn-add-item">
                    Adicionar
                  </button>
                </div>
                {formData.links.length > 0 && (
                  <div className="links-list">
                    {formData.links.map((link, idx) => (
                      <div key={idx} className="link-item">
                        🔗 {link}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklists */}
              <div className="form-group-task">
                <label>
                  <HiCheckCircle /> Checklists
                </label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    value={novaChecklist}
                    onChange={(e) => setNovaChecklist(e.target.value)}
                    placeholder="Nova checklist"
                    className="input-task"
                  />
                  <button type="button" onClick={adicionarChecklist} className="btn-add-item">
                    Criar Checklist
                  </button>
                </div>
                {formData.checklists.length > 0 && (
                  <div className="checklists-list">
                    {formData.checklists.map((checklist, idx) => (
                      <div key={idx} className="checklist-item">
                        ✓ {checklist}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão Submit */}
              <div className="modal-footer-task">
                <button type="submit" className="btn-submit-task" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>

          {/* COLUNA DIREITA - SIDEBAR */}
          <div className="modal-right">
            {/* Histórico */}
            <div className="sidebar-section">
              <h4>Histórico</h4>
              <div className="historico-list">
                {historico.map((item, idx) => (
                  <div key={idx} className="historico-item">
                    <span className="historico-acao">{item.acao}</span>
                    <span className="historico-data">{item.dataHora}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Membros */}
            <div className="sidebar-section">
              <h4>Membros</h4>
              <div className="membros-avatares">
                {getMembrosDisplay()}
                <button 
                  type="button" 
                  className="btn-add-membro"
                  onClick={() => setShowMembrosPicker(!showMembrosPicker)}
                >
                  <HiPlus />
                </button>
              </div>
              
              {showMembrosPicker && (
                <div className="membros-picker">
                  <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    className="search-membros"
                  />
                  {usuarios.map(usuario => {
                    const nome = usuario.name || usuario.nome || '';
                    const iniciais = nome.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
                    const isSelected = formData.membros.includes(usuario.id);
                    
                    return (
                      <div 
                        key={usuario.id} 
                        className={`membro-picker-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleMembroToggle(usuario.id)}
                      >
                        <div className="membro-avatar-small">{iniciais}</div>
                        <span>{nome}</span>
                        {isSelected && <span className="check-icon">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Anexos / Dropbox */}
            <div className="sidebar-section">
              <h4>
                <HiPaperClip /> Anexos
              </h4>
              <button
                type="button"
                className="btn-dropbox-full"
                onClick={conectarDropbox}
              >
                <span className="dropbox-icon">📦</span> Conectar Dropbox
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
