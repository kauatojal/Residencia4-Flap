import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import { 
  HiX, HiUser, HiTag, HiClock, HiDocumentText, 
  HiPaperClip, HiLink, HiCheckCircle, HiPlus 
} from 'react-icons/hi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CreateTaskModal.css';

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
  
  const [showMembrosPicker, setShowMembrosPicker] = useState(false);
  const [searchMembro, setSearchMembro] = useState('');
  const [novoLink, setNovoLink] = useState('');
  const [novaChecklist, setNovaChecklist] = useState('');
  const [historico, setHistorico] = useState([]);

  const historicoActionsRef = useRef(new Set());

  useEffect(() => {
    if (isOpen) {
      carregarDados();
      resetHistorico();
      adicionarHistoricoUnico('criacao', 'Tarefa em criação');
    }
  }, [isOpen]);

  const carregarDados = async () => {
    try {
      console.log('🔄 Iniciando carregamento de dados...');
      
      const [clientesRes, flagsRes, usuariosRes] = await Promise.all([
        api.get('/cliente/all'),
        api.get('/flag/all'),
        api.get('/user')
      ]);

      console.log('📊 Respostas completas:');
      console.log('Clientes Response:', clientesRes);
      console.log('Flags Response:', flagsRes);
      console.log('Usuários Response:', usuariosRes);

      const clientesData = clientesRes.data?.data || clientesRes.data || [];
      const flagsData = flagsRes.data?.data || flagsRes.data || [];
      const usuariosData = usuariosRes.data?.data || usuariosRes.data || [];

      console.log('📋 Dados extraídos:');
      console.log('Clientes:', clientesData);
      console.log('Flags:', flagsData);
      console.log('Usuários:', usuariosData);

      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      const flagsArray = Array.isArray(flagsData) ? flagsData : [];
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];

      setClientes(clientesArray);
      setFlags(flagsArray);
      setUsuarios(usuariosArray);

      console.log('✅ Estados atualizados:');
      console.log(`- ${clientesArray.length} clientes`);
      console.log(`- ${flagsArray.length} flags`);
      console.log(`- ${usuariosArray.length} usuários`);

      if (flagsArray.length === 0) {
        console.error('⚠️ PROBLEMA: Nenhuma flag foi retornada!');
        console.log('Verifique se o endpoint /flag/all está funcionando corretamente.');
        alert('⚠️ Aviso: Nenhuma prioridade disponível. Verifique a API /flag/all');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('Detalhes:', error.response?.data);
      alert('Erro ao carregar dados. Verifique sua conexão e o console.');
    }
  };

  const resetHistorico = () => {
    setHistorico([]);
    historicoActionsRef.current = new Set();
  };

  const adicionarHistoricoUnico = (chave, acao) => {
    if (historicoActionsRef.current.has(chave)) {
      return;
    }

    historicoActionsRef.current.add(chave);

    const dataHora = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setHistorico(prev => [...prev, { acao, dataHora }]);
  };

  const adicionarHistoricoMultiplo = (acao) => {
    const dataHora = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setHistorico(prev => [...prev, { acao, dataHora }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tarefaPayload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        dataVencimento: formData.dataVencimento ? formData.dataVencimento.toISOString() : null,
        listaId: listaId,
        quadroId: quadroId,
        clienteId: formData.clienteId || null,
        flagId: formData.flagId || null
      };

      const tarefaResponse = await api.post('/tarefa', tarefaPayload);

      const tarefaId = tarefaResponse.data.id;

      if (formData.membros.length > 0) {
        await Promise.all(
          formData.membros.map(membroId =>
            api.post(`/tarefa/${tarefaId}/membros`, { usuarioId: membroId })
          )
        );
      }

      if (formData.checklists.length > 0) {
        await Promise.all(
          formData.checklists.map(checklist =>
            api.post('/checklists', {
              nome: checklist,
              tarefaId: tarefaId
            })
          )
        );
      }

      alert('✅ Tarefa criada com sucesso!');
      onTaskCreated(tarefaResponse.data);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('❌ Erro ao criar tarefa: ' + (error.response?.data?.message || error.message));
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
    resetHistorico();
    setSearchMembro('');
    setShowMembrosPicker(false);
    onClose();
  };

  const handleMembroToggle = (membroId) => {
    const usuario = usuarios.find(u => u.id === membroId);
    const nome = usuario?.name || usuario?.nome || 'Membro';
    
    setFormData(prev => {
      const isAdding = !prev.membros.includes(membroId);
      
      if (isAdding) {
        adicionarHistoricoUnico(`membro-${membroId}`, `${nome} adicionado`);
      }
      
      return {
        ...prev,
        membros: isAdding
          ? [...prev.membros, membroId]
          : prev.membros.filter(id => id !== membroId)
      };
    });
  };

  const adicionarLink = () => {
    if (novoLink.trim() && isValidUrl(novoLink)) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, novoLink]
      }));
      setNovoLink('');
      adicionarHistoricoMultiplo('Link adicionado');
    } else {
      alert('Por favor, insira uma URL válida (deve começar com http:// ou https://)');
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const removerLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
    adicionarHistoricoMultiplo('Link removido');
  };

  const adicionarChecklist = () => {
    if (novaChecklist.trim()) {
      setFormData(prev => ({
        ...prev,
        checklists: [...prev.checklists, novaChecklist]
      }));
      setNovaChecklist('');
      adicionarHistoricoMultiplo('Checklist adicionada');
    }
  };

  const removerChecklist = (index) => {
    setFormData(prev => ({
      ...prev,
      checklists: prev.checklists.filter((_, i) => i !== index)
    }));
    adicionarHistoricoMultiplo('Checklist removida');
  };

  const conectarDropbox = () => {
    const DROPBOX_APP_KEY = '25553epqpjq0r83';
    const REDIRECT_URI = encodeURIComponent(window.location.origin + '/dropbox-callback');
    
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&response_type=token&redirect_uri=${REDIRECT_URI}`;
    
    window.open(authUrl, 'dropboxAuth', 'width=600,height=700');
    
    adicionarHistoricoUnico('dropbox', 'Conectando ao Dropbox...');

    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return;
      
      const { access_token } = event.data;
      if (access_token) {
        localStorage.setItem('dropbox_token', access_token);
        console.log('✅ Token Dropbox salvo localmente:', access_token.substring(0, 20) + '...');
        
        alert('✅ Dropbox conectado com sucesso!\nToken salvo localmente.');
        adicionarHistoricoUnico('dropbox-sucesso', 'Dropbox conectado');
        
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);
  };

  const getMembrosDisplay = () => {
    return formData.membros.map(membroId => {
      const usuario = usuarios.find(u => u.id === membroId);
      if (!usuario) return null;
      
      const nome = usuario.name || usuario.nome || '';
      const iniciais = nome.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
      const corAleatoria = `hsl(${membroId * 137.5 % 360}, 70%, 60%)`;
      
      return (
        <div 
          key={membroId} 
          className="membro-avatar" 
          title={nome}
          style={{ backgroundColor: corAleatoria }}
        >
          {iniciais}
        </div>
      );
    }).filter(Boolean);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const nome = (usuario.name || usuario.nome || '').toLowerCase();
    return nome.includes(searchMembro.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-task" onClick={handleClose}>
      <div className="modal-content-task" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-modal-task" onClick={handleClose}>
          <HiX />
        </button>

        <div className="modal-layout">
          <div className="modal-left">
            <form onSubmit={handleSubmit}>
              <div className="form-group-task">
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  onBlur={(e) => {
                    if (e.target.value) {
                      adicionarHistoricoUnico('titulo', 'Título definido');
                    }
                  }}
                  placeholder="Título da Tarefa"
                  className="input-title-task"
                  required
                />
              </div>

              <div className="form-row-task">
                <div className="form-group-task">
                  <label>
                    <HiUser /> Cliente / Empresa
                  </label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => {
                      setFormData({ ...formData, clienteId: e.target.value });
                      if (e.target.value) {
                        const cliente = clientes.find(c => c.id === parseInt(e.target.value));
                        adicionarHistoricoUnico('cliente', `Cliente: ${cliente?.nome}`);
                      }
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
                      if (e.target.value) {
                        const flag = flags.find(f => f.id === parseInt(e.target.value));
                        adicionarHistoricoUnico('prioridade', `Prioridade: ${flag?.nome}`);
                      }
                    }}
                    className="select-task select-prioridade"
                  >
                    <option value="">Selecione prioridade...</option>
                    {flags.length === 0 ? (
                      <option disabled>Nenhuma prioridade disponível</option>
                    ) : (
                      flags.map(flag => {
                        const nome = flag.nome || flag.name || '';
                        const cor = flag.cor || '#6c757d';
                        return (
                          <option 
                            key={flag.id} 
                            value={flag.id}
                            style={{ 
                              color: cor,
                              fontWeight: '600'
                            }}
                          >
                            ● {nome}
                          </option>
                        );
                      })
                    )}
                  </select>
                  {flags.length === 0 && (
                    <small style={{ color: '#dc3545', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      ⚠️ Nenhuma flag carregada. Verifique a API.
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group-task">
                <label>
                  <HiClock /> Prazo de Entrega
                </label>
                <DatePicker
                  selected={formData.dataVencimento}
                  onChange={(date) => {
                    setFormData({ ...formData, dataVencimento: date });
                    if (date) {
                      adicionarHistoricoUnico('prazo', `Prazo: ${date.toLocaleDateString('pt-BR')}`);
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione uma data"
                  className="datepicker-task"
                  todayButton="Hoje"
                  isClearable
                  minDate={new Date()}
                />
              </div>

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
                        <span>🔗 {link}</span>
                        <button
                          type="button"
                          onClick={() => removerLink(idx)}
                          className="btn-remove-item"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group-task">
                <label>
                  <HiCheckCircle /> Checklists
                </label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    value={novaChecklist}
                    onChange={(e) => setNovaChecklist(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarChecklist())}
                    placeholder="Nova checklist"
                    className="input-task"
                  />
                  <button type="button" onClick={adicionarChecklist} className="btn-add-item">
                    Criar
                  </button>
                </div>
                {formData.checklists.length > 0 && (
                  <div className="checklists-list">
                    {formData.checklists.map((checklist, idx) => (
                      <div key={idx} className="checklist-item">
                        <span>✓ {checklist}</span>
                        <button
                          type="button"
                          onClick={() => removerChecklist(idx)}
                          className="btn-remove-item"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer-task">
                <button type="submit" className="btn-submit-task" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>

          <div className="modal-right">
            <div className="sidebar-section">
              <h4>Histórico</h4>
              <div className="historico-list">
                {historico.length === 0 ? (
                  <p className="texto-vazio">Nenhuma ação ainda</p>
                ) : (
                  historico.map((item, idx) => (
                    <div key={idx} className="historico-item">
                      <span className="historico-acao">{item.acao}</span>
                      <span className="historico-data">{item.dataHora}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <h4>Membros</h4>
              <div className="membros-avatares">
                {getMembrosDisplay()}
                <button 
                  type="button" 
                  className="btn-add-membro"
                  onClick={() => setShowMembrosPicker(!showMembrosPicker)}
                  title="Adicionar membro"
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
                    value={searchMembro}
                    onChange={(e) => setSearchMembro(e.target.value)}
                  />
                  <div className="membros-picker-list">
                    {usuariosFiltrados.length === 0 ? (
                      <p className="texto-vazio">Nenhum usuário encontrado</p>
                    ) : (
                      usuariosFiltrados.map(usuario => {
                        const nome = usuario.name || usuario.nome || '';
                        const iniciais = nome.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
                        const isSelected = formData.membros.includes(usuario.id);
                        const corAleatoria = `hsl(${usuario.id * 137.5 % 360}, 70%, 60%)`;
                        
                        return (
                          <div 
                            key={usuario.id} 
                            className={`membro-picker-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleMembroToggle(usuario.id)}
                          >
                            <div 
                              className="membro-avatar-small"
                              style={{ backgroundColor: corAleatoria }}
                            >
                              {iniciais}
                            </div>
                            <span>{nome}</span>
                            {isSelected && <span className="check-icon">✓</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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
              <p className="dropbox-info">
                Conecte sua conta Dropbox para adicionar arquivos à tarefa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
