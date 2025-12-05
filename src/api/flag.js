import api from "../services/api";

export const getFlags = async () => {
  const res = await api.get('/flagTarefa/listar');
  return res.data;
};
