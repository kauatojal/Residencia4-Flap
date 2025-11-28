import api from "./api";

async function list() {
  const response = await api.get("/flag/all");
  return response.data;
}

async function getById(id) {
  const response = await api.get(`/flag/${id}`);
  return response.data;
}

async function getByName(name) {
  const response = await api.get(`/flag/nome/${name}`);
  return response.data;
}

async function create(data) {
  const response = await api.post("/flag", data);
  return response.data;
}

async function update(id, data) {
  const response = await api.put(`/flag/${id}`, data);
  return response.data;
}

async function remove(id) {
  await api.delete(`/flag/${id}`);
}

export default { list, getByName, getById, create, update, remove };
