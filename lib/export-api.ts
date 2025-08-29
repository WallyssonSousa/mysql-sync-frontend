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
    id: number
    exportId: number
    status: "SUCESS" | "error" | "running"
    message: string
    startTime: string
    endTime?: string
    recordsExported?: number
}

export const exportApi = {
  // Get all export logs
  getExportLogs: () => api.get<ExportLog[]>("/export/export-logs"),

  // Create new export configuration
  createExport: (exportData: Omit<ExportConfig, "id" | "createdAt" | "updatedAt">) =>
    api.post<ExportConfig>("/export", exportData),

  // Update existing export configuration
  updateExport: (id: number, exportData: Partial<ExportConfig>) => api.put<ExportConfig>(`/export/${id}`, exportData),

  // Get all export configurations (assuming this endpoint exists)
  getExports: () => api.get<ExportConfig[]>("/export"),

  // Delete export configuration (assuming this endpoint exists)
  deleteExport: (id: number) => api.delete(`/export/${id}`),
}