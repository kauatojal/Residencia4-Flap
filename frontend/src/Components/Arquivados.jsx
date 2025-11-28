import React, { useEffect, useState } from "react";
import "./Arquivados.css";
import Swal from "sweetalert2";
import { Search, Eye, RotateCcw, Trash2, Layout, User, Calendar, Briefcase, Mail, Phone, Building } from "lucide-react";

export default function Arquivados() {
  const [activeTab, setActiveTab] = useState("quadros"); // 'quadros' ou 'clientes'
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
        // --- QUADROS ---
        const response = await fetch('http://localhost:8090/v1/quadro/all', { headers: getHeaders() });
        if (response.ok) {
            const todosQuadros = await response.json();
            const archivedIds = JSON.parse(localStorage.getItem("quadros_arquivados") || "[]");
            
            const lista = todosQuadros
              .filter(q => archivedIds.includes(q.id))
              .map(q => ({
                  ...q,
                  type: 'quadro',
                  // Mock de dados extras se a API não trouxer
                  dataCriacao: q.dataCriacao ? new Date(q.dataCriacao).toLocaleDateString('pt-BR') : "10/01/2024",
                  dataArquivamento: new Date().toLocaleDateString('pt-BR'),
                  prioridade: q.prioridade || "Alta",
                  cliente: {
                    nome: "Flap Soluções",
                    logo: null, // null gera a inicial
                    ...q.cliente
                  }
              }));
            setItems(lista);
        }
      } else {
        // --- CLIENTES ---
        const response = await fetch('http://localhost:8090/v1/cliente/all', { headers: getHeaders() });
        if (response.ok) {
          const todosClientes = await response.json();
          const lista = todosClientes
            .filter(c => c.arquivado === true)
            .map(c => ({
              ...c,
              type: 'cliente',
              // Normalizando campos para o card
              titulo: c.nome,
              descricao: c.empresa || "Empresa não informada",
              dataCriacao: "N/A",
              dataArquivamento: "Recentemente"
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

  // --- VISUALIZAR ---
  const handleVisualizar = (item) => {
    const isQuadro = item.type === 'quadro';
    
    // Logo e Nome Principal
    const logoUrl = isQuadro ? item.cliente?.logo : item.logo;
    const logoLetter = (isQuadro ? item.cliente?.nome : item.titulo)?.charAt(0) || 'C';
    const mainTitle = isQuadro ? item.titulo : item.titulo; // Título do quadro ou nome do cliente

    const logoHtml = logoUrl 
      ? `<img src="${logoUrl}" class="modal-logo-img" />`
      : `<div class="modal-logo-placeholder">${logoLetter}</div>`;

    // Badge de Prioridade (só para quadros)
    let badgeHtml = '';
    if (isQuadro) {
       const p = item.prioridade || 'Média';
       badgeHtml = `<span class="modal-priority-badge ${p.toLowerCase()}">Prioridade ${p}</span>`;
    }

    // Conteúdo da Box Cinza
    let detailsHtml = '';
    if (isQuadro) {
        // Detalhes do QUADRO
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
        // Detalhes do CLIENTE
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
            <button type="button" class="swal2-close" style="display: flex;" onclick="swal.closeModal()">×</button>
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
      showCloseButton: false, 
      width: '450px',
      padding: '0',
      customClass: { popup: 'rounded-popup' }
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
      if (item.type === "quadro") {
        const key = "quadros_arquivados";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        const novo = list.filter(id => id !== item.id);
        localStorage.setItem(key, JSON.stringify(novo));
      } else {
        const clienteAtualizado = { ...item, arquivado: false };
        // Limpa campos extras
        delete clienteAtualizado.type;
        delete clienteAtualizado.dataCriacao;
        delete clienteAtualizado.dataArquivamento;
        delete clienteAtualizado.titulo;
        delete clienteAtualizado.descricao;
        
        await fetch(`http://localhost:8090/v1/cliente/${item.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(clienteAtualizado)
        });
      }
      setItems(prev => prev.filter(i => i.id !== item.id));
      Swal.fire('Restaurado!', '', 'success');
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
        const endpoint = item.type === 'quadro' ? 'quadro' : 'cliente';
        if (item.type === "quadro") {
           const key = "quadros_arquivados";
           const list = JSON.parse(localStorage.getItem(key) || "[]");
           const novoLocal = list.filter(id => id !== item.id);
           localStorage.setItem(key, JSON.stringify(novoLocal));
           
           await fetch(`http://localhost:8090/v1/quadro/${item.id}`, {
              method: 'DELETE',
              headers: getHeaders()
           });
        } else {
            await fetch(`http://localhost:8090/v1/cliente/${item.id}`, {
              method: 'DELETE',
              headers: getHeaders()
           });
        }
        setItems(prev => prev.filter(i => i.id !== item.id));
        Swal.fire('Excluído!', '', 'success');
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
              {/* HEADER DO CARD */}
              <div className="card-header-row">
                  <div className="card-header-left">
                      <h3 className="card-title" title={item.titulo}>{item.titulo}</h3>
                      <p className="card-subtitle">{item.descricao}</p>
                  </div>
                  <span className={`card-type-badge ${item.type}`}>
                    {item.type === 'quadro' ? 'QUADRO' : 'CLIENTE'}
                  </span>
              </div>

              {/* LOGO + PRIORIDADE (QUADROS) */}
              {item.type === 'quadro' && (
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
              
              {/* LOGO (CLIENTES) */}
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

              {/* DATAS (IGUAL ANEXO 1) */}
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

              {/* BOTÕES DE AÇÃO */}
              <div className="card-actions-row">
                <button className="btn-icon view" onClick={() => handleVisualizar(item)}><Eye size={18} /></button>
                <button className="btn-icon restore" onClick={() => handleRestaurar(item)}><RotateCcw size={18} /></button>
                <button className="btn-icon delete" onClick={() => handleExcluir(item)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}