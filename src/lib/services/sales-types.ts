/**
 * Tipos TypeScript para el servicio de ventas
 * Basado en BACKOFFICE_DASHBOARD_METRICS.md
 */

// ============================================================================
// TIPOS DE RESPUESTA DEL API
// ============================================================================

/**
 * Respuesta del endpoint GET /api/v1/admin-panel/total-sales
 *
 * Retorna conteos globales de ventas y usuarios:
 * { courses, advices, books, users }
 */
export interface TotalSalesResponse {
  /** Total de cursos vendidos */
  courses: number;
  /** Total de asesorías contratadas */
  advices: number;
  /** Total de libros/versiones comprados */
  books: number;
  /** Total de usuarios registrados */
  users: number;
}

/**
 * Tipo de venta
 */
export type SaleType = "Curso" | "Asesoría" | "Libro";

/**
 * Estado de la venta
 */
export type SaleStatus = "completed" | "pending" | "failed" | "refunded";

/**
 * Plataforma de pago
 */
export type PurchaseFrom = "stripe" | "paypal";

/**
 * Venta individual del sistema
 * Endpoint: GET /api/v1/admin-panel/sales
 */
export interface Sale {
  id: string;
  /** Título del producto vendido */
  title: string;
  /** Tipo de venta: "Curso", "Asesoría", "Libro" */
  type: SaleType;
  /** Fecha de la venta en formato ISO 8601 */
  date: string;
  /** Nombre del cliente */
  firstName: string;
  /** Precio del producto */
  price: string;
  /** Estado del pago */
  status: SaleStatus;
  /** Valor del monto */
  amount_value: string;
  /** Moneda (EUR) */
  amount_currency: string;
  /** Plataforma de pago: "stripe" | "paypal" */
  purchase_from: PurchaseFrom;
  /** URL de imagen del producto */
  image: string;
}

/**
 * Respuesta paginada del endpoint GET /api/v1/admin-panel/sales
 */
export interface SalesListResponse {
  sales: Sale[];
  page: number;
  totalPages: number;
  /** Total general de ventas */
  length: number;
}

// ============================================================================
// PARÁMETROS DE CONSULTA
// ============================================================================

/**
 * Parámetros para filtrar ventas
 */
export interface GetSalesParams {
  /** Límite de resultados por página */
  limit?: number;
  /** Número de página (1-based) */
  page?: number;
  /** Mes (1-12) para filtrar ventas del año en curso */
  month?: number;
  /** Búsqueda por nombre del cliente (firstName) */
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
