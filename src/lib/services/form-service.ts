/**
 * Servicio para manejar formularios nutricionales
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import apiClient from "@/lib/api-client";

// ============================================
// TIPOS
// ============================================

/**
 * Tipo de formulario
 */
export interface FormType {
  id: string;
  name: string;
  description?: string;
  type: string; // "Nutricional", etc.
}

/**
 * Respuesta de formulario de usuario
 */
export interface FormUserAnswer {
  id: string;
  user_id: string;
  form_id: string;
  answers: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// ============================================
// SERVICIO
// ============================================

/**
 * Obtiene todos los tipos de formularios disponibles
 * Endpoint: GET /api/v1/admin-panel/form-types
 */
export async function getFormTypes(): Promise<FormType[]> {
  try {
    const response = await apiClient.get<FormType[]>("/api/v1/admin-panel/form-types");
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de formularios:", error);
    throw error;
  }
}

/**
 * Obtiene las respuestas de un usuario a un formulario
 * Endpoint: GET /api/v1/admin-panel/form-user-answer
 * @param userId - ID del usuario
 * @param formId - ID del formulario
 */
export async function getFormUserAnswer(userId: string, formId: string): Promise<FormUserAnswer | null> {
  try {
    const response = await apiClient.get<FormUserAnswer>("/api/v1/admin-panel/form-user-answer", {
      params: {
        user_id: userId,
        form_id: formId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener respuestas de formulario:", error);
    // Si no existe, retornar null en lugar de lanzar error
    if ((error as { response?: { status?: number } }).response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Obtiene todos los formularios nutricionales disponibles
 */
export async function getNutritionalForms(): Promise<FormType[]> {
  try {
    const allForms = await getFormTypes();
    return allForms.filter((form) => form.type === "Nutricional" || form.type === "nutritional");
  } catch (error) {
    console.error("Error al obtener formularios nutricionales:", error);
    throw error;
  }
}
