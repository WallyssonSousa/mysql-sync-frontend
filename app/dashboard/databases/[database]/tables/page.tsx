"use client"

import { useEffect, useState } from "react"
import { databaseApi } from "@/lib/api"
import { useParams } from "next/navigation"
import { Table2 } from "lucide-react"

export default function TablesPage() {
    const { database } = useParams<{ database: string }>()
    const [tables, setTables] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTables = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await databaseApi.getTables(database)
                setTables(response.data || [])
            } catch (erro) {
                setError("Erro ao carregar tabelas do banco de dados")
                console.log('Erro: ', erro)
            } finally {
                setLoading(false)
            }
        }

        if (database) {
            fetchTables()
        }
    }, [database])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Tabelas do banco: {database}</h1>

            {loading && <p>Carregando tabelas...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && tables.length === 0 && (
                <p>Nenhuma tabela encontrada neste banco.</p>
            )}

            <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 bg-muted/40 text-sm font-medium text-muted-foreground px-4 py-2">
                    <span>Nome da Tabela</span>
                    <span className="text-right">Banco</span>
                </div>
                <div className="divide-y divide-border">
                    {tables.map((tableName, index) => (
                        <div
                            key={`${tableName}-${index}`}
                            className="grid grid-cols-2 items-center px-4 py-3 text-sm hover:bg-muted/20 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Table2 size={16} className="text-primary" />
                                <span className="capitalize font-medium">{tableName}</span>
                            </div>
                            <span className="text-right text-muted-foreground">{database}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
