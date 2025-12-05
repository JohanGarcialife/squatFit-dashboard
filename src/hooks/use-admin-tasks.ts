/**
 * Hooks para gestión de tareas administrativas con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useQuery } from "@tanstack/react-query";

import { AdminTasksService } from "@/lib/services/admin-tasks-service";
import type { GetTasksParams, TaskStatus } from "@/lib/services/admin-tasks-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const adminTasksKeys = {
  all: ["admin-tasks"] as const,
  lists: () => [...adminTasksKeys.all, "list"] as const,
  list: (params?: GetTasksParams) => [...adminTasksKeys.lists(), params] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener todas las tareas asignadas al usuario autenticado
 * Endpoint: GET /api/v1/admin-panel/tasks/assigned-to-me
 *
 * @param params - Parámetros de filtrado (status, priority, limit, offset)
 */
export function useMyTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: adminTasksKeys.list(params),
    queryFn: () => AdminTasksService.getTasksAssignedToMe(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar en caso de error
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false, // Desactivar auto-refresh si hay error
  });
}

/**
 * Hook para obtener tareas filtradas por estado específico
 *
 * @param status - Estado de las tareas a filtrar
 * @param params - Parámetros adicionales de filtrado
 */
export function useMyTasksByStatus(status: TaskStatus, params?: Omit<GetTasksParams, "status">) {
  return useMyTasks({ ...params, status });
}

/**
 * Hook para obtener solo las tareas pendientes del usuario
 * Útil para widgets del dashboard
 *
 * @param limit - Límite de tareas a obtener (default: 5)
 */
export function useMyPendingTasks(limit: number = 5) {
  return useMyTasksByStatus("pending", { limit });
}

/**
 * Hook para obtener tareas en progreso
 */
export function useMyInProgressTasks(limit?: number) {
  return useMyTasksByStatus("in_progress", { limit });
}

/**
 * Hook para contar tareas pendientes
 */
export function usePendingTasksCount() {
  const { data } = useMyTasks({ status: "pending" });
  return data?.total ?? 0;
}
