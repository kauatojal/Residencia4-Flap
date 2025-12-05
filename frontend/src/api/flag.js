import api from "../config/api";

export const getFlags = async () => {
  const res = await api.get('/flagTarefa/listar');
  return res.data;
};
