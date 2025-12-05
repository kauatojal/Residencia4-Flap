import api from "./api";

const kanbanService = {
  // 🟦 QUADROS
  listQuadros: async () =>
    (await api.get("/quadro/all")).data,

  createQuadro: async (data) =>
    (await api.post("/quadro", data)).data,

  getQuadro: async (id) =>
    (await api.get(`/quadro/${id}`)).data,

  updateQuadro: async (data) =>
    (await api.put("/quadro", data)).data,

  deleteQuadro: async (id) =>
    (await api.delete(`/quadro/${id}`)).data,

  arquivarQuadro: async (id) =>
    (await api.post(`/quadro/${id}/arquivar`)).data,

  // 🟩 LISTAS (COLUNAS)
  listListas: async () =>
    (await api.get("/lista/all")).data,

  listListasByQuadroId: async (quadroId) =>
    (await api.get(`/lista/by-quadro/${quadroId}`)).data,

  createLista: async (data) =>
    (await api.post("/lista", data)).data,

  // ✅ ATUALIZAR LISTA - VERSÃO FINAL CORRIGIDA
  updateLista: async (listaData) => {
    try {
      // ✅ VALIDAÇÕES
      if (!listaData.id) {
        console.error('❌ ERRO: ID da lista não fornecido', listaData);
        throw new Error('O ID da lista é obrigatório para atualização');
      }

      if (!listaData.quadro?.id) {
        console.error('❌ ERRO: ID do quadro não fornecido', listaData);
        throw new Error('O ID do quadro é obrigatório para atualização');
      }

      // ✅ PAYLOAD COM ID NO BODY (CONFORME ListaRequest ATUALIZADO)
      const payload = {
        id: Number(listaData.id),
        nome: listaData.nome,
        posicao: listaData.posicao || 0,
        quadro: {
          id: Number(listaData.quadro.id)
        }
      };

      console.log('📤 PUT /v1/lista - Payload:', JSON.stringify(payload, null, 2));

      const response = await api.put("/lista", payload);
      
      console.log('✅ Lista atualizada com sucesso:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Erro ao atualizar lista:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        mensagem: error.message
      });
      
      // ✅ MENSAGENS DE ERRO ESPECÍFICAS
      if (error.response?.status === 403) {
        throw new Error('Sem permissão para alterar listas. Verifique suas credenciais.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Lista não encontrada.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Dados inválidos.');
      }
      
      throw error;
    }
  },

  deleteLista: async (id) =>
    (await api.delete(`/lista/${id}`)).data,

  // 🟨 TAREFAS (CARDS)
  listTarefas: async () =>
    (await api.get(`/tarefa/all`)).data,

  listTarefasByQuadroId: async (quadroId) =>
    (await api.get(`/tarefa/by-quadro/${quadroId}`)).data,

  listTarefasByListaId: async (listaId) =>
    (await api.get(`/tarefa/by-lista/${listaId}`)).data,

  listListasWithTarefas: async (quadroId) =>
    (await api.get(`/tarefa/listas-com-tarefas`, {
      params: { quadroId },
    })).data,

  listTarefasArquivadas: async (quadroId) =>
    (await api.get(`/tarefa/all/arquivadas/${quadroId}`)).data,

  getTarefa: async (id) =>
    (await api.get(`/tarefa/${id}`)).data,

  getTarefaCompleta: async (id) =>
    (await api.get(`/tarefa/${id}/completo`)).data,

  createTarefa: async (data) =>
    (await api.post("/tarefa", data)).data,

  updateTarefa: async (updateRequest) =>
    (await api.put("/tarefa", updateRequest)).data,

  // compatibilidade com código antigo
  update: async (id, data) =>
    (await api.put("/tarefa", { id, ...data })).data,

  deleteTarefa: async (id) =>
    (await api.delete(`/tarefa/${id}`)).data,

  moveTarefa: async (tarefaId, novaListaId, quadroId) =>
    (await api.put(
      `/tarefa/${tarefaId}/mover-lista`,
      null,
      { params: { novaListaId, quadroId } }
    )).data,

  arquivarTarefa: async (id) =>
    (await api.post(`/tarefa/${id}/arquivar`)).data,

  // 🟥 FLAGS
  listFlags: async () =>
    (await api.get("/flag/all")).data,

  createFlag: async (data) =>
    (await api.post("/flag", data)).data,

  updateFlag: async (id, data) =>
    (await api.put(`/flag/${id}`, data)).data,

  deleteFlag: async (id) =>
    (await api.delete(`/flag/${id}`)).data,

  setFlag: async (tarefaId, flagId) =>
    (await api.put(`/tarefa/${tarefaId}/flag/${flagId}`)).data,

  // 🟪 ANEXOS
  listAnexos: async (tarefaId) =>
    (await api.get(`/tarefa/${tarefaId}/anexos`)).data,

  uploadAnexo: async (tarefaId, formData) =>
    (await api.post(`/tarefa/${tarefaId}/anexos/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data,

  deleteAnexo: async (tarefaId, anexoId) =>
    (await api.delete(`/tarefa/${tarefaId}/anexos/${anexoId}`)).data,

  // 🟧 COMENTÁRIOS
  listComentarios: async (tarefaId) =>
    (await api.get(`/tarefa/${tarefaId}/comentarios`)).data,

  addComentario: async (tarefaId, data) =>
    (await api.post(`/tarefa/${tarefaId}/comentarios/add`, data)).data,

  deleteComentario: async (tarefaId, comentarioId) =>
    (await api.delete(`/tarefa/${tarefaId}/comentarios/${comentarioId}`)).data,

  // 🟫 CHECKLISTS
  listChecklists: async (tarefaId) =>
    (await api.get(`/tarefa/${tarefaId}/checklists`)).data,

  addChecklist: async (tarefaId, data) =>
    (await api.post(`/tarefa/${tarefaId}/checklists`, data)).data,

  updateChecklist: async (tarefaId, checklistId, data) =>
    (await api.put(`/tarefa/${tarefaId}/checklists/${checklistId}`, data)).data,

  deleteChecklist: async (tarefaId, checklistId) =>
    (await api.delete(`/tarefa/${tarefaId}/checklists/${checklistId}`)).data,

  // 👥 CLIENTES
  listClientes: async () =>
    (await api.get("/cliente/all")).data,

  createCliente: async (data) =>
    (await api.post("/cliente", data)).data,

  updateCliente: async (id, data) =>
    (await api.put(`/cliente/${id}`, data)).data,

  deleteCliente: async (id) =>
    (await api.delete(`/cliente/${id}`)).data,

  arquivarCliente: async (id) =>
    (await api.post(`/cliente/${id}/arquivar`)).data,

  // 👤 USUÁRIOS/MEMBROS
  listMembros: async () =>
    (await api.get("/usuario/all")).data,

  getMembro: async (id) =>
    (await api.get(`/usuario/${id}`)).data,
};

export default kanbanService;
