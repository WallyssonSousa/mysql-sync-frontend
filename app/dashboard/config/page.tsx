"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { userApi } from "@/lib/api"
import { Brush, Plug, Trash, Users } from "lucide-react"
import { useEffect, useState } from "react"

type User = {
    id: number
    username: string
    role: string
}

export default function SettingsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        username: "",
        password_hash: "",
        role: "user",
    })
    const [modalOpen, setModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Buscar usuários cadastrados
    const fetchUsers = async () => {
        try {
            const res = await userApi.getUsers()
            setUsers(res.data || [])
        } catch (error) {
            console.error("Erro ao buscar usuários:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // Abrir modal de criação
    const openCreateModal = () => {
        setEditingUser(null)
        setFormData({ username: "", password_hash: "", role: "user" })
        setModalOpen(true)
    }

    // Abrir modal de edição
    const handleEditUser = (user: User) => {
        setEditingUser(user)
        setFormData({
            username: user.username,
            password_hash: "",
            role: user.role,
        })
        setModalOpen(true)
    }

    // Criar ou atualizar usuário
    const handleSaveUser = async () => {
        try {
            if (editingUser) {
                await userApi.updateUser(editingUser.id, formData)
            } else {
                await userApi.register(formData)
            }
            setModalOpen(false)
            setEditingUser(null)
            setFormData({ username: "", password_hash: "", role: "user" })
            fetchUsers()
        } catch (error) {
            console.error("Erro ao salvar usuário:", error)
        }
    }

    // Deletar usuário
    const handleDeleteUser = async (id: number) => {
        if (!confirm("Deseja realmente excluir este usuário?")) return
        try {
            await userApi.deleteUser(id)
            fetchUsers()
        } catch (error) {
            console.error("Erro ao excluir usuário:", error)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
                <p className="text-muted-foreground">
                    Gerencie usuários e conexões do sistema.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configurar Usuários */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-full">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">Configurar Usuários</CardTitle>
                        </div>
                        <Button size="sm" onClick={openCreateModal}>
                            {editingUser ? "Editar Usuário" : "Novo Usuário"}
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Carregando usuários...
                            </p>
                        ) : users.length > 0 ? (
                            <div className="space-y-3">
                                {users.map((user) => {
                                    const isAdmin = user.role === "admin"
                                    return (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${isAdmin
                                                            ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600"
                                                            : "bg-blue-50 dark:bg-blue-950/20 text-blue-600"
                                                        }`}
                                                >
                                                    {user.username[0].toUpperCase()}
                                                </div>

                                                <div className="flex flex-col">
                                                    <p className="text-sm font-semibold text-foreground">{user.username}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                                                </div>
                                            </div>

                                            {/* Role + ações */}
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={isAdmin ? "default" : "secondary"}
                                                    className={`px-2 py-1 text-xs font-medium ${isAdmin ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    {isAdmin ? "Administrador" : "Usuário"}
                                                </Badge>

                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="p-2"
                                                    onClick={() => handleEditUser(user)}
                                                    title="Editar usuário"
                                                >
                                                    <Brush className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="p-2"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Excluir usuário"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Nenhum usuário cadastrado
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Configurar Conexões */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-full">
                            <Plug className="w-5 h-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">Configurar Conexões</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Funcionalidade em breve...
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de criação/edição */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md w-full rounded-2xl p-6 shadow-lg bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground">
                            {editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-6 space-y-5">
                        {/* Usuário */}
                        <div className="flex flex-col space-y-1">
                            <Label>Usuário (email)</Label>
                            <Input
                                placeholder="Digite o e-mail do usuário"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Senha */}
                        <div className="flex flex-col space-y-1">
                            <Label>
                                Senha {editingUser ? "(deixe em branco para não alterar)" : ""}
                            </Label>
                            <Input
                                type="password"
                                placeholder={editingUser ? "********" : "Digite a senha"}
                                value={formData.password_hash}
                                onChange={(e) =>
                                    setFormData({ ...formData, password_hash: e.target.value })
                                }
                                className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <Label>Função</Label>
                            <div className="relative">
                                <select
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary appearance-none transition-colors"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                >
                                    <option value="user">Usuário</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 text-muted-foreground"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>


                        {/* Botão principal */}
                        <Button
                            onClick={handleSaveUser}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2 transition-colors"
                        >
                            {editingUser ? "Salvar Alterações" : "Criar Usuário"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    )
}
