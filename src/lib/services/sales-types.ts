/**
 * Tipos TypeScript para el servicio de ventas
 * Basado en ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

// ============================================================================
// TIPOS DE RESPUESTA DEL API
// ============================================================================

/**
 * Respuesta del endpoint GET /api/v1/admin-panel/total-sales
 */
export interface TotalSalesResponse {
  total: number;
  count?: number;
  message?: string;
}

/**
 * Venta individual del sistema
 */
export interface Sale {
  id: string;
  title: string;
  user_name?: string;
  user_email?: string;
  user_id?: string;
  amount_value: number;
  currency?: string;
  type: "course" | "advice" | "book";
  created_at: string;
  updated_at?: string;
  status?: string;
}

/**
 * Respuesta paginada del endpoint GET /api/v1/admin-panel/sales
 */
export interface SalesListResponse {
  sales: Sale[];
  page: number;
  totalPages: number;
  length: number;
  total?: number;
}

// ============================================================================
// PARÁMETROS DE CONSULTA
// ============================================================================

/**
 * Parámetros para filtrar ventas
 */
export interface GetSalesParams {
  /** Límite de resultados por página (máx. 20) */
  limit?: number;
  /** Número de página */
  page?: number;
  /** Mes (1-12) para filtrar ventas */
  month?: number;
  /** Búsqueda por título, nombre de usuario o precio */
  search?: string;
}

// ============================================================================
// TIPOS DE ERROR
// ============================================================================

export interface SalesError {
  message: string;
  status?: number;
  code?: string;
}
