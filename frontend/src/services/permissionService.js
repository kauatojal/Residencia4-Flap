import api from "./api";

async function list() {
  const response = await api.get("/permissao/all"); // ✅ SEM /v1/
  return response.data;
}

async function getById(id) {
  const response = await api.get(`/permissao/${id}`);
  return response.data;
}

async function create(data) {
  const response = await api.post("/permissao", data);
  return response.data;
}

async function update(id, data) {
  const response = await api.put(`/permissao/${id}`, data);
  return response.data;
}

async function remove(id) {
  await api.delete(`/permissao/${id}`);
}

export default { 
  list, 
  getAll: list, // ✅ Alias para compatibilidade
  getById, 
  create, 
  update, 
  remove 
};
