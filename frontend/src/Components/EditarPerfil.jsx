import React, { useState } from "react";
import "./EditarPerfil.css";

export default function EditarPerfil() {
  const [form, setForm] = useState({
    nome: "Kauã José",
    email: "kaua@flap.com",
    cargo: "Desenvolvedor",
    senha: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Perfil atualizado com sucesso!");
  };

  return (
    <div className="editar-perfil-container">
      <h2>Editar Perfil</h2>
      <form className="editar-perfil-form" onSubmit={handleSubmit}>
        <label>Nome</label>
        <input name="nome" value={form.nome} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Cargo</label>
        <input name="cargo" value={form.cargo} onChange={handleChange} required />

        <label>Nova Senha</label>
        <input type="password" name="senha" value={form.senha} onChange={handleChange} placeholder="Digite nova senha" />

        <button type="submit" className="btn-salvar">Salvar Alterações</button>
      </form>
    </div>
  );
}
