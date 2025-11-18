import axios from "axios";
import { getToken } from "./auth";

const API_URL = "http://localhost:8090/v1/tarefa";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getTasksByList = async (listId) => {
  const res = await axios.get(`${API_URL}/lista/${listId}`, authHeader());
  return res.data;
};

export const createTask = async (data) => {
  const res = await axios.post(`${API_URL}/criar`, data, authHeader());
  return res.data;
};
