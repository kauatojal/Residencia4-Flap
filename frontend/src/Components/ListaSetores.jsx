import React, { useEffect, useState } from "react";
import setorService from "../services/setorService";

export default function ListaSetores() {
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [novoSetor, setNovoSetor] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");

  const carregarSetores = async () => {
    setLoading(true);
    setErro("");
    try {
      const data = await setorService.list();
      setSetores(data);
    } catch {
      setErro("Erro ao carregar setores.");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarSetores();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await setorService.create({ nome: novoSetor });
      setNovoSetor("");
      carregarSetores();
    } catch {
      setErro("Erro ao cadastrar setor.");
    }
  };

  const handleEdit = (setor) => {
    setEditId(setor.id);
    setEditNome(setor.nome);
  };

  const handleSave = async (id) => {
    try {
      await setorService.update(id, { nome: editNome });
      setEditId(null);
      setEditNome("");
      carregarSetores();
    } catch {
      setErro("Erro ao editar setor.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este setor?")) {
      try {
        await setorService.remove(id);
        carregarSetores();
      } catch {
        setErro("Erro ao excluir setor.");
      }
    }
  };

  if (loading) return <div>Carregando setores...</div>;
  if (erro) return <div>{erro}</div>;

  return (
    <div>
      <h2>Setores</h2>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          value={novoSetor}
          onChange={e => setNovoSetor(e.target.value)}
          placeholder="Novo setor"
          required
        />
        <button type="submit">Adicionar</button>
      </form>
      <ul>
        {setores.map(setor => (
          <li key={setor.id}>
            {editId === setor.id ? (
              <>
                <input
                  type="text"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                />
                <button onClick={() => handleSave(setor.id)}>Salvar</button>
                <button onClick={() => setEditId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                {setor.nome}
                <button onClick={() => handleEdit(setor)}>Editar</button>
                <button onClick={() => handleDelete(setor.id)}>Excluir</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
