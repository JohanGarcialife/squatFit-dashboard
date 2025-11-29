"use client";

import { useMemo } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
  DollarSign,
  ClipboardList,
  Users,
  CreditCard,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { getMockAlertasCriticas } from "./data";
import type { AlertaCritica } from "./schema";

const severityConfig = {
  critica: {
    icon: AlertTriangle,
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-400",
    iconColor: "text-red-600",
    badgeClass: "border-red-200 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    progressColor: "bg-red-500",
  },
  advertencia: {
    icon: AlertCircle,
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-600",
    badgeClass: "border-amber-200 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    progressColor: "bg-amber-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-600",
    badgeClass: "border-blue-200 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    progressColor: "bg-blue-500",
  },
};

const tipoIconConfig = {
  ingresos_bajos: DollarSign,
  tareas_acumuladas: ClipboardList,
  clientes_riesgo: Users,
  pagos_pendientes: CreditCard,
};

interface AlertItemProps {
  alerta: AlertaCritica;
}

function AlertItem({ alerta }: AlertItemProps) {
  const config = severityConfig[alerta.severidad];
  const Icon = config.icon;
  const TipoIcon = tipoIconConfig[alerta.tipo];
  const progress = Math.min((alerta.valor / alerta.umbral) * 100, 100);

  return (
    <div className={`flex items-start gap-4 rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className={`mt-0.5 ${config.iconColor}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TipoIcon className={`size-4 ${config.textColor}`} />
              <span className={`font-medium ${config.textColor}`}>{alerta.titulo}</span>
            </div>
            <p className="text-muted-foreground text-sm">{alerta.descripcion}</p>
          </div>
          <Badge variant="outline" className={config.badgeClass}>
            {alerta.severidad === "critica" ? "Crítico" : alerta.severidad === "advertencia" ? "Advertencia" : "Info"}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Valor actual: <span className="font-semibold">{alerta.valor}</span>
            </span>
            <span className="text-muted-foreground">
              Umbral: <span className="font-semibold">{alerta.umbral}</span>
            </span>
          </div>
          <Progress value={progress} className={`h-2 ${config.progressColor}`} />
        </div>
        {alerta.urlAccion && (
          <Button variant="ghost" size="sm" className={`-ml-2 ${config.textColor}`} asChild>
            <Link href={alerta.urlAccion}>
              Ver detalles
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function AlertsPanel() {
  const alertas = useMemo(() => getMockAlertasCriticas(), []);
  const alertasCriticas = alertas.filter((a) => a.severidad === "critica");
  const alertasAdvertencia = alertas.filter((a) => a.severidad === "advertencia");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Alertas Críticas
            </CardTitle>
            <CardDescription>Métricas que requieren atención inmediata</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {alertasCriticas.length > 0 && <Badge variant="destructive">{alertasCriticas.length} críticas</Badge>}
            {alertasAdvertencia.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {alertasAdvertencia.length} advertencias
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alertas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Info className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="mt-3 font-medium text-green-700 dark:text-green-400">Todo en orden</p>
            <p className="text-muted-foreground text-sm">No hay alertas críticas en este momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <AlertItem key={alerta.id} alerta={alerta} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
