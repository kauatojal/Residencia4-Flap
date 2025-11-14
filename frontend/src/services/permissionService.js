import api from "./api";

// CRUD de permissões

async function list() {
  const response = await api.get("/permissao/all");
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

export default { list, getById, create, update, remove };
