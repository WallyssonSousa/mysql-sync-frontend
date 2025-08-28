"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { databaseApi } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Database, Activity, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type LogItem = {
  id: number
  event_type: string
  table_name: string
  event_data: Record<string, any>
  created_at: string
}

export default function LogsPage() {
  const { database } = useParams<{ database: string }>()
  const [logs, setLogs] = useState<LogItem[]>([])
  const [status, setStatus] = useState<string>("")
  const [checkpoint, setCheckpoint] = useState<LogItem | null>(null)
  const [totalLogs, setTotalLogs] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!database) throw new Error("Nome do banco não definido")

        const response = await databaseApi.getLogs(database)
        const data = response.data

        if (data?.logs) {
          setLogs(data.logs)
          setStatus(data.status)
          setCheckpoint(data.checkpoint ?? null)
          setTotalLogs(data.totalLogs ?? data.logs.length)
        } else {
          setLogs([])
        }
      } catch (err) {
        console.error("Erro ao buscar logs:", err)
        setLogs([]) 
        setStatus("offline")
        setCheckpoint(null)
        setTotalLogs(0)
        setError("Não foi possível carregar os logs deste banco.")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [database])


  const formatDate = (date: string) =>
    new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Database className="w-6 h-6" /> Logs do banco: {database}
      </h1>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-5 h-5" />
          Carregando logs...
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mb-4 flex flex-wrap gap-4">
            <Card className="flex-1 min-w-[200px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span
                  className={`font-semibold ${status === "online" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {status || "Desconhecido"}
                </span>
              </CardContent>
            </Card>

            {checkpoint && (
              <Card className="flex-1 min-w-[250px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Último Checkpoint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Evento <b>{checkpoint.event_type}</b> na tabela{" "}
                    <b>{checkpoint.table_name}</b> em {formatDate(checkpoint.created_at)}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="flex-1 min-w-[150px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="font-semibold">{totalLogs}</span>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-[70vh] w-full rounded-md border p-4 mt-4 bg-muted/30">
            {logs.length === 0 ? (
              <p>Nenhum log encontrado para este banco.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <Badge
                        variant="outline"
                        className={`${log.event_type === "INSERT"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : log.event_type === "UPDATE"
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-red-100 text-red-700 border-red-300"
                          }`}
                      >
                        {log.event_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">
                      <b>Tabela:</b> {log.table_name}
                    </p>
                    <pre className="mt-2 bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.event_data, null, 2)}
                    </pre>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  )
}
