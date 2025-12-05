"use client";

import { Apple, ChefHat, CalendarDays, ArrowLeftRight, TrendingUp, Database } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDietaStats } from "@/hooks/use-dieta";

export function DietaCards() {
  const { stats, isLoading } = useDietaStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Alimentos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Base de Alimentos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalAlimentos}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
            >
              <Apple className="size-4" />
              Alimentos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Database className="size-4" />
            Base de datos nutricional
          </div>
          <div className="text-muted-foreground">
            {stats.alimentosManuales} manuales, {stats.alimentosApi} de APIs
          </div>
        </CardFooter>
      </Card>

      {/* Total Recetas */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Banco de Recetas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalRecetas}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
            >
              <ChefHat className="size-4" />
              Recetas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <TrendingUp className="size-4" />
            {stats.recetasPublicadas} publicadas
          </div>
          <div className="text-muted-foreground">{stats.recetasBorrador} en borrador</div>
        </CardFooter>
      </Card>

      {/* Menús Activos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Menús Generados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalMenus}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            >
              <CalendarDays className="size-4" />
              Menús
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">{stats.menusActivos} menús activos</div>
          <div className="text-muted-foreground">Planes alimenticios asignados</div>
        </CardFooter>
      </Card>

      {/* Sustituciones */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sustituciones</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalSustituciones}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
            >
              <ArrowLeftRight className="size-4" />
              Reglas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">{stats.totalRestricciones} restricciones activas</div>
          <div className="text-muted-foreground">Vegano, Sin gluten, etc.</div>
        </CardFooter>
      </Card>
    </div>
  );
}
