import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiShield } from "react-icons/fi";
import "./EditarUsuario.css";
import roleService from "../services/roleService";

export function EditarUsuario({ usuario, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    celular: "",
    dataNascimento: "",
    password: "",
    cargosIds: []
  });

  const [cargos, setCargos] = useState([]);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [salvando, setSalvando] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const isEditando = !!usuario?.id;

  // ======== BUSCA CARGOS ========
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const cargosData = await roleService.getAll();
        setCargos(cargosData || []);
      } catch (err) {
        console.error("Erro ao carregar cargos:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // ======== PREENCHE FORMULÁRIO ========
  useEffect(() => {
    if (usuario) {
      setForm({
        name: usuario.name || "",
        email: usuario.email || "",
        celular: usuario.celular || "",
        dataNascimento: usuario.dataNascimento
          ? String(usuario.dataNascimento).split("T")[0]
          : "",
        password: "",
        cargosIds: usuario.cargosIds?.map(c => c.id) || []
      });
      setMensagem({ tipo: "", texto: "" });
      setErros({});
    }
  }, [usuario]);

  // ======== VALIDAÇÕES ========
  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarSenha(senha) {
    return senha.length >= 6 || isEditando;
  }

  function validarDataNascimento(data) {
    if (!data) return true;
    const hoje = new Date();
    const dataNasc = new Date(data);
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const m = hoje.getMonth() - dataNasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }
    return idade >= 18 && idade <= 120;
  }

  function aplicarMascaraCelular(valor) {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .slice(0, 15);
  }

  // ✅ OPÇÕES PARA O REACT-SELECT
  const cargosOptions = cargos.map(cargo => ({
    value: cargo.id,
    label: cargo.nome
  }));

  // ✅ VALORES SELECIONADOS
  const cargosSelected = cargosOptions.filter(option => 
    form.cargosIds.includes(option.value)
  );

  // ✅ HANDLER PARA O MULTI-SELECT
  const handleCargosChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setForm(prev => ({ ...prev, cargosIds: selectedIds }));
  };

  function handleChange(e) {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "celular") novoValor = aplicarMascaraCelular(value);

    setForm((prev) => ({ ...prev, [name]: novoValor }));

    // Validações em tempo real
    if (name === "email" && value && !validarEmail(value)) {
      setErros((prev) => ({ ...prev, email: "E-mail inválido" }));
    } else if (name === "email") {
      setErros((prev) => ({ ...prev, email: "" }));
    }

    if (name === "password" && !validarSenha(value)) {
      setErros((prev) => ({
        ...prev,
        password: "A senha deve ter pelo menos 6 caracteres",
      }));
    } else if (name === "password") {
      setErros((prev) => ({ ...prev, password: "" }));
    }

    if (name === "dataNascimento") {
      if (value && !validarDataNascimento(value)) {
        setErros((prev) => ({
          ...prev,
          dataNascimento: "Usuário deve ter entre 18 e 120 anos",
        }));
      } else {
        setErros((prev) => ({ ...prev, dataNascimento: "" }));
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validações finais
    if (!validarEmail(form.email)) {
      setErros((prev) => ({ ...prev, email: "E-mail inválido" }));
      return;
    }

    if (!isEditando && !validarSenha(form.password)) {
      setErros((prev) => ({
        ...prev,
        password: "A senha deve ter pelo menos 6 caracteres",
      }));
      return;
    }

    if (form.dataNascimento && !validarDataNascimento(form.dataNascimento)) {
      setErros((prev) => ({
        ...prev,
        dataNascimento: "Usuário deve ter entre 18 e 120 anos",
      }));
      return;
    }

    // ✅ Monta payload
    const payload = {
      ...form,
      ativo: true,
      permissoesIds: []
    };

    if (form.dataNascimento) {
      const data = new Date(form.dataNascimento + "T00:00:00.000Z");
      payload.dataNascimento = data.toISOString();
    } else {
      payload.dataNascimento = null;
    }

    // Remove senha vazia na edição
    if (isEditando && !payload.password) {
      delete payload.password;
    }

    setSalvando(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      await onSave(payload);
      setMensagem({
        tipo: "sucesso",
        texto: isEditando
          ? "Usuário atualizado com sucesso!"
          : "Usuário criado com sucesso!",
      });

      setTimeout(() => onCancel(), 1200);
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Erro ao salvar usuário. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  }

  // ✅ ESTILOS CUSTOMIZADOS PARA O REACT-SELECT
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '10px',
      border: state.isFocused ? '1px solid #2563eb' : '1px solid #d1d5db',
      background: state.isFocused ? '#ffffff' : '#f9fafb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
      minHeight: '48px',
      transition: 'all 0.25s ease',
      '&:hover': {
        borderColor: '#9ca3af',
        background: '#ffffff'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '4px 12px'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#eff6ff',
      borderRadius: '8px',
      padding: '2px 4px',
      border: '1px solid #bfdbfe'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1e40af',
      fontWeight: '600',
      fontSize: '13px',
      padding: '3px 6px'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#3b82f6',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#dbeafe',
        color: '#1e40af'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '14px'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      zIndex: 9999
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : state.isFocused ? '#1e40af' : '#111827',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px',
      fontWeight: state.isSelected ? '600' : '500',
      borderRadius: '6px',
      marginBottom: '2px',
      '&:active': {
        backgroundColor: '#2563eb'
      }
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#d1d5db'
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'color 0.2s',
      '&:hover': {
        color: '#2563eb'
      }
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      transition: 'color 0.2s',
      '&:hover': {
        color: '#2563eb'
      }
    }),
    loadingIndicator: (provided) => ({
      ...provided,
      color: '#2563eb'
    })
  };

  if (loadingData) {
    return (
      <div className="editar-usuario-modal">
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Carregando dados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-usuario-modal">
      <form onSubmit={handleSubmit} noValidate>
        <h2>{isEditando ? "Editar Usuário" : "Adicionar Usuário"}</h2>

        <label htmlFor="name">
          <FiUser size={16} /> Nome:
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Digite o nome completo"
          autoFocus
          required
        />

        <label htmlFor="email">
          <FiMail size={16} /> Email:
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
        {erros.email && <p className="erro-campo">{erros.email}</p>}

        <label htmlFor="celular">
          <FiPhone size={16} /> Celular:
        </label>
        <input
          id="celular"
          type="tel"
          name="celular"
          value={form.celular}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
          required
        />

        <label htmlFor="password">
          <FiLock size={16} /> {isEditando ? "Nova senha (opcional):" : "Senha:"}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder={
            isEditando
              ? "Deixe em branco para não alterar"
              : "Mínimo 6 caracteres"
          }
          className={erros.password ? "input-erro" : ""}
          required={!isEditando}
        />
        {erros.password && <p className="erro-campo">{erros.password}</p>}

        <label htmlFor="dataNascimento">
          <FiCalendar size={16} /> Data de Nascimento:
        </label>
        <input
          id="dataNascimento"
          type="date"
          name="dataNascimento"
          value={form.dataNascimento}
          onChange={handleChange}
          className={erros.dataNascimento ? "input-erro" : ""}
        />
        {erros.dataNascimento && (
          <p className="erro-campo">{erros.dataNascimento}</p>
        )}

        {/* ✅ REACT-SELECT PARA CARGOS */}
        <label htmlFor="cargos">
          <FiShield size={16} /> Cargos:
        </label>
        <Select
          id="cargos"
          isMulti
          options={cargosOptions}
          value={cargosSelected}
          onChange={handleCargosChange}
          styles={customSelectStyles}
          placeholder="Selecione os cargos..."
          noOptionsMessage={() => "Nenhum cargo disponível"}
          loadingMessage={() => "Carregando..."}
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <p className="info-message-modal">
          ℹ️ As permissões são definidas pelos cargos selecionados
        </p>

        {mensagem.texto && (
          <div
            className={
              mensagem.tipo === "sucesso"
                ? "mensagem-sucesso"
                : "mensagem-erro"
            }
          >
            {mensagem.texto}
          </div>
        )}

        <div className="editar-usuario-actions">
          <button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={onCancel} disabled={salvando}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
