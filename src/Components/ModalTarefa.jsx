import React, { useState, useEffect } from 'react';
import { 
  X, User, Tag, Clock, FileText, Link as LinkIcon, 
  CheckSquare, Users, Paperclip, Plus, Trash2, Send, MessageCircle
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import kanbanService from '../services/kanbanService';
import clientService from '../services/clientService';
import flagService from '../services/flagService';
import dropboxService from '../services/dropboxService';
import './ModalTarefa.css';

export default function ModalTarefa({ 
  isOpen, 
  onClose, 
  quadroId, 
  listaId, 
  tarefaParaEditar,
  onSucesso 
}) {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [flags, setFlags] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  const [showCreateFlag, setShowCreateFlag] = useState(false);
  const [newFlagNome, setNewFlagNome] = useState('');
  const [newFlagCor, setNewFlagCor] = useState('#4a67ff');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    clienteId: '',
    flagId: '',
    dataVencimento: null,
    membros: [],
    links: [],
    checklists: []
  });

  const [showMembrosPicker, setShowMembrosPicker] = useState(false);
  const [novoLink, setNovoLink] = useState('');
  const [novaChecklist, setNovaChecklist] = useState('');
  const [historico, setHistorico] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [dropboxConectado, setDropboxConectado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    if (isOpen) {
      console.log('🧪 ModalTarefa aberto');
      console.log('🧪 Props quadroId, listaId:', quadroId, listaId);
      console.log('🧪 tarefaParaEditar:', tarefaParaEditar);

      carregarDados();
      carregarUsuarioLogado();
      setDropboxConectado(dropboxService.isConnected());
      
      if (tarefaParaEditar) {
        preencherFormulario(tarefaParaEditar);
        carregarHistoricoComentarios(tarefaParaEditar.id);
      } else {
        resetFormulario();
        adicionarHistorico('Tarefa criada');
      }
    }
  }, [isOpen, tarefaParaEditar]);

  async function carregarUsuarioLogado() {
    try {
      const response = await fetch('http://localhost:8090/v1/user/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const user = await response.json();
      setUsuarioLogado(user);
    } catch (error) {
      console.error('Erro ao carregar usuário logado:', error);
    }
  }

  async function carregarHistoricoComentarios(tarefaId) {
    try {
      const historicoSalvo = localStorage.getItem(`historico_tarefa_${tarefaId}`);
      const comentariosSalvos = localStorage.getItem(`comentarios_tarefa_${tarefaId}`);
      
      if (historicoSalvo) {
        setHistorico(JSON.parse(historicoSalvo));
      }
      
      if (comentariosSalvos) {
        setComentarios(JSON.parse(comentariosSalvos));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  async function carregarDados() {
    try {
      const [clientesData, flagsData, usuariosData] = await Promise.all([
        clientService.list(),
        flagService.list(),
        fetch('http://localhost:8090/v1/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      ]);

      setClientes(clientesData);
      setFlags(flagsData.filter(f => f.ativo !== false));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  }

  // ✅ Ajustado para trabalhar só com IDs simples, alinhado ao payload
  function preencherFormulario(tarefa) {
    setFormData({
      titulo: tarefa.titulo || '',
      descricao: tarefa.descricao || '',
      clienteId: tarefa.clienteId?.clienteId || tarefa.clienteId?.id || '',
      flagId: tarefa.flagsTarefaIds?.[0]?.id || '',
      dataVencimento: tarefa.prazoFim ? new Date(tarefa.prazoFim) : null,
      membros: tarefa.responsaveisIds?.map(r => r.id) || [],
      links: tarefa.links || [],
      checklists: tarefa.checklists || []
    });
  }

  function resetFormulario() {
    setFormData({
      titulo: '',
      descricao: '',
      clienteId: '',
      flagId: '',
      dataVencimento: null,
      membros: [],
      links: [],
      checklists: []
    });
    setHistorico([]);
    setComentarios([]);
  }

  function adicionarHistorico(acao) {
    const dataHora = new Date().toLocaleString('pt-BR');
    const novoItem = { 
      acao, 
      dataHora,
      usuario: usuarioLogado?.name || 'Sistema'
    };
    setHistorico(prev => [...prev, novoItem]);
  }

  function adicionarComentario() {
    if (!novoComentario.trim()) return;

    const comentario = {
      id: Date.now(),
      texto: novoComentario.trim(),
      dataHora: new Date().toLocaleString('pt-BR'),
      usuario: {
        id: usuarioLogado?.id,
        nome: usuarioLogado?.name || 'Usuário',
        email: usuarioLogado?.email || ''
      }
    };

    setComentarios(prev => [...prev, comentario]);
    setNovoComentario('');
    adicionarHistorico(`Comentário adicionado: "${comentario.texto.substring(0, 30)}${comentario.texto.length > 30 ? '...' : ''}"`);
  }

  function getIniciaisUsuario(nome) {
    if (!nome) return '?';
    return nome.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }

  function getCorAvatar(nome) {
    const cores = ['#4a67ff', '#ff6b6b', '#51cf66', '#ffa94d', '#748ffc', '#ff8787'];
    const index = nome ? nome.charCodeAt(0) % cores.length : 0;
    return cores[index];
  }

  async function handleCreateFlag() {
    if (!newFlagNome.trim()) {
      alert('Digite um nome para a flag');
      return;
    }

    try {
      const novaFlag = await flagService.create({
        nome: newFlagNome.trim(),
        cor: newFlagCor,
        ativo: true
      });

      setFlags([...flags, novaFlag]);
      setFormData({ ...formData, flagId: novaFlag.id });
      setNewFlagNome('');
      setNewFlagCor('#4a67ff');
      setShowCreateFlag(false);
      adicionarHistorico(`Prioridade "${novaFlag.nome}" criada e selecionada`);
    } catch (error) {
      console.error('Erro ao criar flag:', error);
      alert('Erro ao criar flag. Talvez já exista uma com esse nome.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      alert('Digite um título para a tarefa');
      return;
    }

    console.log('🧪 handleSubmit() disparado');
    console.log('🧪 Props quadroId, listaId:', quadroId, listaId);
    console.log('🧪 tarefaParaEditar:', tarefaParaEditar);

    const quadroIdFinal =
      quadroId ??
      tarefaParaEditar?.quadroId?.id ??
      tarefaParaEditar?.quadro?.id ??
      tarefaParaEditar?.quadroId ??
      null;

    const listaIdFinal =
      listaId ??
      tarefaParaEditar?.listaId?.id ??
      tarefaParaEditar?.lista?.id ??
      tarefaParaEditar?.listaId ??
      null;

    console.log('🧪 quadroIdFinal:', quadroIdFinal, 'listaIdFinal:', listaIdFinal);

    if (!quadroIdFinal || !listaIdFinal) {
      alert('Erro: Quadro ou Lista não identificados');
      console.error('❌ quadroIdFinal ou listaIdFinal inválidos');
      console.error('quadroIdFinal:', quadroIdFinal, 'listaIdFinal:', listaIdFinal);
      console.error('tarefaParaEditar (estrutura real):', tarefaParaEditar);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        prazoInicio: formData.dataVencimento ? formData.dataVencimento.toISOString() : null,
        prazoFim: formData.dataVencimento ? formData.dataVencimento.toISOString() : null,
        dataCriacao: new Date().toISOString(),
        
        lista: { id: Number(listaIdFinal) },
        quadro: { id: Number(quadroIdFinal) },
        cliente: formData.clienteId ? { id: Number(formData.clienteId) } : null,
        
        flagTarefas: formData.flagId ? [{ id: Number(formData.flagId) }] : [],
        responsaveis: formData.membros.map(membroId => ({ id: Number(membroId) }))
      };

      console.log('🧪 Payload enviado para create/update tarefa:', payload);

      let tarefaCriada;

      if (tarefaParaEditar) {
        tarefaCriada = await kanbanService.updateTarefa({
          id: tarefaParaEditar.id,
          ...payload
        });
        adicionarHistorico('Tarefa atualizada com sucesso');
        alert('✅ Tarefa atualizada com sucesso!');
      } else {
        tarefaCriada = await kanbanService.createTarefa(payload);
        adicionarHistorico('Tarefa criada com sucesso');
        alert('✅ Tarefa criada com sucesso!');
      }

      if (tarefaCriada?.id) {
        localStorage.setItem(`historico_tarefa_${tarefaCriada.id}`, JSON.stringify(historico));
        localStorage.setItem(`comentarios_tarefa_${tarefaCriada.id}`, JSON.stringify(comentarios));
      } else if (tarefaParaEditar?.id) {
        localStorage.setItem(`historico_tarefa_${tarefaParaEditar.id}`, JSON.stringify(historico));
        localStorage.setItem(`comentarios_tarefa_${tarefaParaEditar.id}`, JSON.stringify(comentarios));
      }

      // ✅ aguarda o onSucesso (que recarrega quadro/listas) antes de fechar
      if (onSucesso) {
        await onSucesso();
      }
      handleClose();
    } catch (error) {
      console.error('❌ Erro ao salvar tarefa:', error);
      alert('❌ Erro ao salvar tarefa: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    resetFormulario();
    onClose();
  }

  function toggleMembro(membroId) {
    const jaExiste = formData.membros.includes(membroId);
    setFormData(prev => ({
      ...prev,
      membros: jaExiste
        ? prev.membros.filter(id => id !== membroId)
        : [...prev.membros, membroId]
    }));
    
    const usuario = usuarios.find(u => u.id === membroId);
    adicionarHistorico(
      jaExiste 
        ? `Membro "${usuario?.name}" removido` 
        : `Membro "${usuario?.name}" adicionado`
    );
  }

  function getMembrosDisplay() {
    return formData.membros.map(membroId => {
      const usuario = usuarios.find(u => u.id === membroId);
      if (!usuario) return null;
      
      const nome = usuario.name || usuario.nome || '';
      const iniciais = getIniciaisUsuario(nome);
      const cor = getCorAvatar(nome);
      
      return (
        <div 
          key={membroId} 
          className="membro-avatar" 
          style={{ backgroundColor: cor }}
          title={nome}
        >
          {iniciais}
        </div>
      );
    }).filter(Boolean);
  }

  function adicionarLink() {
    if (!novoLink.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, novoLink.trim()]
    }));
    setNovoLink('');
    adicionarHistorico(`Link adicionado: ${novoLink.trim()}`);
  }

  function removerLink(index) {
    const linkRemovido = formData.links[index];
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
    adicionarHistorico(`Link removido: ${linkRemovido}`);
  }

  function adicionarChecklist() {
    if (!novaChecklist.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      checklists: [...prev.checklists, { id: Date.now(), nome: novaChecklist.trim(), concluido: false }]
    }));
    setNovaChecklist('');
    adicionarHistorico(`Checklist adicionada: "${novaChecklist.trim()}"`);
  }

  function toggleChecklist(id) {
    const item = formData.checklists.find(c => c.id === id);
    setFormData(prev => ({
      ...prev,
      checklists: prev.checklists.map(item =>
        item.id === id ? { ...item, concluido: !item.concluido } : item
      )
    }));
    if (item) {
      adicionarHistorico(`Checklist "${item.nome}" marcada como ${!item.concluido ? 'concluída' : 'pendente'}`);
    }
  }

  function removerChecklist(id) {
    const itemRemovido = formData.checklists.find(c => c.id === id);
    setFormData(prev => ({
      ...prev,
      checklists: prev.checklists.filter(item => item.id !== id)
    }));
    if (itemRemovido) {
      adicionarHistorico(`Checklist removida: "${itemRemovido.nome}"`);
    }
  }

  function conectarDropbox() {
    const DROPBOX_APP_KEY = '25553epqpjq0r83';
    const REDIRECT_URI = encodeURIComponent(window.location.origin + '/dropbox-callback');
    
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&response_type=token&redirect_uri=${REDIRECT_URI}`;
    
    const popup = window.open(authUrl, 'dropboxAuth', 'width=600,height=700');
    
    window.addEventListener('message', (event) => {
      if (event.data.access_token) {
        localStorage.setItem('dropbox_token', event.data.access_token);
        setDropboxConectado(true);
        adicionarHistorico('Dropbox conectado com sucesso');
        popup?.close();
      }
    });
  }

  function desconectarDropbox() {
    dropboxService.disconnect();
    setDropboxConectado(false);
    adicionarHistorico('Dropbox desconectado');
  }

  if (!isOpen) return null;

  return (
    <div className="modal-tarefa-overlay" onClick={handleClose}>
      <div className="modal-tarefa-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-modal" onClick={handleClose}>
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* COLUNA ESQUERDA */}
          <div className="modal-left">
            {/* TÍTULO */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Título da tarefa"
                value={formData.titulo}
                onChange={(e) => {
                  const novoTitulo = e.target.value;
                  setFormData({ ...formData, titulo: novoTitulo });
                }}
                className="input-titulo"
                required
              />
            </div>

            {/* CLIENTE */}
            <div className="form-group">
              <label>
                <User size={16} />
                Cliente
              </label>
              <select
                value={formData.clienteId}
                onChange={(e) => {
                  setFormData({ ...formData, clienteId: e.target.value });
                  const cliente = clientes.find(c => c.id === Number(e.target.value));
                  if (cliente) adicionarHistorico(`Cliente "${cliente.nome}" selecionado`);
                }}
                className="select-field"
              >
                <option value="">Selecione...</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* PRIORIDADE */}
            <div className="form-group">
              <label>
                <Tag size={16} />
                Prioridade
              </label>
              
              {!showCreateFlag ? (
                <div className="priority-selector">
                  <select
                    value={formData.flagId}
                    onChange={(e) => {
                      setFormData({ ...formData, flagId: e.target.value });
                      const flag = flags.find(f => f.id === Number(e.target.value));
                      if (flag) adicionarHistorico(`Prioridade "${flag.nome}" selecionada`);
                    }}
                    className="select-field"
                  >
                    <option value="">Selecione...</option>
                    {flags.map(flag => (
                      <option key={flag.id} value={flag.id}>
                        {flag.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-add-flag-inline"
                    onClick={() => setShowCreateFlag(true)}
                    title="Criar nova prioridade"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <div className="create-flag-inline">
                  <input
                    type="text"
                    placeholder="Nome da prioridade"
                    value={newFlagNome}
                    onChange={(e) => setNewFlagNome(e.target.value)}
                    className="input-flag-nome"
                    maxLength={30}
                  />
                  <input
                    type="color"
                    value={newFlagCor}
                    onChange={(e) => setNewFlagCor(e.target.value)}
                    className="input-flag-cor"
                  />
                  <button
                    type="button"
                    className="btn-save-flag"
                    onClick={handleCreateFlag}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="btn-cancel-flag"
                    onClick={() => {
                      setShowCreateFlag(false);
                      setNewFlagNome('');
                      setNewFlagCor('#4a67ff');
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* PRAZO */}
            <div className="form-group">
              <label>
                <Clock size={16} />
                Prazo de Entrega
              </label>
              <DatePicker
                selected={formData.dataVencimento}
                onChange={(date) => {
                  setFormData({ ...formData, dataVencimento: date });
                  if (date) adicionarHistorico(`Prazo de entrega definido: ${date.toLocaleDateString('pt-BR')}`);
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                className="date-picker-input"
              />
            </div>

            {/* DESCRIÇÃO */}
            <div className="form-group">
              <label>
                <FileText size={16} />
                Descrição
              </label>
              <textarea
                placeholder="Adicione uma descrição detalhada..."
                value={formData.descricao}
                onChange={(e) => {
                  setFormData({ ...formData, descricao: e.target.value });
                }}
                onBlur={() => {
                  if (formData.descricao && formData.descricao.trim()) {
                    adicionarHistorico('Descrição adicionada/modificada');
                  }
                }}
                className="textarea-field"
                rows={4}
              />
            </div>

            {/* LINKS */}
            <div className="form-group">
              <label>
                <LinkIcon size={16} />
                Links
              </label>
              <div className="links-container">
                {formData.links.map((link, index) => (
                  <div key={index} className="link-item">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                    <button
                      type="button"
                      onClick={() => removerLink(index)}
                      className="btn-remove-link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="add-link-row">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={novoLink}
                    onChange={(e) => setNovoLink(e.target.value)}
                    className="input-link"
                  />
                  <button
                    type="button"
                    onClick={adicionarLink}
                    className="btn-add-item"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* CHECKLIST */}
            <div className="form-group">
              <label>
                <CheckSquare size={16} />
                Checklist
              </label>
              <div className="checklist-container">
                {formData.checklists.map((item) => (
                  <div key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.concluido}
                      onChange={() => toggleChecklist(item.id)}
                    />
                    <span className={item.concluido ? 'concluido' : ''}>
                      {item.nome}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerChecklist(item.id)}
                      className="btn-remove-checklist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="add-checklist-row">
                  <input
                    type="text"
                    placeholder="Nova checklist..."
                    value={novaChecklist}
                    onChange={(e) => setNovaChecklist(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        adicionarChecklist();
                      }
                    }}
                    className="input-checklist"
                  />
                  <button
                    type="button"
                    onClick={adicionarChecklist}
                    className="btn-add-item"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* BOTÃO SALVAR */}
            <button type="submit" className="btn-criar-tarefa" disabled={loading}>
              {loading ? 'Salvando...' : (tarefaParaEditar ? 'Atualizar Tarefa' : 'Criar Tarefa')}
            </button>
          </div>

          {/* COLUNA DIREITA */}
          <div className="modal-right">
            {/* COMENTÁRIOS */}
            <div className="section-comentarios">
              <h3>
                <MessageCircle size={16} />
                COMENTÁRIOS
              </h3>
              
              <div className="comentarios-list">
                {comentarios.map((comentario) => (
                  <div key={comentario.id} className="comentario-item">
                    <div className="comentario-header">
                      <div 
                        className="comentario-avatar"
                        style={{ backgroundColor: getCorAvatar(comentario.usuario.nome) }}
                        title={comentario.usuario.nome}
                      >
                        {getIniciaisUsuario(comentario.usuario.nome)}
                      </div>
                      <div className="comentario-info">
                        <span className="comentario-nome">{comentario.usuario.nome}</span>
                        <span className="comentario-data">{comentario.dataHora}</span>
                      </div>
                    </div>
                    <p className="comentario-texto">{comentario.texto}</p>
                  </div>
                ))}
              </div>

              <div className="comentario-input-container">
                <textarea
                  placeholder="Escreva um comentário..."
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className="comentario-input"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={adicionarComentario}
                  className="btn-enviar-comentario"
                  disabled={!novoComentario.trim()}
                >
                  <Send size={16} />
                  Enviar
                </button>
              </div>
            </div>

            {/* HISTÓRICO */}
            <div className="section-historico">
              <h3>HISTÓRICO</h3>
              <div className="historico-list">
                {historico.map((item, index) => (
                  <div key={index} className="historico-item">
                    <p>{item.acao}</p>
                    <span>{item.dataHora}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MEMBROS */}
            <div className="section-membros">
              <h3>
                <Users size={16} />
                MEMBROS
              </h3>
              <div className="membros-display">
                {getMembrosDisplay()}
                <button
                  type="button"
                  className="btn-add-membro"
                  onClick={() => setShowMembrosPicker(!showMembrosPicker)}
                >
                  <Plus size={16} />
                </button>
              </div>

              {showMembrosPicker && (
                <div className="membros-picker">
                  {usuarios.map(usuario => (
                    <div
                      key={usuario.id}
                      className={`membro-option ${formData.membros.includes(usuario.id) ? 'selected' : ''}`}
                      onClick={() => toggleMembro(usuario.id)}
                    >
                      <div 
                        className="membro-option-avatar"
                        style={{ backgroundColor: getCorAvatar(usuario.name || usuario.nome) }}
                      >
                        {getIniciaisUsuario(usuario.name || usuario.nome)}
                      </div>
                      <span>{usuario.name || usuario.nome}</span>
                      {formData.membros.includes(usuario.id) && <span className="check-icon">✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DROPBOX */}
            <div className="section-anexos">
              <h3>
                <Paperclip size={16} />
                ANEXOS
              </h3>
              <div className={`dropbox-status ${dropboxConectado ? 'connected' : ''}`}>
                {dropboxConectado ? (
                  <>
                    <p>✓ Dropbox conectado</p>
                    <button type="button" onClick={desconectarDropbox} className="btn-disconnect">
                      Desconectar
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={conectarDropbox} className="btn-connect-dropbox">
                    Conectar Dropbox
                  </button>
                )}
                <p className="dropbox-hint">
                  Conecte sua conta Dropbox para anexar arquivos às tarefas
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
