import React, { useState } from 'react';
import './KanbanHome.css';
import { FiGrid, FiPlus } from 'react-icons/fi';

export default function KanbanHome({ onSelectKanban }) {
  const quadros = [
    {
      id: 'flap',
      nome: 'Flap',
      thumbnail: null,
      cor: '#4a67ff',
      tarefas: {
        'INICIAR (2)': [
          { id: 1, name: 'Revisar Layout', client: 'Cliente A', tags: [{ nome: 'Normal', cor: '#f59e0b' }], prazo: '15/10/2025', status: 'No prazo', membros: 3, comentarios: 45 },
          { id: 2, name: 'Criar Protótipo', client: 'Cliente B', tags: [{ nome: 'Urgente', cor: '#ef4444' }], prazo: '08/10/2025', status: 'No prazo', membros: 5, comentarios: 78 }
        ],
        'FAZENDO (1)': [
          { id: 3, name: 'Implementar API', client: 'Cliente D', tags: [{ nome: 'Normal', cor: '#f59e0b' }], prazo: '05/10/2025', status: 'No prazo', membros: 4, comentarios: 112 }
        ],
        'REFAÇÃO (1)': [
          { id: 4, name: 'Corrigir Bugs', client: 'Cliente G', tags: [{ nome: 'Urgente', cor: '#ef4444' }, { nome: 'Atrasado', cor: '#dc2626' }], prazo: '01/10/2025', status: 'Atrasado', membros: 2, comentarios: 34 }
        ],
        'REVISÃO (1)': [
          { id: 5, name: 'Testar Funcionalidades', client: 'Cliente J', tags: [{ nome: 'Normal', cor: '#f59e0b' }], prazo: '10/10/2025', status: 'No prazo', membros: 1, comentarios: 12 }
        ]
      }
    },
    {
      id: 'marketing',
      nome: 'Marketing Digital',
      thumbnail: null,
      cor: '#10b981',
      tarefas: {
        'A FAZER (2)': [
          { id: 6, name: 'Campanha Redes Sociais', client: 'Empresa X', tags: [{ nome: 'Urgente', cor: '#ef4444' }], prazo: '20/10/2025', status: 'No prazo', membros: 3, comentarios: 8 },
          { id: 7, name: 'Post Instagram', client: 'Empresa Y', tags: [{ nome: 'Normal', cor: '#f59e0b' }], prazo: '18/10/2025', status: 'No prazo', membros: 2, comentarios: 5 }
        ],
        'EM ANDAMENTO (1)': [
          { id: 8, name: 'Análise de Métricas', client: 'Empresa X', tags: [{ nome: 'Normal', cor: '#f59e0b' }], prazo: '22/10/2025', status: 'No prazo', membros: 1, comentarios: 15 }
        ],
        'CONCLUÍDO (0)': []
      }
    },
    {
      id: 'desenvolvimento',
      nome: 'Desenvolvimento Web',
      thumbnail: null,
      cor: '#8b5cf6',
      tarefas: {
        'BACKLOG (3)': [
          { id: 9, name: 'Sistema de Login', client: 'Projeto Interno', tags: [{ nome: 'Feature', cor: '#10b981' }], prazo: '25/10/2025', status: 'No prazo', membros: 2, comentarios: 6 },
          { id: 10, name: 'Dashboard Admin', client: 'Projeto Interno', tags: [{ nome: 'Feature', cor: '#10b981' }], prazo: '30/10/2025', status: 'No prazo', membros: 3, comentarios: 12 },
          { id: 11, name: 'Integração API', client: 'Cliente Z', tags: [{ nome: 'Bug', cor: '#ef4444' }], prazo: '19/10/2025', status: 'No prazo', membros: 1, comentarios: 3 }
        ],
        'SPRINT ATUAL (1)': [
          { id: 12, name: 'Refatoração Código', client: 'Projeto Interno', tags: [{ nome: 'Melhoria', cor: '#06b6d4' }], prazo: '17/10/2025', status: 'No prazo', membros: 2, comentarios: 24 }
        ],
        'REVIEW (0)': [],
        'DONE (0)': []
      }
    }
  ];

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [novoQuadro, setNovoQuadro] = useState({ nome: '', cor: '#4a67ff' });

  const cores = ['#4a67ff', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  const criarQuadro = () => {
    if (novoQuadro.nome.trim()) {
      const quadro = {
        id: novoQuadro.nome.toLowerCase().replace(/\s+/g, '-'),
        nome: novoQuadro.nome,
        thumbnail: null,
        cor: novoQuadro.cor,
        tarefas: {
          'A FAZER (0)': [],
          'EM ANDAMENTO (0)': [],
          'CONCLUÍDO (0)': []
        }
      };
      
      onSelectKanban(quadro);
      setNovoQuadro({ nome: '', cor: '#4a67ff' });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="kanban-home">
      <div className="kanban-home-header">
        <div className="header-title">
          <FiGrid size={24} />
          <h2>Seus Quadros</h2>
        </div>
      </div>

      <div className="quadros-recentes">
        {quadros.map(quadro => (
          <div
            key={quadro.id}
            className="quadro-card"
            onClick={() => onSelectKanban(quadro)}
            style={{ background: quadro.cor }}
          >
            <div className="quadro-overlay"></div>
            <h3>{quadro.nome}</h3>
          </div>
        ))}
      </div>

      <div className="kanban-home-section">
        <div className="criar-quadro-section">
          <h2>Criar Novo Quadro</h2>
          <p>Organize suas tarefas criando um novo quadro personalizado para seu projeto ou equipe.</p>
          <button 
            className="btn-criar-novo-quadro"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={20} />
            Criar Quadro
          </button>
        </div>
      </div>

      {/* Modal Criar Quadro */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-criar-quadro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Criar Novo Quadro</h2>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-field">
                <label>Nome do Quadro *</label>
                <input 
                  type="text"
                  placeholder="Ex: Projetos 2025, Marketing..."
                  value={novoQuadro.nome}
                  onChange={(e) => setNovoQuadro({...novoQuadro, nome: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label>Cor de Destaque</label>
                <div className="cores-grid">
                  {cores.map(cor => (
                    <button
                      key={cor}
                      className={`cor-option ${novoQuadro.cor === cor ? 'selected' : ''}`}
                      style={{ background: cor }}
                      onClick={() => setNovoQuadro({...novoQuadro, cor})}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button 
                className="btn-criar" 
                onClick={criarQuadro}
                disabled={!novoQuadro.nome.trim()}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
