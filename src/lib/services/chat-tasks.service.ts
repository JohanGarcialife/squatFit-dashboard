import { getAuthToken } from "@/lib/auth/auth-utils";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface Task {
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

export interface CreateTaskData {
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  due_date?: Date | string;
}

export interface UpdateTaskStatusData {
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface AssignTaskData {
  assigned_to: string;
}

export interface TaskFilters {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
}

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000";
const REQUEST_TIMEOUT = 10000;

/**
 * Servicio para manejar todas las operaciones relacionadas con tareas de chat
 */
export class ChatTasksService {
  /**
   * Configurar headers por defecto con token de autenticación
   */
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Si no hay token, intentar obtenerlo de localStorage como fallback
    if (!token && typeof window !== "undefined") {
      try {
        const fallbackToken = localStorage.getItem("authToken");
        if (fallbackToken) {
          defaultHeaders.Authorization = `Bearer ${fallbackToken}`;
        }
      } catch (error) {
        console.warn("Error accessing localStorage:", error);
      }
    }

    return defaultHeaders;
  }

  /**
   * Manejar errores de respuesta HTTP
   */
  private static async handleResponseError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));

    // Manejar errores de autenticación específicamente
    if (response.status === 401 || response.status === 403) {
      console.warn("Token de autenticación inválido o expirado");
      throw new Error("Unauthorized");
    }

    throw new Error(errorData.message ?? errorData.error ?? `Error ${response.status}: ${response.statusText}`);
  }

  /**
   * Manejar errores de petición
   */
  private static handleRequestError(error: unknown, timeoutId: NodeJS.Timeout): never {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado tiempo");
      }
      throw error;
    }

    throw new Error("Error de conexión con el servidor");
  }

  /**
   * Método privado para realizar peticiones HTTP al backend
   */
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🌐 ChatTasksService: Haciendo petición a:", url);
    console.log("🔑 ChatTasksService: Token disponible:", !!token);

    const defaultHeaders = this.getDefaultHeaders(token);

    // Crear controlador de abort para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleRequestError(error, timeoutId);
    }
  }

  /**
   * Crear una nueva tarea para un chat o ticket
   * @param chatId - ID del chat o ticket
   * @param taskData - Datos de la tarea a crear
   * @returns Tarea creada
   */
  static async createTask(chatId: string, taskData: CreateTaskData): Promise<Task> {
    return this.makeRequest<Task>(`/api/v1/admin-panel/chat/${chatId}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  /**
   * Obtener todas las tareas asociadas a un chat o ticket
   * @param chatId - ID del chat o ticket
   * @returns Lista de tareas
   */
  static async getTasksByChat(chatId: string): Promise<Task[]> {
    return this.makeRequest<Task[]>(`/api/v1/admin-panel/chat/${chatId}/tasks`, {
      method: "GET",
    });
  }

  /**
   * Obtener tareas asignadas al usuario actual
   * @param filters - Filtros opcionales (status, priority)
   * @returns Lista de tareas asignadas
   */
  static async getMyTasks(filters?: TaskFilters): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status) {
      queryParams.append("status", filters.status);
    }
    if (filters?.priority) {
      queryParams.append("priority", filters.priority);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin-panel/tasks/assigned-to-me${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<Task[]>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Actualizar el estado de una tarea
   * @param taskId - ID de la tarea
   * @param status - Nuevo estado
   * @returns Tarea actualizada
   */
  static async updateTaskStatus(taskId: string, status: UpdateTaskStatusData["status"]): Promise<Task> {
    return this.makeRequest<Task>(`/api/v1/admin-panel/tasks/${taskId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Reasignar una tarea a otro usuario
   * @param taskId - ID de la tarea
   * @param assignedTo - ID del usuario al que se reasigna
   * @returns Tarea actualizada
   */
  static async assignTask(taskId: string, assignedTo: string): Promise<Task> {
    return this.makeRequest<Task>(`/api/v1/admin-panel/tasks/${taskId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
  }

  /**
   * Eliminar una tarea
   * @param taskId - ID de la tarea
   */
  static async deleteTask(taskId: string): Promise<void> {
    return this.makeRequest<void>(`/api/v1/admin-panel/tasks/${taskId}`, {
      method: "DELETE",
    });
  }
}

// Exportar instancia singleton
export const chatTasksService = ChatTasksService;
