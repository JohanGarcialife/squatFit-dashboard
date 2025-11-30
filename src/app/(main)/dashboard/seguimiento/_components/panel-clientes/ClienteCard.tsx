"use client";

import { useState } from "react";

import {
  MoreHorizontal,
  Mail,
  Phone,
  CalendarDays,
  CreditCard,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { PendienteItem } from "./PendienteItem";
import type { ClienteCardProps } from "./types";
import { getInitials, getEstadoPagoBadge, formatDate, getDiasRestantesText } from "./utils";

export function ClienteCard({ cliente }: ClienteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const estadoBadge = getEstadoPagoBadge(cliente.estadoPago);
  const IconEstado = estadoBadge.icon;

  const pendientesActivos = cliente.pendientes.filter((p) => p.estado !== "completada" && p.estado !== "cancelada");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="border-muted size-12 border-2">
                <AvatarImage src={cliente.avatar} alt={cliente.nombre} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(cliente.nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">{cliente.nombre}</CardTitle>
                <CardDescription className="text-xs">{cliente.plan}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("gap-1", estadoBadge.className)}>
                <IconEstado className="size-3" />
                {estadoBadge.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 size-4" />
                    Ver perfil completo
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 size-4" />
                    Enviar mensaje
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CalendarDays className="mr-2 size-4" />
                    Programar revisión
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 size-4" />
                    Registrar pago
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info rápida */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Próxima revisión</p>
              <div className="flex items-center gap-1.5 font-medium">
                <CalendarDays className="text-muted-foreground size-3.5" />
                {cliente.proximaRevision ? formatDate(cliente.proximaRevision) : "Sin programar"}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Pago mensual</p>
              <div className="flex items-center gap-1.5 font-medium">
                <CreditCard className="text-muted-foreground size-3.5" />
                {cliente.montoMensual}€/mes
              </div>
            </div>
          </div>

          {/* Días restantes */}
          <div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
            <span className="text-muted-foreground text-xs">Suscripción</span>
            <span
              className={cn(
                "text-xs font-medium",
                cliente.diasRestantes && cliente.diasRestantes < 0
                  ? "text-red-600"
                  : cliente.diasRestantes && cliente.diasRestantes <= 7
                    ? "text-amber-600"
                    : "text-emerald-600",
              )}
            >
              {getDiasRestantesText(cliente.diasRestantes)}
            </span>
          </div>

          {/* Cumplimiento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cumplimiento semanal</span>
              <span className="font-medium">{cliente.cumplimientoSemanal}%</span>
            </div>
            <Progress
              value={cliente.cumplimientoSemanal}
              className={cn(
                "h-2",
                cliente.cumplimientoSemanal >= 80
                  ? "[&>div]:bg-emerald-500"
                  : cliente.cumplimientoSemanal >= 60
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-red-500",
              )}
            />
          </div>

          {/* Pendientes count y expand */}
          {pendientesActivos.length > 0 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="hover:bg-muted/50 h-auto w-full justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" />
                  <span className="text-sm font-medium">{pendientesActivos.length} pendiente(s)</span>
                </div>
                {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </CollapsibleTrigger>
          )}

          <CollapsibleContent className="space-y-2">
            {pendientesActivos.map((pendiente) => (
              <PendienteItem key={pendiente.id} pendiente={pendiente} />
            ))}
          </CollapsibleContent>

          {/* Contacto */}
          <div className="flex gap-2 border-t pt-2">
            {cliente.email && (
              <Button variant="outline" size="sm" className="h-8 flex-1 text-xs">
                <Mail className="mr-1.5 size-3" />
                Email
              </Button>
            )}
            {cliente.telefono && (
              <Button variant="outline" size="sm" className="h-8 flex-1 text-xs">
                <Phone className="mr-1.5 size-3" />
                Llamar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
