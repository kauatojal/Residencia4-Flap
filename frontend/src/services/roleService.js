import api from "./api";

async function list() {
  const response = await api.get("/cargo/all"); // ✅ SEM /v1/
  return response.data;
}

async function getById(id) {
  const response = await api.get(`/cargo/${id}`);
  return response.data;
}

async function create(roleData) {
  const response = await api.post("/cargo", roleData);
  return response.data;
}

async function update(id, roleData) {
  const response = await api.put(`/cargo/${id}`, roleData);
  return response.data;
}

async function remove(id) {
  await api.delete(`/cargo/${id}`);
}

export default { 
  list, 
  getAll: list, // ✅ Alias para compatibilidade
  getById, 
  create, 
  update, 
  remove 
};
