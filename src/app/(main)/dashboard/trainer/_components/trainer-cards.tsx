"use client";

/**
 * ============================================================================
 * COMPONENTE: TrainerCards - Métricas del Trainer
 * ============================================================================
 *
 * ESTADO DE CONEXIÓN AL BACKEND:
 *
 * ✅ CONECTADO AL BACKEND:
 * - Tareas Completadas: GET /api/v1/admin-panel/tasks/assigned-to-me
 *   → Hook: useTrainerMetrics()
 *   → Muestra: % de tareas completadas, total de tareas
 *
 * - Clientes Activos: GET /api/v1/admin-panel/advices
 *   → Hook: useClientesStats()
 *   → Muestra: Total de clientes activos con asesorías de entrenamiento
 *
 * ❌ SIN CONEXIÓN AL BACKEND (MOCK DATA):
 * - Sesiones Completadas: Sin endpoint disponible
 *   → Endpoint necesario: GET /api/v1/metricas/sesiones
 *   → Datos: clientesEntrenamientoData (mock)
 *
 * - Series Completadas: Sin endpoint disponible
 *   → Endpoint necesario: GET /api/v1/metricas/series
 *   → Datos: clientesEntrenamientoData (mock)
 *
 * - Volumen Semanal: Sin endpoint disponible
 *   → Endpoint necesario: GET /api/v1/metricas/volumen
 *   → Datos: clientesEntrenamientoData (mock)
 *
 * - RPE Medio: Sin endpoint disponible
 *   → Endpoint necesario: GET /api/v1/metricas/rpe
 *   → Datos: clientesEntrenamientoData (mock)
 *
 * INDICADORES VISUALES:
 * - 🟢 Icono Wifi verde: Datos en tiempo real del backend
 * - 🟡 Icono WifiOff amarillo: Datos de ejemplo (endpoint no disponible)
 * ============================================================================
 */

import { useMemo } from "react";

import {
  Activity,
  CheckCircle2,
  BarChart3,
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Wifi,
  WifiOff,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientesStats } from "@/hooks/use-trainer-clientes";
import { useTrainerMetrics } from "@/hooks/use-trainer-tasks";
import { cn } from "@/lib/utils";

import { clientesEntrenamientoData } from "./data";

// ⚠️ MOCK DATA: Calcula métricas de sesiones/volumen/RPE (sin backend disponible)
// TODO: Conectar cuando estén disponibles los endpoints:
// - GET /api/v1/metricas/sesiones
// - GET /api/v1/metricas/series
// - GET /api/v1/metricas/volumen
// - GET /api/v1/metricas/rpe
const calcularMetricasMock = () => {
  const clientes = clientesEntrenamientoData;

  // % Sesiones completadas
  const totalSesionesCompletadas = clientes.reduce((acc, c) => acc + c.adherencia.sesionesCompletadas, 0);
  const totalSesionesPlanificadas = clientes.reduce((acc, c) => acc + c.adherencia.sesionesPlanificadas, 0);
  const porcentajeSesiones = Math.round((totalSesionesCompletadas / totalSesionesPlanificadas) * 100);

  // Series hechas/plan
  const totalSeriesHechas = clientes.reduce((acc, c) => acc + c.adherencia.seriesHechas, 0);
  const totalSeriesPlanificadas = clientes.reduce((acc, c) => acc + c.adherencia.seriesPlanificadas, 0);
  const porcentajeSeries = Math.round((totalSeriesHechas / totalSeriesPlanificadas) * 100);

  // Volumen semanal total
  const volumenTotal = clientes.reduce((acc, c) => acc + c.adherencia.volumenSemanal, 0);

  // RPE medio
  const rpeMedio = clientes.reduce((acc, c) => acc + c.adherencia.rpeMedio, 0) / clientes.length;

  // Tendencias
  const clientesSubiendo = clientes.filter((c) => c.adherencia.tendencia === "subiendo").length;
  const clientesBajando = clientes.filter((c) => c.adherencia.tendencia === "bajando").length;

  return {
    totalSesionesCompletadas,
    totalSesionesPlanificadas,
    porcentajeSesiones,
    totalSeriesHechas,
    totalSeriesPlanificadas,
    porcentajeSeries,
    volumenTotal,
    rpeMedio: rpeMedio.toFixed(1),
    clientesSubiendo,
    clientesBajando,
    totalClientes: clientes.length,
  };
};

const getTendenciaIcon = (tendencia: "subiendo" | "estable" | "bajando") => {
  switch (tendencia) {
    case "subiendo":
      return <TrendingUp className="size-4 text-emerald-500" />;
    case "bajando":
      return <TrendingDown className="size-4 text-red-500" />;
    default:
      return <Minus className="size-4 text-slate-500" />;
  }
};

const getColorPorcentaje = (porcentaje: number) => {
  if (porcentaje >= 90) return "text-emerald-600";
  if (porcentaje >= 75) return "text-amber-600";
  return "text-red-600";
};

const getBadgeColorPorcentaje = (porcentaje: number) => {
  if (porcentaje >= 90)
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400";
  if (porcentaje >= 75) return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400";
  return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400";
};

export function TrainerCards() {
  // Métricas reales del backend
  const { data: metricasTareas, isLoading: isLoadingTareas } = useTrainerMetrics();
  const { stats: statsClientes, isLoading: isLoadingClientes } = useClientesStats();

  // Métricas mock (sin backend disponible)
  const metricasMock = useMemo(() => calcularMetricasMock(), []);

  // Calcular métricas combinadas
  const porcentajeTareasCompletadas = metricasTareas?.porcentajeCompletadas ?? 0;
  const totalTareas = metricasTareas?.totalTareas ?? 0;
  const tareasCompletadas = metricasTareas?.tareasCompletadas ?? 0;
  const totalClientesActivos = statsClientes?.activos ?? 0;
  const totalClientes = statsClientes?.total ?? 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Tareas Completadas - DATOS REALES */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Tareas Completadas</CardDescription>
            <Wifi className="size-4 text-emerald-500" />
          </div>
          {isLoadingTareas ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <CardTitle
              className={cn(
                "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
                getColorPorcentaje(porcentajeTareasCompletadas),
              )}
            >
              {porcentajeTareasCompletadas}%
            </CardTitle>
          )}
          <CardAction>
            <Badge variant="outline" className={getBadgeColorPorcentaje(porcentajeTareasCompletadas)}>
              <CheckCircle2 className="size-4" />
              Adherencia
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {isLoadingTareas ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {tareasCompletadas} de {totalTareas} tareas
            </div>
          )}
          <div className="text-muted-foreground">Tareas asignadas completadas</div>
        </CardFooter>
      </Card>

      {/* Clientes Activos - DATOS REALES */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Clientes Activos</CardDescription>
            <Wifi className="size-4 text-emerald-500" />
          </div>
          {isLoadingClientes ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalClientesActivos}
            </CardTitle>
          )}
          <CardAction>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            >
              <Users className="size-4" />
              Activos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {isLoadingClientes ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {totalClientesActivos} de {totalClientes} clientes
            </div>
          )}
          <div className="text-muted-foreground">Con asesorías activas</div>
        </CardFooter>
      </Card>

      {/* % Sesiones Completadas - MOCK DATA */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Sesiones Completadas</CardDescription>
            <WifiOff className="size-4 text-amber-500" />
          </div>
          <CardTitle
            className={cn(
              "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
              getColorPorcentaje(metricasMock.porcentajeSesiones),
            )}
          >
            {metricasMock.porcentajeSesiones}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={getBadgeColorPorcentaje(metricasMock.porcentajeSesiones)}>
              <CheckCircle2 className="size-4" />
              Adherencia
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metricasMock.totalSesionesCompletadas} de {metricasMock.totalSesionesPlanificadas} sesiones
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            {metricasMock.clientesSubiendo > 0 && (
              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="size-3" />
                {metricasMock.clientesSubiendo} mejorando
              </span>
            )}
            {metricasMock.clientesBajando > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <TrendingDown className="size-3" />
                {metricasMock.clientesBajando} bajando
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Series Hechas/Plan - MOCK DATA */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Series Completadas</CardDescription>
            <WifiOff className="size-4 text-amber-500" />
          </div>
          <CardTitle
            className={cn(
              "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
              getColorPorcentaje(metricasMock.porcentajeSeries),
            )}
          >
            {metricasMock.porcentajeSeries}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={getBadgeColorPorcentaje(metricasMock.porcentajeSeries)}>
              <BarChart3 className="size-4" />
              Series
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metricasMock.totalSeriesHechas} / {metricasMock.totalSeriesPlanificadas} series
          </div>
          <div className="text-muted-foreground">De todos los clientes esta semana</div>
        </CardFooter>
      </Card>

      {/* Volumen Semanal - MOCK DATA */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Volumen Semanal</CardDescription>
            <WifiOff className="size-4 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(metricasMock.volumenTotal / 1000).toFixed(1)}t
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            >
              <Dumbbell className="size-4" />
              Volumen
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metricasMock.volumenTotal.toLocaleString()} kg totales
          </div>
          <div className="text-muted-foreground">Σ (series × reps × peso) semanal</div>
        </CardFooter>
      </Card>

      {/* RPE Medio - MOCK DATA */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>RPE Medio</CardDescription>
            <WifiOff className="size-4 text-amber-500" />
          </div>
          <CardTitle
            className={cn(
              "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
              parseFloat(metricasMock.rpeMedio) >= 8
                ? "text-red-600"
                : parseFloat(metricasMock.rpeMedio) >= 7
                  ? "text-amber-600"
                  : "text-emerald-600",
            )}
          >
            {metricasMock.rpeMedio}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                parseFloat(metricasMock.rpeMedio) >= 8
                  ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : parseFloat(metricasMock.rpeMedio) >= 7
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
              )}
            >
              <Gauge className="size-4" />
              Esfuerzo
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Escala 1-10 (Rating of Perceived Exertion)</div>
          <div className="text-muted-foreground">
            {parseFloat(metricasMock.rpeMedio) >= 8
              ? "Carga alta, considerar deload"
              : parseFloat(metricasMock.rpeMedio) >= 7
                ? "Intensidad óptima"
                : "Margen para progresar"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
