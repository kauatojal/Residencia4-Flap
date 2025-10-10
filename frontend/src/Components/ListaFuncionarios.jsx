import React from "react";
import "./ListaFuncionarios.css";

export default function ListaFuncionarios() {
  const funcionarios = [
    { id: 1, nome: "João Silva", cargo: "Designer", setor: "Criação" },
    { id: 2, nome: "Maria Souza", cargo: "Atendimento", setor: "Comercial" },
    { id: 3, nome: "Carlos Lima", cargo: "Social Media", setor: "Mídia" },
  ];

  const handleEdit = (id) => {
    alert(`Editar funcionário ID: ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja realmente excluir este funcionário?")) {
      alert(`Funcionário ID ${id} excluído`);
    }
  };

  return (
    <div className="lista-funcionarios-container">
      <h2>Lista de Funcionários</h2>
      <table className="tabela-funcionarios">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((f) => (
            <tr key={f.id}>
              <td>{f.nome}</td>
              <td>{f.cargo}</td>
              <td>{f.setor}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEdit(f.id)}>Editar</button>
                <button className="btn-excluir" onClick={() => handleDelete(f.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-adicionar">+ Adicionar Funcionário</button>
    </div>
  );
}
