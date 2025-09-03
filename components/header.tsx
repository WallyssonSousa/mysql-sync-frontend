"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Menu, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Função simples para decodificar JWT (sem verificar assinatura)
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    )
  } catch {
    return null
  }
}

interface HeaderProps {
  onMenuClick: () => void
}

interface UserType {
  username: string
  role: string
  avatarUrl?: string
}

interface ColorType {
  bg: string
  text: string
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [avatarColor, setAvatarColor] = useState<ColorType>({
    bg: "bg-gray-200",
    text: "text-gray-700",
  })

  function getRandomColor(): ColorType {
    const colors: ColorType[] = [
      { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-600" },
      { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-600" },
      { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-600" },
      { bg: "bg-yellow-50 dark:bg-yellow-950/20", text: "text-yellow-600" },
      { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-600" },
      { bg: "bg-pink-50 dark:bg-pink-950/20", text: "text-pink-600" },
      { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-600" },
      { bg: "bg-teal-50 dark:bg-teal-950/20", text: "text-teal-600" },
    ]

    return colors[Math.floor(Math.random() * colors.length)]
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = parseJwt(token)
      if (decoded?.username && decoded?.role) {
        setUser({ username: decoded.username, role: decoded.role })
      }
    }
    setAvatarColor(getRandomColor())
  }, [])

  if (!user) return null

  const initials = user.username.slice(0, 2).toUpperCase()
  const email = `${user.username}@datasync.com`

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus dados e backups</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`${avatarColor.bg} ${avatarColor.text}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.username}</p>
                <p className="text-xs leading-none text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/config")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
