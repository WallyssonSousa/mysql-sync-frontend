import { api } from "./api"

export interface ExportConfig {
  id: number
  cron: string
  target: string
  path: string
  backupDatabase: string
  createdAt?: string
  updatedAt?: string
  active: number 
}

export interface ExportLog {
  id: number
  schedule_id: number
  status: "SUCCESS" | "FAILED" | "error" | "running"
  message: string
  created_at: string
}

export interface ExportLogsResponse {
  logs: ExportLog[]
  stats: {
    total: number
    sucess: number
    failed: number
  }
}

export type CreateExportPayload = Omit<ExportConfig, "id" | "createdAt" | "updatedAt" | "active">

export const exportApi = {
  getExportLogs: () => api.get<ExportLogsResponse>("/export/export-logs"),

  createExport: (exportData: CreateExportPayload) => api.post<ExportConfig>("/export", exportData),

  updateExport: (id: number, exportData: Partial<CreateExportPayload>) =>
    api.put<ExportConfig>(`/export/${id}`, exportData),

  getExports: () => api.get<ExportConfig[]>("/export"),

  deleteExport: (id: number) => api.delete(`/export/${id}`),
}
