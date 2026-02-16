"use client";

import { useMemo } from "react";

import { BookOpen, Package, DollarSign, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLibros } from "@/hooks/use-libros";

export function LibrosCards() {
  const { data: libros = [], isLoading } = useLibros();

  // Calcular estadísticas dinámicamente
  const stats = useMemo(() => {
    const total = libros.length;
    const conVersiones = libros.filter((l) => l.versions && l.versions.length > 0).length;
    const totalVersiones = libros.reduce((sum, l) => sum + (l.versions?.length || 0), 0);
    const precioPromedio = total > 0 ? libros.reduce((sum, l) => sum + (l.price || 0), 0) / total : 0;
    const precioTotal = libros.reduce((sum, l) => sum + (l.price || 0), 0);

    return {
      total,
      conVersiones,
      totalVersiones,
      precioPromedio,
      precioTotal,
    };
  }, [libros]);

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
          <CardDescription>Libros Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{stats.total}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpen className="size-4" />
              Total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Catálogo completo de libros</div>
          <div className="text-muted-foreground">
            {stats.conVersiones} con versiones, {stats.totalVersiones} versiones en total
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Libros con Versiones</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.conVersiones}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
            >
              <Layers className="size-4" />
              Con versiones
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Libros con ediciones disponibles</div>
          <div className="text-muted-foreground">{stats.totalVersiones} versiones en el catálogo</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Precio Promedio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            €{stats.precioPromedio.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            >
              <DollarSign className="size-4" />
              Promedio
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Precio medio por libro</div>
          <div className="text-muted-foreground">Valor promedio del catálogo</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Valor Total Catálogo</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            €{stats.precioTotal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
            >
              <Package className="size-4" />
              Total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Suma del valor de todos los libros</div>
          <div className="text-muted-foreground">{stats.total} libros en el catálogo</div>
        </CardFooter>
      </Card>
    </div>
  );
}
