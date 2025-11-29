"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bell,
  CheckCheck,
  Clock,
  MessageSquare,
  AlertCircle,
  Activity,
  RotateCcw,
  CheckCircle,
  ClipboardCheck,
  ArrowRight,
  Filter,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getMockNotificaciones } from "./data";
import type { Notificacion, TipoNotificacion, PrioridadNotificacion } from "./schema";

const tipoConfig: Record<TipoNotificacion, { icon: typeof Bell; label: string; color: string }> = {
  tarea_asignada: {
    icon: ClipboardCheck,
    label: "Tarea asignada",
    color: "text-blue-500",
  },
  tarea_vencida: {
    icon: Clock,
    label: "Tarea vencida",
    color: "text-red-500",
  },
  mensaje_pendiente: {
    icon: MessageSquare,
    label: "Mensaje pendiente",
    color: "text-amber-500",
  },
  cambio_estado: {
    icon: AlertCircle,
    label: "Cambio de estado",
    color: "text-purple-500",
  },
  actividad_inusual: {
    icon: Activity,
    label: "Actividad inusual",
    color: "text-orange-500",
  },
  reembolso: {
    icon: RotateCcw,
    label: "Solicitud reembolso",
    color: "text-red-600",
  },
  bloque_terminado: {
    icon: CheckCircle,
    label: "Bloque terminado",
    color: "text-green-500",
  },
};

const prioridadConfig: Record<PrioridadNotificacion, { label: string; class: string }> = {
  alta: {
    label: "Alta",
    class: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  media: {
    label: "Media",
    class: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  baja: {
    label: "Baja",
    class: "border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
};

interface NotificationItemProps {
  notificacion: Notificacion;
  onMarkAsRead?: (id: string) => void;
}

function NotificationItem({ notificacion, onMarkAsRead }: NotificationItemProps) {
  const config = tipoConfig[notificacion.tipo];
  const prioridad = prioridadConfig[notificacion.prioridad];
  const Icon = config.icon;

  const timeAgo = formatDistanceToNow(new Date(notificacion.fecha), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      className={`flex gap-3 rounded-lg border p-3 transition-colors ${
        notificacion.leida ? "bg-muted/30 opacity-70" : "bg-card hover:bg-muted/50"
      }`}
    >
      <div className={`mt-0.5 ${config.color}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{notificacion.titulo}</span>
              {!notificacion.leida && <span className="size-2 rounded-full bg-blue-500" />}
            </div>
            <p className="text-muted-foreground line-clamp-2 text-sm">{notificacion.descripcion}</p>
          </div>
          <Badge variant="outline" className={prioridad.class}>
            {prioridad.label}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Clock className="size-3" />
            {timeAgo}
            {notificacion.clienteNombre && (
              <>
                <span>·</span>
                <span>{notificacion.clienteNombre}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!notificacion.leida && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onMarkAsRead(notificacion.id)}
              >
                <CheckCheck className="mr-1 size-3" />
                Marcar leída
              </Button>
            )}
            {notificacion.urlAccion && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link href={notificacion.urlAccion}>
                  Ver
                  <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsList() {
  const notificaciones = useMemo(() => getMockNotificaciones(), []);
  const [filtro, setFiltro] = useState<"todas" | "no_leidas" | TipoNotificacion>("todas");

  const notificacionesFiltradas = useMemo(() => {
    if (filtro === "todas") return notificaciones;
    if (filtro === "no_leidas") return notificaciones.filter((n) => !n.leida);
    return notificaciones.filter((n) => n.tipo === filtro);
  }, [notificaciones, filtro]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;
  const altaPrioridad = notificaciones.filter((n) => n.prioridad === "alta" && !n.leida).length;

  const handleMarkAsRead = (id: string) => {
    // Aquí se conectaría con el backend
    console.log("Marcar como leída:", id);
  };

  const handleMarkAllAsRead = () => {
    // Aquí se conectaría con el backend
    console.log("Marcar todas como leídas");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-blue-500" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              {noLeidas > 0 ? (
                <span>
                  {noLeidas} sin leer
                  {altaPrioridad > 0 && <span className="text-red-500"> · {altaPrioridad} urgentes</span>}
                </span>
              ) : (
                "Todas las notificaciones leídas"
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 size-4" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFiltro("todas")}>Todas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro("no_leidas")}>No leídas</DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(tipoConfig).map(([tipo, config]) => (
                  <DropdownMenuItem key={tipo} onClick={() => setFiltro(tipo as TipoNotificacion)}>
                    <config.icon className={`mr-2 size-4 ${config.color}`} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {noLeidas > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 size-4" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {notificacionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="text-muted-foreground/50 size-12" />
              <p className="mt-3 font-medium">Sin notificaciones</p>
              <p className="text-muted-foreground text-sm">
                {filtro !== "todas" ? "No hay notificaciones con este filtro" : "Estás al día"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificacionesFiltradas.map((notificacion) => (
                <NotificationItem key={notificacion.id} notificacion={notificacion} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
