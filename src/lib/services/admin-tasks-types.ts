/**
 * Tipos TypeScript para el servicio de tareas administrativas
 * Basado en ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

// ============================================================================
// ENUMS Y TIPOS
// ============================================================================

/**
 * Estados posibles de una tarea
 */
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

/**
 * Prioridades de tareas
 */
export type TaskPriority = "low" | "medium" | "high" | "urgent";

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Tarea del sistema
 */
export interface Task {
  id: string;
  chat_id?: string;
  support_ticket_id?: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  created_by: string;
  created_by_name?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Respuesta del endpoint GET /api/v1/admin-panel/tasks/assigned-to-me
 */
export interface TasksResponse {
  tasks: Task[];
  total: number;
}

// ============================================================================
// PARÁMETROS DE CONSULTA
// ============================================================================

/**
 * Parámetros para filtrar tareas
 */
export interface GetTasksParams {
  /** Filtrar por estado */
  status?: TaskStatus;
  /** Filtrar por prioridad */
  priority?: TaskPriority;
  /** Límite de resultados */
  limit?: number;
  /** Offset para paginación */
  offset?: number;
}

// ============================================================================
// TIPOS DE ERROR
// ============================================================================

export interface TasksError {
  message: string;
  status?: number;
  code?: string;
}
