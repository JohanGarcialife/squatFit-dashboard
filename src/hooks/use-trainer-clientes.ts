/**
 * Hooks para gestión de Clientes del Trainer
 * Conectado con TrainerService usando React Query
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { TrainerService } from "@/lib/services/trainer-service";
import type { GetClientesParams, GetCoachesParams } from "@/lib/services/trainer-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const trainerClientesKeys = {
  all: ["trainer-clientes"] as const,
  lists: () => [...trainerClientesKeys.all, "list"] as const,
  list: (params?: GetClientesParams) => [...trainerClientesKeys.lists(), params] as const,
  imc: (userId?: string) => [...trainerClientesKeys.all, "imc", userId] as const,
};

export const trainerCoachesKeys = {
  all: ["trainer-coaches"] as const,
  lists: () => [...trainerCoachesKeys.all, "list"] as const,
  list: (params?: GetCoachesParams) => [...trainerCoachesKeys.lists(), params] as const,
};

// ============================================================================
// QUERIES - CLIENTES
// ============================================================================

/**
 * Hook para obtener clientes activos del trainer
 * Endpoint: GET /api/v1/admin-panel/advices (proxy para obtener clientes)
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
 * Hook para obtener clientes con filtros específicos
 */
export function useTrainerClientesFiltrados(filters: {
  status?: "active" | "inactive" | "pending";
  adviceType?: "Entrenamiento" | "Nutricional" | "Completo";
}) {
  const { data: clientes = [], isLoading, isError } = useTrainerClientes();

  const clientesFiltrados = clientes.filter((cliente) => {
    if (filters.status && cliente.status !== filters.status) return false;
    if (filters.adviceType && cliente.advice_type !== filters.adviceType) return false;
    return true;
  });

  return {
    data: clientesFiltrados,
    isLoading,
    isError,
  };
}

/**
 * Hook para contar clientes por estado
 */
export function useClientesStats() {
  const { data: clientes = [], isLoading } = useTrainerClientes();

  const stats = {
    total: clientes.length,
    activos: clientes.filter((c) => c.status === "active").length,
    inactivos: clientes.filter((c) => c.status === "inactive").length,
    pendientes: clientes.filter((c) => c.status === "pending").length,
    // Por tipo de asesoría
    entrenamiento: clientes.filter((c) => c.advice_type === "Entrenamiento").length,
    nutricional: clientes.filter((c) => c.advice_type === "Nutricional").length,
    completo: clientes.filter((c) => c.advice_type === "Completo").length,
  };

  return {
    stats,
    isLoading,
  };
}

// ============================================================================
// QUERIES - COACHES/ENTRENADORES
// ============================================================================

/**
 * Hook para obtener lista de coaches
 * Endpoint: GET /api/v1/admin-panel/coaches
 */
export function useTrainerCoaches(params?: GetCoachesParams) {
  return useQuery({
    queryKey: trainerCoachesKeys.list(params),
    queryFn: () => TrainerService.getCoaches(params),
    staleTime: 10 * 60 * 1000, // 10 minutos (coaches no cambian frecuentemente)
    gcTime: 15 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener coaches activos
 */
export function useActiveCoaches() {
  return useTrainerCoaches({ status: "active" });
}

// ============================================================================
// QUERIES - IMC/CALCULADORA
// ============================================================================

/**
 * Hook para obtener historial de IMC
 * Endpoint: GET /api/v1/calculator/history
 */
export function useIMCHistory(date?: string) {
  return useQuery({
    queryKey: trainerClientesKeys.imc(date),
    queryFn: () => TrainerService.getHistorialIMC(date),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // No reintentar si es error de autenticación
      if (error instanceof Error && error.message === "Unauthorized") {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * Hook para obtener el último registro de IMC
 */
export function useLatestIMC() {
  const { data: history = [], isLoading, isError } = useIMCHistory();

  const latestIMC = history.length > 0 ? history[0] : null;

  return {
    data: latestIMC,
    isLoading,
    isError,
  };
}

/**
 * Hook para obtener tendencia de IMC (últimos N registros)
 */
export function useIMCTrend(limit = 5) {
  const { data: history = [], isLoading } = useIMCHistory();

  const trend = history.slice(0, limit);

  // Calcular si la tendencia es ascendente, descendente o estable
  const direction =
    trend.length >= 2
      ? trend[0].imc > trend[trend.length - 1].imc
        ? "down" // Bajando (bueno si tenía sobrepeso)
        : trend[0].imc < trend[trend.length - 1].imc
          ? "up" // Subiendo
          : "stable"
      : "stable";

  return {
    trend,
    direction,
    isLoading,
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
 * Hook para invalidar queries de IMC
 */
export function useInvalidateIMC() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: trainerClientesKeys.imc() });
  };
}

/**
 * Hook para prefetch de clientes (útil para navegación)
 */
export function usePrefetchClientes() {
  const queryClient = useQueryClient();

  return (params?: GetClientesParams) => {
    queryClient.prefetchQuery({
      queryKey: trainerClientesKeys.list(params),
      queryFn: () => TrainerService.getClientesActivos(params),
      staleTime: 5 * 60 * 1000,
    });
  };
}
