import api from "./api";

// ======== LISTAR TODOS OS USUÁRIOS ========
async function list() {
  try {
    const response = await api.get("/user"); // ✅ Endpoint correto (sem /v1/)
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao listar usuários:", error);
    throw new Error(error.response?.data?.message || "Falha ao carregar lista de usuários");
  }
}

// ======== OBTER USUÁRIO LOGADO ========
async function getMe() {
  try {
    const response = await api.get("/user/me");
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao obter dados do usuário logado:", error);
    throw new Error(error.response?.data?.message || "Falha ao buscar usuário autenticado");
  }
}

// ======== OBTER USUÁRIO POR ID ========
async function getById(id) {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao obter usuário ${id}:`, error);
    throw new Error(error.response?.data?.message || "Falha ao buscar usuário");
  }
}

// ======== CRIAR NOVO USUÁRIO ========
async function create(userData) {
  try {
    // ✅ LIMPA CAMPOS VAZIOS ANTES DE ENVIAR
    const cleanData = { ...userData };
    
    // Remove dataNascimento se estiver vazio/null/undefined
    if (!cleanData.dataNascimento) {
      delete cleanData.dataNascimento;
    }

    // Remove senha vazia
    if (!cleanData.password || cleanData.password.trim() === "") {
      delete cleanData.password;
    }

    // Remove campos undefined ou null
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === null || cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    console.log("📤 Criando usuário:", cleanData);

    const response = await api.post("/auth/register", cleanData);
    
    console.log("✅ Usuário criado com sucesso:", response.data);
    return response.data; // ✅ Retorna os dados diretamente
    
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
    
    // ✅ RETORNA MENSAGEM ESPECÍFICA DO BACKEND
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Falha ao criar usuário";
    
    throw new Error(errorMessage);
  }
}

// ======== ATUALIZAR USUÁRIO ========
async function update(id, userData) {
  try {
    // ✅ LIMPA CAMPOS VAZIOS
    const cleanData = { ...userData };
    
    // Remove senha vazia (não atualiza se não foi informada)
    if (!cleanData.password || cleanData.password.trim() === "") {
      delete cleanData.password;
    }

    // Remove dataNascimento se vazio
    if (!cleanData.dataNascimento) {
      delete cleanData.dataNascimento;
    }

    // Remove campos undefined ou null
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === null || cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    console.log(`📤 Atualizando usuário ${id}:`, cleanData);

    const response = await api.put(`/auth/usuarios/${id}`, cleanData);
    
    console.log("✅ Usuário atualizado com sucesso:", response.data);
    return response.data; // ✅ Retorna os dados diretamente
    
  } catch (error) {
    console.error(`❌ Erro ao atualizar usuário ${id}:`, error);
    
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Falha ao atualizar usuário";
    
    throw new Error(errorMessage);
  }
}

// ======== DELETAR USUÁRIO ========
async function remove(id) {
  try {
    console.log(`🗑️ Deletando usuário ${id}`);
    
    const response = await api.delete(`/auth/usuarios/${id}`);
    
    console.log("✅ Usuário deletado com sucesso");
    return response.data;
    
  } catch (error) {
    console.error(`❌ Erro ao deletar usuário ${id}:`, error);
    
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Falha ao deletar usuário";
    
    throw new Error(errorMessage);
  }
}

// ======== EXPORTAÇÃO ========
export default { 
  list, 
  getAll: list, // ✅ Alias para compatibilidade
  getMe, 
  getById, // ✅ Adicionado
  create, 
  update, 
  remove 
};
