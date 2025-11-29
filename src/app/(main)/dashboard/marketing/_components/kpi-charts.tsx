"use client";

import { useMemo } from "react";

import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart, Label, LabelList } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";

import {
  getMockIngresos,
  getMockVentasProducto,
  getMockTareasPorArea,
  ingresosChartConfig,
  ventasChartConfig,
  tareasChartConfig,
} from "./data";

export function KPICharts() {
  const ingresosMensual = useMemo(() => getMockIngresos("mensual"), []);
  const ventasProducto = useMemo(() => getMockVentasProducto(), []);
  const tareasPorArea = useMemo(() => getMockTareasPorArea(), []);

  const totalVentas = ventasProducto.reduce((acc, curr) => acc + curr.cantidad, 0);
  const totalIngresos = ventasProducto.reduce((acc, curr) => acc + curr.ingresos, 0);

  // Preparar datos para gráfico de tareas (pie chart)
  const tareasChartData = [
    { area: "nutricion", tareas: tareasPorArea.nutricion, fill: "hsl(var(--chart-1))" },
    { area: "entreno", tareas: tareasPorArea.entreno, fill: "hsl(var(--chart-2))" },
    { area: "soporte", tareas: tareasPorArea.soporte, fill: "hsl(var(--chart-3))" },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-5">
      {/* Gráfico de Ingresos - Área */}
      <Card className="col-span-1 xl:col-span-3">
        <CardHeader>
          <CardTitle>Evolución de Ingresos</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ingresosChartConfig} className="h-64 w-full">
            <AreaChart data={ingresosMensual} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="periodo" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `€${value / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="var(--color-ingresos)"
                fill="var(--color-ingresos)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="meta"
                stroke="var(--color-meta)"
                fill="var(--color-meta)"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm" variant="outline">
            Ver Informe Completo
          </Button>
          <Button size="sm" variant="outline">
            Descargar CSV
          </Button>
        </CardFooter>
      </Card>

      {/* Gráfico de Tareas por Área - Pie */}
      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Tareas Pendientes por Área</CardTitle>
          <CardDescription>Distribución actual</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={tareasChartConfig} className="h-52 w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={tareasChartData}
                dataKey="tareas"
                nameKey="area"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                cornerRadius={4}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold tabular-nums"
                          >
                            {tareasPorArea.total}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-sm">
                            Tareas
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                content={() => (
                  <ul className="mt-4 flex justify-center gap-4">
                    {tareasChartData.map((item) => (
                      <li key={item.area} className="flex items-center gap-2 text-sm">
                        <span className="size-3 rounded-full" style={{ background: item.fill }} />
                        <span className="capitalize">
                          {tareasChartConfig[item.area as keyof typeof tareasChartConfig].label}
                        </span>
                        <span className="font-semibold tabular-nums">{item.tareas}</span>
                      </li>
                    ))}
                  </ul>
                )}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Ventas por Producto - Barras */}
      <Card className="col-span-1 xl:col-span-3">
        <CardHeader>
          <CardTitle>Ventas por Tipo de Producto</CardTitle>
          <CardDescription>Desglose de ventas e ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ventasChartConfig} className="h-64 w-full">
            <BarChart data={ventasProducto} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="tipo"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => ventasChartConfig[value as keyof typeof ventasChartConfig]?.label ?? value}
                width={80}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === "ingresos") {
                        return formatCurrency(Number(value));
                      }
                      return `${value} unidades`;
                    }}
                  />
                }
              />
              <Bar dataKey="cantidad" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="cantidad"
                  position="right"
                  className="fill-foreground text-sm"
                  formatter={(value: number) => `${value} uds`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Total: <span className="font-semibold">{totalVentas}</span> ventas ·{" "}
            <span className="font-semibold">{formatCurrency(totalIngresos)}</span>
          </div>
        </CardFooter>
      </Card>

      {/* Resumen de Ingresos por Producto */}
      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Ingresos por Producto</CardTitle>
          <CardDescription>Distribución de ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ventasChartConfig} className="h-52 w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} hideLabel />}
              />
              <Pie
                data={ventasProducto}
                dataKey="ingresos"
                nameKey="tipo"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                cornerRadius={4}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-lg font-bold">
                            {formatCurrency(totalIngresos)}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-sm">
                            Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                content={() => (
                  <ul className="mt-4 flex flex-wrap justify-center gap-3">
                    {ventasProducto.map((item) => (
                      <li key={item.tipo} className="flex items-center gap-1.5 text-xs">
                        <span className="size-2.5 rounded-full" style={{ background: item.fill }} />
                        <span className="capitalize">{ventasChartConfig[item.tipo]?.label}</span>
                        <span className="text-muted-foreground">{item.porcentaje}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
