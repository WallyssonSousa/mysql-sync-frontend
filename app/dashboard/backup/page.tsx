"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Archive, Database, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react"
import { databaseApi, backupApi } from "@/lib/api"

interface BackupTable {
  name: string
  columns: string
}

interface BackupConfig {
  sourceDatabase: string
  backupDatabase: string
  backupHost: string
  backupUser: string
  backupPassword: string
  tables: BackupTable[]
}

interface DatabaseOption {
  value: string
  label: string
}

export default function BackupPage() {
  const [loading, setLoading] = useState(false)
  const [databases, setDatabases] = useState<DatabaseOption[]>([])
  const [tables, setTables] = useState<{ name: string }[]>([])
  const [databaseSearch, setDatabaseSearch] = useState("")
  const [tableSearch, setTableSearch] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loadingTables, setLoadingTables] = useState(false)

  const [config, setConfig] = useState<BackupConfig>({
    sourceDatabase: "",
    backupDatabase: "",
    backupHost: "192.168.0.235",
    backupUser: "Mysqlsync",
    backupPassword: "Ws07830519*",
    tables: [],
  })

  // Buscar bancos de dados disponíveis
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const { data } = await databaseApi.getDatabases()
        if (Array.isArray(data)) setDatabases(data)
        else setDatabases([])
      } catch (error) {
        console.error("Erro ao buscar bancos:", error)
        setDatabases([])
      }
    }
    fetchDatabases()
  }, [])

  // Buscar tabelas quando o banco de origem for selecionado
  useEffect(() => {
    if (config.sourceDatabase) fetchTables(config.sourceDatabase)
    else setTables([])
  }, [config.sourceDatabase])

  const fetchTables = async (database: string) => {
    setLoadingTables(true)
    try {
      const { data } = await databaseApi.getTables(database)
      const mapped = Array.isArray(data) ? data.map((name: string) => ({ name })) : []
      setTables(mapped)
    } catch (error) {
      console.error("Erro ao buscar tabelas:", error)
      setTables([])
    } finally {
      setLoadingTables(false)
    }
  }

  // Filtrar bancos pelo label
  const filteredDatabases = (databases || []).filter((db) =>
    db.label.toLowerCase().includes(databaseSearch.toLowerCase())
  )

  // Filtrar tabelas
  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(tableSearch.toLowerCase())
  )

  const addTable = (tableName: string) => {
    if (!config.tables.find((t) => t.name === tableName)) {
      setConfig((prev) => ({
        ...prev,
        tables: [...prev.tables, { name: tableName, columns: "*" }],
      }))
    }
  }

  const removeTable = (tableName: string) => {
    setConfig((prev) => ({
      ...prev,
      tables: prev.tables.filter((t) => t.name !== tableName),
    }))
  }

  const updateTableColumns = (tableName: string, columns: string) => {
    setConfig((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => (t.name === tableName ? { ...t, columns } : t)),
    }))
  }

  const handleBackup = async () => {
    if (!config.sourceDatabase || !config.backupDatabase || config.tables.length === 0) {
      alert("Por favor, preencha todos os campos obrigatórios e selecione pelo menos uma tabela.")
      return
    }

    setLoading(true)
    try {
      await backupApi.createBackup(config)
      alert("Backup iniciado com sucesso!")
      setConfig((prev) => ({ ...prev, tables: [] }))
    } catch (error: unknown) {
      console.error("Erro ao fazer backup:", error)
      alert("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Archive className="w-8 h-8 text-primary" />
          Backup de Dados
        </h1>
        <p className="text-muted-foreground">
          Configure e execute backups dos seus bancos de dados de forma segura.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração do Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Configuração do Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Banco de Origem */}
            <div className="space-y-2">
              <Label htmlFor="sourceDatabase">Banco de Origem *</Label>
              <div className="relative">
                <Input
                  placeholder="Buscar banco de dados..."
                  value={databaseSearch}
                  onChange={(e) => setDatabaseSearch(e.target.value)}
                  className="mb-2"
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
              <Select
                value={config.sourceDatabase}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, sourceDatabase: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco de origem" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDatabases.map((db) => (
                    <SelectItem key={db.value} value={db.value}>
                      {db.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banco de Destino */}
            <div className="space-y-2">
              <Label htmlFor="backupDatabase">Banco de Destino *</Label>
              <Input
                id="backupDatabase"
                placeholder="Nome do banco de backup"
                value={config.backupDatabase}
                onChange={(e) => setConfig((prev) => ({ ...prev, backupDatabase: e.target.value }))}
              />
            </div>

            {/* Host do Backup */}
            <div className="space-y-2">
              <Label htmlFor="backupHost">Host do Backup *</Label>
              <Input
                id="backupHost"
                placeholder="IP ou hostname do servidor"
                value={config.backupHost}
                onChange={(e) => setConfig((prev) => ({ ...prev, backupHost: e.target.value }))}
              />
            </div>

            {/* Usuário */}
            <div className="space-y-2">
              <Label htmlFor="backupUser">Usuário *</Label>
              <Input
                id="backupUser"
                placeholder="Usuário do banco"
                value={config.backupUser}
                onChange={(e) => setConfig((prev) => ({ ...prev, backupUser: e.target.value }))}
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="backupPassword">Senha *</Label>
              <div className="relative">
                <Input
                  id="backupPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha do banco"
                  value={config.backupPassword}
                  onChange={(e) => setConfig((prev) => ({ ...prev, backupPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Tabelas */}
        <Card>
          <CardHeader>
            <CardTitle>Tabelas para Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.sourceDatabase ? (
              <>
                <div className="relative">
                  <Input
                    placeholder="Buscar tabelas..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                  />
                  <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                </div>

                {loadingTables ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredTables.map((table) => (
                      <div
                        key={table.name}
                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50"
                      >
                        <span className="text-sm font-medium">{table.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addTable(table.name)}
                          disabled={config.tables.some((t) => t.name === table.name)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Selecione um banco de origem para ver as tabelas disponíveis
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabelas Selecionadas */}
      {config.tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabelas Selecionadas ({config.tables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.tables.map((table) => (
                <div key={table.name} className="flex items-center gap-4 p-3 border rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <span className="font-medium">{table.name}</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Colunas (ex: id,name,email ou *)"
                      value={table.columns}
                      onChange={(e) => updateTableColumns(table.name, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => removeTable(table.name)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Backup */}
      <div className="flex justify-end">
        <Button
          onClick={handleBackup}
          disabled={loading || !config.sourceDatabase || !config.backupDatabase || config.tables.length === 0}
          className="min-w-32"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Executando...
            </>
          ) : (
            <>
              <Archive className="w-4 h-4 mr-2" />
              Iniciar Backup
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
