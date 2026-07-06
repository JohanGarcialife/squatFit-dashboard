"use client";

import { Server } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useSystemMetrics } from "@/hooks/use-system-metrics";

import { AlertsRecommendations } from "./alerts-recommendations";
import { PerformanceOverviewCards } from "./performance-overview-cards";

export function SystemPerformanceDashboard() {
  const { data, isLoading, isError } = useSystemMetrics();

  if (isLoading) {
    return (
      <div className="mb-8 space-y-4">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    // Si hay un error o no hay datos, mostramos un estado vacío/error sutil
    // pero no rompemos toda la página.
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive mb-8 rounded-xl border p-6 text-center">
        <p className="text-sm">No se pudieron cargar las métricas del sistema.</p>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
          <Server className="h-4 w-4 text-indigo-500" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">System Performance</h2>
      </div>

      <PerformanceOverviewCards overview={data.overview} />
      <AlertsRecommendations alerts={data.alerts} recommendations={data.recommendations} />
    </div>
  );
}
