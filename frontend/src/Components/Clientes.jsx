import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Archive, Mail, Phone, Building } from "lucide-react";
import "./Clientes.css";
import CadastroCliente from "./CadastroCliente";
import clientService from "../services/clientService";
import Swal from "sweetalert2";
// import '../styles/DarkMode.css'; /// ???? onde ta esse arquivo?

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteParaArquivar, setClienteParaArquivar] = useState(null);
  const [busca, setBusca] = useState("");

  const fetchClientes = async () => {
    setLoading(true);

    try {
      const clientes = await clientService.list()
      setClientes(clientes)
    } catch(e) {
      console.error("Erro ao carregar clientes: ", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSaveSuccess = () => {
    setMostrarCadastro(false);
    setClienteEditando(null);
    fetchClientes();
  };

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
        await clientService.remove(id)

        setClientes(clientes.filter((c) => c.id !== id));
        Swal.fire('Excluído!', 'Cliente removido.', 'success');
      } catch (error) {
        console.error("Erro ao remover cliente: ", error)
        Swal.fire('Erro', 'Não foi possível excluir.', 'error');
      } finally {
        setLoading(false)
      }
    }
  };

  const confirmarArquivamento = async () => {
    if (!clienteParaArquivar) return;

    try {
      const clienteAtualizado = { ...clienteParaArquivar, arquivado: true };

      await clientService.update(clienteParaArquivar.id)

      setClientes(clientes.map(c => c.id === clienteParaArquivar.id ? clienteAtualizado : c));
      setClienteParaArquivar(null);
      Swal.fire('Arquivado!', 'Cliente arquivado com sucesso.', 'success');
    } catch (error) {
      console.error("Erro ao alterar cliente: ", error)
      Swal.fire('Erro', 'Erro de conexão.', 'error');
    }
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
                  {/* {cliente.logo ? (
                    <img src={cliente.logo} alt="Logo" className="cliente-logo-img" />
                  ) : (
                    cliente.nome ? cliente.nome.charAt(0).toUpperCase() : '#'
                  )} */}
                  {cliente.nome ? cliente.nome.charAt(0).toUpperCase() : '#'}
                </div>

                <div className="cliente-info">
                  <h3>{cliente.nome}</h3>
                  <p className="cliente-empresa">{cliente.empresa || "Empresa não informada"}</p>
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
                {cliente.cnpj && (
                  <div className="cliente-detalhe">
                    <Building size={16} />
                    <span>{cliente.cnpj}</span>
                  </div>
                )}
              </div>

              <div className="cliente-card-actions">
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

      {/* MODAL ARQUIVAR */}
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

      {/* MODAL CADASTRO */}
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
