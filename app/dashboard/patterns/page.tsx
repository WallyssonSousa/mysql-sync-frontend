"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Search, Trash2, Play, Database, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { patternApi, type Pattern } from "@/lib/pattern-api"

export default function PatternsPage() {
  const [loading, setLoading] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [newPattern, setNewPattern] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPatterns()
  }, [])

  const fetchPatterns = async () => {
    try {
      const { data } = await patternApi.listPatterns()
      setPatterns(data)
    } catch (error) {
      console.error("Erro ao buscar padrões:", error)
      setPatterns([])
    }
  }

  const handleCreatePattern = async () => {
    if (!newPattern.trim()) {
      alert("Por favor, insira um padrão válido.")
      return
    }

    setLoading(true)
    try {
      await patternApi.createPattern({ pattern: newPattern.trim() })
      setNewPattern("")
      await fetchPatterns()
      alert("Padrão criado com sucesso!")
    } catch (error: unknown) {
      console.error("Erro ao criar padrão:", error)
      alert("Erro ao criar padrão. Verifique a conexão com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleScanDatabases = async () => {
    setScanLoading(true)
    try {
      const { data } = await patternApi.scanDatabases()
      alert(data.message || "Scan executado com sucesso!")
      await fetchPatterns()
    } catch (error: unknown) {
      console.error("Erro ao executar scan:", error)
      alert("Erro ao executar scan. Verifique a conexão com o servidor.")
    } finally {
      setScanLoading(false)
    }
  }

  // Filtrar padrões pela busca
  const filteredPatterns = patterns.filter((pattern) =>
    pattern.pattern.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Padrões de Backup
        </h1>
        <p className="text-muted-foreground">
          Configure padrões para identificação automática de bancos de dados para backup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criar Novo Padrão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Padrão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPattern">Padrão de Nome *</Label>
              <Input
                id="newPattern"
                placeholder="Ex: b%_2 (% = qualquer caractere)"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePattern()}
              />
              <p className="text-xs text-muted-foreground">
                Use % como wildcard. Ex: b%_2 encontra banco_teste_2, backup_prod_2, etc.
              </p>
            </div>

            <Button onClick={handleCreatePattern} disabled={loading || !newPattern.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Padrão
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Execute um scan para identificar novos bancos de dados que correspondem aos padrões definidos.
              </p>
            </div>

            <Button
              onClick={handleScanDatabases}
              disabled={scanLoading || patterns.length === 0}
              className="w-full bg-transparent"
              variant="outline"
            >
              {scanLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executando Scan...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Executar Scan
                </>
              )}
            </Button>

            {patterns.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Crie pelo menos um padrão para executar o scan
              </p>
            )}
          </CardContent>
        </Card>
      </div>

    
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Padrões Definidos ({patterns.length})</span>
            <div className="relative w-64">
              <Input
                placeholder="Buscar padrões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum padrão definido ainda. Crie seu primeiro padrão para começar.
              </p>
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum padrão encontrado para: {searchTerm}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{pattern.pattern}</code>
                      <Badge variant={pattern.active ? "default" : "secondary"}>
                        {pattern.active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Criado em {formatDate(pattern.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => {
                        // TODO: Implementar exclusão de padrão
                        alert("Funcionalidade de exclusão será implementada em breve")
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
