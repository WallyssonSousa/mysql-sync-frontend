"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Archive, Clock, Database, Activity, Users, Server } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { databaseApi } from "@/lib/api"

type UserRole = "admin" | "user"

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [databasesCount, setDatabasesCount] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")

    setRole("admin")
    setLoading(false)
  }, [router])

  // Busca quantidade de bancos ativos
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

  const stats = [
    {
      title: "Bancos Ativos",
      value: databasesCount !== null ? databasesCount.toString() : "--",
      icon: Server,
      change: databasesCount !== null ? `Total encontrado` : "Carregando...",
    },
    {
      title: "Backups Hoje",
      value: "8",
      icon: Archive,
      change: "100% sucesso",
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

      {/* Quick Actions */}
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
            {[
              { action: "Backup realizado", target: "database_prod", time: "2 min atrás" },
              { action: "Usuário conectado", target: "admin@datasync.com", time: "5 min atrás" },
              { action: "Agendamento criado", target: "export_daily", time: "1 hora atrás" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.target}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
