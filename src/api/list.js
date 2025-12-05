import api from "../services/api";

export const getLists = async (boardId) => {
  const res = await api.get(`/lista/quadro/${boardId}`);
  return res.data;
};

export const createList = async (data) => {
  const res = await api.post('/lista/criar', data);
  return res.data;
};
