import api from "./api";

async function list() {
  try {
    const response = await api.get("/user");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    throw new Error("Falha ao carregar lista de usuários");
  }
}

async function getMe() {
  try {
    const response = await api.get("/user/me");
    return response.data;
  } catch (error) {
    console.error("Erro ao obter dados do usuário logado:", error);
    throw new Error("Falha ao buscar usuário autenticado");
  }
}

async function create(userData) {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, data: response.data };
    }
    return { success: false };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Falha ao criar usuário");
  }
}

async function update(id, userData) {
  try {
    const response = await api.put(`/auth/usuarios/${id}`, userData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, data: response.data };
    }
    return { success: false };
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error);
    throw new Error("Falha ao atualizar usuário");
  }
}

async function remove(id) {
  try {
    const response = await api.delete(`/auth/usuarios/${id}`);
    if (response.status >= 200 && response.status < 300) {
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error(`Erro ao deletar usuário ${id}:`, error);
    throw new Error("Falha ao deletar usuário");
  }
}

export default { list, getMe, create, update, remove };
