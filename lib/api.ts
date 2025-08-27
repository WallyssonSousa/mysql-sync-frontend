// lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const databaseApi = {
  getDatabases: () => api.get("/sync/databases"),
  getTables: (databaseName: string) =>
    api.get(`/sync/tables/${encodeURIComponent(databaseName)}`), 
};
