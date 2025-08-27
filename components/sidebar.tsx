"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Archive, Clock, Database, Home, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

type UserRole = "admin" | "user"

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    setRole("admin")
  }, [])

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      roles: ["admin", "user"],
    },
    {
      title: "Bancos & Tabelas",
      icon: Database,
      href: "/dashboard/databases",
      roles: ["admin", "user"],
    },
    {
      title: "Backup",
      icon: Archive,
      href: "/dashboard/backup",
      roles: ["admin"],
    },
    {
      title: "Agendamentos",
      icon: Clock,
      href: "/dashboard/schedules",
      roles: ["admin", "user"],
    },
  ]

  const filteredItems = menuItems.filter((item) => role && item.roles.includes(role))

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <h1 className="font-semibold text-sidebar-foreground">DataSync</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 text-left font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => {
                    router.push(item.href)
                    onClose()
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.title}
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 text-center">DataSync v1.0.0</div>
          </div>
        </div>
      </div>
    </>
  )
}
