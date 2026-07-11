"use client";

import { BookOpen, GraduationCap, MessageSquare, TrendingUp, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTotalSales } from "@/hooks/use-sales";

// ============================================================================
// TIPOS
// ============================================================================

interface KPIItem {
  label: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

// ============================================================================
// COMPONENTE DE KPI INDIVIDUAL
// ============================================================================

function KPICard({ item }: { item: KPIItem }) {
  return (
    <Card className="sqf-metric-card group relative overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="bg-primary text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
          <item.icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{item.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight tabular-nums">{item.value.toLocaleString("es-ES")}</p>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">{item.description}</p>
        </div>
        <TrendingUp className="text-muted-foreground/40 h-4 w-4 shrink-0" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SKELETON LOADING
// ============================================================================

function KPICardSkeleton() {
  return (
    <Card className="sqf-metric-card border-0 shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Tarjetas KPI del dashboard
 * Muestra: Cursos vendidos, Asesorías, Libros, Usuarios registrados
 * Endpoint: GET /api/v1/admin-panel/total-sales
 */
export function KPICards() {
  const { data, isLoading, isError } = useTotalSales();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="sqf-metric-card border-destructive/20 border-0 shadow-md">
            <CardContent className="flex items-center justify-center p-5">
              <p className="text-destructive text-sm">Error al cargar datos</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis: KPIItem[] = [
    {
      label: "Cursos Vendidos",
      value: data.courses,
      icon: GraduationCap,
      description: "Total de cursos vendidos",
    },
    {
      label: "Asesorías",
      value: data.advices,
      icon: MessageSquare,
      description: "Total de asesorías contratadas",
    },
    {
      label: "Libros",
      value: data.books,
      icon: BookOpen,
      description: "Total de libros comprados",
    },
    {
      label: "Usuarios",
      value: data.users,
      icon: Users,
      description: "Usuarios registrados",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((item) => (
        <KPICard key={item.label} item={item} />
      ))}
    </div>
  );
}
