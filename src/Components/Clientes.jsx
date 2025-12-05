import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Archive, Mail, Phone, Building, Eye, Link as LinkIcon, User, Briefcase } from "lucide-react";
import api from "../services/api";
import "./Clientes.css";
import CadastroCliente from "./CadastroCliente";
import Swal from "sweetalert2";
import '../styles/DarkMode.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteParaArquivar, setClienteParaArquivar] = useState(null);
  const [clienteVisualizando, setClienteVisualizando] = useState(null);
  const [busca, setBusca] = useState("");

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cliente/all');
      setClientes(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleExcluirCliente = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Isso removerá o cliente permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/cliente/${id}`);
        setClientes(clientes.filter((c) => c.id !== id));
        Swal.fire('Excluído!', 'Cliente removido.', 'success');
      } catch (error) {
        Swal.fire('Erro', 'Não foi possível excluir.', 'error');
      }
    }
  };

  const confirmarArquivamento = async () => {
    if (!clienteParaArquivar) return;

    try {
      await api.post(`/cliente/${clienteParaArquivar.id}/arquivar`);
      setClientes(clientes.filter(c => c.id !== clienteParaArquivar.id));
      setClienteParaArquivar(null);
      Swal.fire('Arquivado!', 'Cliente arquivado com sucesso.', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao arquivar.', 'error');
    }
  };

  const handleSaveSuccess = () => {
    setMostrarCadastro(false);
    setClienteEditando(null);
    fetchClientes();
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    if (cliente.arquivado) return false;
    const termo = busca.toLowerCase();
    return (
      (cliente.nome && cliente.nome.toLowerCase().includes(termo)) ||
      (cliente.empresa && cliente.empresa.toLowerCase().includes(termo)) ||
      (cliente.email && cliente.email.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <div className="header-title">
          <h1>Clientes</h1>
          <p>Gerencie sua base de clientes</p>
        </div>
        <button
          className="btn-cadastrar-cliente"
          onClick={() => {
            setClienteEditando(null);
            setMostrarCadastro(true);
          }}
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="clientes-busca">
        <Search className="busca-icon" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome, empresa ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">Carregando clientes...</div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="clientes-vazio">
          <p>Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="clientes-grid">
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="cliente-card animated-card">
              <button
                className="btn-arquivar-card"
                onClick={() => setClienteParaArquivar(cliente)}
                title="Arquivar"
              >
                <Archive size={16} />
              </button>

              <div className="cliente-card-header">
                <div className="cliente-avatar animated-avatar">
                  {cliente.logo ? (
                    <img src={cliente.logo} alt="Logo" className="cliente-logo-img" />
                  ) : (
                    cliente.nome ? cliente.nome.charAt(0).toUpperCase() : '#'
                  )}
                </div>

                <div className="cliente-info">
                  <h3>{cliente.nome}</h3>
                  <p className="cliente-empresa">{cliente.empresa || "Empresa não informada"}</p>
                  {cliente.link && (
                    <a 
                      href={cliente.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="cliente-link-ia"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🤖 Link IA Personalizado
                    </a>
                  )}
                </div>
              </div>

              <div className="cliente-card-body">
                <div className="cliente-detalhe">
                  <Mail size={16} />
                  <span>{cliente.email || "Sem email"}</span>
                </div>
                <div className="cliente-detalhe">
                  <Phone size={16} />
                  <span>{cliente.telefone || "Sem telefone"}</span>
                </div>
              </div>

              <div className="cliente-card-actions">
                <button 
                  className="btn-visualizar" 
                  onClick={() => setClienteVisualizando(cliente)}
                  title="Visualizar Detalhes"
                >
                  <Eye size={16}/> Visualizar
                </button>
                
                <button className="btn-editar" onClick={() => {
                  setClienteEditando(cliente);
                  setMostrarCadastro(true);
                }}>
                  <Edit size={16}/> Editar
                </button>
                
                <button className="btn-excluir" onClick={() => handleExcluirCliente(cliente.id)}>
                  <Trash2 size={16}/> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {clienteParaArquivar && (
        <div className="modal-overlay">
          <div className="modal-arquivar">
            <div className="modal-icon-warning">
              <Archive size={40} />
            </div>
            <h2>Arquivar Cliente</h2>
            <p>
              Tem certeza que deseja arquivar <strong>{clienteParaArquivar.nome}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="btn-cancelar-modal" onClick={() => setClienteParaArquivar(null)}>
                Cancelar
              </button>
              <button className="btn-confirmar-modal" onClick={confirmarArquivamento}>
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteVisualizando && (
        <div className="modal-overlay" onClick={() => setClienteVisualizando(null)}>
          <div className="modal-visualizar" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar" onClick={() => setClienteVisualizando(null)} type="button">✕</button>
            
            <div className="modal-visualizar-header">
              <div className="modal-avatar">
                {clienteVisualizando.logo ? (
                  <img src={clienteVisualizando.logo} alt="Logo" />
                ) : (
                  <div className="avatar-placeholder">
                    {clienteVisualizando.nome.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2>{clienteVisualizando.nome}</h2>
              <p className="modal-empresa">{clienteVisualizando.empresa || "Empresa não informada"}</p>
            </div>

            <div className="modal-visualizar-body">
              <div className="info-row">
                <div className="info-label">
                  <Mail size={18} />
                  <span>Email</span>
                </div>
                <div className="info-value">{clienteVisualizando.email || "Não informado"}</div>
              </div>

              <div className="info-row">
                <div className="info-label">
                  <Phone size={18} />
                  <span>Telefone</span>
                </div>
                <div className="info-value">{clienteVisualizando.telefone || "Não informado"}</div>
              </div>

              <div className="info-row">
                <div className="info-label">
                  <Building size={18} />
                  <span>CNPJ</span>
                </div>
                <div className="info-value">{clienteVisualizando.cnpj || "Não informado"}</div>
              </div>

              {clienteVisualizando.link && (
                <div className="info-row">
                  <div className="info-label">
                    <LinkIcon size={18} />
                    <span>Link IA</span>
                  </div>
                  <div className="info-value">
                    <a href={clienteVisualizando.link} target="_blank" rel="noopener noreferrer">
                      {clienteVisualizando.link}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-visualizar-footer">
              <button 
                className="btn-editar-modal" 
                onClick={() => {
                  setClienteVisualizando(null);
                  setClienteEditando(clienteVisualizando);
                  setMostrarCadastro(true);
                }}
              >
                <Edit size={16}/> Editar Cliente
              </button>
              <button className="btn-fechar-modal" onClick={() => setClienteVisualizando(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarCadastro && (
        <CadastroCliente
          cliente={clienteEditando}
          onSave={handleSaveSuccess}
          onCancel={() => {
            setMostrarCadastro(false);
            setClienteEditando(null);
          }}
        />
      )}
    </div>
  );
}
