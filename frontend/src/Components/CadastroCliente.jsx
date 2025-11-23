import React, { useState, useEffect } from "react";
import "./CadastroCliente.css";
import clientService from "../services/clientService";

export default function CadastroCliente({ cliente, onSave, onCancel }) {
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    cnpj: "",
    email: "",
    telefone: "",
    link: "", // NOVO CAMPO
    logo: null,
  });

  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome || "",
        empresa: cliente.empresa || "",
        cnpj: cliente.cnpj || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        link: cliente.link || "", // CARREGA O LINK NA EDIÇÃO
        logo: cliente.logo || null,
      });
      if (cliente.logo) {
        setPreviewLogo(cliente.logo);
      }
    }
  }, [cliente]);

  // ============ VALIDAÇÕES ============
  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validação simples de URL
  const validarUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;

    return true;
  };

  // ============ MÁSCARAS ============
  const aplicarMascaraTelefone = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .slice(0, 15);
  };

  const aplicarMascaraCNPJ = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  // ============ HANDLERS ============
  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "telefone") {
      novoValor = aplicarMascaraTelefone(value);
    }

    if (name === "cnpj") {
      novoValor = aplicarMascaraCNPJ(value);
    }

    setForm({ ...form, [name]: novoValor });

    // Validação em tempo real
    if (name === "email") {
       if (value && !validarEmail(value)) {
          setErros((prev) => ({ ...prev, email: "E-mail inválido" }));
       } else {
          setErros((prev) => ({ ...prev, email: "" }));
       }
    }

    if (name === "link") {
        if (value && !validarUrl(value)) {
            setErros((prev) => ({ ...prev, link: "Link inválido (inclua http:// ou https://)" }));
        } else {
            setErros((prev) => ({ ...prev, link: "" }));
        }
    }

    if (name === "cnpj") {
      if (value) {
        const cnpjLimpo = value.replace(/\D/g, '');
        if (cnpjLimpo.length === 14 && !validarCNPJ(value)) {
          setErros((prev) => ({ ...prev, cnpj: "CNPJ inválido" }));
        } else {
          setErros((prev) => ({ ...prev, cnpj: "" }));
        }
      }
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErros((prev) => ({ ...prev, logo: "Arquivo muito grande. Máximo 5MB." }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErros((prev) => ({ ...prev, logo: "Apenas imagens são permitidas." }));
        return;
      }

      setErros((prev) => ({ ...prev, logo: "" }));
      setForm({ ...form, logo: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório";
    if (!form.empresa.trim()) novosErros.empresa = "Empresa é obrigatória";
    if (!validarCNPJ(form.cnpj)) novosErros.cnpj = "CNPJ inválido";
    if (!validarEmail(form.email)) novosErros.email = "E-mail inválido";
    if (!form.telefone.trim()) novosErros.telefone = "Telefone é obrigatório";

    // Validação do Link (opcional: se for obrigatório, descomente a linha abaixo)
    if (form.link && !validarUrl(form.link)) novosErros.link = "Link inválido";
    // if (!form.link.trim()) novosErros.link = "Link é obrigatório";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      await clientService.create(form)
      setForm({ nome: "", empresa: "", cnpj: "", email: "", telefone: "", link: "", logo: null });
      setPreviewLogo(null);
    } catch (error) {
      alert("Erro ao salvar cliente");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cadastro-cliente-overlay">
      <div className="cadastro-cliente-modal">
        <button className="btn-fechar" onClick={onCancel} type="button">
          ✕
        </button>
        <div className="cadastro-cliente-container">
          <h2>{cliente ? "Editar Cliente" : "Cadastro de Cliente"}</h2>
          <form className="cadastro-cliente-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className={erros.nome ? "input-erro" : ""}
                required
              />
              {erros.nome && <span className="erro-campo">{erros.nome}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="empresa">Empresa</label>
              <input
                id="empresa"
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                className={erros.empresa ? "input-erro" : ""}
                required
              />
              {erros.empresa && <span className="erro-campo">{erros.empresa}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cnpj">CNPJ</label>
              <input
                id="cnpj"
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className={erros.cnpj ? "input-erro" : ""}
                required
              />
              {erros.cnpj && <span className="erro-campo">{erros.cnpj}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="exemplo@empresa.com"
                className={erros.email ? "input-erro" : ""}
                required
              />
              {erros.email && <span className="erro-campo">{erros.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className={erros.telefone ? "input-erro" : ""}
                required
              />
              {erros.telefone && <span className="erro-campo">{erros.telefone}</span>}
            </div>

            {/* NOVO CAMPO LINK */}
            <div className="form-group">
              <label htmlFor="link">Link Personalizado (IA)</label>
              <input
                id="link"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://exemplo.com/ia-do-cliente"
                className={erros.link ? "input-erro" : ""}
                // Adicione 'required' aqui se o campo for obrigatório
              />
              {erros.link && <span className="erro-campo">{erros.link}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="logo">Logo da Empresa</label>
              <div className="logo-upload-container">
                <div
                  className="logo-upload-box"
                  onClick={() => document.getElementById('logo').click()}
                >
                  {previewLogo ? (
                    <div className="logo-preview">
                      <img src={previewLogo} alt="Preview logo" />
                      <div className="logo-overlay">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="logo-placeholder">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <span>Clique para adicionar logo</span>
                    </div>
                  )}
                </div>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="input-file"
                  style={{ display: 'none' }}
                />
              </div>
              {erros.logo && <span className="erro-campo">{erros.logo}</span>}
            </div>

            <div className="cadastro-actions">
              <button type="submit" className="btn-cadastrar" disabled={salvando}>
                {salvando ? "Salvando..." : (cliente ? "Salvar Alterações" : "Cadastrar Cliente")}
              </button>
              <button type="button" className="btn-cancelar" onClick={onCancel}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
