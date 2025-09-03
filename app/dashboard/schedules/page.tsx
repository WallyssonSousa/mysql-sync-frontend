"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  FolderOpen,
} from "lucide-react"

import {
  exportApi,
  type ApiExportConfig,
  type ApiExportLog,
  type CreateExportPayload,
} from "@/lib/export-api"

type UserRole = "admin" | "user"

/**
 * Modelos NORMALIZADOS para o frontend (tipos usados na tela)
 */
type ExportConfigModel = {
  id: number
  cron: string
  target: "local" | "ftp" | "s3" | string
  path: string
  active: boolean
  backupDatabase: string
}

type ExportLogModel = {
  id: number
  exportId: number
  status: "success" | "error" | "running" | string
  message: string
  createdAt: string
}

/** Mapeadores dos payloads da API -> modelos do frontend */
function mapExportConfig(api: ApiExportConfig): ExportConfigModel {
  return {
    id: api.id,
    cron: api.cron,
    target: api.target,
    path: api.path,
    active: api.active === 1,
    backupDatabase: api.backupDatabase,
  }
}

function mapExportLog(api: ApiExportLog): ExportLogModel {
  const normalized = api.status.toUpperCase()
  const statusMap: Record<string, ExportLogModel["status"]> = {
    SUCCESS: "success",
    ERROR: "error",
    RUNNING: "running",
  }
  return {
    id: api.id,
    exportId: api.schedule_id,
    status: statusMap[normalized] ?? api.status.toLowerCase(),
    message: api.message,
    createdAt: api.created_at,
  }
}

export default function ExportControlPage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  // estados com TIPOS concretos (sem any)
  const [exportsCfg, setExportsCfg] = useState<ExportConfigModel[]>([])
  const [logs, setLogs] = useState<ExportLogModel[]>([])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingExport, setEditingExport] = useState<ExportConfigModel | null>(null)

  const [formData, setFormData] = useState<CreateExportPayload>({
    cron: "0 2 * * *", // Daily at 2 AM
    target: "local",
    path: "",
    backupDatabase: "",
  })

  // auth básica
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.push("/login")
      return
    }
    setRole("admin")
    setLoading(false)
  }, [router])

  // carregar exports e logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exportsResponse, logsResponse] = await Promise.all([
          exportApi.getExports().catch(() => ({ data: [] as ApiExportConfig[] })),
          exportApi.getExportLogs().catch(() => ({ data: [] as ApiExportLog[] })),
        ])

        const mappedExports = (exportsResponse.data ?? []).map(mapExportConfig)
        const mappedLogs = (logsResponse.data ?? []).map(mapExportLog)

        setExportsCfg(mappedExports)
        setLogs(mappedLogs)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast.error("Não foi possível carregar os dados de exportação.")
      }
    }

    if (role) fetchData()
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingExport) {
        await exportApi.updateExport(editingExport.id, formData)
        toast.success("Configuração de exportação atualizada com sucesso.")
      } else {
        await exportApi.createExport(formData)
        toast.success("Nova configuração de exportação criada com sucesso.")
      }

      // refresh
      const exportsResponse = await exportApi.getExports().catch(() => ({ data: [] as ApiExportConfig[] }))
      setExportsCfg((exportsResponse.data ?? []).map(mapExportConfig))

      // reset
      setFormData({
        cron: "0 2 * * *",
        target: "local",
        path: "",
        backupDatabase: "",
      })
      setEditingExport(null)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast.error("Não foi possível salvar a configuração.")
    }
  }

  const handleEdit = (exportConfig: ExportConfigModel) => {
    setEditingExport(exportConfig)
    setFormData({
      cron: exportConfig.cron,
      target: exportConfig.target,
      path: exportConfig.path,
      backupDatabase: exportConfig.backupDatabase,
      // active pode ser ajustado por outro controle se desejar
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await exportApi.deleteExport(id)
      setExportsCfg((prev) => prev.filter((exp) => exp.id !== id))
      toast.success("Configuração de exportação removida com sucesso.")
    } catch (error) {
      console.error("Erro ao deletar:", error)
      toast.error("Não foi possível remover a configuração.")
    }
  }

  // === STATS (sem any, derivados por memo) ===
  const stats = useMemo(() => {
    const todayStr = new Date().toDateString()

    const activeCount = exportsCfg.filter((exp) => exp.active).length

    const runsToday = logs.filter((log) => new Date(log.createdAt).toDateString() === todayStr).length

    const successRate =
      logs.length > 0
        ? `${Math.round((logs.filter((l) => l.status === "success").length / logs.length) * 100)}%`
        : "0%"

    return [
      {
        title: "Exportações Ativas",
        value: activeCount.toString(),
        icon: Play,
        change: "Configuradas",
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950/20",
      },
      {
        title: "Exportações Hoje",
        value: runsToday.toString(),
        icon: Download,
        change: "Executadas",
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
      },
      {
        title: "Taxa de Sucesso",
        value: successRate,
        icon: CheckCircle,
        change: "Últimos 30 dias",
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-950/20",
      },
      {
        title: "Status Sistema",
        value: "Online",
        icon: Activity,
        change: "Operacional",
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-950/20",
      },
    ]
  }, [exportsCfg, logs])

  const cronPresets = [
    { label: "A cada minuto", value: "* * * * *" },
    { label: "A cada hora", value: "0 * * * *" },
    { label: "Diário às 2h", value: "0 2 * * *" },
    { label: "Semanal (Domingo)", value: "0 2 * * 0" },
    { label: "Mensal (dia 1)", value: "0 2 1 * *" },
  ] as const

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Controle de Exportação</h1>
          <p className="text-muted-foreground">Gerencie configurações e monitore exportações de dados.</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingExport(null)
                setFormData({
                  cron: "0 2 * * *",
                  target: "local",
                  path: "",
                  backupDatabase: "",
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Exportação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingExport ? "Editar Exportação" : "Nova Configuração de Exportação"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cron">Agendamento (Cron)</Label>
                <Select
                  value={formData.cron}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, cron: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um agendamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {cronPresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Destino</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, target: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="ftp">FTP</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="path">Caminho de Destino</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) => setFormData((prev) => ({ ...prev, path: e.target.value }))}
                  placeholder="C:/Users/USUARIO021/Desktop/export"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupDatabase">Banco de Dados</Label>
                <Input
                  id="backupDatabase"
                  value={formData.backupDatabase}
                  onChange={(e) => setFormData((prev) => ({ ...prev, backupDatabase: e.target.value }))}
                  placeholder="mysqlubsyncdois_backup"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingExport ? "Atualizar" : "Criar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Export Configurations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configurações de Exportação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportsCfg.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma configuração de exportação encontrada.</p>
              <p className="text-sm">Clique em Nova Exportação para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exportsCfg.map((exportConfig) => (
                <div
                  key={exportConfig.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{exportConfig.backupDatabase}</h3>
                      <Badge
                        className={
                          exportConfig.active
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }
                      >
                        {exportConfig.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <Clock className="w-3 h-3 inline mr-1" />
                        Agendamento: {exportConfig.cron}
                      </p>
                      <p>
                        <FolderOpen className="w-3 h-3 inline mr-1" />
                        Destino: {exportConfig.target} - {exportConfig.path}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(exportConfig)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta configuração de exportação? Esta ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(exportConfig.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Logs de Exportação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.slice(0, 10).map((log) => {
            const status = log.status?.toLowerCase()
            return (
              <div
                key={log.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-full ${status === "success"
                        ? "bg-emerald-100"
                        : status === "error"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                        }`}
                    >
                      {status === "success" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : status === "error" ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <span className="font-medium">Exportação #{log.exportId}</span>
                    <Badge
                      className={
                        status === "success"
                          ? "bg-emerald-500 text-white"
                          : status === "error"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-400 text-black"
                      }
                    >
                      {status === "success"
                        ? "Sucesso"
                        : status === "error"
                          ? "Erro"
                          : "Pendente"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
