/**
 * Servicio para manejar todas las operaciones relacionadas con Dieta/Nutrición
 * Sigue el patrón de CursosService y ChatService
 */

import { getAuthToken } from "@/lib/auth/auth-utils";

import type {
  Alimento,
  MenuSemanal,
  Receta,
  ApiResponse,
  SingleResponse,
  CreateAlimentoDto,
  GetAlimentosParams,
  CreatePlanDto,
  GetPlanesParams,
  AlimentoApiResponse,
  PlanApiResponse,
  RecetaApiResponse,
  MealApiResponse,
  CreateRecetaDto,
  CreateMealDto,
} from "./dieta-types";

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const REQUEST_TIMEOUT = 10000;

// ============================================================================
// SERVICIO DE DIETA
// ============================================================================

/**
 * Servicio para manejar todas las operaciones relacionadas con dieta y nutrición
 */
export class DietaService {
  // ==========================================================================
  // MÉTODOS PRIVADOS
  // ==========================================================================

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
    let errorData: any = {};
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : {};
    } catch {
      // Si no se puede parsear, usar objeto vacío
      errorData = {};
    }

    // Manejar errores de autenticación
    if (response.status === 401 || response.status === 403) {
      console.warn("🔐 DietaService: Token de autenticación inválido o expirado");
      throw new Error("Unauthorized");
    }

    // Manejar error 404 (endpoint no encontrado) de forma más clara
    if (response.status === 404) {
      console.error(`❌ DietaService: Endpoint no encontrado (404): ${response.url}`);
      throw new Error(`Endpoint no encontrado: ${response.url}. Verifica que el endpoint exista en el backend.`);
    }

    const errorMessage = errorData.message ?? errorData.error ?? `Error ${response.status}: ${response.statusText}`;
    console.error(`❌ DietaService: Error ${response.status} - ${errorMessage}`);
    throw new Error(errorMessage);
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

    console.log("🍎 DietaService: Haciendo petición a:", url);
    console.log("🔑 DietaService: Token disponible:", !!token);

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

      console.log("📥 DietaService: Respuesta status:", response.status);

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const data = await response.json();
      console.log("✅ DietaService: Datos recibidos:", data);

      return data;
    } catch (error) {
      console.error("❌ DietaService: Error en petición:", error);
      this.handleRequestError(error, timeoutId);
    }
  }

  // ==========================================================================
  // MAPEO DE DATOS (API -> Frontend)
  // ==========================================================================

  /**
   * Mapear respuesta de alimento de la API al formato del frontend
   */
  private static mapAlimentoFromApi(apiAlimento: AlimentoApiResponse): Alimento {
    return {
      id: apiAlimento.id,
      nombre: apiAlimento.nombre ?? apiAlimento.name ?? "",
      categoria: (apiAlimento.categoria ?? apiAlimento.category ?? "otros") as Alimento["categoria"],
      calorias: apiAlimento.calorias ?? apiAlimento.calories ?? 0,
      proteinas: apiAlimento.proteinas ?? apiAlimento.protein ?? 0,
      carbohidratos: apiAlimento.carbohidratos ?? apiAlimento.carbohydrates ?? 0,
      grasas: apiAlimento.grasas ?? apiAlimento.fat ?? 0,
      fibra: apiAlimento.fibra ?? apiAlimento.fiber,
      origen: (apiAlimento.origen ?? apiAlimento.source ?? "manual") as Alimento["origen"],
      imagen: apiAlimento.imagen ?? apiAlimento.image,
      etiquetas: apiAlimento.etiquetas ?? apiAlimento.tags ?? [],
      createdAt: apiAlimento.createdAt ?? apiAlimento.created_at,
      updatedAt: apiAlimento.updatedAt ?? apiAlimento.updated_at,
    };
  }

  /**
   * Mapear respuesta de plan de la API al formato del frontend
   */
  private static mapPlanFromApi(apiPlan: PlanApiResponse): MenuSemanal {
    return {
      id: apiPlan.id,
      nombre: apiPlan.nombre ?? apiPlan.name ?? "",
      clienteId: apiPlan.clienteId ?? apiPlan.client_id,
      clienteNombre: apiPlan.clienteNombre ?? apiPlan.client_name,
      objetivo: (apiPlan.objetivo ?? apiPlan.goal ?? "mantenimiento") as MenuSemanal["objetivo"],
      restricciones: apiPlan.restricciones ?? apiPlan.restrictions ?? [],
      dias: (apiPlan.dias ?? apiPlan.days ?? []) as MenuSemanal["dias"],
      caloriasDiarias: apiPlan.caloriasDiarias ?? apiPlan.daily_calories ?? 0,
      proteinasDiarias: apiPlan.proteinasDiarias ?? apiPlan.daily_protein ?? 0,
      carbohidratosDiarios: apiPlan.carbohidratosDiarios ?? apiPlan.daily_carbs ?? 0,
      grasasDiarias: apiPlan.grasasDiarias ?? apiPlan.daily_fat ?? 0,
      estado: (apiPlan.estado ?? apiPlan.status ?? "borrador") as MenuSemanal["estado"],
      fechaInicio: apiPlan.fechaInicio ?? apiPlan.start_date,
      fechaFin: apiPlan.fechaFin ?? apiPlan.end_date,
      createdAt: apiPlan.createdAt ?? apiPlan.created_at,
      updatedAt: apiPlan.updatedAt ?? apiPlan.updated_at,
    };
  }

  /**
   * Mapear respuesta de receta de la API al formato del frontend
   * El backend devuelve: name, description, kcal, carbohydrates, proteins, fats
   * Necesitamos mapear a la estructura completa de Receta del frontend
   */
  private static mapRecetaFromApi(apiReceta: RecetaApiResponse): Receta {
    // Función helper para convertir a número de forma segura
    const toNumber = (value: unknown, defaultValue = 0): number => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return defaultValue;
    };

    // Calcular valores por porción (asumiendo 1 porción por defecto)
    // Convertir a números asegurando que siempre sean números válidos
    const kcal = toNumber(apiReceta.kcal ?? apiReceta.nutritional_value?.calories, 0);
    const carbs = toNumber(apiReceta.carbohydrates ?? apiReceta.nutritional_value?.carbohydrates, 0);
    const proteins = toNumber(apiReceta.proteins ?? apiReceta.nutritional_value?.proteins, 0);
    const fats = toNumber(apiReceta.fats ?? apiReceta.nutritional_value?.fats, 0);

    return {
      id: apiReceta.id,
      nombre: apiReceta.name ?? "",
      descripcion: apiReceta.description,
      imagen: apiReceta.image ?? apiReceta.image_url,
      tipoComida: "comida" as const, // Valor por defecto, el backend no tiene este campo
      tiempoPreparacion: 0, // El backend no tiene este campo
      porciones: 1, // Valor por defecto
      dificultad: "media" as const, // Valor por defecto
      ingredientes: [], // El backend no devuelve ingredientes en el listado
      instrucciones: [], // El backend no devuelve instrucciones en el listado
      caloriasTotal: kcal,
      proteinasTotal: proteins,
      carbohidratosTotal: carbs,
      grasasTotal: fats,
      caloriasPorcion: kcal,
      proteinasPorcion: proteins,
      carbohidratosPorcion: carbs,
      grasasPorcion: fats,
      etiquetas: [], // El backend no tiene etiquetas
      estado: "publicado" as const, // Valor por defecto
      createdAt: apiReceta.createdAt ?? apiReceta.created_at,
      updatedAt: apiReceta.updatedAt ?? apiReceta.updated_at,
    };
  }

  // ==========================================================================
  // ENDPOINTS DE RECETAS (Implementados según ANALISIS_FUNCIONALIDADES_BACKEND.md)
  // ==========================================================================

  /**
   * Obtener todas las recetas
   * GET /api/v1/recipe/all
   */
  static async getRecetas(): Promise<Receta[]> {
    console.log("🍳 DietaService.getRecetas: Iniciando petición");

    try {
      const response = await this.makeRequest<RecetaApiResponse[] | ApiResponse<RecetaApiResponse[]>>(
        "/api/v1/recipe/all",
      );

      const recetasApi = Array.isArray(response) ? response : response.data;
      const recetas = recetasApi.map(this.mapRecetaFromApi);

      console.log("✅ DietaService.getRecetas: Recetas obtenidas:", recetas.length);

      return recetas;
    } catch (error) {
      console.error("❌ DietaService.getRecetas: Error:", error);
      throw error;
    }
  }

  /**
   * Obtener recetas del usuario autenticado
   * GET /api/v1/recipe/by-user
   */
  static async getRecetasByUser(): Promise<Receta[]> {
    console.log("🍳 DietaService.getRecetasByUser: Iniciando petición");

    try {
      const response = await this.makeRequest<RecetaApiResponse[] | ApiResponse<RecetaApiResponse[]>>(
        "/api/v1/recipe/by-user",
      );

      const recetasApi = Array.isArray(response) ? response : response.data;
      const recetas = recetasApi.map(this.mapRecetaFromApi);

      console.log("✅ DietaService.getRecetasByUser: Recetas obtenidas:", recetas.length);

      return recetas;
    } catch (error) {
      console.error("❌ DietaService.getRecetasByUser: Error:", error);
      throw error;
    }
  }

  /**
   * Crear una nueva receta
   * POST /api/v1/recipe/create
   */
  static async createReceta(data: CreateRecetaDto): Promise<Receta> {
    console.log("🍳 DietaService.createReceta: Creando receta", data.name);

    try {
      const response = await this.makeRequest<SingleResponse<RecetaApiResponse> | RecetaApiResponse>(
        "/api/v1/recipe/create",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );

      const recetaApi = "data" in response ? response.data : response;
      const receta = this.mapRecetaFromApi(recetaApi);

      console.log("✅ DietaService.createReceta: Receta creada:", receta.id);

      return receta;
    } catch (error) {
      console.error("❌ DietaService.createReceta: Error:", error);
      throw error;
    }
  }

  /**
   * Subir imagen de receta
   * PUT /api/v1/recipe/upload-receipe-image?recipe_id={id}
   * NOTA: Usa FormData, por lo que NO debe incluir Content-Type en headers (el navegador lo hace automáticamente)
   */
  static async uploadRecetaImage(recipeId: string, file: File): Promise<Receta> {
    console.log("🍳 DietaService.uploadRecetaImage: Subiendo imagen para receta", recipeId);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);

      // Para FormData, NO incluir Content-Type - el navegador lo establece automáticamente con el boundary
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (typeof window !== "undefined") {
        // Fallback a localStorage
        try {
          const fallbackToken = localStorage.getItem("authToken");
          if (fallbackToken) {
            headers.Authorization = `Bearer ${fallbackToken}`;
          }
        } catch (error) {
          console.warn("Error accessing localStorage:", error);
        }
      }

      const url = `${API_BASE_URL}/api/v1/recipe/upload-receipe-image?recipe_id=${recipeId}`;

      console.log("🍳 DietaService.uploadRecetaImage: Haciendo petición a:", url);
      console.log("🔑 DietaService.uploadRecetaImage: Token disponible:", !!token);

      // Crear controlador de abort para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(url, {
          method: "PUT",
          headers,
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("📥 DietaService.uploadRecetaImage: Respuesta status:", response.status);

        if (!response.ok) {
          await this.handleResponseError(response);
        }

        const data = await response.json();
        console.log("✅ DietaService.uploadRecetaImage: Datos recibidos:", data);

        const recetaApi = "data" in data ? data.data : data;
        const receta = this.mapRecetaFromApi(recetaApi);

        console.log("✅ DietaService.uploadRecetaImage: Imagen subida exitosamente");

        return receta;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("La petición tardó demasiado tiempo");
        }
        throw error;
      }
    } catch (error) {
      console.error("❌ DietaService.uploadRecetaImage: Error:", error);
      throw error;
    }
  }

  /**
   * Obtener comidas del usuario para una fecha específica
   * GET /api/v1/recipe/meals?date={date}
   */
  static async getMeals(date: string): Promise<MealApiResponse[]> {
    console.log("🍽️ DietaService.getMeals: Obteniendo comidas para fecha", date);

    try {
      const response = await this.makeRequest<MealApiResponse[] | ApiResponse<MealApiResponse[]>>(
        `/api/v1/recipe/meals?date=${encodeURIComponent(date)}`,
      );

      const mealsApi = Array.isArray(response) ? response : response.data;

      console.log("✅ DietaService.getMeals: Comidas obtenidas:", mealsApi.length);

      return mealsApi;
    } catch (error) {
      console.error("❌ DietaService.getMeals: Error:", error);
      throw error;
    }
  }

  /**
   * Crear una comida (registrar consumo de receta)
   * POST /api/v1/recipe/meal
   */
  static async createMeal(data: CreateMealDto): Promise<MealApiResponse> {
    console.log("🍽️ DietaService.createMeal: Creando comida", data.recipe_id);

    try {
      const response = await this.makeRequest<SingleResponse<MealApiResponse> | MealApiResponse>(
        "/api/v1/recipe/meal",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );

      const mealApi = "data" in response ? response.data : response;

      console.log("✅ DietaService.createMeal: Comida creada:", mealApi.id);

      return mealApi;
    } catch (error) {
      console.error("❌ DietaService.createMeal: Error:", error);
      throw error;
    }
  }

  // ==========================================================================
  // ENDPOINTS DE ALIMENTOS (NO DISPONIBLES EN EL BACKEND)
  // ==========================================================================
  // NOTA: Estos endpoints (/api/v1/admin-panel/nutrition/foods) NO existen
  // según ANALISIS_FUNCIONALIDADES_BACKEND.md
  // Se mantienen comentados para referencia futura

  /**
   * Obtener lista de alimentos
   * ❌ NO DISPONIBLE: GET /api/v1/admin-panel/nutrition/foods no existe en el backend
   * Este método lanza un error indicando que el endpoint no está disponible
   */
  static async getAlimentos(_params?: GetAlimentosParams): Promise<Alimento[]> {
    console.warn("⚠️ DietaService.getAlimentos: Endpoint no disponible en el backend");
    throw new Error(
      "El endpoint /api/v1/admin-panel/nutrition/foods no existe en el backend. Usa datos estáticos o implementa el endpoint en el backend.",
    );
  }

  /**
   * Obtener un alimento por ID
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async getAlimento(_id: string): Promise<Alimento> {
    throw new Error("El endpoint para obtener alimento por ID no existe en el backend.");
  }

  /**
   * Crear un nuevo alimento
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async createAlimento(_data: CreateAlimentoDto): Promise<Alimento> {
    throw new Error("El endpoint para crear alimento no existe en el backend.");
  }

  /**
   * Actualizar un alimento existente
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async updateAlimento(_id: string, _data: Partial<CreateAlimentoDto>): Promise<Alimento> {
    throw new Error("El endpoint para actualizar alimento no existe en el backend.");
  }

  /**
   * Eliminar un alimento
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async deleteAlimento(_id: string): Promise<boolean> {
    throw new Error("El endpoint para eliminar alimento no existe en el backend.");
  }

  // ==========================================================================
  // ENDPOINTS DE PLANES/MENÚS (NO DISPONIBLES EN EL BACKEND)
  // ==========================================================================
  // NOTA: Estos endpoints (/api/v1/admin-panel/nutrition/plans) NO existen
  // según ANALISIS_FUNCIONALIDADES_BACKEND.md
  // Se mantienen comentados para referencia futura

  /**
   * Obtener lista de planes/menús
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async getPlanes(_params?: GetPlanesParams): Promise<MenuSemanal[]> {
    throw new Error("El endpoint /api/v1/admin-panel/nutrition/plans no existe en el backend.");
  }

  /**
   * Obtener un plan por ID
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async getPlan(_id: string): Promise<MenuSemanal> {
    throw new Error("El endpoint para obtener plan por ID no existe en el backend.");
  }

  /**
   * Crear un nuevo plan/menú
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async createPlan(_data: CreatePlanDto): Promise<MenuSemanal> {
    throw new Error("El endpoint para crear plan no existe en el backend.");
  }

  /**
   * Actualizar un plan existente
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async updatePlan(_id: string, _data: Partial<CreatePlanDto>): Promise<MenuSemanal> {
    throw new Error("El endpoint para actualizar plan no existe en el backend.");
  }

  /**
   * Eliminar un plan
   * ❌ NO DISPONIBLE: Este endpoint no existe en el backend
   */
  static async deletePlan(_id: string): Promise<boolean> {
    throw new Error("El endpoint para eliminar plan no existe en el backend.");
  }

  // ==========================================================================
  // MÉTODOS DE UTILIDAD
  // ==========================================================================

  /**
   * Obtener estadísticas combinadas
   * Útil para el componente DietaCards
   * Nota: Solo incluye recetas ya que alimentos y planes no tienen endpoints disponibles
   */
  static async getStats(): Promise<{ totalAlimentos: number; totalPlanes: number; totalRecetas: number }> {
    console.log("📊 DietaService.getStats: Obteniendo estadísticas");

    try {
      const recetas = await this.getRecetas().catch(() => []);

      const stats = {
        totalAlimentos: 0, // Endpoint no disponible
        totalPlanes: 0, // Endpoint no disponible
        totalRecetas: recetas.length,
      };

      console.log("✅ DietaService.getStats: Estadísticas obtenidas:", stats);

      return stats;
    } catch (error) {
      console.error("❌ DietaService.getStats: Error:", error);
      return { totalAlimentos: 0, totalPlanes: 0, totalRecetas: 0 };
    }
  }
}
