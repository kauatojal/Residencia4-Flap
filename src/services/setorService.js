import api from "./api";

// CRUD de setores

async function list() {
  const response = await api.get("/v1/setor/all");
  return response.data;
}

async function getById(id) {
  const response = await api.get(`/v1/setor/${id}`);
  return response.data;
}

async function create(data) {
  const response = await api.post("/v1/setor", data);
  return response.data;
}

async function update(id, data) {
  const response = await api.put("/v1/setor", { id, ...data });
  return response.data;
}

async function remove(id) {
  await api.delete(`/v1/setor/${id}`);
}

export default { list, getById, create, update, remove };
