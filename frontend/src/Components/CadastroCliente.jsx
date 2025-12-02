import React, { useState, useEffect } from "react";
import "./CadastroCliente.css";
import clientService from "../services/clientService";
import Swal from "sweetalert2";

export default function CadastroCliente({ cliente, onSave, onCancel }) {
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    cnpj: "",
    email: "",
    telefone: "",
    link: "", 
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
        link: cliente.link || "",
        logo: cliente.logo || null,
      });
      if (cliente.logo) {
        setPreviewLogo(cliente.logo);
      }
    }
  }, [cliente]);

  // ============ UTILITÁRIO: CONVERTER PARA BASE64 ============
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // ============ VALIDAÇÕES ============
  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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

    if (name === "telefone") novoValor = aplicarMascaraTelefone(value);
    if (name === "cnpj") novoValor = aplicarMascaraCNPJ(value);

    setForm({ ...form, [name]: novoValor });

    // Validações
    if (name === "email") {
       setErros((prev) => ({ ...prev, email: (value && !validarEmail(value)) ? "E-mail inválido" : "" }));
    }
    
    // Valida Link se houver valor
    if (name === "link") {
        setErros((prev) => ({ ...prev, link: (value && !validarUrl(value)) ? "Link inválido" : "" }));
    }

    // Valida CNPJ APENAS SE houver valor (agora é opcional)
    if (name === "cnpj") {
      if (value) {
        const cnpjLimpo = value.replace(/\D/g, '');
        if (cnpjLimpo.length === 14 && !validarCNPJ(value)) {
          setErros((prev) => ({ ...prev, cnpj: "CNPJ inválido" }));
        } else {
          setErros((prev) => ({ ...prev, cnpj: "" }));
        }
      } else {
        setErros((prev) => ({ ...prev, cnpj: "" })); // Limpa erro se apagar tudo
      }
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Arquivo muito grande',
          text: 'O tamanho máximo permitido é 5MB.',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        Swal.fire('Erro', 'Apenas imagens são permitidas', 'error');
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setForm({ ...form, logo: base64 });
        setPreviewLogo(base64);
        setErros((prev) => ({ ...prev, logo: "" }));
      } catch (error) {
        console.error("Erro ao converter imagem", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const novosErros = {};
    // === VALIDAÇÕES OBRIGATÓRIAS (APENAS NOME E EMAIL) ===
    if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório";
    if (!validarEmail(form.email)) novosErros.email = "E-mail inválido";
    
    // === VALIDAÇÕES OPCIONAIS (Só valida se tiver preenchido) ===
    if (form.cnpj && !validarCNPJ(form.cnpj)) novosErros.cnpj = "CNPJ inválido";
    if (form.link && !validarUrl(form.link)) novosErros.link = "Link inválido";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      Swal.fire({
        icon: 'error',
        title: 'Atenção',
        text: 'Preencha corretamente os campos obrigatórios.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        nome: form.nome,
        // Envia string vazia se não preencher, para evitar null se o backend permitir
        empresa: form.empresa || "", 
        cnpj: form.cnpj ? form.cnpj.replace(/\D/g, '') : "", 
        email: form.email,
        telefone: form.telefone || "",
        link: form.link || "",
        logo: form.logo
      };

      console.log("Enviando Payload:", payload);

      await clientService.create(payload);
      
      await Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Cliente cadastrado com sucesso.',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true
      });

      setForm({ nome: "", empresa: "", cnpj: "", email: "", telefone: "", link: "", logo: null });
      setPreviewLogo(null);
      
      if (onSave) onSave();
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      
      let msg = 'Erro ao salvar cliente.';
      if (error.response?.status === 403) {
        msg = 'Acesso Negado (403). Verifique se você está logado ou se seu Token expirou.';
      } else if (error.response?.status === 500) {
        // AVISO SOBRE O BANCO DE DADOS
        msg = 'Erro Interno (500). O banco de dados pode estar rejeitando campos vazios (CNPJ/Empresa).';
      }

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: msg,
        footer: `Status: ${error.response?.status || 'Erro de Rede'}`
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cadastro-cliente-overlay">
      <div className="cadastro-cliente-modal">
        <button className="btn-fechar" onClick={onCancel} type="button">✕</button>
        <div className="cadastro-cliente-container">
          <h2>{cliente ? "Editar Cliente" : "Cadastro de Cliente"}</h2>
          <form className="cadastro-cliente-form" onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label htmlFor="nome">
                Nome <span>*</span>
              </label>
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

            {/* EMPRESA (OPCIONAL) */}
            <div className="form-group">
              <label htmlFor="empresa">Empresa</label>
              <input
                id="empresa"
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                className={erros.empresa ? "input-erro" : ""}
                // Removido required
              />
            </div>

            {/* CNPJ (OPCIONAL) */}
            <div className="form-group">
              <label htmlFor="cnpj">CNPJ</label>
              <input
                id="cnpj"
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className={erros.cnpj ? "input-erro" : ""}
                // Removido required
              />
              {erros.cnpj && <span className="erro-campo">{erros.cnpj}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span>*</span>
              </label>
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

            {/* TELEFONE (OPCIONAL) */}
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className={erros.telefone ? "input-erro" : ""}
                // Removido required
              />
              {erros.telefone && <span className="erro-campo">{erros.telefone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="link">Link Personalizado (IA)</label>
              <input
                id="link"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://exemplo.com/ia-do-cliente"
                className={erros.link ? "input-erro" : ""}
              />
              {erros.link && <span className="erro-campo">{erros.link}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="logo">Logo da Empresa</label>
              <div className="logo-upload-container">
                <div className="logo-upload-box" onClick={() => document.getElementById('logo').click()}>
                  {previewLogo ? (
                    <div className="logo-preview">
                      <img src={previewLogo} alt="Preview" />
                    </div>
                  ) : (
                    <div className="logo-placeholder">
                      <span>Clique para adicionar logo</span>
                    </div>
                  )}
                </div>
                <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
              </div>
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