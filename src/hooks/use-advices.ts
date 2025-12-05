/**
 * Hooks para gestión de asesorías con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useQuery } from "@tanstack/react-query";

import { AdvicesService } from "@/lib/services/advices-service";
import type { GetAdvicesParams } from "@/lib/services/advices-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const advicesKeys = {
  all: ["advices"] as const,
  lists: () => [...advicesKeys.all, "list"] as const,
  list: (params?: GetAdvicesParams) => [...advicesKeys.lists(), params] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener todas las asesorías con paginación
 * Endpoint: GET /api/v1/admin-panel/advices
 *
 * @param params - Parámetros de paginación (limit, page)
 */
export function useAdvices(params?: GetAdvicesParams) {
  return useQuery({
    queryKey: advicesKeys.list(params),
    queryFn: () => AdvicesService.getAdvices(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: false, // No reintentar en caso de error
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook para obtener asesorías recientes (últimas 5)
 * Útil para widgets del dashboard
 */
export function useRecentAdvices() {
  return useAdvices({ limit: 5, page: 1 });
}

/**
 * Hook para obtener el total de asesorías
 */
export function useAdvicesCount() {
  const { data } = useAdvices({ limit: 1, page: 1 });
  return data?.length ?? 0;
}
