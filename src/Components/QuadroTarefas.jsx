import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  ArrowLeft, Plus, MoreVertical, Trash2, Edit2, 
  Archive, Filter, Calendar, Grid, Clock, X, CheckCircle, AlertCircle
} from 'lucide-react';
import kanbanService from '../services/kanbanService';
import ModalTarefa from './ModalTarefa';
import KanbanFilter from './KanbanFilter';
import CalendarioAnual from './CalendarioAnual';
import './QuadroTarefas.css';

export default function QuadroTarefas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quadro, setQuadro] = useState(null);
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal Tarefa
  const [showModalTarefa, setShowModalTarefa] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [listaIdSelecionada, setListaIdSelecionada] = useState(null);

  // ✅ MODAIS CRIAR/EDITAR LISTA
  const [showModalCriarLista, setShowModalCriarLista] = useState(false);
  const [showModalEditarLista, setShowModalEditarLista] = useState(false);
  const [listaParaEditar, setListaParaEditar] = useState(null);
  const [novoNomeLista, setNovoNomeLista] = useState('');
  const [nomeEditarLista, setNomeEditarLista] = useState('');

  // ✅ MODAL DE CONFIRMAÇÃO PARA EXCLUIR LISTA
  const [showModalConfirmarExclusao, setShowModalConfirmarExclusao] = useState(false);
  const [listaParaExcluir, setListaParaExcluir] = useState(null);

  // ✅ MODAL DE CONFIRMAÇÃO PARA ARQUIVAR TAREFA
  const [showModalArquivarTarefa, setShowModalArquivarTarefa] = useState(false);
  const [tarefaParaArquivar, setTarefaParaArquivar] = useState(null);

  // ✅ TOAST DE NOTIFICAÇÃO
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // View
  const [activeView, setActiveView] = useState('quadros');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtros avançados
  const [filters, setFilters] = useState({
    member: null,
    company: null,
    flags: []
  });

  const [menuListaAberto, setMenuListaAberto] = useState(null);

  useEffect(() => {
    carregarQuadro();
  }, [id]);

  // ✅ MOSTRAR TOAST
  function mostrarToast(message, type = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  }

  async function carregarQuadro() {
    try {
      setLoading(true);
      setError(null);

      const dadosQuadro = await kanbanService.getQuadro(id);
      setQuadro(dadosQuadro);

      const listasComTarefas = await kanbanService.listListasWithTarefas(id);
      
      const listasFormatadas = listasComTarefas.map(item => {
        const lista = item.listaResponse || item.lista || item;
        const tarefas = item.tarefas || [];
        
        return {
          id: lista.id || lista.listaId,
          titulo: lista.titulo || lista.nome,
          descricao: lista.descricao || '',
          quadroId: lista.quadroId || Number(id),
          tarefas: tarefas
        };
      });

      setListas(listasFormatadas);
    } catch (err) {
      console.error('❌ Erro ao carregar quadro:', err);
      setError('Erro ao carregar o quadro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function onDragEnd(result) {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (type === 'lista') {
      const novaOrdem = Array.from(listas);
      const [listaMovida] = novaOrdem.splice(source.index, 1);
      novaOrdem.splice(destination.index, 0, listaMovida);
      setListas(novaOrdem);
      return;
    }

    const listaOrigem = listas.find(l => l.id === Number(source.droppableId));
    const listaDestino = listas.find(l => l.id === Number(destination.droppableId));

    if (!listaOrigem || !listaDestino) return;

    const tarefasOrigem = Array.from(listaOrigem.tarefas);
    const [tarefaMovida] = tarefasOrigem.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      tarefasOrigem.splice(destination.index, 0, tarefaMovida);
      
      const novasListas = listas.map(lista =>
        lista.id === listaOrigem.id
          ? { ...lista, tarefas: tarefasOrigem }
          : lista
      );
      
      setListas(novasListas);
    } else {
      const tarefasDestino = Array.from(listaDestino.tarefas);
      tarefasDestino.splice(destination.index, 0, tarefaMovida);

      const novasListas = listas.map(lista => {
        if (lista.id === listaOrigem.id) {
          return { ...lista, tarefas: tarefasOrigem };
        }
        if (lista.id === listaDestino.id) {
          return { ...lista, tarefas: tarefasDestino };
        }
        return lista;
      });

      setListas(novasListas);

      try {
        await kanbanService.moveTarefa(
          Number(draggableId),
          listaDestino.id,
          Number(id)
        );
      } catch (err) {
        console.error('Erro ao mover tarefa:', err);
        carregarQuadro();
      }
    }
  }

  function abrirModalCriarTarefa(listaId) {
    setListaIdSelecionada(listaId);
    setTarefaParaEditar(null);
    setShowModalTarefa(true);
  }

  function abrirModalEditarTarefa(tarefa) {
    setTarefaParaEditar(tarefa);
    setListaIdSelecionada(tarefa.listaId?.id || tarefa.lista?.id || null);
    setShowModalTarefa(true);
  }

  // ✅ CRIAR NOVA LISTA
  async function criarNovaLista() {
    if (!novoNomeLista.trim()) {
      mostrarToast('Digite um nome para a lista', 'error');
      return;
    }

    try {
      const novaLista = await kanbanService.createLista({
        nome: novoNomeLista.trim(),
        posicao: listas.length,
        quadro: { id: Number(id) }
      });

      setListas([...listas, { 
        id: novaLista.id,
        titulo: novaLista.nome,
        descricao: '',
        quadroId: Number(id),
        tarefas: [] 
      }]);
      
      setShowModalCriarLista(false);
      setNovoNomeLista('');
      mostrarToast('Lista criada com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao criar lista:', err);
      mostrarToast('Erro ao criar lista. Tente novamente.', 'error');
    }
  }

  // ✅ ABRIR MODAL EDITAR LISTA
  function abrirModalEditarLista(lista) {
    setListaParaEditar(lista);
    setNomeEditarLista(lista.titulo);
    setShowModalEditarLista(true);
    setMenuListaAberto(null);
  }

  // ✅ EDITAR LISTA COM MODAL - CORRIGIDO
  async function editarLista() {
    if (!nomeEditarLista.trim()) {
      mostrarToast('Digite um nome para a lista', 'error');
      return;
    }

    if (!listaParaEditar || !listaParaEditar.id) {
      mostrarToast('Erro: ID da lista não encontrado', 'error');
      return;
    }

    try {
      console.log('📝 Editando lista:', {
        id: listaParaEditar.id,
        nome: nomeEditarLista.trim(),
        quadroId: Number(id)
      });

      const listaAtualizada = await kanbanService.updateLista({
        id: listaParaEditar.id,
        nome: nomeEditarLista.trim(),
        posicao: 0,
        quadro: { id: Number(id) }
      });

      setListas(listas.map(l =>
        l.id === listaParaEditar.id ? { ...l, titulo: listaAtualizada.nome } : l
      ));
      
      setShowModalEditarLista(false);
      setListaParaEditar(null);
      setNomeEditarLista('');
      mostrarToast('Lista editada com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao editar lista:', err);
      mostrarToast('Erro ao editar lista. Verifique o console.', 'error');
    }
  }

  // ✅ ABRIR MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
  function abrirModalConfirmarExclusao(lista) {
    setListaParaExcluir(lista);
    setShowModalConfirmarExclusao(true);
    setMenuListaAberto(null);
  }

  // ✅ CONFIRMAR EXCLUSÃO DA LISTA
  async function confirmarExclusaoLista() {
    if (!listaParaExcluir) return;

    const tarefasNaoArquivadas = (listaParaExcluir.tarefas || []).filter(t => !t.arquivado);
    const numTarefas = tarefasNaoArquivadas.length;

    try {
      setShowModalConfirmarExclusao(false);

      // ✅ Se tiver tarefas ativas, arquivar todas antes de deletar
      if (numTarefas > 0) {
        await Promise.all(
          tarefasNaoArquivadas.map(tarefa => 
            kanbanService.arquivarTarefa(tarefa.id)
          )
        );
      }

      await kanbanService.deleteLista(listaParaExcluir.id);
      setListas(listas.filter(l => l.id !== listaParaExcluir.id));
      setListaParaExcluir(null);
      mostrarToast('Lista excluída com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao excluir lista:', err);
      mostrarToast('Erro ao excluir lista. Tente novamente.', 'error');
    }
  }

  // ✅ ABRIR MODAL ARQUIVAR TAREFA
  function abrirModalArquivarTarefa(tarefa, event) {
    event.stopPropagation();
    setTarefaParaArquivar(tarefa);
    setShowModalArquivarTarefa(true);
  }

  // ✅ CONFIRMAR ARQUIVAMENTO DE TAREFA
  async function confirmarArquivarTarefa() {
    if (!tarefaParaArquivar) return;

    try {
      setShowModalArquivarTarefa(false);
      await kanbanService.arquivarTarefa(tarefaParaArquivar.id);
      mostrarToast('Tarefa arquivada com sucesso!', 'success');
      carregarQuadro();
      setTarefaParaArquivar(null);
    } catch (err) {
      console.error('Erro ao arquivar tarefa:', err);
      mostrarToast('Erro ao arquivar tarefa.', 'error');
    }
  }

  // ✅ OBTER TAREFAS PARA CALENDÁRIO
  function getTarefasParaCalendario() {
    const todasTarefas = [];
    listas.forEach(lista => {
      (lista.tarefas || []).forEach(tarefa => {
        if (tarefa.prazoFim && !tarefa.arquivado) {
          todasTarefas.push({
            id: tarefa.id,
            titulo: tarefa.titulo || tarefa.title,
            prazo: new Date(tarefa.prazoFim).toLocaleDateString('pt-BR'),
            prioridade: tarefa.flagsTarefaIds?.[0]?.nome || '',
            cliente: {
              nome: tarefa.clienteId?.nome || 'Sem cliente'
            }
          });
        }
      });
    });
    return todasTarefas;
  }

  function aplicarFiltro(tarefas) {
    let filtered = tarefas.filter(t => !t.arquivado);

    if (filtroTexto.trim()) {
      filtered = filtered.filter(tarefa =>
        tarefa.titulo?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        tarefa.descricao?.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }

    if (filters.member) {
      filtered = filtered.filter(tarefa => {
        const membros = tarefa.responsaveisIds || [];
        return membros.some(m => m.id === filters.member || m.responsaveisIds === filters.member);
      });
    }

    if (filters.company) {
      filtered = filtered.filter(tarefa =>
        tarefa.clienteId?.id === filters.company ||
        tarefa.clienteId?.clienteId === filters.company
      );
    }

    if (filters.flags && filters.flags.length > 0) {
      filtered = filtered.filter(tarefa => {
        const tarefaFlags = tarefa.flagsTarefaIds || [];
        return tarefaFlags.some(f => 
          filters.flags.includes(f.id) || filters.flags.includes(f.flagsTarefaIds)
        );
      });
    }

    return filtered;
  }

  function contarFiltrosAtivos() {
    let count = 0;
    if (filters.member) count++;
    if (filters.company) count++;
    if (filters.flags && filters.flags.length > 0) count += filters.flags.length;
    if (filtroTexto.trim()) count++;
    return count;
  }

  function getCorFlag(flags) {
    if (!flags || flags.length === 0) return '#94a3b8';
    const primeiraFlag = flags[0];
    return primeiraFlag.cor || '#4a67ff';
  }

  function getNomeFlag(flags) {
    if (!flags || flags.length === 0) return '';
    return flags[0].nome || '';
  }

  function getIniciaisMembro(membro) {
    const nome = membro.name || membro.nome || '';
    return nome.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }

  function formatarData(data) {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  function isDataProxima(data) {
    if (!data) return false;
    const hoje = new Date();
    const dataVencimento = new Date(data);
    const diffDias = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
    return diffDias <= 3 && diffDias >= 0;
  }

  function isDataAtrasada(data) {
    if (!data) return false;
    const hoje = new Date();
    const dataVencimento = new Date(data);
    return dataVencimento < hoje;
  }

  if (loading) {
    return (
      <div className="quadro-loading">
        <div className="loading-spinner"></div>
        <p>Carregando quadro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quadro-error">
        <p>{error}</p>
        <button onClick={carregarQuadro}>Tentar Novamente</button>
      </div>
    );
  }

  // ✅ VIEW: CALENDÁRIO
  if (activeView === 'calendario') {
    return (
      <div className="quadro-tarefas-container">
        <div className="quadro-header">
          <div className="header-left">
            <button className="btn-voltar" onClick={() => setActiveView('quadros')}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="quadro-titulo">Calendário - {quadro?.titulo}</h1>
          </div>
        </div>
        <CalendarioAnual tasks={getTarefasParaCalendario()} />
      </div>
    );
  }

  // ✅ VIEW: QUADRO (KANBAN)
  return (
    <div className="quadro-tarefas-container">
      {/* ✅ TOAST DE NOTIFICAÇÃO */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="quadro-header">
        <div className="header-left">
          <button className="btn-voltar" onClick={() => navigate('/kanban')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="quadro-titulo">{quadro?.titulo || 'Quadro'}</h1>
        </div>

        <div className="header-actions">
          <button
            className={`btn-view ${activeView === 'quadros' ? 'active' : ''}`}
            onClick={() => setActiveView('quadros')}
          >
            <Grid size={18} />
            Quadro
          </button>

          <button
            className={`btn-view ${activeView === 'calendario' ? 'active' : ''}`}
            onClick={() => setActiveView('calendario')}
          >
            <Calendar size={18} />
            Calendário
          </button>

          <button
            className="btn-view"
            onClick={() => navigate('/arquivados')}
          >
            <Archive size={18} />
            Arquivadas
          </button>

          <button
            className={`btn-filtro ${contarFiltrosAtivos() > 0 ? 'active' : ''}`}
            onClick={() => setMostrarFiltros(true)}
          >
            <Filter size={18} />
            Filtros
            {contarFiltrosAtivos() > 0 && (
              <span className="filter-badge">{contarFiltrosAtivos()}</span>
            )}
          </button>
        </div>
      </div>

      {/* BUSCA RÁPIDA */}
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar tarefas..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          className="input-filtro"
        />
      </div>

      {/* VIEW: QUADRO */}
      <div className="kanban-board">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="lista">
            {(provided) => (
              <div
                className="listas-container"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {listas.map((lista, index) => {
                  const tarefasFiltradas = aplicarFiltro(lista.tarefas || []);
                  
                  return (
                    <Draggable
                      key={lista.id}
                      draggableId={`lista-${lista.id}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="lista-coluna"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          {/* HEADER DA LISTA */}
                          <div className="lista-header" {...provided.dragHandleProps}>
                            <h3>{lista.titulo}</h3>
                            <span className="lista-count">
                              {tarefasFiltradas.length}
                              {tarefasFiltradas.length !== lista.tarefas.filter(t => !t.arquivado).length && (
                                <span className="lista-count-total">/{lista.tarefas.filter(t => !t.arquivado).length}</span>
                              )}
                            </span>
                            
                            <div className="lista-menu-container">
                              <button
                                className="btn-menu-lista"
                                onClick={() =>
                                  setMenuListaAberto(
                                    menuListaAberto === lista.id ? null : lista.id
                                  )
                                }
                              >
                                <MoreVertical size={16} />
                              </button>

                              {menuListaAberto === lista.id && (
                                <div className="menu-lista-dropdown">
                                  <button onClick={() => abrirModalEditarLista(lista)}>
                                    <Edit2 size={14} /> Editar
                                  </button>
                                  <button
                                    onClick={() => abrirModalConfirmarExclusao(lista)}
                                    className="btn-excluir"
                                  >
                                    <Trash2 size={14} /> Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* TAREFAS */}
                          <Droppable droppableId={String(lista.id)} type="tarefa">
                            {(provided, snapshot) => (
                              <div
                                className={`lista-tarefas ${
                                  snapshot.isDraggingOver ? 'dragging-over' : ''
                                }`}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {tarefasFiltradas.map((tarefa, idx) => {
                                  const flags = tarefa.flagsTarefaIds || [];
                                  const membros = tarefa.responsaveisIds || [];
                                  const cliente = tarefa.clienteId;
                                  const prazoFim = tarefa.prazoFim;

                                  return (
                                    <Draggable
                                      key={tarefa.id}
                                      draggableId={String(tarefa.id)}
                                      index={idx}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          className={`tarefa-card ${
                                            snapshot.isDragging ? 'dragging' : ''
                                          }`}
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          onClick={() => abrirModalEditarTarefa(tarefa)}
                                        >
                                          {/* ✅ BOTÃO ARQUIVAR */}
                                          <button
                                            className="btn-arquivar-tarefa"
                                            onClick={(e) => abrirModalArquivarTarefa(tarefa, e)}
                                            title="Arquivar tarefa"
                                          >
                                            <Archive size={14} />
                                          </button>

                                          {/* FLAG/PRIORIDADE */}
                                          {flags.length > 0 && (
                                            <div
                                              className="tarefa-flag"
                                              style={{
                                                backgroundColor: getCorFlag(flags)
                                              }}
                                            >
                                              {getNomeFlag(flags)}
                                            </div>
                                          )}

                                          {/* TÍTULO */}
                                          <h4 className="tarefa-titulo">{tarefa.titulo}</h4>
                                          
                                          {/* DESCRIÇÃO */}
                                          {tarefa.descricao && (
                                            <p className="tarefa-descricao">{tarefa.descricao}</p>
                                          )}

                                          {/* CLIENTE/EMPRESA */}
                                          {cliente && (
                                            <div className="tarefa-cliente-badge">
                                              <span>{cliente.nome}</span>
                                            </div>
                                          )}

                                          {/* FOOTER COM MEMBROS E DATA */}
                                          <div className="tarefa-footer">
                                            {/* MEMBROS COM FOTO */}
                                            {membros.length > 0 && (
                                              <div className="tarefa-membros">
                                                {membros.slice(0, 3).map((membro) => (
                                                  <div
                                                    key={membro.id || membro.responsaveisIds}
                                                    className="membro-avatar-card"
                                                    title={membro.name || membro.nome || ''}
                                                  >
                                                    {getIniciaisMembro(membro)}
                                                  </div>
                                                ))}
                                                {membros.length > 3 && (
                                                  <div className="membro-avatar-card membro-extra">
                                                    +{membros.length - 3}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                            
                                            {/* DATA DE VENCIMENTO */}
                                            {prazoFim && (
                                              <div className={`tarefa-data ${
                                                isDataAtrasada(prazoFim) ? 'atrasada' :
                                                isDataProxima(prazoFim) ? 'proxima' : ''
                                              }`}>
                                                <Clock size={12} />
                                                <span>{formatarData(prazoFim)}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>

                          <button
                            className="btn-add-tarefa"
                            onClick={() => abrirModalCriarTarefa(lista.id)}
                          >
                            <Plus size={16} />
                            Adicionar tarefa
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}

                {provided.placeholder}

                <button 
                  className="btn-nova-lista" 
                  onClick={() => setShowModalCriarLista(true)}
                >
                  <Plus size={20} />
                  Nova Lista
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* ✅ MODAL CRIAR LISTA */}
      {showModalCriarLista && (
        <div className="modal-mini-overlay" onClick={() => setShowModalCriarLista(false)}>
          <div className="modal-mini-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-mini-header">
              <h3>Nova Lista</h3>
              <button onClick={() => setShowModalCriarLista(false)} className="btn-close-mini">
                <X size={18} />
              </button>
            </div>
            <div className="modal-mini-body">
              <label>Nome da lista:</label>
              <input
                type="text"
                placeholder="Ex: A fazer, Em progresso..."
                value={novoNomeLista}
                onChange={(e) => setNovoNomeLista(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') criarNovaLista();
                  if (e.key === 'Escape') setShowModalCriarLista(false);
                }}
                autoFocus
              />
            </div>
            <div className="modal-mini-footer">
              <button 
                className="btn-cancelar" 
                onClick={() => {
                  setShowModalCriarLista(false);
                  setNovoNomeLista('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar" 
                onClick={criarNovaLista}
              >
                Criar Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL EDITAR LISTA */}
      {showModalEditarLista && (
        <div className="modal-mini-overlay" onClick={() => setShowModalEditarLista(false)}>
          <div className="modal-mini-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-mini-header">
              <h3>Editar Lista</h3>
              <button onClick={() => setShowModalEditarLista(false)} className="btn-close-mini">
                <X size={18} />
              </button>
            </div>
            <div className="modal-mini-body">
              <label>Nome da lista:</label>
              <input
                type="text"
                value={nomeEditarLista}
                onChange={(e) => setNomeEditarLista(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') editarLista();
                  if (e.key === 'Escape') setShowModalEditarLista(false);
                }}
                autoFocus
              />
            </div>
            <div className="modal-mini-footer">
              <button 
                className="btn-cancelar" 
                onClick={() => {
                  setShowModalEditarLista(false);
                  setListaParaEditar(null);
                  setNomeEditarLista('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar" 
                onClick={editarLista}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL: CONFIRMAR ARQUIVAR TAREFA */}
      {showModalArquivarTarefa && tarefaParaArquivar && (
        <div className="modal-confirmacao-overlay" onClick={() => setShowModalArquivarTarefa(false)}>
          <div className="modal-confirmacao-content modal-confirmacao-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirmacao-icon modal-icon-warning">
              <Archive size={40} />
            </div>
            
            <h3>Arquivar Tarefa</h3>
            
            <p className="modal-confirmacao-texto">
              Deseja arquivar a tarefa <strong>"{tarefaParaArquivar.titulo}"</strong>?
            </p>
            
            <div className="modal-confirmacao-footer">
              <button 
                className="btn-cancelar-exclusao" 
                onClick={() => {
                  setShowModalArquivarTarefa(false);
                  setTarefaParaArquivar(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-arquivar" 
                onClick={confirmarArquivarTarefa}
              >
                <Archive size={16} />
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL: CONFIRMAR EXCLUSÃO DE LISTA */}
      {showModalConfirmarExclusao && listaParaExcluir && (
        <div className="modal-confirmacao-overlay" onClick={() => setShowModalConfirmarExclusao(false)}>
          <div className="modal-confirmacao-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirmacao-icon">
              <Trash2 size={48} />
            </div>
            
            <h3>Excluir Lista</h3>
            
            <p className="modal-confirmacao-texto">
              Tem certeza que deseja excluir a lista <strong>"{listaParaExcluir.titulo}"</strong>?
            </p>
            
            {listaParaExcluir.tarefas?.filter(t => !t.arquivado).length > 0 && (
              <div className="modal-confirmacao-alerta">
                <div className="alerta-icon">⚠️</div>
                <div className="alerta-texto">
                  <strong>Esta lista contém {listaParaExcluir.tarefas.filter(t => !t.arquivado).length} tarefa(s) ativa(s).</strong>
                  <br />
                  Todas as tarefas serão automaticamente arquivadas.
                </div>
              </div>
            )}
            
            <div className="modal-confirmacao-footer">
              <button 
                className="btn-cancelar-exclusao" 
                onClick={() => {
                  setShowModalConfirmarExclusao(false);
                  setListaParaExcluir(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-exclusao" 
                onClick={confirmarExclusaoLista}
              >
                <Trash2 size={16} />
                Excluir Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FILTROS */}
      <KanbanFilter 
        isOpen={mostrarFiltros}
        onClose={() => setMostrarFiltros(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {/* MODAL DE TAREFA */}
      {showModalTarefa && (
        <ModalTarefa
          isOpen={showModalTarefa}
          onClose={() => {
            setShowModalTarefa(false);
            setTarefaParaEditar(null);
            setListaIdSelecionada(null);
          }}
          quadroId={Number(id)}
          listaId={listaIdSelecionada}
          tarefaParaEditar={tarefaParaEditar}
          // ✅ ÚNICA MUDANÇA: garantir reload completo antes de fechar
          onSucesso={async () => {
            await carregarQuadro();
          }}
        />
      )}
    </div>
  );
}
