/**
 * Tipos TypeScript para el servicio de asesorías
 * Basado en ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Asesoría del sistema
 */
export interface Advice {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  adviser_id?: string;
  adviser_name?: string;
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  description?: string;
  notes?: string;
}

/**
 * Respuesta paginada del endpoint GET /api/v1/admin-panel/advices
 */
export interface AdvicesResponse {
  advices: Advice[];
  page: number;
  totalPages: number;
  length: number;
  total?: number;
}

// ============================================================================
// PARÁMETROS DE CONSULTA
// ============================================================================

/**
 * Parámetros para filtrar asesorías
 */
export interface GetAdvicesParams {
  /** Límite de resultados por página */
  limit?: number;
  /** Número de página */
  page?: number;
}

// ============================================================================
// TIPOS DE ERROR
// ============================================================================

export interface AdvicesError {
  message: string;
  status?: number;
  code?: string;
}
