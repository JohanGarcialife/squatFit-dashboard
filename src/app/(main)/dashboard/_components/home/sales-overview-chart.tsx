"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTotalSales } from "@/hooks/use-sales";

// ============================================================================
// CONFIGURACIÓN DEL GRÁFICO
// ============================================================================

const chartConfig = {
  courses: {
    label: "Cursos",
    color: "hsl(262, 83%, 58%)",
  },
  advices: {
    label: "Asesorías",
    color: "hsl(199, 89%, 48%)",
  },
  books: {
    label: "Libros",
    color: "hsl(38, 92%, 50%)",
  },
} satisfies ChartConfig;

const COLORS = [
  "hsl(262, 83%, 58%)", // violet
  "hsl(199, 89%, 48%)", // sky
  "hsl(38, 92%, 50%)", // amber
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Gráfico donut de distribución de ventas por tipo
 * Datos de: GET /api/v1/admin-panel/total-sales
 */
export function SalesOverviewChart() {
  const { data, isLoading, isError } = useTotalSales();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Distribución de Ventas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-destructive text-sm">Error al cargar el gráfico</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: "courses", value: data.courses, fill: COLORS[0] },
    { name: "advices", value: data.advices, fill: COLORS[1] },
    { name: "books", value: data.books, fill: COLORS[2] },
  ];

  const total = data.courses + data.advices + data.books;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Distribución de Ventas</CardTitle>
        <CardDescription>{total.toLocaleString("es-ES")} ventas totales</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
              stroke="hsl(var(--background))"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Leyenda personalizada */}
        <div className="mt-4 flex items-center justify-center gap-6">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
              <span className="text-muted-foreground text-xs">
                {chartConfig[entry.name as keyof typeof chartConfig]?.label}
              </span>
              <span className="text-xs font-semibold">{entry.value.toLocaleString("es-ES")}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
