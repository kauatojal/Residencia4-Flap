import React, { useState, useEffect } from "react";
import "./Clientes.css";
import CadastroCliente from "./CadastroCliente";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busca, setBusca] = useState("");

  // Simulação de buscar clientes - substituir por API real
  useEffect(() => {
    const clientesMock = [
      {
        id: 1,
        nome: "João Silva",
        empresa: "Tech Solutions Ltda",
        email: "joao@tech.com",
        telefone: "(11) 98765-4321",
      },
      {
        id: 2,
        nome: "Maria Santos",
        empresa: "Inovare Sistemas",
        email: "maria@inovare.com",
        telefone: "(21) 91234-5678",
      },
      {
        id: 3,
        nome: "Carlos Oliveira",
        empresa: "CloudBusiness Corp",
        email: "carlos@cloud.com",
        telefone: "(31) 99876-5432",
      },
    ];
    setClientes(clientesMock);
  }, []);

  const handleSalvarCliente = (clienteNovo) => {
    if (clienteEditando) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteEditando.id ? { ...clienteNovo, id: c.id } : c
        )
      );
    } else {
      setClientes((prev) => [...prev, { ...clienteNovo, id: Date.now() }]);
    }
    setMostrarCadastro(false);
    setClienteEditando(null);
  };

  const handleEditarCliente = (cliente) => {
    setClienteEditando(cliente);
    setMostrarCadastro(true);
  };

  const handleExcluirCliente = (id) => {
    if (window.confirm("Deseja realmente excluir este cliente?")) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase())
  );

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
            <div key={cliente.id} className="cliente-card">
              <div className="cliente-card-header">
                <div className="cliente-avatar">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <div className="cliente-info">
                  <h3>{cliente.nome}</h3>
                  <p className="cliente-empresa">{cliente.empresa}</p>
                </div>
              </div>
              <div className="cliente-card-body">
                <div className="cliente-detalhe">
                  <span className="icone">✉️</span>
                  <span>{cliente.email}</span>
                </div>
                <div className="cliente-detalhe">
                  <span className="icone">📞</span>
                  <span>{cliente.telefone}</span>
                </div>
              </div>
              <div className="cliente-card-actions">
                <button
                  className="btn-editar"
                  onClick={() => handleEditarCliente(cliente)}
                >
                  Editar
                </button>
                <button
                  className="btn-excluir"
                  onClick={() => handleExcluirCliente(cliente.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
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
