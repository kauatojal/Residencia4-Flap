import React, { useState, useEffect } from "react";
import "./EditarUsuario.css";

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

  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [salvando, setSalvando] = useState(false);

  const isEditando = !!usuario?.id;

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || "",
        email: usuario.email || "",
        celular: usuario.celular || "",
        setor: usuario.setor || "",
        senha: "",
      });
      setMensagem({ tipo: "", texto: "" });
      setErros({});
    }
  }, [usuario]);

  // ======== FUNÇÕES DE MÁSCARA E VALIDAÇÃO ==========
  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarSenha(senha) {
    return senha.length >= 6 || isEditando;
  }

  function aplicarMascaraCelular(valor) {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .slice(0, 15);
  }

  // ==================================================

  function handleChange(e) {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "celular") novoValor = aplicarMascaraCelular(value);

    setForm((prev) => ({ ...prev, [name]: novoValor }));

    // validações em tempo real
    if (name === "email" && value && !validarEmail(value)) {
      setErros((prev) => ({ ...prev, email: "E-mail inválido" }));
    } else if (name === "email") {
      setErros((prev) => ({ ...prev, email: "" }));
    }

    if (name === "senha" && !validarSenha(value)) {
      setErros((prev) => ({
        ...prev,
        senha: "A senha deve ter pelo menos 6 caracteres",
      }));
    } else if (name === "senha") {
      setErros((prev) => ({ ...prev, senha: "" }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validações finais antes de salvar
    if (!validarEmail(form.email)) {
      setErros((prev) => ({ ...prev, email: "E-mail inválido" }));
      return;
    }

    if (!isEditando && !validarSenha(form.senha)) {
      setErros((prev) => ({
        ...prev,
        senha: "A senha deve ter pelo menos 6 caracteres",
      }));
      return;
    }

    setSalvando(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      await onSave(form);
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

  return (
    <div className="editar-usuario-modal">
      <form onSubmit={handleSubmit} noValidate>
        <h2>{isEditando ? "Editar Usuário" : "Adicionar Usuário"}</h2>

        <label htmlFor="nome">Nome:</label>
        <input
          id="nome"
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Digite o nome completo"
          autoFocus
          required
        />

        <label htmlFor="email">Email:</label>
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

        <label htmlFor="celular">Celular:</label>
        <input
          id="celular"
          type="tel"
          name="celular"
          value={form.celular}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
          required
        />

        <label htmlFor="setor">Setor:</label>
        <select
          id="setor"
          name="setor"
          value={form.setor}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o setor</option>
          {setores.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <label htmlFor="senha">
          {isEditando ? "Nova Senha (opcional):" : "Senha:"}
        </label>
        <input
          id="senha"
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          placeholder={
            isEditando
              ? "Deixe em branco para não alterar"
              : "Mínimo 6 caracteres"
          }
          className={erros.senha ? "input-erro" : ""}
          required={!isEditando}
        />
        {erros.senha && <p className="erro-campo">{erros.senha}</p>}

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
