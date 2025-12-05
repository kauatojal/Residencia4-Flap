import React, { useEffect, useState } from "react";
import permissionService from "../services/permissionService";

export default function ListaPermissoes() {
  const [permissoes, setPermissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [novaPermissao, setNovaPermissao] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");

  const carregarPermissoes = async () => {
    setLoading(true);
    setErro("");
    try {
      const data = await permissionService.list();
      setPermissoes(data);
    } catch {
      setErro("Erro ao carregar permissões.");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarPermissoes();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await permissionService.create({ nome: novaPermissao });
      setNovaPermissao("");
      carregarPermissoes();
    } catch {
      setErro("Erro ao cadastrar permissão.");
    }
  };

  const handleEdit = (permissao) => {
    setEditId(permissao.id);
    setEditNome(permissao.nome);
  };

  const handleSave = async (id) => {
    try {
      await permissionService.update(id, { nome: editNome });
      setEditId(null);
      setEditNome("");
      carregarPermissoes();
    } catch {
      setErro("Erro ao editar permissão.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir esta permissão?")) {
      try {
        await permissionService.remove(id);
        carregarPermissoes();
      } catch {
        setErro("Erro ao excluir permissão.");
      }
    }
  };

  if (loading) return <div>Carregando permissões...</div>;
  if (erro) return <div>{erro}</div>;

  return (
    <div>
      <h2>Permissões</h2>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          value={novaPermissao}
          onChange={e => setNovaPermissao(e.target.value)}
          placeholder="Nova permissão"
          required
        />
        <button type="submit">Adicionar</button>
      </form>
      <ul>
        {permissoes.map(permissao => (
          <li key={permissao.id}>
            {editId === permissao.id ? (
              <>
                <input
                  type="text"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                />
                <button onClick={() => handleSave(permissao.id)}>Salvar</button>
                <button onClick={() => setEditId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                {permissao.nome}
                <button onClick={() => handleEdit(permissao)}>Editar</button>
                <button onClick={() => handleDelete(permissao.id)}>Excluir</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
