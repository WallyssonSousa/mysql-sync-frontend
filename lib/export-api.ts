import { api } from './api';

export interface ExportConfig {
  id?: number;
  cron: string;
  target: string;
  path: string;
  backupDatabase: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "1" | "0";
}

export interface ExportLog {
  created_at: string | number | Date;
  id: number;
  schedule_id: number;
  status: "SUCCESS" | "error" | "running";
  message: string;
}

export interface ExportLogsResponse {
  logs: ExportLog[];
  stats: {
    total: number;
    sucess: number; 
    failed: number;
  };
}

export const exportApi = {
  getExportLogs: () => api.get<ExportLogsResponse>("/export/export-logs"),

  createExport: (exportData: Omit<ExportConfig, "id" | "createdAt" | "updatedAt">) =>
    api.post<ExportConfig>("/export", exportData),

  updateExport: (id: number, exportData: Partial<ExportConfig>) =>
    api.put<ExportConfig>(`/export/${id}`, exportData),

  getExports: () => api.get<ExportConfig[]>("/export"),

  deleteExport: (id: number) => api.delete(`/export/${id}`),
};
