"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { databaseApi, userApi } from "@/lib/api"
import { exportApi, ExportLog } from "@/lib/export-api"
import { Activity, Archive, Clock, Database, Server, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type UserRole = "admin" | "user"

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [databasesCount, setDatabasesCount] = useState<number | null>(null)
  const [logs, setLogs] = useState<ExportLog[]>([])
  const [successBackupCount, setBackupSuccessCount] = useState(0);
  const [backupTotalCount, setBackupTotalCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState({ value: "0%", change: "Carregando..." });


  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const { data } = await exportApi.getExportLogs()
        const successBackups = data.logs.filter((log) => log.status === "SUCCESS")
        setBackupSuccessCount(successBackups.length)
        setBackupTotalCount(data.logs.length)
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
        const { data } = await exportApi.getExportLogs()
        const sorted = data.logs.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setLogs(sorted.slice(0, 5))
      } catch (error) {
        console.error("Erro ao buscar logs: ", error)
      }
    }
  
    fetchLogs()
  }, [])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await userApi.getUsers();
        setUserCount(response.data.length);
      } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const databasesResponse = await databaseApi.getDatabases();
        const databases = databasesResponse.data || [];

        let totalLogs = 0;
        let errorLogs = 0;

        for (const db of databases) {
          try {
            const logsResponse = await databaseApi.getLogs(db.name);
            const logs = logsResponse.data || [];
            totalLogs += logs.length;
            errorLogs += logs.filter((log: { status: string }) => log.status === "error").length;
          } catch (logError) {
            console.warn(`Não foi possível buscar logs do banco ${db.name}:`, logError);
          }
        }

        const successLogs = totalLogs - errorLogs;
        const healthPercent = totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(1) : "100";

        setSystemStatus({
          value: `${healthPercent}%`,
          change: errorLogs > 0 ? `Erros detectados: ${errorLogs}` : "Operacional",
        });
      } catch (error) {
        console.error("Erro ao buscar bancos:", error);
        setSystemStatus({ value: "0%", change: "Erro ao verificar sistema" });
      }
    };

    fetchSystemStatus();
  }, []);


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
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Backups",
      value: successBackupCount.toString(),
      icon: Archive,
      change: `${backupPercentage}% sucesso`,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Usuários no Sistema",
      value: String(userCount),
      icon: Users,
      change: userCount === 1
        ? "1 usuário cadastrado no sistema"
        : `${userCount} usuários cadastrados no sistema`,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      title: "Status Sistema",
      value: systemStatus.value,
      icon: Activity,
      change: systemStatus.change,
      color:
        parseFloat(systemStatus.value) > 90
          ? "text-green-600"
          : parseFloat(systemStatus.value) > 70
            ? "text-yellow-600"
            : "text-red-600",
      bgColor:
        parseFloat(systemStatus.value) > 90
          ? "bg-green-50 dark:bg-green-950/20"
          : parseFloat(systemStatus.value) > 70
            ? "bg-yellow-50 dark:bg-yellow-950/20"
            : "bg-red-50 dark:bg-red-950/20",
    },
  ];


  const filteredActions = quickActions.filter((action) => role && action.roles.includes(role))

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Bem-vindo de volta</h1>
        <p className="text-muted-foreground">Aqui está um resumo das suas atividades e sistemas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`${stat.color} w-5 h-5`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
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
            <div className="p-2 bg-cyan-50 dark:bg-cyan-950/20 rounded-full">
              <Activity className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-cyan-600 font-semibold">Atividade Recente</span>
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
