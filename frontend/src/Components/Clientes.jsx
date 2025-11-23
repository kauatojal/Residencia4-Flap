import React, { useState, useEffect } from "react";
import "./Clientes.css";
import CadastroCliente from "./CadastroCliente";
import clientService from "../services/clientService";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteParaArquivar, setClienteParaArquivar] = useState(null);
  const [busca, setBusca] = useState("");

  async function loadClients() {
    const clientes = await clientService.list()
    setClientes(clientes)
  }

  // Carregar clientes + arquivados do localStorage
  useEffect(() => {
    loadClients()
  }, []);

  // Salvar cliente
  const handleSalvarCliente = (clienteNovo) => {
    const processarLogo = (logo) => {
      return new Promise((resolve) => {
        if (!logo || typeof logo === "string") return resolve(logo);
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logo);
      });
    };

    processarLogo(clienteNovo.logo).then((logoBase64) => {
      const clienteFormatado = { ...clienteNovo, logo: logoBase64 };

      let novaLista = [];

      if (clienteEditando) {
        novaLista = clientes.map((c) =>
          c.id === clienteEditando.id ? { ...clienteFormatado, id: c.id } : c
        );
      } else {
        novaLista = [
          ...clientes,
          { ...clienteFormatado, id: Date.now(), arquivado: false },
        ];
      }

      setClientes(novaLista);

      setMostrarCadastro(false);
      setClienteEditando(null);
    });
  };

  // Excluir
  const handleExcluirCliente = async (id) => {
    if (window.confirm("Deseja realmente excluir este cliente?")) {
      await clientService.remove(id)
      const listaAtual = clientes.filter((c) => c.id !== id);
      setClientes(listaAtual);
    }
  };

  // Abrir modal
  const abrirModalArquivar = (cliente) => {
    setClienteParaArquivar(cliente);
  };

  // Confirmar arquivamento
  const confirmarArquivamento = () => {
    const listaAtual = clientes.map((c) =>
      c.id === clienteParaArquivar.id ? { ...c, arquivado: true } : c
    );
    setClientes(listaAtual);
    setClienteParaArquivar(null);
  };

  // Filtro (somente não arquivados)
  const clientesFiltrados = clientes.filter((cliente) => {
    if (cliente.arquivado) return false;
    return (
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase())
    );
  });

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <h1>Clientes</h1>
        <button
          className="btn-cadastrar-cliente"
          onClick={() => {
            setClienteEditando(null);
            setMostrarCadastro(true);
          }}
        >
          + Cadastrar Cliente
        </button>
      </div>

      <div className="clientes-busca">
        <input
          type="text"
          placeholder="Buscar por nome, empresa ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="clientes-vazio">
          <p>Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="clientes-grid">
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="cliente-card animated-card">
              <button
                className="btn-arquivar"
                onClick={() => abrirModalArquivar(cliente)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="#6b7280" fill="none" strokeWidth="2">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="3" y="3" width="18" height="5" />
                  <line x1="12" y1="12" x2="12" y2="17" />
                </svg>
              </button>

              <div className="cliente-card-header">
                <div className="cliente-avatar animated-avatar">
                  {cliente.logo ? (
                    <img src={cliente.logo} alt="Logo" className="cliente-logo-img" />
                  ) : (
                    cliente.nome.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="cliente-info">
                  <h3>{cliente.nome}</h3>
                  <p className="cliente-empresa">{cliente.empresa}</p>

                  {cliente.link && (
                    <a
                      className="cliente-link"
                      href={cliente.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" stroke="#4a67ff" fill="none" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.39 1.39" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.39-1.39" />
                      </svg>
                      Acessar IA
                    </a>
                  )}
                </div>
              </div>

              <div className="cliente-card-body">
                <div className="cliente-detalhe">
                  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#6b7280" fill="none" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                  <span>{cliente.email}</span>
                </div>

                <div className="cliente-detalhe">
                  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#e11d48" fill="none" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0111 19a19.5 19.5 0 01-8-7A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.81.38 1.6.76 2.32l.23.44a2 2 0 01-.45 2.31L8.09 9.91a16 16 0 006 6l1.12-1.12a2 2 0 012.31-.45l.44.23c.72.38 1.51.64 2.32.76A2 2 0 0122 16.92z" />
                  </svg>
                  <span>{cliente.telefone}</span>
                </div>
              </div>

              <div className="cliente-card-actions">
                <button className="btn-editar" onClick={() => setClienteEditando(cliente)}>Editar</button>
                <button className="btn-excluir" onClick={() => handleExcluirCliente(cliente.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL ARQUIVAR */}
      {clienteParaArquivar && (
        <div className="modal-overlay">
          <div className="modal-arquivar">
            <svg width="50" height="50" stroke="#eab308" fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="1" />
            </svg>

            <h2>Arquivar Empresa</h2>
            <p>
              Tem certeza que deseja arquivar a empresa{" "}
              <strong>{clienteParaArquivar.nome}</strong>? Ela ficará oculta mas poderá ser restaurada depois.
            </p>

            <div className="modal-buttons">
              <button className="btn-cancelar" onClick={() => setClienteParaArquivar(null)}>
                Cancelar
              </button>

              <button className="btn-confirmar" onClick={confirmarArquivamento}>
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarCadastro && (
        <CadastroCliente
          cliente={clienteEditando}
          onSave={handleSalvarCliente}
          onCancel={() => {
            setMostrarCadastro(false);
            setClienteEditando(null);
          }}
        />
      )}
    </div>
  );
}
