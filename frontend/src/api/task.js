import api from "../config/api";

export const getTasksByList = async (listId) => {
  const res = await api.get(`/tarefa/lista/${listId}`);
  return res.data;
};

export const createTask = async (data) => {
  const res = await api.post('/tarefa/criar', data);
  return res.data;
};
