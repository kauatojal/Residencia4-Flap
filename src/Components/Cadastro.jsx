import React, { useState, useEffect } from 'react';
import './FormStyle.css';
import userService from "../services/userService";
import roleService from "../services/roleService";
import RecuperarSenha from './RecuperarSenha';

export default function Cadastro({ onReturn }) {
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    senha: "",
    dataNascimento: "",
    cargosIds: []
  });
  
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // ======== BUSCA CARGOS ========
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const cargosData = await roleService.getAll();
        setCargos(cargosData || []);
      } catch (err) {
        console.error("Erro ao carregar cargos:", err);
        setErro("Erro ao carregar dados do sistema");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======== SELEÇÃO DE CARGOS (MÚLTIPLOS) ========
  const handleCargoToggle = (cargoId) => {
    setForm(prev => ({
      ...prev,
      cargosIds: prev.cargosIds.includes(cargoId)
        ? prev.cargosIds.filter(id => id !== cargoId)
        : [...prev.cargosIds, cargoId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    
    try {
      const payload = {
        name: form.nome,
        email: form.email,
        password: form.senha,
        celular: form.celular,
        ativo: true,
        cargosIds: form.cargosIds,
        permissoesIds: [] // Backend não está salvando ainda
      };

      // ✅ Converte data para ISO completo
      if (form.dataNascimento) {
        const data = new Date(form.dataNascimento + 'T00:00:00.000Z');
        payload.dataNascimento = data.toISOString();
      }

      await userService.create(payload);
      
      setSucesso("Funcionário cadastrado com sucesso!");
      
      // Limpa o formulário
      setForm({
        nome: "",
        email: "",
        celular: "",
        senha: "",
        dataNascimento: "",
        cargosIds: []
      });
      
      setTimeout(onReturn, 1500);
    } catch (err) {
      setErro(err.message || "Erro ao cadastrar funcionário!");
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

  if (loadingData) {
    return (
      <div className="form-page-wrapper">
        <div className="form-container">
          <p>Carregando dados...</p>
        </div>
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
            <input 
              type="text" 
              name="nome" 
              value={form.nome} 
              onChange={handleChange} 
              placeholder="Nome completo do funcionário" 
              required 
            />
          </div>
          
          <div className="form-field">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="email@flap.com" 
              required 
            />
          </div>
          
          <div className="form-field">
            <label>Telefone</label>
            <input 
              type="tel" 
              name="celular" 
              value={form.celular} 
              onChange={handleChange} 
              placeholder="+55 79 91234-5678" 
              required 
            />
          </div>

          <div className="form-field">
            <label>Data de Nascimento</label>
            <input 
              type="date" 
              name="dataNascimento" 
              value={form.dataNascimento} 
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-field">
            <label>Senha Provisória</label>
            <input 
              type="password" 
              name="senha" 
              value={form.senha} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* ======== CARGOS ======== */}
          <div className="form-field">
            <label>Cargos</label>
            <div className="checkbox-group">
              {cargos.length === 0 ? (
                <p className="empty-message">Nenhum cargo disponível</p>
              ) : (
                cargos.map(cargo => (
                  <label key={cargo.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.cargosIds.includes(cargo.id)}
                      onChange={() => handleCargoToggle(cargo.id)}
                    />
                    <span>{cargo.nome}</span>
                  </label>
                ))
              )}
            </div>
            <p className="info-message">
              ℹ️ As permissões dos cargos estão sendo configuradas pelo sistema
            </p>
          </div>
          
          <button type="submit" className="form-button" disabled={loading || loadingData}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        
        {erro && <div className="form-erro">{erro}</div>}
        {sucesso && <div className="form-sucesso">{sucesso}</div>}
      </div>
    </div>
  );
}
