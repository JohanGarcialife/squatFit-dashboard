"use client";

import { useMemo } from "react";

import { Users, CalendarCheck, AlertTriangle, ClipboardList, TrendingUp, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { getSeguimientoStats } from "./data";

export function SeguimientoCards() {
  const stats = useMemo(() => getSeguimientoStats(), []);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Clientes Activos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.clientesActivos}/{stats.totalClientes}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            >
              <Users className="size-4" />
              Activos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <TrendingUp className="size-4" />
            {stats.cumplimientoPromedio}% cumplimiento promedio
          </div>
          <div className="text-muted-foreground">
            {stats.clientesPendientePago > 0 && (
              <span className="text-amber-600">{stats.clientesPendientePago} con pago pendiente</span>
            )}
            {stats.clientesPendientePago === 0 && "Todos los pagos al día"}
          </div>
        </CardFooter>
      </Card>

      {/* Revisiones */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Revisiones Programadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.revisionesSemana}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            >
              <CalendarCheck className="size-4" />
              Esta semana
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revisionesHoy > 0 ? (
              <span className="text-blue-600">{stats.revisionesHoy} revisión(es) hoy</span>
            ) : (
              "Sin revisiones hoy"
            )}
          </div>
          <div className="text-muted-foreground">Agenda de seguimiento semanal</div>
        </CardFooter>
      </Card>

      {/* Alertas */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Alertas Pendientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.alertasSinLeer}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                stats.alertasAltas > 0
                  ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              }
            >
              <AlertTriangle className="size-4" />
              {stats.alertasAltas > 0 ? "Urgentes" : "Alertas"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.alertasAltas > 0 ? (
              <span className="text-red-600">{stats.alertasAltas} alerta(s) de alta prioridad</span>
            ) : (
              "Sin alertas urgentes"
            )}
          </div>
          <div className="text-muted-foreground">Requieren tu atención</div>
        </CardFooter>
      </Card>

      {/* Tareas Pendientes */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tareas por Entregar</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.tareasHoy + stats.tareasVencidas}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                stats.tareasVencidas > 0
                  ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
              }
            >
              <ClipboardList className="size-4" />
              Pendientes
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.tareasVencidas > 0 ? (
              <span className="text-red-600">{stats.tareasVencidas} tarea(s) vencida(s)</span>
            ) : (
              `${stats.tareasHoy} tarea(s) para hoy`
            )}
          </div>
          <div className="text-muted-foreground">Dietas, pautas e informes</div>
        </CardFooter>
      </Card>
    </div>
  );
}
