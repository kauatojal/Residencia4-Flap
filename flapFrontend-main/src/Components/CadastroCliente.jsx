import React, { useState } from "react";
import "./CadastroCliente.css";

export default function CadastroCliente() {
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cliente cadastrado com sucesso!");
    setForm({ nome: "", empresa: "", email: "", telefone: "" });
  };

  return (
    <div className="main-content-wrapper">
      <div className="cadastro-cliente-container">
        <h2>Cadastro de Cliente</h2>
        <form className="cadastro-cliente-form" onSubmit={handleSubmit}>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />

          <label>Empresa</label>
          <input name="empresa" value={form.empresa} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />

          <label>Telefone</label>
          <input name="telefone" value={form.telefone} onChange={handleChange} required />

          <button type="submit" className="btn-cadastrar">Cadastrar Cliente</button>
        </form>
      </div>
    </div>
  );
}