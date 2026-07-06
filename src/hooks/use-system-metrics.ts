"use client";

import { useQuery } from "@tanstack/react-query";

import { SystemMetricsService } from "@/lib/services/system-metrics-service";
import type { SystemMetricsResponse } from "@/lib/services/system-metrics-types";

export const systemMetricsKeys = {
  all: ["system-metrics"] as const,
  dashboard: () => [...systemMetricsKeys.all, "dashboard"] as const,
};

/**
 * Hook para obtener las métricas de rendimiento del sistema
 */
export function useSystemMetrics() {
  const query = useQuery<SystemMetricsResponse>({
    queryKey: systemMetricsKeys.dashboard(),
    queryFn: () => SystemMetricsService.getPerformanceDashboard(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    mutate: query.refetch,
  };
}
