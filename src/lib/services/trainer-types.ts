/**
 * Tipos para el servicio de Trainer
 * Basado en los endpoints disponibles del backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

// ============================================================================
// TIPOS DE TAREAS (reutilizando de chat-tasks.service.ts)
// ============================================================================

export interface TrainerTask {
  id: string;
  chat_id?: string | null;
  support_ticket_id?: string | null;
  title: string;
  description?: string | null;
  assigned_to: string;
  created_by: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: Date | string | null;
  completed_at?: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  assigned_to_user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  created_by_user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface CreateTrainerTaskDto {
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  due_date?: Date | string;
}

export interface UpdateTaskStatusDto {
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface GetTasksFilters {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  limit?: number;
  offset?: number;
}

// ============================================================================
// TIPOS DE CLIENTES/ASESORÍAS
// ============================================================================

export interface TrainerCliente {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  // Datos de la asesoría
  advice_id?: string;
  advice_type?: "Entrenamiento" | "Nutricional" | "Completo";
  coach_id?: string;
  coach_name?: string;
  start_date?: string;
  end_date?: string;
  status?: "active" | "inactive" | "pending";
}

export interface GetClientesParams {
  page?: number;
  limit?: number;
  status?: string;
}

// Respuesta del endpoint GET /api/v1/admin-panel/advices
export interface AdviceResponse {
  advices: Advice[];
  page: number;
  totalPages: number;
  length: number;
}

export interface Advice {
  id: string;
  user_id: string;
  coach_id: string;
  advice_type: string;
  start_date: string;
  end_date: string;
  status: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  coach?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ============================================================================
// TIPOS DE IMC/CALCULADORA
// ============================================================================

export interface IMCHistoryRecord {
  id: string;
  user_id: string;
  weight: number;
  height: number;
  imc: number;
  classification: string;
  tips?: string[];
  created_at: string;
}

export interface IMCCalculationResponse {
  imc: number;
  classification: string;
  tips: string[];
  weight: number;
  height: number;
}

export interface CalculateIMCDto {
  weight: number;
  height: number;
}

// ============================================================================
// TIPOS DE MÉTRICAS AGREGADAS
// ============================================================================

export interface TrainerMetrics {
  // Métricas de tareas
  totalTareas: number;
  tareasPendientes: number;
  tareasEnProgreso: number;
  tareasCompletadas: number;
  tareasCanceladas: number;
  porcentajeCompletadas: number;

  // Métricas de clientes
  totalClientes: number;
  clientesActivos: number;
  clientesInactivos: number;

  // Métricas por prioridad
  tareasUrgentes: number;
  tareasAltas: number;
  tareasMedias: number;
  tareasBajas: number;

  // Métricas temporales
  tareasVencidas: number;
  tareasProximasVencer: number; // Próximas 7 días
}

// ============================================================================
// TIPOS DE RESPUESTAS API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TasksResponse {
  tasks: TrainerTask[];
  total: number;
}

// ============================================================================
// TIPOS DE COACHES/ENTRENADORES
// ============================================================================

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialties?: string[];
  certifications?: string[];
  experience?: number;
  hourlyRate?: number;
  bio?: string;
  status?: "active" | "inactive";
}

export interface GetCoachesParams {
  page?: number;
  limit?: number;
  status?: string;
  specialty?: string;
  availability?: string;
}
