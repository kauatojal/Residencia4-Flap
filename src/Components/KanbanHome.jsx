import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Archive, X, Check } from 'lucide-react';
import kanbanService from '../services/kanbanService';
import ModalConfirmacao from './ModalConfirmacao';
import './KanbanHome.css';

export default function KanbanHome() {
  const navigate = useNavigate();
  const [quadros, setQuadros] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de confirmação
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [quadroParaArquivar, setQuadroParaArquivar] = useState(null);

  // Formulário de criar quadro
  const [showFormCriar, setShowFormCriar] = useState(false);
  const [novoQuadroNome, setNovoQuadroNome] = useState('');
  const [corSelecionada, setCorSelecionada] = useState('#16a085');
  const [criandoQuadro, setCriandoQuadro] = useState(false);
  const [modoCorCustomizada, setModoCorCustomizada] = useState(false);

  // Cores pré-definidas
  const coresDisponiveis = [
    { hex: '#16a085', gradient: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)', nome: 'Verde' },
    { hex: '#2980b9', gradient: 'linear-gradient(135deg, #2980b9 0%, #3498db 100%)', nome: 'Azul' },
    { hex: '#8e44ad', gradient: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)', nome: 'Roxo' },
    { hex: '#d35400', gradient: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)', nome: 'Laranja' }
  ];

  useEffect(() => {
    carregarQuadros();
  }, []);

  async function carregarQuadros() {
    try {
      setLoading(true);
      const data = await kanbanService.listQuadros();
      const quadrosAtivos = data.filter(q => !q.arquivado);
      setQuadros(quadrosAtivos);
    } catch (error) {
      console.error('Erro ao carregar quadros:', error);
    } finally {
      setLoading(false);
    }
  }

  function abrirFormCriar() {
    setShowFormCriar(true);
    setNovoQuadroNome('');
    setCorSelecionada('#16a085');
    setModoCorCustomizada(false);
  }

  function fecharFormCriar() {
    setShowFormCriar(false);
    setNovoQuadroNome('');
    setCorSelecionada('#16a085');
    setModoCorCustomizada(false);
  }

  function selecionarCor(cor) {
    setCorSelecionada(cor);
    setModoCorCustomizada(false);
  }

  function selecionarCorCustomizada(e) {
    setCorSelecionada(e.target.value);
    setModoCorCustomizada(true);
  }

  async function criarNovoQuadro(e) {
    e.preventDefault();
    
    if (!novoQuadroNome.trim()) {
      alert('Digite um nome para o quadro');
      return;
    }

    setCriandoQuadro(true);

    try {
      // ✅ CORRIGIDO: Removido campo "descricao"
      const novoQuadro = await kanbanService.createQuadro({
        titulo: novoQuadroNome.trim(),
        cor: corSelecionada
      });

      const quadroComCor = { ...novoQuadro, cor: corSelecionada };
      setQuadros([...quadros, quadroComCor]);
      
      fecharFormCriar();
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      alert('Erro ao criar quadro. Tente novamente.');
    } finally {
      setCriandoQuadro(false);
    }
  }

  function abrirModalArquivar(quadro, e) {
    e.stopPropagation();
    setQuadroParaArquivar(quadro);
    setShowModalConfirmar(true);
  }

  async function confirmarArquivar() {
    if (!quadroParaArquivar) return;

    try {
      await kanbanService.arquivarQuadro(quadroParaArquivar.id);
      setQuadros(quadros.filter(q => q.id !== quadroParaArquivar.id));
      setShowModalConfirmar(false);
      setQuadroParaArquivar(null);
    } catch (error) {
      console.error('Erro ao arquivar quadro:', error);
      alert('Erro ao arquivar quadro.');
    }
  }

  function abrirQuadro(id) {
    navigate(`/kanban/${id}`);
  }

  function getCorQuadro(index, quadro) {
    if (quadro?.cor) {
      // Se for uma cor customizada (hex)
      if (quadro.cor.startsWith('#')) {
        // Criar gradiente automaticamente
        return `linear-gradient(135deg, ${quadro.cor} 0%, ${quadro.cor}dd 100%)`;
      }
      // Se for uma das cores pré-definidas
      const corEncontrada = coresDisponiveis.find(c => c.hex === quadro.cor);
      if (corEncontrada) return corEncontrada.gradient;
    }
    
    // Senão, usa alternância por índice
    const cores = coresDisponiveis.map(c => c.gradient);
    return cores[index % cores.length];
  }

  if (loading) {
    return (
      <div className="kanban-home-loading">
        <div className="loading-spinner"></div>
        <p>Carregando quadros...</p>
      </div>
    );
  }

  return (
    <div className="kanban-home-container">
      <div className="kanban-home-header">
        <h1>Seus Quadros</h1>
      </div>
      
      <div className="quadros-grid">
        {quadros.map((quadro, index) => (
          <div
            key={quadro.id}
            className="quadro-card"
            style={{ background: getCorQuadro(index, quadro) }}
            onClick={() => abrirQuadro(quadro.id)}
          >
            <div className="quadro-card-content">
              <h3>{quadro.titulo}</h3>
              {quadro.descricao && <p>{quadro.descricao}</p>}
            </div>
            
            <button
              className="btn-arquivar-quadro"
              onClick={(e) => abrirModalArquivar(quadro, e)}
              title="Arquivar quadro"
            >
              <Archive size={16} />
            </button>
          </div>
        ))}

        {/* Formulário Criar Quadro */}
        {!showFormCriar ? (
          <div className="quadro-card quadro-card-novo" onClick={abrirFormCriar}>
            <Plus size={32} />
            <span>Criar Quadro</span>
          </div>
        ) : (
          <div className="quadro-card quadro-card-form">
            <button className="btn-fechar-form" onClick={fecharFormCriar}>
              <X size={18} />
            </button>

            <form onSubmit={criarNovoQuadro}>
              <h3>Novo Quadro</h3>

              <div className="form-group-criar">
                <label>Nome do Quadro</label>
                <input
                  type="text"
                  value={novoQuadroNome}
                  onChange={(e) => setNovoQuadroNome(e.target.value)}
                  placeholder="Ex: Projeto Marketing"
                  className="input-criar-quadro"
                  autoFocus
                  maxLength={50}
                />
              </div>

              <div className="form-group-criar">
                <label>Escolha uma cor</label>
                <div className="cores-container">
                  {/* Cores Pré-definidas + Color Picker */}
                  <div className="cores-grid">
                    {coresDisponiveis.map((cor) => (
                      <button
                        key={cor.hex}
                        type="button"
                        className={`cor-opcao ${!modoCorCustomizada && corSelecionada === cor.hex ? 'selected' : ''}`}
                        style={{ background: cor.gradient }}
                        onClick={() => selecionarCor(cor.hex)}
                        title={cor.nome}
                      >
                        {!modoCorCustomizada && corSelecionada === cor.hex && <Check size={20} />}
                      </button>
                    ))}
                    
                    {/* Color Picker Customizado */}
                    <div className="cor-customizada-wrapper">
                      <label 
                        htmlFor="color-picker" 
                        className={`cor-opcao cor-customizada ${modoCorCustomizada ? 'selected' : ''}`}
                        style={{ 
                          background: modoCorCustomizada 
                            ? corSelecionada 
                            : 'linear-gradient(45deg, #ff0000 0%, #ffff00 25%, #00ff00 50%, #00ffff 75%, #0000ff 100%)'
                        }}
                        title="Escolher cor personalizada"
                      >
                        {modoCorCustomizada && <Check size={20} />}
                        <input
                          id="color-picker"
                          type="color"
                          value={corSelecionada}
                          onChange={selecionarCorCustomizada}
                          className="color-picker-input"
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* Preview da Cor Selecionada */}
                  <div className="cor-preview">
                    <span className="cor-preview-label">Cor selecionada:</span>
                    <div 
                      className="cor-preview-box" 
                      style={{ 
                        background: modoCorCustomizada 
                          ? corSelecionada 
                          : coresDisponiveis.find(c => c.hex === corSelecionada)?.gradient 
                      }}
                    ></div>
                    <span className="cor-preview-hex">{corSelecionada.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="btn-cancelar-form"
                  onClick={fecharFormCriar}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-criar-form"
                  disabled={criandoQuadro || !novoQuadroNome.trim()}
                >
                  {criandoQuadro ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showModalConfirmar && (
        <ModalConfirmacao
          isOpen={showModalConfirmar}
          onClose={() => {
            setShowModalConfirmar(false);
            setQuadroParaArquivar(null);
          }}
          onConfirm={confirmarArquivar}
          titulo="Arquivar Quadro"
          mensagem={`Deseja realmente arquivar o quadro "${quadroParaArquivar?.titulo}"?`}
          textoBotaoConfirmar="Arquivar"
          tipoBotao="warning"
        />
      )}
    </div>
  );
}
