/**
 * Tipos para el módulo de Marketing y KPIs
 *
 * Maneja el mapeo entre las respuestas de la API del backend
 * y los tipos del frontend para el sistema de Marketing y KPIs.
 *
 * Endpoints utilizados:
 * - GET /api/v1/admin-panel/sales - Obtener ventas
 * - GET /api/v1/admin-panel/total-sales - Obtener total de ventas
 * - GET /api/v1/admin-panel/advices - Obtener asesorías
 * - GET /api/v1/admin-panel/tasks/assigned-to-me - Obtener tareas
 * - GET /api/v1/support/backoffice/dashboard/metrics - Obtener métricas de soporte
 */

// Re-exportar tipos del frontend
import type {
  MarketingKPIs,
  IngresoData,
  VentaProducto,
  TareasPorArea,
  CausaTicket,
} from "@/app/(main)/dashboard/marketing/_components/schema";

// Re-exportar tipos de respuestas API existentes
import type {
  SalesApiResponse,
  SaleApiResponse,
  TotalSalesApiResponse,
  AdvicesApiResponse,
  AdviceApiResponse,
  TasksApiResponse,
  TaskApiResponse,
  SupportMetricsApiResponse,
  CategoryDistribution,
} from "./seguimiento-types";

// ============================================================================
// TIPOS ESPECÍFICOS DE MARKETING
// ============================================================================

/**
 * Parámetros para obtener ventas
 */
export interface GetSalesParams {
  limit?: number;
  page?: number;
  month?: number; // 1-12
  search?: string;
}

/**
 * Parámetros para obtener asesorías
 */
export interface GetAdvicesParams {
  limit?: number;
  page?: number;
}

/**
 * Parámetros para obtener tareas
 */
export interface GetTasksParams {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  limit?: number;
  offset?: number;
}

// ============================================================================
// FUNCIONES DE TRANSFORMACIÓN
// ============================================================================

/**
 * Transforma las ventas del backend en ventas por producto para la UI
 */
export function transformSalesToVentaProducto(sales: SaleApiResponse[]): VentaProducto[] {
  const ventasPorTipo: Record<string, { cantidad: number; ingresos: number }> = {
    libro: { cantidad: 0, ingresos: 0 },
    curso: { cantidad: 0, ingresos: 0 },
    asesoria: { cantidad: 0, ingresos: 0 },
    premium: { cantidad: 0, ingresos: 0 },
  };

  // Agrupar ventas por tipo
  sales.forEach((sale) => {
    const tipo = mapProductTypeToVentaType(sale.product_type);
    if (ventasPorTipo[tipo]) {
      ventasPorTipo[tipo].cantidad += 1;
      ventasPorTipo[tipo].ingresos += sale.amount_value || 0;
    }
  });

  // Calcular totales
  const totalVentas = sales.length;
  const totalIngresos = sales.reduce((sum, sale) => sum + (sale.amount_value || 0), 0);

  // Transformar a formato esperado por la UI
  const resultado: VentaProducto[] = [];
  const fills = {
    libro: "hsl(var(--primary))", // Color naranja de SquatFit
    curso: "hsl(var(--chart-2))", // Naranja claro/amarillo
    asesoria: "hsl(var(--chart-3))", // Azul complementario
    premium: "hsl(var(--chart-4))", // Morado
  };

  Object.entries(ventasPorTipo).forEach(([tipo, datos]) => {
    if (datos.cantidad > 0) {
      resultado.push({
        tipo: tipo as VentaProducto["tipo"],
        cantidad: datos.cantidad,
        ingresos: datos.ingresos,
        porcentaje: totalIngresos > 0 ? (datos.ingresos / totalIngresos) * 100 : 0,
        fill: fills[tipo as keyof typeof fills],
      });
    }
  });

  return resultado;
}

/**
 * Mapea el tipo de producto del backend al tipo de venta de la UI
 */
function mapProductTypeToVentaType(
  productType: "course" | "advice" | "book" | string,
): "libro" | "curso" | "asesoria" | "premium" {
  switch (productType) {
    case "book":
      return "libro";
    case "course":
      return "curso";
    case "advice":
      return "asesoria";
    default:
      return "premium";
  }
}

/**
 * Mapea el tipo de venta de la UI al tipo de producto del backend
 */
export function mapVentaTypeToProductType(
  tipo: "libro" | "curso" | "asesoria" | "premium",
): "course" | "advice" | "book" | string {
  switch (tipo) {
    case "libro":
      return "book";
    case "curso":
      return "course";
    case "asesoria":
      return "advice";
    default:
      return "";
  }
}

/**
 * Transforma las asesorías del backend en estadísticas para KPIs
 */
export function transformAdvicesToStats(advices: AdviceApiResponse[]): {
  activas: number;
  pausa: number;
  finalizadas: number;
} {
  const stats = {
    activas: 0,
    pausa: 0,
    finalizadas: 0,
  };

  advices.forEach((advice) => {
    const status = advice.status?.toLowerCase() || "";
    if (status.includes("active") || status === "activa") {
      stats.activas += 1;
    } else if (status.includes("pause") || status === "pausa") {
      stats.pausa += 1;
    } else if (status.includes("finish") || status.includes("complete") || status === "finalizada") {
      stats.finalizadas += 1;
    }
  });

  return stats;
}

/**
 * Transforma las tareas del backend en tareas por área
 * Nota: El backend no proporciona área directamente, necesitamos inferirlo del chat_id
 */
export function transformTasksToTareasPorArea(tasks: TaskApiResponse[]): TareasPorArea {
  // Por ahora, distribuimos equitativamente ya que no tenemos información del área
  // TODO: Cuando el backend proporcione el área del chat, actualizar esta función
  const total = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;
  const porArea = Math.floor(total / 3);

  return {
    nutricion: porArea,
    entreno: porArea,
    soporte: total - porArea * 2,
    total,
  };
}

/**
 * Transforma las métricas de soporte en top causas de tickets
 */
export function transformMetricsToTopCausas(metrics: SupportMetricsApiResponse, limit: number = 5): CausaTicket[] {
  if (!metrics.categoryDistribution || metrics.categoryDistribution.length === 0) {
    return [];
  }

  // Ordenar por cantidad descendente y tomar los primeros N
  const sorted = [...metrics.categoryDistribution].sort((a, b) => b.count - a.count).slice(0, limit);

  return sorted.map((cat, index) => ({
    id: `causa-${index + 1}`,
    causa: cat.category,
    cantidad: cat.count,
    porcentaje: cat.percentage,
    tendencia: "estable" as const, // El backend no proporciona tendencia, usar "estable" por defecto
  }));
}

// Re-exportar tipos
export type {
  MarketingKPIs,
  IngresoData,
  VentaProducto,
  TareasPorArea,
  CausaTicket,
  SalesApiResponse,
  SaleApiResponse,
  TotalSalesApiResponse,
  AdvicesApiResponse,
  AdviceApiResponse,
  TasksApiResponse,
  TaskApiResponse,
  SupportMetricsApiResponse,
  CategoryDistribution,
};
