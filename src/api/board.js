import api from "../services/api";

export const getBoards = async () => {
  const res = await api.get('/quadro/listar');
  return res.data;
};

export const createBoard = async (data) => {
  const res = await api.post('/quadro/criar', data);
  return res.data;
};
