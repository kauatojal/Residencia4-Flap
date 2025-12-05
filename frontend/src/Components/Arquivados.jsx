import React, { useEffect, useState } from "react";
import "./Arquivados.css";
import Swal from "sweetalert2";
import { Search, Eye, RotateCcw, Trash2, Layout, User, Calendar, CheckSquare } from "lucide-react";

export default function Arquivados() {
  const [activeTab, setActiveTab] = useState("quadros");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  async function loadItems() {
    setLoading(true);
    try {
      if (activeTab === "quadros") {
        const response = await fetch('http://localhost:8090/v1/quadro/all', { headers: getHeaders() });
        if (response.ok) {
          const todosQuadros = await response.json();
          
          const lista = todosQuadros
            .filter(q => q.arquivado === true)
            .map(q => ({
              ...q,
              type: 'quadro',
              dataCriacao: q.dataCriacao ? new Date(q.dataCriacao).toLocaleDateString('pt-BR') : "N/A",
              dataArquivamento: q.dataArquivamento ? new Date(q.dataArquivamento).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
              prioridade: q.prioridade || "Média",
              cliente: {
                nome: "Flap Soluções",
                logo: null,
                ...q.cliente
              }
            }));
          setItems(lista);
        }
      } else if (activeTab === "clientes") {
        const response = await fetch('http://localhost:8090/v1/cliente/all', { headers: getHeaders() });
        if (response.ok) {
          const todosClientes = await response.json();
          const lista = todosClientes
            .filter(c => c.arquivado === true)
            .map(c => ({
              ...c,
              type: 'cliente',
              titulo: c.nome,
              descricao: c.empresa || "Empresa não informada",
              dataCriacao: "N/A",
              dataArquivamento: "Recentemente"
            }));
          setItems(lista);
        }
      } else if (activeTab === "tarefas") {
        const quadrosResponse = await fetch('http://localhost:8090/v1/quadro/all', { headers: getHeaders() });
        
        if (quadrosResponse.ok) {
          const todosQuadros = await quadrosResponse.json();
          let todasTarefasArquivadas = [];
          
          for (const quadro of todosQuadros) {
            const tarefasResponse = await fetch(
              `http://localhost:8090/v1/tarefa/all/arquivadas/${quadro.id}`,
              { headers: getHeaders() }
            );
            
            if (tarefasResponse.ok) {
              const tarefasArquivadas = await tarefasResponse.json();
              todasTarefasArquivadas.push(...tarefasArquivadas);
            }
          }
          
          const lista = todasTarefasArquivadas.map(t => ({
            ...t,
            type: 'tarefa',
            titulo: t.titulo,
            descricao: t.descricao || "Sem descrição",
            dataCriacao: t.dataCriacao ? new Date(t.dataCriacao).toLocaleDateString('pt-BR') : "N/A",
            dataArquivamento: "Recentemente",
            cliente: t.clienteId || { nome: "Sem cliente" },
            prioridade: t.flagsTarefaIds?.[0]?.nome || "Média"
          }));
          
          setItems(lista);
        }
      }
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const handleVisualizar = (item) => {
    const isQuadro = item.type === 'quadro';
    const isTarefa = item.type === 'tarefa';
    
    const logoUrl = isQuadro || isTarefa ? item.cliente?.logo : item.logo;
    const logoLetter = (isQuadro || isTarefa ? item.cliente?.nome : item.titulo)?.charAt(0) || 'C';
    const mainTitle = item.titulo;

    const logoHtml = logoUrl 
      ? `<img src="${logoUrl}" class="modal-logo-img" />`
      : `<div class="modal-logo-placeholder">${logoLetter}</div>`;

    let badgeHtml = '';
    if (isQuadro || isTarefa) {
       const p = item.prioridade || 'Média';
       badgeHtml = `<span class="modal-priority-badge ${p.toLowerCase()}">Prioridade ${p}</span>`;
    }

    let detailsHtml = '';
    if (isTarefa) {
      detailsHtml = `
        <div class="modal-detail-row">
          <span class="label">Cliente</span>
          <span class="value">${item.cliente?.nome || 'Sem cliente'}</span>
        </div>
        <div class="modal-detail-row">
          <span class="label">Descrição</span>
          <span class="value">${item.descricao || '-'}</span>
        </div>
        <div class="modal-grid-2">
          <div class="modal-detail-item">
            <span class="label">Criado em</span>
            <span class="value">${item.dataCriacao}</span>
          </div>
          <div class="modal-detail-item">
            <span class="label">Arquivado em</span>
            <span class="value">${item.dataArquivamento}</span>
          </div>
        </div>
        ${item.prazoFim ? `
        <div class="modal-detail-row" style="margin-top:10px;">
          <span class="label">Prazo</span>
          <span class="value">${new Date(item.prazoFim).toLocaleDateString('pt-BR')}</span>
        </div>` : ''}
      `;
    } else if (isQuadro) {
      detailsHtml = `
        <div class="modal-detail-row">
          <span class="label">Cliente</span>
          <span class="value">${item.cliente?.nome}</span>
        </div>
        <div class="modal-detail-row">
          <span class="label">Descrição</span>
          <span class="value">${item.descricao || '-'}</span>
        </div>
        <div class="modal-grid-2">
          <div class="modal-detail-item">
            <span class="label">Criado em</span>
            <span class="value">${item.dataCriacao}</span>
          </div>
          <div class="modal-detail-item">
            <span class="label">Arquivado em</span>
            <span class="value">${item.dataArquivamento}</span>
          </div>
        </div>
      `;
    } else {
      detailsHtml = `
        <div class="modal-detail-row">
          <span class="label">Empresa</span>
          <span class="value">${item.descricao || item.empresa || '-'}</span>
        </div>
        <div class="modal-detail-row">
          <span class="label">Email</span>
          <span class="value">${item.email || '-'}</span>
        </div>
        <div class="modal-grid-2">
          <div class="modal-detail-item">
            <span class="label">Telefone</span>
            <span class="value">${item.telefone || '-'}</span>
          </div>
          <div class="modal-detail-item">
            <span class="label">CNPJ</span>
            <span class="value">${item.cnpj || '-'}</span>
          </div>
        </div>
        ${item.link ? `
        <div class="modal-detail-row" style="margin-top:10px;">
          <a href="${item.link}" target="_blank" class="modal-link-ia">Acessar Link Personalizado</a>
        </div>` : ''}
      `;
    }

    Swal.fire({
      title: '',
      html: `
        <div class="custom-modal-wrapper">
          <div class="modal-header-center">
            ${logoHtml}
            <h2>${mainTitle}</h2>
            ${badgeHtml}
          </div>
          <div class="modal-info-box">
            ${detailsHtml}
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '450px',
      padding: '0',
      customClass: { 
        popup: 'rounded-popup',
        closeButton: 'custom-swal-close'
      }
    });
  };

  const handleRestaurar = async (item) => {
    const result = await Swal.fire({
      title: 'Restaurar?',
      text: "O item voltará para a lista ativa.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        let response;
        
        if (item.type === "quadro") {
          response = await fetch(`http://localhost:8090/v1/quadro/${item.id}/desarquivar`, {
            method: 'POST',
            headers: getHeaders()
          });
        } else if (item.type === "cliente") {
          const clienteAtualizado = { ...item, arquivado: false };
          delete clienteAtualizado.type;
          delete clienteAtualizado.dataCriacao;
          delete clienteAtualizado.dataArquivamento;
          delete clienteAtualizado.titulo;
          delete clienteAtualizado.descricao;
          
          response = await fetch(`http://localhost:8090/v1/cliente/${item.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(clienteAtualizado)
          });
        } else if (item.type === "tarefa") {
          // ✅ NOVO: Usa o endpoint POST /v1/tarefa/{id}/desarquivar
          response = await fetch(`http://localhost:8090/v1/tarefa/${item.id}/desarquivar`, {
            method: 'POST',
            headers: getHeaders()
          });
        }
        
        if (!response.ok) {
          throw new Error(`Erro ao restaurar ${item.type}`);
        }
        
        // Remove da lista localmente
        setItems(prev => prev.filter(i => i.id !== item.id));
        Swal.fire('Restaurado!', 'O item foi restaurado com sucesso.', 'success');
      } catch (error) {
        console.error('Erro ao restaurar:', error);
        Swal.fire('Erro!', 'Não foi possível restaurar o item.', 'error');
      }
    }
  };

  const handleExcluir = async (item) => {
    const result = await Swal.fire({
      title: 'Excluir?',
      text: "Ação irreversível.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        let response;
        if (item.type === "quadro") {
          response = await fetch(`http://localhost:8090/v1/quadro/${item.id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
        } else if (item.type === "cliente") {
          response = await fetch(`http://localhost:8090/v1/cliente/${item.id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
        } else if (item.type === "tarefa") {
          response = await fetch(`http://localhost:8090/v1/tarefa/${item.id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
        }
        
        if (!response.ok) {
          throw new Error('Erro ao excluir item');
        }
        
        setItems(prev => prev.filter(i => i.id !== item.id));
        Swal.fire('Excluído!', 'O item foi excluído permanentemente.', 'success');
      } catch (error) {
        console.error('Erro ao excluir:', error);
        Swal.fire('Erro!', 'Não foi possível excluir o item.', 'error');
      }
    }
  };

  const filteredItems = items.filter(item => 
    (item.titulo && item.titulo.toLowerCase().includes(busca.toLowerCase())) ||
    (item.descricao && item.descricao.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="arquivados-page">
      <div className="arquivados-header">
        <div className="header-text">
          <h1>Itens Arquivados</h1>
          <p>Histórico de {activeTab}.</p>
        </div>
      </div>

      <div className="arquivados-controls">
        <div className="arquivados-tabs">
          <button 
            className={`tab-btn ${activeTab === 'quadros' ? 'active' : ''}`}
            onClick={() => setActiveTab('quadros')}
          >
            <Layout size={18} /> Quadros
          </button>
          <button 
            className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <User size={18} /> Clientes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tarefas' ? 'active' : ''}`}
            onClick={() => setActiveTab('tarefas')}
          >
            <CheckSquare size={18} /> Tarefas
          </button>
        </div>

        <div className="arquivados-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder={`Buscar em ${activeTab}...`} 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="arquivados-loading">Carregando...</div>
      ) : filteredItems.length === 0 ? (
        <div className="arquivados-vazio">
          <p>Nenhum {activeTab.slice(0, -1)} arquivado.</p>
        </div>
      ) : (
        <div className="arquivados-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="arquivado-card">
              <div className="card-header-row">
                <div className="card-header-left">
                  <h3 className="card-title" title={item.titulo}>{item.titulo}</h3>
                  <p className="card-subtitle">{item.descricao}</p>
                </div>
                <span className={`card-type-badge ${item.type}`}>
                  {item.type === 'quadro' ? 'QUADRO' : item.type === 'cliente' ? 'CLIENTE' : 'TAREFA'}
                </span>
              </div>

              {(item.type === 'quadro' || item.type === 'tarefa') && (
                <div className="card-meta-row">
                  <div className="client-info-mini">
                    {item.cliente?.logo ? (
                      <img src={item.cliente.logo} alt="Logo" className="mini-logo" />
                    ) : (
                      <div className="mini-logo-placeholder">{item.cliente?.nome?.charAt(0) || 'C'}</div>
                    )}
                    <span>{item.cliente?.nome}</span>
                  </div>
                  {item.prioridade && (
                    <span className={`mini-priority ${item.prioridade.toLowerCase()}`}>
                      {item.prioridade}
                    </span>
                  )}
                </div>
              )}
              
              {item.type === 'cliente' && (
                <div className="card-meta-row">
                  <div className="client-info-mini">
                    {item.logo ? (
                      <img src={item.logo} alt="Logo" className="mini-logo" />
                    ) : (
                      <div className="mini-logo-placeholder">{item.titulo.charAt(0)}</div>
                    )}
                    <span>{item.titulo}</span>
                  </div>
                </div>
              )}

              <div className="card-dates-box">
                <div className="date-row">
                  <Calendar size={14} className="icon-gray" />
                  <span>Criado: <strong>{item.dataCriacao}</strong></span>
                </div>
                <div className="date-row">
                  <Calendar size={14} className="icon-gray" />
                  <span>Arquivado: <strong>{item.dataArquivamento}</strong></span>
                </div>
              </div>

              <div className="card-actions-row">
                <button className="btn-icon view" onClick={() => handleVisualizar(item)} title="Visualizar">
                  <Eye size={18} />
                </button>
                <button className="btn-icon restore" onClick={() => handleRestaurar(item)} title="Restaurar">
                  <RotateCcw size={18} />
                </button>
                <button className="btn-icon delete" onClick={() => handleExcluir(item)} title="Excluir permanentemente">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
