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
  line: string; // color de la línea superior
  iconBg: string; // fondo del cuadro del icono
  iconText: string; // color del icono
}

// ============================================================================
// COMPONENTE DE KPI INDIVIDUAL
// ============================================================================

function KPICard({ item }: { item: KPIItem }) {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Línea superior de color (de la paleta de marca) */}
      <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: item.line }} />

      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: item.iconBg, color: item.iconText }}
        >
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
    <Card className="border-0 shadow-md">
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
          <Card key={i} className="border-destructive/20 border-0 shadow-md">
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
      line: "#363C98",
      iconBg: "#E7E6FF",
      iconText: "#363C98",
    },
    {
      label: "Asesorías",
      value: data.advices,
      icon: MessageSquare,
      description: "Total de asesorías contratadas",
      line: "#9F4E63",
      iconBg: "#E8D8DE",
      iconText: "#9F4E63",
    },
    {
      label: "Libros",
      value: data.books,
      icon: BookOpen,
      description: "Total de libros comprados",
      line: "#FF690B",
      iconBg: "#FFF7F2",
      iconText: "#FF690B",
    },
    {
      label: "Usuarios",
      value: data.users,
      icon: Users,
      description: "Usuarios registrados",
      line: "#2F855A",
      iconBg: "#E3EFE8",
      iconText: "#2F855A",
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
