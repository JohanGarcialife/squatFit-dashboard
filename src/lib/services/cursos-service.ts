import { getAuthToken } from "@/lib/auth/auth-utils";
import { Curso, CursoApi } from "@/app/(main)/dashboard/cursos/_components/schema";

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const REQUEST_TIMEOUT = 10000;

// ============================================================================
// TIPOS
// ============================================================================

// DTO para el formulario (desde la UI)
export interface CreateCursoDto {
  name: string;
  description: string;
  instructor: string;
  price: number;
  currency?: string;
  status?: "Activo" | "Inactivo" | "En Desarrollo";
  duration: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  category: string;
}

// DTO que espera la API (formato real del backend)
export interface CreateCursoApiDto {
  id?: string;
  title: string;
  subtitle: string;
  price: string;
  tutor_id: string;
  image?: string;
  video_presentation?: string;
}

export interface UpdateCursoDto extends Partial<CreateCursoDto> {
  id: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetCursosParams {
  page?: number;
  limit?: number;
  status?: "Activo" | "Inactivo" | "En Desarrollo";
  category?: string;
  level?: "Principiante" | "Intermedio" | "Avanzado";
}

// ============================================================================
// SERVICIO DE CURSOS
// ============================================================================

/**
 * Servicio para manejar todas las operaciones relacionadas con cursos
 */
export class CursosService {
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
      // Fallback a localStorage
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

    // Manejar errores de autenticación
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

    console.log("🌐 CursosService: Haciendo petición a:", url);

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

      return await response.json();
    } catch (error) {
      this.handleRequestError(error, timeoutId);
    }
  }

  // ========================================================================
  // TRANSFORMADORES DE DATOS
  // ========================================================================

  /**
   * Transforma los datos de la API al formato esperado por la UI
   */
  private static transformCursoFromApi(apiCurso: CursoApi): Curso {
    // Manejo seguro del tutor (puede ser undefined en algunas respuestas)
    const instructorName = apiCurso.tutor
      ? `${apiCurso.tutor.firstName} ${apiCurso.tutor.lastName}`.trim()
      : "Sin instructor";

    const priceNumber = parseFloat(apiCurso.price) || 0;

    return {
      id: apiCurso.id,
      name: apiCurso.title,
      description: apiCurso.subtitle || "Sin descripción",
      instructor: instructorName,
      price: priceNumber,
      currency: "€",
      status: "Activo",
      students: apiCurso.students || 0,
      duration: "8 semanas", // Valor por defecto
      level: "Principiante", // Valor por defecto
      category: "General", // Valor por defecto
      thumbnail: apiCurso.image || undefined,
      tutorId: apiCurso.tutor?.id,
      tutorFirstName: apiCurso.tutor?.firstName,
      tutorLastName: apiCurso.tutor?.lastName,
      tutorProfilePicture: apiCurso.tutor?.profile_picture,
      videoPresentation: apiCurso.video_presentation || undefined,
    };
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS DEL SERVICIO
  // ========================================================================

  /**
   * Obtiene todos los cursos
   * Endpoint: GET /api/v1/admin-panel/courses
   */
  static async getCursos(params?: GetCursosParams): Promise<Curso[]> {
    try {
      console.log("🔍 CursosService: Obteniendo cursos...");

      // Construir query params
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.category) queryParams.append("category", params.category);
      if (params?.level) queryParams.append("level", params.level);

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/admin-panel/courses${queryString ? `?${queryString}` : ""}`;

      const response = await this.makeRequest<any>(endpoint);

      // Log para debugging - ver estructura de respuesta
      console.log("📦 CursosService: Respuesta de la API:", response);

      // Manejar diferentes estructuras de respuesta
      let cursosApi: CursoApi[] = [];

      if (Array.isArray(response)) {
        // La API devuelve directamente el array
        cursosApi = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // La API devuelve { data: [...] }
        cursosApi = response.data;
      } else if (response?.courses && Array.isArray(response.courses)) {
        // La API devuelve { courses: [...] }
        cursosApi = response.courses;
      } else {
        console.warn("⚠️ CursosService: Estructura de respuesta desconocida", response);
        cursosApi = [];
      }

      // Transformar los datos de la API al formato de la UI
      const cursos: Curso[] = cursosApi.map((apiCurso) => this.transformCursoFromApi(apiCurso));

      console.log(`✅ CursosService: ${cursos.length} cursos obtenidos y transformados`);
      return cursos;
    } catch (error) {
      console.error("❌ CursosService: Error obteniendo cursos:", error);
      throw error;
    }
  }

  /**
   * Obtiene un curso por ID
   * Endpoint: GET /api/v1/courses/{id}
   */
  static async getCursoById(id: string): Promise<Curso> {
    if (!id) {
      throw new Error("ID de curso requerido");
    }

    try {
      const response = await this.makeRequest<ApiResponse<Curso>>(`/api/v1/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo curso:", error);
      throw error;
    }
  }

  /**
   * Transforma los datos del formulario al formato esperado por la API
   */
  private static transformToApiFormat(data: CreateCursoDto): CreateCursoApiDto {
    return {
      title: data.name,
      subtitle: data.description,
      price: data.price.toString(), // Convertir number a string
      tutor_id: data.instructor, // Por ahora, usar el nombre del instructor como ID
      // TODO: Necesitamos un selector de tutores que devuelva el ID real
      image: "", // Valor por defecto
      video_presentation: "", // Valor por defecto
    };
  }

  /**
   * Crea un nuevo curso
   * Endpoint: POST /api/v1/admin-panel/courses
   */
  static async createCurso(data: CreateCursoDto): Promise<Curso> {
    if (!data.name || !data.description) {
      throw new Error("Nombre y descripción son requeridos");
    }

    try {
      console.log("📝 CursosService: Creando nuevo curso:", data.name);

      // Transformar datos del formulario al formato de la API
      const apiData = this.transformToApiFormat(data);

      console.log("📤 CursosService: Datos enviados a la API:", apiData);

      const response = await this.makeRequest<any>("/api/v1/admin-panel/courses", {
        method: "POST",
        body: JSON.stringify(apiData),
      });

      console.log("✅ CursosService: Curso creado exitosamente");
      console.log("📦 CursosService: Respuesta de la API:", response);

      // Si la respuesta es un array, tomar el primer elemento
      const cursoData = Array.isArray(response) ? response[0] : response.data || response;

      // Transformar la respuesta al formato de la UI
      return this.transformCursoFromApi(cursoData);
    } catch (error) {
      console.error("Error creando curso:", error);
      throw error;
    }
  }

  /**
   * Actualiza un curso existente
   * Endpoint: PUT /api/v1/admin-panel/courses?course_id={id}
   */
  static async updateCurso(id: string, data: Partial<CreateCursoDto>): Promise<Curso> {
    if (!id) {
      throw new Error("ID de curso requerido");
    }

    try {
      console.log("📝 CursosService: Actualizando curso:", id);

      // Transformar datos al formato de la API (solo los campos proporcionados)
      const apiData: Partial<CreateCursoApiDto> = {};

      if (data.name) apiData.title = data.name;
      if (data.description) apiData.subtitle = data.description;
      if (data.price !== undefined) apiData.price = data.price.toString();
      if (data.instructor) apiData.tutor_id = data.instructor;

      console.log("📤 CursosService: Datos enviados a la API:", apiData);

      const response = await this.makeRequest<any>(`/api/v1/admin-panel/courses?course_id=${id}`, {
        method: "PUT",
        body: JSON.stringify(apiData),
      });

      console.log("✅ CursosService: Curso actualizado exitosamente");
      console.log("📦 CursosService: Respuesta de la API:", response);

      // Transformar la respuesta al formato de la UI
      const cursoData = Array.isArray(response) ? response[0] : response.data || response;
      return this.transformCursoFromApi(cursoData);
    } catch (error) {
      console.error("Error actualizando curso:", error);
      throw error;
    }
  }

  /**
   * Elimina un curso
   * Endpoint: DELETE /api/v1/courses/{id}
   */
  static async deleteCurso(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID de curso requerido");
    }

    try {
      console.log("🗑️ CursosService: Eliminando curso:", id);

      await this.makeRequest<{ success: boolean; message: string }>(`/api/v1/courses/${id}`, {
        method: "DELETE",
      });

      console.log("✅ CursosService: Curso eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando curso:", error);
      throw error;
    }
  }

  /**
   * Activa o desactiva un curso
   * Endpoint: PUT /api/v1/admin-panel/courses/status
   *
   * NOTA: La API solo devuelve un mensaje de confirmación, no el curso actualizado
   * Ejemplo respuesta: { "message": "Curso activado exitosamente" }
   */
  static async toggleCursoStatus(id: string, status: "Activo" | "Inactivo"): Promise<{ message: string }> {
    if (!id) {
      throw new Error("ID de curso requerido");
    }

    try {
      console.log("🔄 CursosService: Cambiando estado del curso:", id, "a", status);

      // Convertir status a boolean para la API
      const active = status === "Activo";

      const requestBody = {
        course_id: id,
        active: active,
      };

      console.log("📤 CursosService: Datos enviados a la API:", requestBody);

      const response = await this.makeRequest<{ message: string }>(`/api/v1/admin-panel/courses/status`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      console.log("✅ CursosService: Estado del curso actualizado");
      console.log("📦 CursosService: Respuesta de la API:", response);

      // La API solo devuelve { message: "Curso activado/desactivado exitosamente" }
      return response;
    } catch (error) {
      console.error("Error cambiando estado del curso:", error);
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
