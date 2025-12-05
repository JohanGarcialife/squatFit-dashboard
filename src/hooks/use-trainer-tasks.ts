/**
 * Hooks para gestión de Tareas del Trainer
 * Conectado con TrainerService usando React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TrainerService } from "@/lib/services/trainer-service";
import type { TrainerTask, CreateTrainerTaskDto, GetTasksFilters, TrainerMetrics } from "@/lib/services/trainer-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const trainerTasksKeys = {
  all: ["trainer-tasks"] as const,
  lists: () => [...trainerTasksKeys.all, "list"] as const,
  list: (filters?: GetTasksFilters) => [...trainerTasksKeys.lists(), filters] as const,
  byClient: (chatId: string) => [...trainerTasksKeys.all, "by-client", chatId] as const,
  metrics: () => [...trainerTasksKeys.all, "metrics"] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener tareas asignadas al trainer actual
 * Endpoint: GET /api/v1/admin-panel/tasks/assigned-to-me
 */
export function useTrainerTasks(filters?: GetTasksFilters) {
  return useQuery({
    queryKey: trainerTasksKeys.list(filters),
    queryFn: () => TrainerService.getTareasAsignadas(filters),
    staleTime: 30 * 1000, // 30 segundos (más frecuente para tareas)
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar si es error de autenticación
      if (error instanceof Error && error.message === "Unauthorized") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true, // Refrescar al volver a la ventana
  });
}

/**
 * Hook para obtener tareas de un cliente específico
 * Endpoint: GET /api/v1/admin-panel/chat/:chatId/tasks
 */
export function useClientTasks(chatId: string) {
  return useQuery({
    queryKey: trainerTasksKeys.byClient(chatId),
    queryFn: () => TrainerService.getTareasPorCliente(chatId),
    enabled: !!chatId, // Solo ejecuta si hay chatId
    staleTime: 30 * 1000,
    retry: 1,
  });
}

/**
 * Hook para calcular métricas agregadas de tareas
 */
export function useTrainerMetrics(filters?: GetTasksFilters) {
  const { data: tasks = [], isLoading, isError } = useTrainerTasks(filters);

  return useQuery({
    queryKey: trainerTasksKeys.metrics(),
    queryFn: () => {
      const metrics = TrainerService.calcularMetricasTareas(tasks);
      return metrics;
    },
    enabled: tasks.length > 0, // Solo calcular si hay tareas
    staleTime: 30 * 1000,
    initialData: () => {
      // Datos iniciales mientras carga
      return {
        totalTareas: 0,
        tareasPendientes: 0,
        tareasEnProgreso: 0,
        tareasCompletadas: 0,
        tareasCanceladas: 0,
        porcentajeCompletadas: 0,
        totalClientes: 0,
        clientesActivos: 0,
        clientesInactivos: 0,
        tareasUrgentes: 0,
        tareasAltas: 0,
        tareasMedias: 0,
        tareasBajas: 0,
        tareasVencidas: 0,
        tareasProximasVencer: 0,
      } as TrainerMetrics;
    },
  });
}

// ============================================================================
// MUTATIONS - ESCRITURA DE DATOS
// ============================================================================

/**
 * Hook para crear una nueva tarea para un cliente
 * Endpoint: POST /api/v1/admin-panel/chat/:chatId/tasks
 */
export function useCreateTrainerTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: CreateTrainerTaskDto }) =>
      TrainerService.crearTarea(chatId, data),
    onMutate: async () => {
      toast.loading("Creando tarea...", { id: "create-task" });
    },
    onSuccess: (newTask, { chatId }) => {
      // Invalidar queries para refrescar
      queryClient.invalidateQueries({ queryKey: trainerTasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trainerTasksKeys.byClient(chatId) });
      queryClient.invalidateQueries({ queryKey: trainerTasksKeys.metrics() });

      toast.success("Tarea creada exitosamente", { id: "create-task" });
    },
    onError: (error: Error) => {
      console.error("Error creando tarea:", error);
      toast.error(error.message || "Error al crear la tarea", { id: "create-task" });
    },
  });
}

/**
 * Hook para actualizar el estado de una tarea
 * Endpoint: PUT /api/v1/admin-panel/tasks/:taskId/status
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: "pending" | "in_progress" | "completed" | "cancelled";
    }) => TrainerService.actualizarEstadoTarea(taskId, status),
    onMutate: async ({ taskId, status }) => {
      const statusLabels = {
        pending: "Pendiente",
        in_progress: "En Progreso",
        completed: "Completada",
        cancelled: "Cancelada",
      };
      toast.loading(`Actualizando a ${statusLabels[status]}...`, { id: `update-task-${taskId}` });

      // Optimistic update
      await queryClient.cancelQueries({ queryKey: trainerTasksKeys.lists() });

      const previousTasks = queryClient.getQueryData<TrainerTask[]>(trainerTasksKeys.lists());

      if (previousTasks) {
        const updatedTasks = previousTasks.map((task) => (task.id === taskId ? { ...task, status } : task));
        queryClient.setQueryData(trainerTasksKeys.lists(), updatedTasks);
      }

      return { previousTasks, taskId };
    },
    onSuccess: (updatedTask, { taskId }) => {
      // Invalidar queries para refrescar
      queryClient.invalidateQueries({ queryKey: trainerTasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trainerTasksKeys.metrics() });

      // Si la tarea tiene chat_id, invalidar también las tareas de ese cliente
      if (updatedTask.chat_id) {
        queryClient.invalidateQueries({ queryKey: trainerTasksKeys.byClient(updatedTask.chat_id) });
      }

      toast.success("Estado actualizado exitosamente", { id: `update-task-${taskId}` });
    },
    onError: (error: Error, { taskId }, context) => {
      // Rollback en caso de error
      if (context?.previousTasks) {
        queryClient.setQueryData(trainerTasksKeys.lists(), context.previousTasks);
      }

      console.error("Error actualizando tarea:", error);
      toast.error(error.message || "Error al actualizar la tarea", { id: `update-task-${taskId}` });
    },
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Hook para invalidar todas las queries de tareas
 */
export function useInvalidateTrainerTasks() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: trainerTasksKeys.all });
  };
}

/**
 * Hook para obtener tareas filtradas por estado
 */
export function useTasksByStatus(status: "pending" | "in_progress" | "completed" | "cancelled") {
  return useTrainerTasks({ status });
}

/**
 * Hook para obtener tareas filtradas por prioridad
 */
export function useTasksByPriority(priority: "low" | "medium" | "high" | "urgent") {
  return useTrainerTasks({ priority });
}
