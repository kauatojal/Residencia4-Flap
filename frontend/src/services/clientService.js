import api from "./api";

async function list() {
  const response = await api.get("/cliente/all");
  return response.data;
}

async function getById(id) {
  const response = await api.get(`/cliente/${id}`);
  return response.data;
}

async function getByName(name) {
  const response = await api.get(`/cliente/nome/${name}`);
  return response.data;
}

async function create(data) {
  const response = await api.post("/cliente", data);
  return response.data;
}

async function update(id, data) {
  const response = await api.put(`/cliente/${id}`, data);
  return response.data;
}

async function remove(id) {
  await api.delete(`/cliente/${id}`);
}

export default { list, getByName, getById, create, update, remove };
