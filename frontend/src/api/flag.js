import axios from "axios";
import { getToken } from "./auth";

const API_URL = "http://localhost:8090/flagTarefa";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getFlags = async () => {
  const res = await axios.get(`${API_URL}/listar`, authHeader());
  return res.data;
};
