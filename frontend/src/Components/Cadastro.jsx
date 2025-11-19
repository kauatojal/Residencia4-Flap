import React, { useState } from 'react';
import './FormStyle.css';
import userService from "../services/userService";
import RecuperarSenha from './RecuperarSenha';

export default function Cadastro({ onReturn }) {
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    senha: ""
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      await userService.create({
        name: form.nome,
        email: form.email,
        password: form.senha,
        celular: form.celular,
        dataNascimento: new Date().toISOString(),
        ativo: true,
        cargosIds: [],
        permissoesIds: [],
      });
      setSucesso("Funcionário cadastrado com sucesso!");
      setTimeout(onReturn, 1500);
    } catch (err) {
      setErro("Erro ao cadastrar funcionário!");
    } finally {
      setLoading(false);
    }
  };

  if (showRecuperar) {
    return (
      <div className="form-page-wrapper">
        <RecuperarSenha onReturn={() => setShowRecuperar(false)} />
      </div>
    );
  }

  return (
    <div className="form-page-wrapper">
      <div className="form-container">
        <img src="/Logo_flap.png" alt="Flap Logo" className="form-logo" />
        <h2>Cadastro de Funcionário</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nome</label>
            <input type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo do funcionário" required />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@flap.com" required />
          </div>
          <div className="form-field">
            <label>Telefone</label>
            <input type="tel" name="celular" value={form.celular} onChange={handleChange} placeholder="+55 79 91234-5678" required />
          </div>
          <div className="form-field">
            <label>Senha Provisória</label>
            <input type="password" name="senha" value={form.senha} onChange={handleChange} required />
          </div>
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        {erro && <div className="form-erro">{erro}</div>}
        {sucesso && <div className="form-sucesso">{sucesso}</div>}
      </div>
    </div>
  );
}
