"use client";

import { useMemo } from "react";
import { TrendingUp, GraduationCap, Users, DollarSign } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCursos } from "@/hooks/use-cursos";

export function CursosCards() {
  const { data: cursos = [], isLoading } = useCursos();

  // Calcular estadísticas dinámicamente
  const stats = useMemo(() => {
    const total = cursos.length;
    const activos = cursos.filter((c) => c.status === "Activo").length;
    const inactivos = cursos.filter((c) => c.status === "Inactivo").length;
    const enDesarrollo = cursos.filter((c) => c.status === "En Desarrollo").length;
    const totalEstudiantes = cursos.reduce((sum, c) => sum + (c.students || 0), 0);
    const promedioEstudiantes = total > 0 ? Math.round(totalEstudiantes / total) : 0;
    const ingresosPotenciales = cursos.reduce((sum, c) => sum + (c.price || 0) * (c.students || 0), 0);
    const precioPromedio = total > 0 ? cursos.reduce((sum, c) => sum + (c.price || 0), 0) / total : 0;

    return {
      total,
      activos,
      inactivos,
      enDesarrollo,
      totalEstudiantes,
      promedioEstudiantes,
      ingresosPotenciales,
      precioPromedio,
    };
  }, [cursos]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cursos Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{stats.total}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <GraduationCap className="size-4" />
              Total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Catálogo completo de cursos</div>
          <div className="text-muted-foreground">
            {stats.activos} activos, {stats.inactivos} inactivo{stats.inactivos !== 1 ? "s" : ""}, {stats.enDesarrollo}{" "}
            en desarrollo
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cursos Activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{stats.activos}</CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
            >
              <TrendingUp className="size-4" />
              Disponibles
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Disponibles para inscripción</div>
          <div className="text-muted-foreground">{stats.totalEstudiantes.toLocaleString()} estudiantes activos</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Estudiantes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalEstudiantes.toLocaleString()}
          </CardTitle>
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
          <div className="line-clamp-1 flex gap-2 font-medium">Estudiantes inscritos totales</div>
          <div className="text-muted-foreground">Promedio {stats.promedioEstudiantes} estudiantes por curso</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos Potenciales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            €{stats.ingresosPotenciales.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
            >
              <DollarSign className="size-4" />
              Total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Basado en inscripciones actuales</div>
          <div className="text-muted-foreground">Precio promedio: €{stats.precioPromedio.toFixed(2)} por curso</div>
        </CardFooter>
      </Card>
    </div>
  );
}
