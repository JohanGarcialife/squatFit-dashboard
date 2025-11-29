import type {
  MarketingKPIs,
  IngresoData,
  VentaProducto,
  ClienteRenovacion,
  ClienteFaltaPago,
  ClienteInactivo,
  TareasPorArea,
  CausaTicket,
  Notificacion,
  AccionXP,
  CreditoMensual,
  FiltrosMarketing,
  CoachOption,
  AlertaCritica,
} from "@/app/(main)/dashboard/marketing/_components/schema";
import { getAuthToken } from "@/lib/auth/auth-utils";

import { MarketingApiClient, API_BASE_URL } from "./marketing-api-client";

/**
 * Servicio para manejar operaciones relacionadas con Marketing y KPIs
 * Preparado para conectar con el backend de SquatFit
 */
export class MarketingService {
  // ========================================================================
  // MÉTODOS PÚBLICOS - KPIs
  // ========================================================================

  static async getKPIs(filtros?: FiltrosMarketing): Promise<MarketingKPIs> {
    try {
      console.log("📊 MarketingService: Obteniendo KPIs...");
      const queryString = MarketingApiClient.buildQueryString(filtros);
      const response = await MarketingApiClient.makeRequest<MarketingKPIs>(
        `/api/v1/admin-panel/marketing/kpis${queryString}`,
      );
      console.log("✅ MarketingService: KPIs obtenidos");
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo KPIs:", error);
      throw error;
    }
  }

  static async getIngresosAcumulados(periodo: "mensual" | "anual"): Promise<IngresoData[]> {
    try {
      console.log(`💰 MarketingService: Obteniendo ingresos ${periodo}...`);
      const response = await MarketingApiClient.makeRequest<IngresoData[]>(
        `/api/v1/admin-panel/marketing/ingresos?periodo=${periodo}`,
      );
      console.log("✅ MarketingService: Ingresos obtenidos");
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo ingresos:", error);
      throw error;
    }
  }

  static async getVentasPorProducto(filtros?: FiltrosMarketing): Promise<VentaProducto[]> {
    try {
      console.log("🛒 MarketingService: Obteniendo ventas por producto...");
      const queryString = MarketingApiClient.buildQueryString(filtros);
      const response = await MarketingApiClient.makeRequest<VentaProducto[]>(
        `/api/v1/admin-panel/marketing/ventas-producto${queryString}`,
      );
      console.log("✅ MarketingService: Ventas obtenidas");
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo ventas:", error);
      throw error;
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - CLIENTES
  // ========================================================================

  static async getClientesRenovacion(dias: number = 7): Promise<ClienteRenovacion[]> {
    try {
      console.log(`🔄 MarketingService: Obteniendo clientes con renovación en ${dias} días...`);
      const response = await MarketingApiClient.makeRequest<ClienteRenovacion[]>(
        `/api/v1/admin-panel/marketing/clientes-renovacion?dias=${dias}`,
      );
      console.log(`✅ MarketingService: ${response.length} clientes con renovación próxima`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo clientes renovación:", error);
      throw error;
    }
  }

  static async getClientesFaltaPago(): Promise<ClienteFaltaPago[]> {
    try {
      console.log("💳 MarketingService: Obteniendo clientes con falta de pago...");
      const response = await MarketingApiClient.makeRequest<ClienteFaltaPago[]>(
        `/api/v1/admin-panel/marketing/clientes-falta-pago`,
      );
      console.log(`✅ MarketingService: ${response.length} clientes con falta de pago`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo clientes falta pago:", error);
      throw error;
    }
  }

  static async getClientesSinContacto(dias: number = 7): Promise<ClienteInactivo[]> {
    try {
      console.log(`📭 MarketingService: Obteniendo clientes sin contacto en ${dias} días...`);
      const response = await MarketingApiClient.makeRequest<ClienteInactivo[]>(
        `/api/v1/admin-panel/marketing/clientes-sin-contacto?dias=${dias}`,
      );
      console.log(`✅ MarketingService: ${response.length} clientes sin contacto`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo clientes sin contacto:", error);
      throw error;
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - TAREAS Y TICKETS
  // ========================================================================

  static async getTareasPendientes(): Promise<TareasPorArea> {
    try {
      console.log("📋 MarketingService: Obteniendo tareas pendientes...");
      const response = await MarketingApiClient.makeRequest<TareasPorArea>(
        `/api/v1/admin-panel/marketing/tareas-pendientes`,
      );
      console.log("✅ MarketingService: Tareas pendientes obtenidas");
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo tareas:", error);
      throw error;
    }
  }

  static async getTopCausasTickets(limit: number = 5): Promise<CausaTicket[]> {
    try {
      console.log(`🎫 MarketingService: Obteniendo top ${limit} causas de tickets...`);
      const response = await MarketingApiClient.makeRequest<CausaTicket[]>(
        `/api/v1/admin-panel/marketing/top-causas-tickets?limit=${limit}`,
      );
      console.log("✅ MarketingService: Causas de tickets obtenidas");
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo causas tickets:", error);
      throw error;
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - NOTIFICACIONES
  // ========================================================================

  static async getNotificaciones(filtros?: {
    tipo?: string;
    leidas?: boolean;
    limit?: number;
  }): Promise<Notificacion[]> {
    try {
      console.log("🔔 MarketingService: Obteniendo notificaciones...");
      const params = new URLSearchParams();
      if (filtros?.tipo) params.append("tipo", filtros.tipo);
      if (filtros?.leidas !== undefined) params.append("leidas", String(filtros.leidas));
      if (filtros?.limit) params.append("limit", String(filtros.limit));
      const queryString = params.toString();
      const response = await MarketingApiClient.makeRequest<Notificacion[]>(
        `/api/v1/admin-panel/marketing/notificaciones${queryString ? `?${queryString}` : ""}`,
      );
      console.log(`✅ MarketingService: ${response.length} notificaciones obtenidas`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo notificaciones:", error);
      throw error;
    }
  }

  static async marcarNotificacionLeida(id: string): Promise<void> {
    try {
      console.log(`📖 MarketingService: Marcando notificación ${id} como leída...`);
      await MarketingApiClient.makeRequest<void>(`/api/v1/admin-panel/marketing/notificaciones/${id}/leer`, {
        method: "PUT",
      });
      console.log("✅ MarketingService: Notificación marcada como leída");
    } catch (error) {
      console.error("❌ MarketingService: Error marcando notificación:", error);
      throw error;
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - SISTEMA XP
  // ========================================================================

  static async getTablaXP(): Promise<AccionXP[]> {
    try {
      console.log("⭐ MarketingService: Obteniendo tabla XP...");
      const response = await MarketingApiClient.makeRequest<AccionXP[]>(`/api/v1/admin-panel/marketing/tabla-xp`);
      console.log(`✅ MarketingService: ${response.length} acciones XP obtenidas`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo tabla XP:", error);
      throw error;
    }
  }

  static async getCreditosMensuales(): Promise<CreditoMensual[]> {
    try {
      console.log("🏆 MarketingService: Obteniendo créditos mensuales...");
      const response = await MarketingApiClient.makeRequest<CreditoMensual[]>(
        `/api/v1/admin-panel/marketing/creditos-mensuales`,
      );
      console.log(`✅ MarketingService: ${response.length} créditos mensuales obtenidos`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo créditos mensuales:", error);
      throw error;
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - ALERTAS
  // ========================================================================

  static async getAlertasCriticas(): Promise<AlertaCritica[]> {
    try {
      console.log("⚠️ MarketingService: Obteniendo alertas críticas...");
      const response = await MarketingApiClient.makeRequest<AlertaCritica[]>(`/api/v1/admin-panel/marketing/alertas`);
      console.log(`✅ MarketingService: ${response.length} alertas obtenidas`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo alertas:", error);
      throw error;
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - UTILIDADES
  // ========================================================================

  static async getCoaches(): Promise<CoachOption[]> {
    try {
      console.log("👥 MarketingService: Obteniendo coaches...");
      const response = await MarketingApiClient.makeRequest<CoachOption[]>(`/api/v1/admin-panel/coaches`);
      console.log(`✅ MarketingService: ${response.length} coaches obtenidos`);
      return response;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo coaches:", error);
      throw error;
    }
  }

  static async exportCSV(
    tipo: "kpis" | "clientes" | "ventas" | "notificaciones" | "xp",
    filtros?: FiltrosMarketing,
  ): Promise<Blob> {
    try {
      console.log(`📥 MarketingService: Exportando ${tipo} a CSV...`);
      const token = getAuthToken();
      const queryString = MarketingApiClient.buildQueryString(filtros);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin-panel/marketing/export?tipo=${tipo}${queryString ? `&${queryString.slice(1)}` : ""}`,
        { headers: MarketingApiClient.getDefaultHeaders(token) },
      );
      if (!response.ok) throw new Error(`Error exportando: ${response.statusText}`);
      const blob = await response.blob();
      console.log("✅ MarketingService: Exportación completada");
      return blob;
    } catch (error) {
      console.error("❌ MarketingService: Error exportando:", error);
      throw error;
    }
  }

  static async copyToClipboard(tipo: "kpis" | "clientes" | "ventas", filtros?: FiltrosMarketing): Promise<void> {
    try {
      console.log(`📋 MarketingService: Copiando ${tipo} al portapapeles...`);
      let data: string;
      switch (tipo) {
        case "kpis": {
          const kpis = await this.getKPIs(filtros);
          data = Object.entries(kpis)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
          break;
        }
        case "ventas": {
          const ventas = await this.getVentasPorProducto(filtros);
          data = ventas.map((v) => `${v.tipo}: ${v.cantidad} ventas - €${v.ingresos}`).join("\n");
          break;
        }
        default:
          throw new Error(`Tipo de copia no soportado: ${tipo}`);
      }
      await navigator.clipboard.writeText(data);
      console.log("✅ MarketingService: Datos copiados al portapapeles");
    } catch (error) {
      console.error("❌ MarketingService: Error copiando:", error);
      throw error;
    }
  }
}
