/**
 * Hooks para gestión de Clientes del Trainer
 * Conectado con TrainerService usando React Query
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { TrainerService } from "@/lib/services/trainer-service";
import type { TrainerCliente, GetClientesParams } from "@/lib/services/trainer-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const trainerClientesKeys = {
  all: ["trainer-clientes"] as const,
  lists: () => [...trainerClientesKeys.all, "list"] as const,
  list: (params?: GetClientesParams) => [...trainerClientesKeys.lists(), params] as const,
  stats: () => [...trainerClientesKeys.all, "stats"] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener clientes activos del trainer
 * Endpoint: GET /api/v1/admin-panel/advices
 */
export function useTrainerClientes(params?: GetClientesParams) {
  return useQuery({
    queryKey: trainerClientesKeys.list(params),
    queryFn: () => TrainerService.getClientesActivos(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error) => {
      // No reintentar si es error de autenticación
      if (error instanceof Error && error.message === "Unauthorized") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener estadísticas de clientes
 */
export function useClientesStats() {
  const { data: clientes = [], isLoading, isError } = useTrainerClientes();

  const stats = {
    total: clientes.length,
    activos: clientes.filter((c) => c.status === "active").length,
    inactivos: clientes.filter((c) => c.status === "inactive").length,
  };

  return {
    stats,
    isLoading,
    isError,
  };
}

/**
 * Hook para obtener clientes filtrados
 */
export function useTrainerClientesFiltrados(filters: { status?: string; search?: string }) {
  const { data: clientes = [], isLoading, isError } = useTrainerClientes();

  const clientesFiltrados = clientes.filter((cliente) => {
    if (filters.status && cliente.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return cliente.nombre.toLowerCase().includes(searchLower) || cliente.email.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return {
    data: clientesFiltrados,
    isLoading,
    isError,
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Hook para invalidar todas las queries de clientes
 */
export function useInvalidateTrainerClientes() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: trainerClientesKeys.all });
  };
}

/**
 * Hook para prefetch de clientes
 */
export function usePrefetchClientes() {
  const queryClient = useQueryClient();

  return (params?: GetClientesParams) => {
    queryClient.prefetchQuery({
      queryKey: trainerClientesKeys.list(params),
      queryFn: () => TrainerService.getClientesActivos(params),
    });
  };
}
