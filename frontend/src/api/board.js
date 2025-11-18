import axios from "axios";
import { getToken } from "./auth";

const API_URL = "http://localhost:8090/quadro";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getBoards = async () => {
  const res = await axios.get(`${API_URL}/listar`, authHeader());
  return res.data;
};

export const createBoard = async (data) => {
  const res = await axios.post(`${API_URL}/criar`, data, authHeader());
  return res.data;
};
