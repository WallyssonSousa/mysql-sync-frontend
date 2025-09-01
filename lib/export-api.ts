import { api } from './api';

export interface ExportConfig{
    id?: number
    cron: string
    target: string
    path: string
    backupDatabase: string
    createdAt?: string
    updatedAt?: string
    status?: "1" | "0" 
}

export interface ExportLog{
    created_at: string | number | Date;
    id: number
    exportId: number
    status: "SUCESS" | "error" | "running"
    message: string
    startTime: string
    endTime?: string
    recordsExported?: number
}

export const exportApi = {
  getExportLogs: () => api.get<ExportLog[]>("/export/export-logs"),

  createExport: (exportData: Omit<ExportConfig, "id" | "createdAt" | "updatedAt">) =>
    api.post<ExportConfig>("/export", exportData),

  updateExport: (id: number, exportData: Partial<ExportConfig>) => api.put<ExportConfig>(`/export/${id}`, exportData),

  getExports: () => api.get<ExportConfig[]>("/export"),

  deleteExport: (id: number) => api.delete(`/export/${id}`),
}