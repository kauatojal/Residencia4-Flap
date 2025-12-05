import axios from "axios";
import { getToken } from "./auth";

const API_URL = "http://localhost:8090/lista";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getLists = async (boardId) => {
  const res = await axios.get(`${API_URL}/quadro/${boardId}`, authHeader());
  return res.data;
};

export const createList = async (data) => {
  const res = await axios.post(`${API_URL}/criar`, data, authHeader());
  return res.data;
};
