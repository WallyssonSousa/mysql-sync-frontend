"use client"

import { Database } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import logo from "@/public/logo-softclever.png"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex flex-col justify-center p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-xl">MySQL Sync</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <Card className="bg-background/30 border-border shadow-lg">
                <CardHeader>
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
                    <p className="text-muted-foreground text-sm">
                      Acesse para gerenciar sincronização, backups e exportação de dados.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">MySQL DataSync v1.0.0 - Soft Clever - Sistemas Inteligentes</p>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background border-l border-border">
          <div className="flex flex-col items-center gap-8 p-8">
            {/* Logo */}
            <div className="flex items-center justify-center p-8 bg-background/50 backdrop-blur-sm rounded-2xl border border-border shadow-lg">
              <Image
                src={logo}
                alt="Logo Soft Clever"
                width={180}
                height={180}
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-6 text-center max-w-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Sistema de Sincronização</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Gerencie backups, sincronizações e exportações de dados de forma simples e eficiente.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-foreground">Backups Automáticos</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-foreground">Sincronização em Tempo Real</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-foreground">Agendamentos de Exportação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
