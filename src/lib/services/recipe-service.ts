/**
 * Servicio para la gestión de recetas conectado al backend
 * Endpoints disponibles según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import apiClient from "@/lib/api-client";

import type {
  BackendRecipe,
  CreateRecipePayload,
  CreateRecipeResponse,
  BackendMeal,
  CreateMealPayload,
} from "./recipe-types";

// ============================================
// RECETAS
// ============================================

/**
 * Obtiene todas las recetas del sistema
 * Endpoint: GET /api/v1/recipe/all
 * @returns Array de recetas
 */
export async function getAllRecipes(): Promise<BackendRecipe[]> {
  try {
    const response = await apiClient.get<BackendRecipe[]>("/api/v1/recipe/all");
    return response.data;
  } catch (error) {
    console.error("Error al obtener todas las recetas:", error);
    throw error;
  }
}

/**
 * Obtiene las recetas del usuario autenticado
 * Endpoint: GET /api/v1/recipe/by-user
 * @returns Array de recetas del usuario
 */
export async function getUserRecipes(): Promise<BackendRecipe[]> {
  try {
    const response = await apiClient.get<BackendRecipe[]>("/api/v1/recipe/by-user");
    return response.data;
  } catch (error) {
    console.error("Error al obtener recetas del usuario:", error);
    throw error;
  }
}

/**
 * Crea una nueva receta
 * Endpoint: POST /api/v1/recipe/create
 * @param data - Datos de la receta a crear
 * @returns Receta creada
 */
export async function createRecipe(data: CreateRecipePayload): Promise<CreateRecipeResponse> {
  try {
    const response = await apiClient.post<CreateRecipeResponse>("/api/v1/recipe/create", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear receta:", error);
    throw error;
  }
}

/**
 * Sube una imagen para una receta existente
 * Endpoint: PUT /api/v1/recipe/upload-receipe-image
 * @param recipeId - ID de la receta
 * @param file - Archivo de imagen
 * @returns Receta actualizada con URL de imagen
 */
export async function uploadRecipeImage(recipeId: string, file: File): Promise<BackendRecipe> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.put<BackendRecipe>(
      `/api/v1/recipe/upload-receipe-image?recipe_id=${recipeId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error al subir imagen de receta:", error);
    throw error;
  }
}

// ============================================
// COMIDAS (MEALS)
// ============================================

/**
 * Obtiene las comidas del usuario para una fecha específica
 * Endpoint: GET /api/v1/recipe/meals
 * @param date - Fecha en formato ISO (YYYY-MM-DD)
 * @returns Array de comidas con recetas asociadas
 */
export async function getMealsByDate(date: string): Promise<BackendMeal[]> {
  try {
    const response = await apiClient.get<BackendMeal[]>("/api/v1/recipe/meals", {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener comidas por fecha:", error);
    throw error;
  }
}

/**
 * Crea una nueva comida (registra consumo de receta)
 * Endpoint: POST /api/v1/recipe/meal
 * @param data - Datos de la comida a crear
 * @returns Comida creada
 */
export async function createMeal(data: CreateMealPayload): Promise<BackendMeal> {
  try {
    const response = await apiClient.post<BackendMeal>("/api/v1/recipe/meal", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear comida:", error);
    throw error;
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Duplica una receta existente creando una nueva basada en la original
 * Como no existe endpoint de duplicación, usa el endpoint de crear
 * @param recipeId - ID de la receta a duplicar
 * @param originalRecipe - Datos de la receta original
 * @returns Nueva receta creada
 */
export async function duplicateRecipe(originalRecipe: BackendRecipe): Promise<CreateRecipeResponse> {
  const duplicateData: CreateRecipePayload = {
    name: `${originalRecipe.name} (copia)`,
    description: originalRecipe.description,
    kcal: originalRecipe.kcal,
    carbohydrates: originalRecipe.carbohydrates,
    proteins: originalRecipe.proteins,
    fats: originalRecipe.fats,
  };

  return createRecipe(duplicateData);
}

// ============================================
// FUNCIONES NO DISPONIBLES (Backend incompleto)
// ============================================

/**
 * ❌ NO DISPONIBLE: Actualizar receta
 * El backend no tiene endpoint PUT /api/v1/recipe/:id
 */
export async function updateRecipe(_recipeId: string, _data: Partial<CreateRecipePayload>): Promise<never> {
  throw new Error("La actualización de recetas no está disponible en el backend actual");
}

/**
 * ❌ NO DISPONIBLE: Eliminar receta
 * El backend no tiene endpoint DELETE /api/v1/recipe/:id
 */
export async function deleteRecipe(_recipeId: string): Promise<never> {
  throw new Error("La eliminación de recetas no está disponible en el backend actual");
}

/**
 * ❌ NO DISPONIBLE: Obtener receta por ID
 * El backend no tiene endpoint GET /api/v1/recipe/:id
 */
export async function getRecipeById(_recipeId: string): Promise<never> {
  throw new Error("La obtención de receta por ID no está disponible en el backend actual");
}
