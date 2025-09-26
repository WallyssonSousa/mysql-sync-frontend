import { api } from "./api"

export interface Pattern {
  id: number
  pattern: string
  active: boolean
  created_at: string
}

export interface CreatePatternRequest {
  pattern: string
}

export interface ScanResult {
  message: string
}


export const patternApi = {
  createPattern: (data: CreatePatternRequest) => api.post<{ message: string; pattern: string }>("/patterns", data),

  listPatterns: () => api.get<Pattern[]>("/patterns"),

  scanDatabases: () => api.post<ScanResult>("/patterns/scan"),
}
