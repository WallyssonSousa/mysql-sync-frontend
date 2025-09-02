"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { databaseApi } from "@/lib/api";
import { Database, Eye, Server, Table } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface DatabaseInfo {
  name: string;
  type?: string;
  status?: string;
  tables_count?: number;
  size?: string;
}

export default function DatabasesPage() {
  const router = useRouter();
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    fetchDatabases();
  }, [router]);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await databaseApi.getDatabases();

      if (Array.isArray(response.data)) {
        const mapped = response.data.map((dbName: string) => ({
          name: dbName,
          type: "Desconhecido",
          status: "active",
        }));
        setDatabases(mapped);
      } else {
        setDatabases([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao carregar bancos de dados");
      console.error("Error fetching databases:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTables = (databaseName: string) => {
    router.push(`/dashboard/databases/${encodeURIComponent(databaseName)}/tables`);
  };

  const handleViewLogs = (databaseName: string) => {
    router.push(`/dashboard/databases/${encodeURIComponent(databaseName)}/logs`);
  };

  // aplicar filtros
  const filteredDatabases = useMemo(() => {
    return databases.filter((db) => {
      const matchName = db.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || db.status === statusFilter;
      const matchType =
        typeFilter === "all" || db.type?.toLowerCase() === typeFilter.toLowerCase();
      return matchName && matchStatus && matchType;
    });
  }, [databases, search, statusFilter, typeFilter]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-foreground">Bancos de Dados</h1>
          <p className="text-muted-foreground">
            Visualize todos os bancos de dados conectados no servidor.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-foreground">Bancos de Dados</h1>
          <p className="text-muted-foreground">
            Visualize todos os bancos de dados conectados no servidor.
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <Server className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchDatabases} variant="outline" className="mt-4 bg-transparent">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-7 h-7 text-primary" />
          Bancos de Dados
        </h1>
        <p className="text-muted-foreground">
          Visualize todos os bancos de dados conectados no servidor. Total: {filteredDatabases.length} banco(s)
        </p>
      </div>

      {/* filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredDatabases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum banco encontrado</h3>
            <p className="text-muted-foreground">Não há bancos de dados conectados com esses filtros.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatabases.map((db, idx) => (
            <Card
              key={`${db.name}-${idx}`}
              className="hover:shadow-lg transition-all group hover:scale-[1.02]"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {db.name}
                      </CardTitle>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${db.status === "active"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}
                  >
                    {db.status === "active" ? "Ativo" : "Inativo"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {db.size && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tamanho:</span>
                      <span className="font-medium">{db.size}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleViewTables(db.name)}
                      className="w-1/2"
                      variant="outline"
                    >
                      <Table className="w-4 h-4 mr-2" />
                      Tabelas
                    </Button>
                    <Button
                      onClick={() => handleViewLogs(db.name)}
                      className="w-1/2"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
