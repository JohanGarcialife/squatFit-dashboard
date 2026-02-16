/**
 * Tipos para el módulo de Seguimiento
 *
 * Maneja el mapeo entre las respuestas de la API del backend
 * y los tipos del frontend para el sistema de seguimiento de clientes.
 *
 * Endpoints utilizados:
 * - GET /api/v1/admin-panel/advices - Obtener clientes desde asesorías
 * - GET /api/v1/admin-panel/tasks/assigned-to-me - Obtener tareas/revisiones
 * - GET /api/v1/support/backoffice/dashboard/metrics - Obtener métricas
 * - GET /api/v1/admin-panel/sales - Obtener ventas
 */

// ============================================================================
// TIPOS DEL FRONTEND (ya existentes en schema.ts)
// ============================================================================

import type {
  ClienteSeguimiento,
  RevisionAgendada,
  AlertaCumplimiento,
  TareaDietista,
  SeguimientoStats,
  EstadoPago,
  TipoRevision,
  EstadoTarea,
  PrioridadAlerta,
  TipoAlerta,
  PendienteCliente,
} from "@/app/(main)/dashboard/seguimiento/_components/schema";

// Re-exportar para facilitar el uso
export type {
  ClienteSeguimiento,
  RevisionAgendada,
  AlertaCumplimiento,
  TareaDietista,
  SeguimientoStats,
  EstadoPago,
  TipoRevision,
  EstadoTarea,
  PrioridadAlerta,
  TipoAlerta,
  PendienteCliente,
};

// ============================================================================
// RESPUESTAS DE LA API - ASESORÍAS
// ============================================================================

/**
 * Usuario básico retornado por la API
 */
export interface UserApiResponse {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  avatar?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Respuesta de asesoría del backend
 * GET /api/v1/admin-panel/advices
 */
export interface AdviceApiResponse {
  id: string;
  user_id: string;
  adviser_id?: string | null;
  plan_type?: string | null;
  subscription_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  monthly_price?: number | null;
  payment_status?: string | null;
  created_at: string;
  updated_at: string;
  user?: UserApiResponse;
  adviser?: UserApiResponse;
}

/**
 * Respuesta paginada de asesorías
 */
export interface AdvicesApiResponse {
  advices: AdviceApiResponse[];
  page: number;
  totalPages: number;
  length: number;
}

// ============================================================================
// RESPUESTAS DE LA API - TAREAS
// ============================================================================

/**
 * Respuesta de tarea del backend
 * GET /api/v1/admin-panel/tasks/assigned-to-me
 */
export interface TaskApiResponse {
  id: string;
  chat_id?: string | null;
  support_ticket_id?: string | null;
  title: string;
  description?: string | null;
  assigned_to: string;
  created_by: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_user?: UserApiResponse | null;
  created_by_user?: UserApiResponse | null;
}

/**
 * Respuesta de tareas con total
 */
export interface TasksApiResponse {
  tasks: TaskApiResponse[];
  total: number;
}

// ============================================================================
// RESPUESTAS DE LA API - MÉTRICAS DE SOPORTE
// ============================================================================

/**
 * Distribución por categoría
 */
export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

/**
 * Respuesta de métricas del dashboard de soporte
 * GET /api/v1/support/backoffice/dashboard/metrics
 */
export interface SupportMetricsApiResponse {
  totalTickets: number;
  ticketsByStatus: {
    pending: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  ticketsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  averageResponseTime: number;
  averageResolutionTime: number;
  categoryDistribution: CategoryDistribution[];
  assignedToMe?: number;
  recentTickets?: any[];
}

// ============================================================================
// RESPUESTAS DE LA API - VENTAS
// ============================================================================

/**
 * Item de venta del backend
 */
export interface SaleApiResponse {
  id: string;
  user_id: string;
  product_id: string;
  product_type: "course" | "advice" | "book";
  product_title?: string;
  amount_value: number;
  currency?: string;
  payment_status?: string;
  created_at: string;
  user?: UserApiResponse;
}

/**
 * Respuesta paginada de ventas
 */
export interface SalesApiResponse {
  sales: SaleApiResponse[];
  page: number;
  totalPages: number;
  length: number;
}

/**
 * Respuesta de total de ventas
 */
export interface TotalSalesApiResponse {
  totalSales: number;
  totalRevenue: number;
}

// ============================================================================
// PARÁMETROS Y FILTROS
// ============================================================================

/**
 * Parámetros para obtener asesorías
 */
export interface GetAdvicesParams {
  limit?: number;
  page?: number;
  search?: string;
}

/**
 * Parámetros para obtener tareas
 */
export interface GetTasksParams {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  limit?: number;
  offset?: number;
}

/**
 * Parámetros para obtener ventas
 */
export interface GetSalesParams {
  limit?: number;
  page?: number;
  month?: number;
  search?: string;
}

/**
 * Filtros para clientes en el frontend
 */
export interface FiltrosClientes {
  busqueda?: string;
  estadoPago?: EstadoPago | "todos";
  ordenarPor?: "nombre" | "proximaRevision" | "estadoPago" | "cumplimiento";
}

/**
 * Filtros para revisiones en el frontend
 */
export interface FiltrosRevisiones {
  fecha?: Date;
  tipoRevision?: TipoRevision | "todas";
  completadas?: boolean;
}

/**
 * Filtros para alertas en el frontend
 */
export interface FiltrosAlertas {
  tipo?: TipoAlerta | "todas";
  prioridad?: PrioridadAlerta | "todas";
  leidas?: boolean;
}

// ============================================================================
// RESPUESTAS GENÉRICAS
// ============================================================================

/**
 * Respuesta genérica de la API con data
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Respuesta única de la API
 */
export interface SingleResponse<T> {
  data: T;
}

/**
 * Respuesta de error de la API
 */
export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}
