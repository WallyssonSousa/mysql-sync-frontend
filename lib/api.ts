import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

// Adiciona token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API de bancos de dados
export const databaseApi = {
  getDatabases: () => api.get("/sync/databases"),
  getTables: (databaseName: string) =>
    api.get(`/sync/tables/${encodeURIComponent(databaseName)}`),
  getLogs: (databaseName: string) =>
    api.get(`/sync/backup/${encodeURIComponent(databaseName)}/logs`),
};

// Backup API endpoints
export const backupApi = {
  createBackup: (backupData: {
    sourceDatabase: string;
    backupDatabase: string;
    backupHost: string;
    backupUser: string;
    backupPassword: string;
    tables: { name: string; columns: string }[];
  }) => api.post("/sync/backup", backupData),
  /* getBackups: () => api.get("/sync/backups"), */
};

// API de usuários
export const userApi = {
  getUsers: () => api.get("/auth/users"),
  register: (data: { username: string; password_hash: string; role: string }) =>
    api.post("/auth/register", data),
  updateUser: (id: number, data: { username?: string; password_hash?: string; role?: string }) =>
    api.put(`/auth/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
}

