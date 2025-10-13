import { getAuthToken } from "@/lib/auth/auth-utils";

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const REQUEST_TIMEOUT = 10000;

// ============================================================================
// TIPOS
// ============================================================================

export interface UpdateUserDto {
  user_id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phone_number?: string;
  birth?: string;
  description?: string;
  profile_picture?: string;
}

// Respuesta real del API de lista de usuarios
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string | null;
  birth: string | null;
  role: string;
  status: string; // "active" o "inactive"
}

// Respuesta completa del API para detalles de usuario (PUT)
export interface UserDetailResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  birth: string;
  profile_picture: string | null;
  config_kcal_goal: number | null;
  encrypt_google_access: string | null;
  notifications: boolean;
  last_logged_in_device: string | null;
  last_logged_in_time: string;
  status_login: number;
  active_token: string;
  role_id: string;
  platform: string;
  weekly_cardio_frequency_id: string | null;
  description: string | null;
  phone_number: string | null;
  status: string;
  gender: string | null;
  weight: number | null;
  height: number | null;
  training_goal_id: string | null;
  daily_activity_id: string | null;
  steps_peer_day_id: string | null;
  strength_training_id: string | null;
}

export interface GetAlumnosParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
}

// ============================================================================
// SERVICIO DE USUARIOS
// ============================================================================

/**
 * Servicio para manejar operaciones relacionadas con usuarios del sistema
 */
export class UsersService {
  /**
   * Configurar headers por defecto con token de autenticación
   */
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    } else if (typeof window !== "undefined") {
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

    console.log("🌐 UsersService: Haciendo petición a:", url);

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

      return await response.json();
    } catch (error) {
      this.handleRequestError(error, timeoutId);
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS DEL SERVICIO
  // ========================================================================

  /**
   * Obtiene todos los alumnos/usuarios
   * Endpoint: GET /api/v1/admin-panel/users
   */
  static async getAlumnos(params?: GetAlumnosParams): Promise<UserResponse[]> {
    try {
      console.log("🔍 UsersService: Obteniendo alumnos...");

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.role) queryParams.append("role", params.role);

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/admin-panel/users${queryString ? `?${queryString}` : ""}`;

      const response = await this.makeRequest<any>(endpoint);
      
      console.log("📦 UsersService: Respuesta del API:", response);
      console.log("📦 UsersService: Tipo de respuesta:", typeof response);
      console.log("📦 UsersService: Es array?:", Array.isArray(response));

      // Verificar si la respuesta es un array directamente o viene dentro de un objeto
      let alumnos: UserResponse[];
      
      if (Array.isArray(response)) {
        alumnos = response;
      } else if (response && Array.isArray(response.data)) {
        alumnos = response.data;
      } else if (response && Array.isArray(response.users)) {
        alumnos = response.users;
      } else {
        console.error("❌ UsersService: Formato de respuesta no reconocido:", response);
        return [];
      }

      console.log(`✅ UsersService: ${alumnos.length} alumnos obtenidos`);
      return alumnos;
    } catch (error) {
      console.error("❌ UsersService: Error obteniendo alumnos:", error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un usuario
   * Endpoint: PUT /api/v1/admin-panel/users/edit
   */
  static async updateUser(data: UpdateUserDto): Promise<UserDetailResponse> {
    if (!data.user_id) {
      throw new Error("ID de usuario requerido");
    }

    try {
      console.log("📝 UsersService: Actualizando usuario:", data.user_id);

      const response = await this.makeRequest<UserDetailResponse>("/api/v1/admin-panel/users/edit", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      console.log("✅ UsersService: Usuario actualizado exitosamente");
      return response;
    } catch (error) {
      console.error("❌ UsersService: Error actualizando usuario:", error);
      throw error;
    }
  }

  /**
   * Método de utilidad para verificar la conectividad con el backend
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log("Health check: No hay token disponible");
        return false;
      }

      await this.makeRequest<{ status: string }>("/api/v1/health");
      return true;
    } catch (error) {
      console.error("Health check falló:", error);
      return false;
    }
  }
}

