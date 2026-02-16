import { getAuthToken } from "@/lib/auth/auth-utils";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface SavedResponse {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  usage_count: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateSavedResponseData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface UpdateSavedResponseData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  is_active?: boolean;
}

export interface SavedResponseFilters {
  category?: string;
  is_active?: boolean;
  search?: string;
}

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000";
const REQUEST_TIMEOUT = 10000;

/**
 * Servicio para manejar todas las operaciones relacionadas con respuestas guardadas
 */
export class SavedResponsesService {
  /**
   * Configurar headers por defecto con token de autenticación
   */
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

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

    const defaultHeaders = this.getDefaultHeaders(token);

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
   * Crear una nueva respuesta guardada
   */
  static async createResponse(responseData: CreateSavedResponseData): Promise<SavedResponse> {
    return this.makeRequest<SavedResponse>(`/api/v1/admin-panel/saved-responses`, {
      method: "POST",
      body: JSON.stringify(responseData),
    });
  }

  /**
   * Obtener todas las respuestas guardadas del usuario actual
   */
  static async getResponses(filters?: SavedResponseFilters): Promise<SavedResponse[]> {
    const queryParams = new URLSearchParams();
    if (filters?.category) {
      queryParams.append("category", filters.category);
    }
    if (filters?.is_active !== undefined) {
      queryParams.append("is_active", filters.is_active.toString());
    }
    if (filters?.search) {
      queryParams.append("search", filters.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin-panel/saved-responses${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<SavedResponse[]>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Obtener una respuesta guardada por ID
   */
  static async getResponseById(responseId: string): Promise<SavedResponse> {
    return this.makeRequest<SavedResponse>(`/api/v1/admin-panel/saved-responses/${responseId}`, {
      method: "GET",
    });
  }

  /**
   * Actualizar una respuesta guardada
   */
  static async updateResponse(responseId: string, updates: UpdateSavedResponseData): Promise<SavedResponse> {
    return this.makeRequest<SavedResponse>(`/api/v1/admin-panel/saved-responses/${responseId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Eliminar una respuesta guardada
   */
  static async deleteResponse(responseId: string): Promise<void> {
    return this.makeRequest<void>(`/api/v1/admin-panel/saved-responses/${responseId}`, {
      method: "DELETE",
    });
  }

  /**
   * Incrementar contador de uso de una respuesta
   */
  static async incrementUsageCount(responseId: string): Promise<void> {
    return this.makeRequest<void>(`/api/v1/admin-panel/saved-responses/${responseId}/increment-usage`, {
      method: "POST",
    });
  }
}

// Exportar instancia singleton
export const savedResponsesService = SavedResponsesService;
