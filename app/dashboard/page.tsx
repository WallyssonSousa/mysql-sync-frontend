"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Archive, Clock, Database, Activity, Users, Server } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { databaseApi } from "@/lib/api"
import { exportApi } from "@/lib/export-api"
import { ExportLog } from "@/lib/export-api"

type UserRole = "admin" | "user"

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [databasesCount, setDatabasesCount] = useState<number | null>(null)
  const [logs, setLogs] = useState<ExportLog[]>([])
  const [ successBackupCount, setBackupSuccessCount ] = useState(0);
  const [backupTotalCount, setBackupTotalCount] = useState(0)
 
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const { data } = await exportApi.getExportLogs()
        const successBackups = data.filter((log: ExportLog) => log.status === "SUCCESS")
        setBackupSuccessCount(successBackups.length)
        setBackupTotalCount(data.length)
      } catch (error) {
        console.error("Erro ao buscar logs:", error)
      }
    }

    fetchBackups()
  }, [])


  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")

    setRole("admin")
    setLoading(false)
  }, [router])

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await databaseApi.getDatabases()
        const databases = response.data || []
        setDatabasesCount(databases.length)
      } catch (error) {
        console.error("Erro ao buscar bancos:", error)
        setDatabasesCount(0)
      }
    }
    fetchDatabases()
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await exportApi.getExportLogs();
        const sorted = data.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
        setLogs(sorted.slice(0, 5))
      } catch (error) {
        console.error("Erro ao buscar logs: ", error)
      }
    }

    fetchLogs()
  }, [])



  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Bancos & Tabelas",
      description: "Visualize todos os bancos de dados e tabelas disponíveis para sincronização.",
      icon: Database,
      href: "/dashboard/databases",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      roles: ["admin", "user"],
    },
    {
      title: "Backup",
      description: "Crie backups e visualize logs de backups realizados.",
      icon: Archive,
      href: "/dashboard/backup",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      roles: ["admin"],
    },
    {
      title: "Agendamentos",
      description: "Crie, edite e visualize logs de agendamentos de exportação de dados.",
      icon: Clock,
      href: "/dashboard/schedules",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      roles: ["admin", "user"],
    },
  ]

  const backupPercentage =
    backupTotalCount > 0 ? Math.round((successBackupCount / backupTotalCount) * 100) : 0

  const stats = [
    {
      title: "Bancos Ativos",
      value: databasesCount !== null ? databasesCount.toString() : "--",
      icon: Server,
      change: databasesCount !== null ? `Total encontrado` : "Carregando...",
    },
    {
      title: "Backups",
      value: successBackupCount.toString(),
      icon: Archive,
      change: `${backupPercentage}% sucesso`,
    },
    {
      title: "Usuários Online",
      value: "24",
      icon: Users,
      change: "+12% vs ontem",
    },
    {
      title: "Status Sistema",
      value: "99.9%",
      icon: Activity,
      change: "Operacional",
    },
  ]

  const filteredActions = quickActions.filter((action) => role && action.roles.includes(role))

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Bem-vindo de volta</h1>
        <p className="text-muted-foreground">Aqui está um resumo das suas atividades e sistemas.</p>
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
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.title}
                className="hover:shadow-lg transition-all cursor-pointer group hover:scale-[1.02]"
                onClick={() => router.push(action.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {action.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {log.status === "SUCCESS"
                        ? "Backup realizado"
                        : log.status === "error"
                          ? "Erro na exportação"
                          : "Exportação em andamento"}
                    </p>
                    <p className="text-xs text-muted-foreground">{log.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
