/**
 * Tipos para la API de Recetas del Backend
 * Basado en el análisis de ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

// ============================================
// TIPOS DEL BACKEND (API Response)
// ============================================

/**
 * Receta tal como viene del backend
 * Endpoint: GET /api/v1/recipe/all, GET /api/v1/recipe/by-user
 */
export interface BackendRecipe {
  id: string;
  name: string;
  description?: string;
  kcal: number; // calorías totales de la receta
  carbohydrates: number; // gramos totales
  proteins: number; // gramos totales
  fats: number; // gramos totales
  image?: string; // URL de la imagen
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Payload para crear una receta
 * Endpoint: POST /api/v1/recipe/create
 */
export interface CreateRecipePayload {
  name: string;
  description?: string;
  kcal: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
}

/**
 * Respuesta al crear una receta
 */
export interface CreateRecipeResponse extends BackendRecipe {}

/**
 * Comida (registro de consumo de receta)
 * Endpoint: GET /api/v1/recipe/meals
 */
export interface BackendMeal {
  id: string;
  recipe_id: string;
  user_id: string;
  date: string; // ISO format
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  created_at: string;
  recipe?: BackendRecipe; // receta asociada
}

/**
 * Payload para crear una comida
 * Endpoint: POST /api/v1/recipe/meal
 */
export interface CreateMealPayload {
  recipe_id: string;
  date: string; // ISO format
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
}

// ============================================
// FUNCIONES DE TRANSFORMACIÓN
// ============================================

import type { Receta } from "@/app/(main)/dashboard/dieta/_components/schema";

/**
 * Transforma una receta del backend al formato de la UI
 * @param backendRecipe - Receta del backend
 * @param porciones - Número de porciones (default: 1)
 * @returns Receta en formato de UI
 */
export function transformBackendToUI(backendRecipe: BackendRecipe, porciones: number = 1): Receta {
  // Calcular valores por porción
  const caloriasPorcion = backendRecipe.kcal / porciones;
  const proteinasPorcion = backendRecipe.proteins / porciones;
  const carbohidratosPorcion = backendRecipe.carbohydrates / porciones;
  const grasasPorcion = backendRecipe.fats / porciones;

  return {
    id: backendRecipe.id,
    nombre: backendRecipe.name,
    descripcion: backendRecipe.description || "",
    imagen: backendRecipe.image,
    tipoComida: "comida", // default, puede ser configurado
    tiempoPreparacion: 30, // default, el backend no provee este dato
    porciones: porciones,
    dificultad: "media", // default, el backend no provee este dato
    ingredientes: [], // el backend no provee ingredientes detallados
    instrucciones: [], // el backend no provee instrucciones
    // Totales
    caloriasTotal: backendRecipe.kcal,
    proteinasTotal: backendRecipe.proteins,
    carbohidratosTotal: backendRecipe.carbohydrates,
    grasasTotal: backendRecipe.fats,
    // Por porción
    caloriasPorcion: caloriasPorcion,
    proteinasPorcion: proteinasPorcion,
    carbohidratosPorcion: carbohidratosPorcion,
    grasasPorcion: grasasPorcion,
    // Metadatos
    etiquetas: [],
    estado: "publicado",
    createdAt: backendRecipe.created_at,
    updatedAt: backendRecipe.updated_at,
  };
}

/**
 * Transforma una receta de la UI al formato del backend para creación
 * @param uiRecipe - Datos de receta de la UI
 * @returns Payload para crear receta en backend
 */
export function transformUIToBackend(uiRecipe: Partial<Receta>): CreateRecipePayload {
  // Si description está vacío o es undefined, no lo incluimos en el payload
  const description = uiRecipe.descripcion?.trim();

  const payload: CreateRecipePayload = {
    name: uiRecipe.nombre || "",
    kcal: uiRecipe.caloriasTotal || 0,
    carbohydrates: uiRecipe.carbohidratosTotal || 0,
    proteins: uiRecipe.proteinasTotal || 0,
    fats: uiRecipe.grasasTotal || 0,
  };

  // Solo agregar description si tiene contenido
  if (description && description.length > 0) {
    payload.description = description;
  }

  return payload;
}

/**
 * Mapea el tipo de comida de la UI al formato del backend
 */
export function mapMealTypeToBackend(tipoComida: Receta["tipoComida"]): "breakfast" | "lunch" | "dinner" | "snack" {
  const mealTypeMap: Record<Receta["tipoComida"], "breakfast" | "lunch" | "dinner" | "snack"> = {
    desayuno: "breakfast",
    almuerzo: "lunch",
    comida: "lunch",
    merienda: "snack",
    cena: "dinner",
    snack: "snack",
  };

  return mealTypeMap[tipoComida] || "lunch";
}

/**
 * Mapea el tipo de comida del backend al formato de la UI
 */
export function mapMealTypeToUI(mealType: "breakfast" | "lunch" | "dinner" | "snack"): Receta["tipoComida"] {
  const mealTypeMap: Record<"breakfast" | "lunch" | "dinner" | "snack", Receta["tipoComida"]> = {
    breakfast: "desayuno",
    lunch: "comida",
    dinner: "cena",
    snack: "snack",
  };

  return mealTypeMap[mealType] || "comida";
}
