// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchAppointments = async () => {
  try {
    const response = await api.get("/appointments");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
