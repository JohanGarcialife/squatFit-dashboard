import {
  courseDetailApiSchema,
  type CourseDetail,
} from "@/app/(main)/dashboard/cursos/_components/course-detail-schema";
import { Curso, CursoApi } from "@/app/(main)/dashboard/cursos/_components/schema";
import { getAuthToken } from "@/lib/auth/auth-utils";

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
  image?: string;
  video_presentation?: string;
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
}

export interface UploadVideoResponse {
  message: string;
  url?: string;
}

export interface UploadCursoVideoPayload {
  courseId: string;
  file: File;
  description?: string;
  priority?: number;
}

export interface LinkCursoVideoPayload {
  courseId: string;
  title: string;
  url: string;
  description?: string;
  priority?: number;
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
   * Valida si una URL de imagen es válida o es un placeholder genérico
   */
  private static isValidImageUrl(url: string | null | undefined): boolean {
    if (!url || typeof url !== "string" || url.trim() === "") {
      return false;
    }

    const trimmedUrl = url.trim();

    // Lista de URLs inválidas conocidas
    const invalidUrls = [
      "image.jpg",
      "/image.jpg",
      "https://storage.googleapis.com/course-images/image.jpg",
      "storage.googleapis.com/course-images/image.jpg",
      "fitness-fundamentals.jpg",
      "/fitness-fundamentals.jpg",
    ];

    // Filtrar URLs inválidas conocidas
    if (invalidUrls.includes(trimmedUrl)) {
      return false;
    }

    // Filtrar URLs que contengan "image.jpg" genérico
    if (trimmedUrl.toLowerCase().includes("/image.jpg") || trimmedUrl.toLowerCase().endsWith("image.jpg")) {
      return false;
    }

    // Filtrar URLs de Google Storage que sean genéricas o inválidas
    if (trimmedUrl.includes("storage.googleapis.com") && trimmedUrl.includes("/image.jpg")) {
      return false;
    }

    return true;
  }

  /**
   * Transforma los datos de la API al formato esperado por la UI
   */
  private static transformCursoFromApi(apiCurso: CursoApi): Curso {
    // Manejo seguro del tutor (puede ser undefined en algunas respuestas)
    const instructorName = apiCurso.tutor
      ? `${apiCurso.tutor.firstName} ${apiCurso.tutor.lastName}`.trim()
      : "Sin instructor";

    const priceNumber = parseFloat(apiCurso.price) || 0;

    // Convertir students a número: el back puede enviar string; si no convertimos, al sumar se concatenan ("0"+"1"+"0" → "010").
    const rawStudents = (apiCurso as { students?: unknown }).students;
    const students = Number(rawStudents) || 0;

    // Validar y filtrar imágenes inválidas antes de asignarlas
    const validThumbnail = apiCurso.image && this.isValidImageUrl(apiCurso.image) ? apiCurso.image : undefined;

    return {
      id: apiCurso.id,
      name: apiCurso.title,
      description: apiCurso.subtitle || "Sin descripción",
      instructor: instructorName,
      price: priceNumber,
      currency: "€",
      status: "Activo",
      students,
      duration: "8 semanas", // Valor por defecto
      thumbnail: validThumbnail,
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

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/admin-panel/courses${queryString ? `?${queryString}` : ""}`;

      const response = await this.makeRequest<any>(endpoint);

      // Debug: respuesta cruda del endpoint admin-panel/courses
      console.log(
        "[GET /api/v1/admin-panel/courses]",
        { endpoint, query: queryString || "(sin query)" },
        "→ respuesta completa:",
        response,
      );
      if (typeof response === "object" && response !== null) {
        const arr = Array.isArray(response) ? response : (response?.data ?? response?.courses ?? []);
        if (Array.isArray(arr)) {
          console.log(
            "[GET /api/v1/admin-panel/courses] total ítems en lista:",
            arr.length,
            "| primer curso (todos los campos del back):",
            arr[0] ?? "(vacío)",
          );
        }
      }

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
   * Detalle completo del curso (currículo de videos/audios)
   * Endpoint: GET /api/v1/course/detail/{id}
   */
  static async getCourseDetail(id: string): Promise<CourseDetail> {
    if (!id) {
      throw new Error("ID de curso requerido");
    }

    const raw: unknown = await this.makeRequest<unknown>(`/api/v1/course/detail/${id}`);
    const parsed = courseDetailApiSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("CursosService.getCourseDetail: respuesta inválida", parsed.error.flatten());
      throw new Error("La respuesta del detalle del curso no es válida");
    }

    return parsed.data;
  }

  /**
   * Transforma los datos del formulario al formato esperado por la API
   */
  private static transformToApiFormat(data: CreateCursoDto): CreateCursoApiDto {
    return {
      title: data.name,
      subtitle: data.description,
      price: data.price.toString(),
      tutor_id: data.instructor,
      image: data.image ?? "",
      video_presentation: data.video_presentation ?? "",
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
   * Endpoint: DELETE /api/v1/admin-panel/courses?course_id={id}
   * Elimina permanentemente un curso de la plataforma.
   */
  static async deleteCurso(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID de curso requerido");
    }

    try {
      console.log("🗑️ CursosService: Eliminando curso:", id);

      await this.makeRequest<{ success?: boolean; message?: string }>(`/api/v1/admin-panel/courses?course_id=${id}`, {
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
   * Sube un archivo de video y lo asocia a un curso
   * Endpoint: POST /api/v1/course/upload-video?course_id={id}
   *
   * NOTA: Usa multipart/form-data. No se establece Content-Type manualmente
   * para que el navegador añada el boundary correcto.
   */
  static async uploadCursoVideo({
    courseId,
    file,
    description,
    priority,
  }: UploadCursoVideoPayload): Promise<UploadVideoResponse> {
    if (!courseId) {
      throw new Error("ID de curso requerido");
    }

    const token = getAuthToken() ?? (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);
    const url = `${API_BASE_URL}/api/v1/course/upload-video?course_id=${courseId}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (description?.trim()) {
      formData.append("description", description.trim());
    }
    if (priority !== undefined) {
      formData.append("priority", priority.toString());
    }

    // Timeout extendido (2 minutos) para archivos de video pesados
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    try {
      console.log("📹 CursosService: Subiendo video al curso:", courseId);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const result: UploadVideoResponse = await response.json();
      console.log("✅ CursosService: Video subido exitosamente:", result);
      return result;
    } catch (error) {
      this.handleRequestError(error, timeoutId);
    }
  }

  /**
   * Vincula un video externo a un curso
   * Endpoint: POST /api/v1/course/link-video?course_id={id}
   */
  static async linkCursoVideo({
    courseId,
    title,
    url,
    description,
    priority,
  }: LinkCursoVideoPayload): Promise<UploadVideoResponse> {
    if (!courseId) {
      throw new Error("ID de curso requerido");
    }

    if (!title.trim()) {
      throw new Error("El titulo del video es requerido");
    }

    if (!url.trim()) {
      throw new Error("La URL del video es requerida");
    }

    const trimmedDescription = description?.trim();

    const payload = {
      title: title.trim(),
      url: url.trim(),
      description: trimmedDescription ? trimmedDescription : undefined,
      priority,
    };

    try {
      console.log("🔗 CursosService: Vinculando video externo al curso:", courseId);
      return await this.makeRequest<UploadVideoResponse>(`/api/v1/course/link-video?course_id=${courseId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error vinculando video externo:", error);
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
