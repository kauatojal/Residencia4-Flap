import api from "./api";

// Usa o endpoint de login para autenticação
async function login(email, senha) {
  const response = await api.post("/auth/login", { email, senha });
  return response.data; // { token: ... }
}

// Retorna informações do usuário autenticado
async function getMe() {
  const response = await api.get("/user/me");
  return response.data;
}

// CRUD usuário
async function list() {
  const response = await api.get("/user");
  return response.data;
}

// endpoint para criação de usuário fica em /auth/register

async function create(userData) {
  const response = await api.post("/auth/user", userData);
  return response.data;
}

async function update(id, userData) {
  const response = await api.put(`/auth/user/${id}`, userData);
  return response.data;
}

// endpoint para remoção de usuário deve ficar em /auth/user
async function remove(id) {
  await api.delete(`/auth/user/${id}`);
}

export default { login, getMe, list, create, update, remove };
