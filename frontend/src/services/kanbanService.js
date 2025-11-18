import api from "./api";

const kanbanService = {
  // 🟦 QUADROS
  listQuadros: async () => (await api.get("/quadros/all")).data,
  createQuadro: async (data) => (await api.post("/quadros", data)).data,
  getQuadro: async (id) => (await api.get(`/quadros/${id}`)).data,

  // 🟩 LISTAS
  listListas: async (quadroId) => (await api.get(`/lista/all/${quadroId}`)).data,
  createLista: async (data) => (await api.post("/lista", data)).data,

  // 🟨 TAREFAS
  listTarefas: async (listaId) => (await api.get(`/tarefa/by-lista/${listaId}`)).data,
  getTarefa: async (id) => (await api.get(`/tarefa/${id}`)).data,
  createTarefa: async (data) => (await api.post("/tarefa", data)).data,
  updateTarefa: async (id, data) => (await api.put(`/tarefa/${id}`, data)).data,
  deleteTarefa: async (id) => (await api.delete(`/tarefa/${id}`)).data,
  moveTarefa: async (tarefaId, listaDestinoId) =>
    (await api.put(`/tarefa/${tarefaId}/mover-lista`, { listaDestinoId })).data,

  // 🟥 FLAGS
  listFlags: async () => (await api.get("/flag-tarefa/all")).data,
  setFlag: async (tarefaId, flagId) =>
    (await api.put(`/tarefa/${tarefaId}/flag`, { flagId })).data,

  // 🟪 ANEXOS
  listAnexos: async (tarefaId) => (await api.get(`/tarefa/${tarefaId}/anexos`)).data,
  uploadAnexo: async (tarefaId, formData) =>
    (await api.post(`/tarefa/${tarefaId}/anexos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data,
  deleteAnexo: async (tarefaId, anexoId) =>
    (await api.delete(`/tarefa/${tarefaId}/anexos/${anexoId}`)).data,

  // 🟧 COMENTÁRIOS
  listComentarios: async (tarefaId) =>
    (await api.get(`/tarefa/${tarefaId}/comentarios`)).data,
  addComentario: async (tarefaId, data) =>
    (await api.post(`/tarefa/${tarefaId}/comentarios`, data)).data,
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
};

export default kanbanService;
