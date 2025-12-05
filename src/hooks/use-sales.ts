/**
 * Hooks para gestión de ventas con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useQuery } from "@tanstack/react-query";

import { SalesService } from "@/lib/services/sales-service";
import type { GetSalesParams } from "@/lib/services/sales-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const salesKeys = {
  all: ["sales"] as const,
  total: () => [...salesKeys.all, "total"] as const,
  lists: () => [...salesKeys.all, "list"] as const,
  list: (params?: GetSalesParams) => [...salesKeys.lists(), params] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener el total de ventas del sistema
 * Endpoint: GET /api/v1/admin-panel/total-sales
 */
export function useTotalSales() {
  return useQuery({
    queryKey: salesKeys.total(),
    queryFn: () => SalesService.getTotalSales(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: false, // No reintentar en caso de error
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook para obtener lista de ventas con filtros y paginación
 * Endpoint: GET /api/v1/admin-panel/sales
 *
 * @param params - Parámetros de filtrado (limit, page, month, search)
 */
export function useSales(params?: GetSalesParams) {
  return useQuery({
    queryKey: salesKeys.list(params),
    queryFn: () => SalesService.getSales(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: false, // No reintentar en caso de error
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook para obtener ventas recientes (últimas 5)
 * Útil para widgets del dashboard
 */
export function useRecentSales() {
  return useSales({ limit: 5, page: 1 });
}
