import { Libro, LibroApi } from "@/app/(main)/dashboard/libros/_components/schema";
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
export interface CreateLibroDto {
  title: string;
  subtitle: string;
  image?: File | null;
  imageUrl?: string;
  price: number;
}

export interface UpdateLibroDto extends Partial<CreateLibroDto> {
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

// ============================================================================
// SERVICIO DE LIBROS
// ============================================================================

/**
 * Servicio para manejar todas las operaciones relacionadas con libros
 */
export class LibrosService {
  /**
   * Configurar headers por defecto con token de autenticación
   */
  private static getDefaultHeaders(token: string | null, isFormData = false): Record<string, string> {
    const defaultHeaders: Record<string, string> = {};

    // No establecer Content-Type para FormData, el navegador lo hará automáticamente
    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }

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

    console.log("🌐 LibrosService: Haciendo petición a:", url);

    const isFormData = options.body instanceof FormData;
    const defaultHeaders = this.getDefaultHeaders(token, isFormData);

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
   * Valida si una URL de imagen es válida
   */
  private static isValidImageUrl(url: string | null | undefined): boolean {
    if (!url || typeof url !== "string" || url.trim() === "") {
      return false;
    }

    const trimmedUrl = url.trim();

    // Lista de URLs inválidas conocidas
    const invalidUrls = ["image.jpg", "/image.jpg", "placeholder.jpg", "/placeholder.jpg"];

    // Filtrar URLs inválidas conocidas
    if (invalidUrls.includes(trimmedUrl)) {
      return false;
    }

    return true;
  }

  /**
   * Transforma los datos de la API al formato esperado por la UI
   */
  private static transformLibroFromApi(apiLibro: LibroApi): Libro {
    const priceNumber = parseFloat(apiLibro.price) || 0;

    // Validar y filtrar imágenes inválidas antes de asignarlas
    const validImage = apiLibro.image && this.isValidImageUrl(apiLibro.image) ? apiLibro.image : undefined;

    return {
      id: apiLibro.id,
      title: apiLibro.title,
      subtitle: apiLibro.subtitle || "Sin descripción",
      image: validImage,
      price: priceNumber,
      versions: apiLibro.versions || [],
    };
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS DEL SERVICIO
  // ========================================================================

  /**
   * Obtiene todos los libros
   * Endpoint: GET /api/v1/book/all
   */
  static async getLibros(): Promise<Libro[]> {
    try {
      console.log("🔍 LibrosService: Obteniendo libros...");

      const response = await this.makeRequest<any>("/api/v1/book/all");

      // Log para debugging - ver estructura de respuesta
      console.log("📦 LibrosService: Respuesta de la API:", response);

      // Manejar diferentes estructuras de respuesta
      let librosApi: LibroApi[] = [];

      if (Array.isArray(response)) {
        // La API devuelve directamente el array
        librosApi = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // La API devuelve { data: [...] }
        librosApi = response.data;
      } else if (response?.books && Array.isArray(response.books)) {
        // La API devuelve { books: [...] }
        librosApi = response.books;
      } else {
        console.warn("⚠️ LibrosService: Estructura de respuesta desconocida", response);
        librosApi = [];
      }

      // Transformar los datos de la API al formato de la UI
      const libros: Libro[] = librosApi.map((apiLibro) => this.transformLibroFromApi(apiLibro));

      console.log(`✅ LibrosService: ${libros.length} libros obtenidos y transformados`);
      return libros;
    } catch (error) {
      console.error("❌ LibrosService: Error obteniendo libros:", error);
      throw error;
    }
  }

  /**
   * Obtiene un libro por ID
   * Endpoint: GET /api/v1/book/{id}
   */
  static async getLibroById(id: string): Promise<Libro> {
    if (!id) {
      throw new Error("ID de libro requerido");
    }

    try {
      console.log("🔍 LibrosService: Obteniendo libro:", id);

      const response = await this.makeRequest<any>(`/api/v1/book/${id}`);

      console.log("📦 LibrosService: Respuesta de la API:", response);

      // Manejar estructura de respuesta
      const libroData = response.data || response;

      return this.transformLibroFromApi(libroData);
    } catch (error) {
      console.error("❌ LibrosService: Error obteniendo libro:", error);
      throw error;
    }
  }

  /**
   * Crea un nuevo libro
   * Endpoint: POST /api/v1/book (multipart/form-data)
   */
  static async createLibro(data: CreateLibroDto): Promise<Libro> {
    if (!data.title || !data.subtitle) {
      throw new Error("Título y subtítulo son requeridos");
    }

    try {
      console.log("📝 LibrosService: Creando nuevo libro:", data.title);

      // Crear FormData para enviar datos multipart
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle);
      formData.append("price", data.price.toString());

      // Manejar imagen: archivo o URL
      if (data.image instanceof File) {
        formData.append("image", data.image);
        console.log("📤 LibrosService: Enviando archivo de imagen:", data.image.name);
      } else if (data.imageUrl) {
        formData.append("imageUrl", data.imageUrl);
        console.log("📤 LibrosService: Enviando URL de imagen:", data.imageUrl);
      }

      console.log("📤 LibrosService: Datos enviados a la API (FormData)");

      const response = await this.makeRequest<any>("/api/v1/book", {
        method: "POST",
        body: formData,
      });

      console.log("✅ LibrosService: Libro creado exitosamente");
      console.log("📦 LibrosService: Respuesta de la API:", response);

      // Si la respuesta es un array, tomar el primer elemento
      const libroData = Array.isArray(response) ? response[0] : response.data || response;

      // Transformar la respuesta al formato de la UI
      return this.transformLibroFromApi(libroData);
    } catch (error) {
      console.error("❌ LibrosService: Error creando libro:", error);
      throw error;
    }
  }

  /**
   * Actualiza un libro existente
   * Endpoint: PUT /api/v1/book/{id}
   */
  static async updateLibro(id: string, data: Partial<CreateLibroDto>): Promise<Libro> {
    if (!id) {
      throw new Error("ID de libro requerido");
    }

    try {
      console.log("📝 LibrosService: Actualizando libro:", id);

      // Según documentación: PUT /api/v1/book/{id} con body application/json
      // Campos: title, subtitle, image (URL string), price (string)
      const hasFile = data.image instanceof File;

      if (hasFile) {
        // Solo usar FormData cuando se sube un archivo nuevo (si la API lo acepta)
        const formData = new FormData();
        if (data.title) formData.append("title", data.title);
        if (data.subtitle) formData.append("subtitle", data.subtitle);
        if (data.price !== undefined) formData.append("price", data.price.toString());
        formData.append("image", data.image);
        console.log("📤 LibrosService: Actualizando con archivo de imagen:", data.image.name);

        const response = await this.makeRequest<any>(`/api/v1/book/${id}`, {
          method: "PUT",
          body: formData,
        });

        console.log("✅ LibrosService: Libro actualizado exitosamente");
        console.log("📦 LibrosService: Respuesta de la API:", response);

        const libroData = Array.isArray(response) ? response[0] : response.data || response;
        return this.transformLibroFromApi(libroData);
      } else {
        // Usar JSON según documentación: PUT /api/v1/book/{id} con application/json
        // Campos esperados: title, subtitle, image (URL string), price (string)
        const jsonData: Record<string, string> = {};

        if (data.title) jsonData.title = data.title;
        if (data.subtitle) jsonData.subtitle = data.subtitle;
        if (data.price !== undefined) jsonData.price = data.price.toString();
        // La API espera el campo "image" con la URL de la imagen
        if (data.imageUrl && this.isValidImageUrl(data.imageUrl)) {
          jsonData.image = data.imageUrl;
        }

        console.log("📤 LibrosService: Datos enviados a la API (JSON):", jsonData);

        const response = await this.makeRequest<any>(`/api/v1/book/${id}`, {
          method: "PUT",
          body: JSON.stringify(jsonData),
        });

        console.log("✅ LibrosService: Libro actualizado exitosamente");
        console.log("📦 LibrosService: Respuesta de la API:", response);

        const libroData = Array.isArray(response) ? response[0] : response.data || response;
        return this.transformLibroFromApi(libroData);
      }
    } catch (error) {
      console.error("❌ LibrosService: Error actualizando libro:", error);
      throw error;
    }
  }

  /**
   * Elimina un libro
   * Endpoint: DELETE /api/v1/book/{id}
   */
  static async deleteLibro(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID de libro requerido");
    }

    try {
      console.log("🗑️ LibrosService: Eliminando libro:", id);

      await this.makeRequest<{ success: boolean; message: string }>(`/api/v1/book/${id}`, {
        method: "DELETE",
      });

      console.log("✅ LibrosService: Libro eliminado exitosamente");
    } catch (error) {
      console.error("❌ LibrosService: Error eliminando libro:", error);
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
