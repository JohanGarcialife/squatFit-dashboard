"use client";

import { useMemo } from "react";

import { Activity, CheckCircle2, BarChart3, Gauge, TrendingUp, TrendingDown, Minus, Dumbbell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { clientesEntrenamientoData } from "./data";

// Calcula métricas agregadas de todos los clientes
const calcularMetricasGlobales = () => {
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
  const metricas = useMemo(() => calcularMetricasGlobales(), []);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* % Sesiones Completadas */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sesiones Completadas</CardDescription>
          <CardTitle
            className={cn(
              "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
              getColorPorcentaje(metricas.porcentajeSesiones),
            )}
          >
            {metricas.porcentajeSesiones}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={getBadgeColorPorcentaje(metricas.porcentajeSesiones)}>
              <CheckCircle2 className="size-4" />
              Adherencia
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metricas.totalSesionesCompletadas} de {metricas.totalSesionesPlanificadas} sesiones
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            {metricas.clientesSubiendo > 0 && (
              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="size-3" />
                {metricas.clientesSubiendo} mejorando
              </span>
            )}
            {metricas.clientesBajando > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <TrendingDown className="size-3" />
                {metricas.clientesBajando} bajando
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Series Hechas/Plan */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Series Completadas</CardDescription>
          <CardTitle
            className={cn(
              "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
              getColorPorcentaje(metricas.porcentajeSeries),
            )}
          >
            {metricas.porcentajeSeries}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={getBadgeColorPorcentaje(metricas.porcentajeSeries)}>
              <BarChart3 className="size-4" />
              Series
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metricas.totalSeriesHechas} / {metricas.totalSeriesPlanificadas} series
          </div>
          <div className="text-muted-foreground">De todos los clientes esta semana</div>
        </CardFooter>
      </Card>

      {/* Volumen Semanal */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Volumen Semanal</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(metricas.volumenTotal / 1000).toFixed(1)}t
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
          <div className="line-clamp-1 flex gap-2 font-medium">{metricas.volumenTotal.toLocaleString()} kg totales</div>
          <div className="text-muted-foreground">Σ (series × reps × peso) semanal</div>
        </CardFooter>
      </Card>

      {/* RPE Medio */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>RPE Medio</CardDescription>
          <CardTitle
            className={cn(
              "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
              parseFloat(metricas.rpeMedio) >= 8
                ? "text-red-600"
                : parseFloat(metricas.rpeMedio) >= 7
                  ? "text-amber-600"
                  : "text-emerald-600",
            )}
          >
            {metricas.rpeMedio}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                parseFloat(metricas.rpeMedio) >= 8
                  ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : parseFloat(metricas.rpeMedio) >= 7
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
            {parseFloat(metricas.rpeMedio) >= 8
              ? "Carga alta, considerar deload"
              : parseFloat(metricas.rpeMedio) >= 7
                ? "Intensidad óptima"
                : "Margen para progresar"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
