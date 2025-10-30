import React, { useState, useEffect } from "react";
import './EditarUsuario.css';

const setores = [
  { label: "Design", value: "Design" },
  { label: "Comercial", value: "Comercial" },
  { label: "Mídia", value: "Mídia" },
  { label: "Marketing", value: "Marketing" },
];

export function EditarUsuario({ usuario, onSave, onCancel }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    setor: "",
    senha: "",
  });

  useEffect(() => {
    if (usuario) {
      setForm({
        ...usuario,
        senha: "" // Senha sempre começa vazia por segurança
      });
    }
  }, [usuario]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="editar-usuario-modal">
      <form onSubmit={handleSubmit}>
        <h2>Editar Usuário</h2>

        <label>Nome:</label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Número de Celular:</label>
        <input
          type="tel"
          name="celular"
          value={form.celular}
          onChange={handleChange}
          required
        />

        <label>Setor:</label>
        <select
          name="setor"
          value={form.setor}
          onChange={handleChange}
          required
        >
          <option value="">Selecione</option>
          {setores.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <label>Nova Senha (deixe em branco para não alterar):</label>
        <input
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          placeholder="Digite a nova senha"
        />

        <div className="editar-usuario-actions">
          <button type="submit">Salvar</button>
          <button type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
