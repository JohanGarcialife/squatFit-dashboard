"use client";

import { useMemo } from "react";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Calendar,
  CreditCard,
  MessageSquareOff,
  ClipboardList,
  Ticket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getMockKPIs } from "./data";

export function KPIOverviewCards() {
  const kpis = useMemo(() => getMockKPIs(), []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatVariation = (value: number) => {
    const isPositive = value >= 0;
    return {
      text: `${isPositive ? "+" : ""}${value.toFixed(1)}%`,
      isPositive,
    };
  };

  const variacionMensual = formatVariation(kpis.variacionMensual);
  const variacionAnual = formatVariation(kpis.variacionAnual);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Ingresos Mensual */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos Mensual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(kpis.ingresosMensual)}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                variacionMensual.isPositive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              }
            >
              {variacionMensual.isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {variacionMensual.text}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <DollarSign className="size-4" />
            vs mes anterior
          </div>
          <div className="text-muted-foreground">Meta: {formatCurrency(25000)}</div>
        </CardFooter>
      </Card>

      {/* Ingresos Anual */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos Anual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(kpis.ingresosAnual)}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                variacionAnual.isPositive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              }
            >
              {variacionAnual.isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {variacionAnual.text}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <DollarSign className="size-4" />
            vs año anterior
          </div>
          <div className="text-muted-foreground">Meta: {formatCurrency(300000)}</div>
        </CardFooter>
      </Card>

      {/* Asesorías */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Asesorías</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.asesoriasActivas}
            <span className="text-muted-foreground text-lg font-normal"> activas</span>
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            >
              <Users className="size-4" />
              Total: {kpis.asesoriasActivas + kpis.asesoriasPausa + kpis.asesoriasFinalizadas}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-4 font-medium">
            <span className="text-amber-600">{kpis.asesoriasPausa} en pausa</span>
            <span className="text-muted-foreground">{kpis.asesoriasFinalizadas} finalizadas</span>
          </div>
          <div className="text-muted-foreground">{kpis.totalVentas} ventas totales</div>
        </CardFooter>
      </Card>

      {/* Ventas por Producto */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ventas Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.totalVentas}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
            >
              <TrendingUp className="size-4" />
              Este mes
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Libros, Cursos, Asesorías, Premium</div>
          <div className="text-muted-foreground">Ver desglose por producto</div>
        </CardFooter>
      </Card>

      {/* Renovación Próxima */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Renovación Próxima (7 días)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.clientesRenovacionProxima}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
            >
              <Calendar className="size-4" />
              Atención
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-amber-600">
            <AlertTriangle className="size-4" />
            Requieren seguimiento
          </div>
          <div className="text-muted-foreground">Contactar antes de vencimiento</div>
        </CardFooter>
      </Card>

      {/* Falta Pago */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Falta Pago</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.clientesFaltaPago}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                kpis.clientesFaltaPago > 5
                  ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              }
            >
              <CreditCard className="size-4" />
              {kpis.clientesFaltaPago > 5 ? "Crítico" : "Pendiente"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {kpis.clientesFaltaPago > 0 ? (
              <span className="text-red-600">Gestión de cobros pendiente</span>
            ) : (
              "Todos los pagos al día"
            )}
          </div>
          <div className="text-muted-foreground">Ver detalle de deudas</div>
        </CardFooter>
      </Card>

      {/* Sin Contacto */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sin Contacto {">"}7 días</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.clientesSinContacto}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                kpis.clientesSinContacto > 10
                  ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              }
            >
              <MessageSquareOff className="size-4" />
              Inactivos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {kpis.clientesSinContacto > 0 ? (
              <span className="text-amber-600">Requieren contacto</span>
            ) : (
              "Todos contactados"
            )}
          </div>
          <div className="text-muted-foreground">Riesgo de abandono</div>
        </CardFooter>
      </Card>

      {/* Tareas y Tickets */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tareas Pendientes / Tickets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.tareasPendientesTotal}
            <span className="text-muted-foreground text-lg font-normal"> / {kpis.ticketsRecibidos}</span>
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
            >
              <ClipboardList className="size-4" />
              <Ticket className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Por áreas: Nutrición, Entreno, Soporte</div>
          <div className="text-muted-foreground">Ver desglose detallado</div>
        </CardFooter>
      </Card>
    </div>
  );
}
