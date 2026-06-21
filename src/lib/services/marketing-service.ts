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
import type {
  SalesApiResponse,
  SaleApiResponse,
  TotalSalesApiResponse,
  AdvicesApiResponse,
  TasksApiResponse,
  SupportMetricsApiResponse,
} from "./marketing-types";
import {
  transformSalesToVentaProducto,
  transformAdvicesToStats,
  transformTasksToTareasPorArea,
  transformMetricsToTopCausas,
  mapVentaTypeToProductType,
} from "./marketing-types";

/**
 * Servicio para manejar operaciones relacionadas con Marketing y KPIs
 * Preparado para conectar con el backend de SquatFit
 */
export class MarketingService {
  // ========================================================================
  // MÉTODOS PÚBLICOS - KPIs
  // ========================================================================

  /**
   * Obtiene los KPIs principales del sistema
   * Combina datos de múltiples endpoints del backend
   */
  static async getKPIs(filtros?: FiltrosMarketing): Promise<MarketingKPIs> {
    try {
      console.log("📊 MarketingService: Obteniendo KPIs...");

      // Obtener datos de múltiples endpoints en paralelo
      const [totalSales, advices, pendingTasks, inProgressTasks, supportMetrics] = await Promise.all([
        this.getTotalSalesFromBackend(),
        this.getAdvicesFromBackend({ limit: 1000 }), // Obtener todas para contar estados
        this.getTasksFromBackend({ status: "pending", limit: 1000 }),
        this.getTasksFromBackend({ status: "in_progress", limit: 1000 }),
        this.getSupportMetricsFromBackend(),
      ]);

      // Combinar tareas pendientes y en progreso
      const allTasks = [...pendingTasks.tasks, ...inProgressTasks.tasks];

      // Obtener ventas del mes actual si hay filtro de mes
      const mesActual = filtros?.fechaInicio ? new Date(filtros.fechaInicio).getMonth() + 1 : new Date().getMonth() + 1;
      const salesMes = await this.getSalesFromBackend({ month: mesActual, limit: 1000 });

      // Transformar datos
      const advicesStats = transformAdvicesToStats(advices.advices);
      const tareasPorArea = transformTasksToTareasPorArea(allTasks);

      // Calcular KPIs
      const kpis: MarketingKPIs = {
        // Ingresos: El backend no calcula ingresos reales, usar 0 y mantener mock
        ingresosMensual: 0, // TODO: Calcular cuando el backend sume amount_value
        ingresosAnual: 0, // TODO: Calcular cuando el backend sume amount_value
        variacionMensual: 0, // TODO: Calcular cuando haya datos históricos
        variacionAnual: 0, // TODO: Calcular cuando haya datos históricos

        // Asesorías
        asesoriasActivas: advicesStats.activas,
        asesoriasPausa: advicesStats.pausa,
        asesoriasFinalizadas: advicesStats.finalizadas,

        // Ventas
        totalVentas: totalSales.totalSales || salesMes.length,

        // Clientes: No hay endpoints, mantener en 0
        clientesRenovacionProxima: 0, // TODO: Implementar cuando haya endpoint
        clientesFaltaPago: 0, // TODO: Implementar cuando haya endpoint
        clientesSinContacto: 0, // TODO: Implementar cuando haya endpoint

        // Tareas y Tickets
        tareasPendientesTotal: tareasPorArea.total,
        ticketsRecibidos: supportMetrics.totalTickets || 0,
      };

      console.log("✅ MarketingService: KPIs obtenidos");
      return kpis;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo KPIs:", error);
      // Devolver KPIs vacíos en caso de error
      return {
        ingresosMensual: 0,
        ingresosAnual: 0,
        variacionMensual: 0,
        variacionAnual: 0,
        asesoriasActivas: 0,
        asesoriasPausa: 0,
        asesoriasFinalizadas: 0,
        totalVentas: 0,
        clientesRenovacionProxima: 0,
        clientesFaltaPago: 0,
        clientesSinContacto: 0,
        tareasPendientesTotal: 0,
        ticketsRecibidos: 0,
      };
    }
  }

  /**
   * Obtiene el total de ventas del backend
   * Endpoint: GET /api/v1/admin-panel/total-sales
   */
  private static async getTotalSalesFromBackend(): Promise<TotalSalesApiResponse> {
    return MarketingApiClient.makeRequest<TotalSalesApiResponse>(`/api/v1/admin-panel/total-sales`);
  }

  /**
   * Obtiene ventas del backend
   * Endpoint: GET /api/v1/admin-panel/sales
   */
  private static async getSalesFromBackend(params?: {
    limit?: number;
    page?: number;
    month?: number;
    search?: string;
  }): Promise<SaleApiResponse[]> {
    const limit = params?.limit ?? 1000;
    const page = params?.page ?? 1;

    const queryParams = new URLSearchParams();
    queryParams.append("limit", String(limit));
    queryParams.append("page", String(page));
    if (params?.month) queryParams.append("month", String(params.month));
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const response = await MarketingApiClient.makeRequest<SalesApiResponse>(
      `/api/v1/admin-panel/sales${queryString ? `?${queryString}` : ""}`,
    );
    return response.sales || [];
  }

  /**
   * Obtiene asesorías del backend
   * Endpoint: GET /api/v1/admin-panel/advices
   */
  private static async getAdvicesFromBackend(params?: { limit?: number; page?: number }): Promise<AdvicesApiResponse> {
    const limit = params?.limit ?? 1000;
    const page = params?.page ?? 1;

    const queryParams = new URLSearchParams();
    queryParams.append("limit", String(limit));
    queryParams.append("page", String(page));

    const queryString = queryParams.toString();
    return MarketingApiClient.makeRequest<AdvicesApiResponse>(
      `/api/v1/admin-panel/advices${queryString ? `?${queryString}` : ""}`,
    );
  }

  /**
   * Obtiene tareas del backend
   * Endpoint: GET /api/v1/admin-panel/tasks/assigned-to-me
   */
  private static async getTasksFromBackend(params?: {
    status?: "pending" | "in_progress" | "completed" | "cancelled";
    priority?: "low" | "medium" | "high" | "urgent";
    limit?: number;
    offset?: number;
  }): Promise<TasksApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));

    const queryString = queryParams.toString();
    return MarketingApiClient.makeRequest<TasksApiResponse>(
      `/api/v1/admin-panel/tasks/assigned-to-me${queryString ? `?${queryString}` : ""}`,
    );
  }

  /**
   * Obtiene métricas de soporte del backend
   * Endpoint: GET /api/v1/support/backoffice/dashboard/metrics
   */
  private static async getSupportMetricsFromBackend(): Promise<SupportMetricsApiResponse> {
    return MarketingApiClient.makeRequest<SupportMetricsApiResponse>(`/api/v1/support/backoffice/dashboard/metrics`);
  }

  /**
   * Obtiene ingresos acumulados (mensual o anual)
   * NOTA: El backend no calcula ingresos reales, solo cuenta ventas
   * Por ahora retorna datos mock hasta que el backend implemente el cálculo
   */
  static async getIngresosAcumulados(periodo: "mensual" | "anual"): Promise<IngresoData[]> {
    try {
      console.log(`💰 MarketingService: Obteniendo ingresos ${periodo}...`);
      console.warn("⚠️ MarketingService: El backend no calcula ingresos reales. Retornando datos mock.");

      // TODO: Cuando el backend implemente cálculo de ingresos, usar:
      // const response = await MarketingApiClient.makeRequest<IngresoData[]>(
      //   `/api/v1/admin-panel/marketing/ingresos?periodo=${periodo}`,
      // );

      // Por ahora retornar array vacío o lanzar error
      throw new Error("El backend no implementa cálculo de ingresos. Use datos mock o implemente el endpoint.");
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo ingresos:", error);
      throw error;
    }
  }

  /**
   * Obtiene ventas agrupadas por tipo de producto
   * Endpoint: GET /api/v1/admin-panel/sales
   */
  static async getVentasPorProducto(filtros?: FiltrosMarketing): Promise<VentaProducto[]> {
    try {
      console.log("🛒 MarketingService: Obteniendo ventas por producto...");

      // Construir parámetros para el endpoint de ventas
      const params: {
        limit?: number;
        page?: number;
        month?: number;
        search?: string;
      } = {};

      if (filtros?.fechaInicio) {
        const fecha = new Date(filtros.fechaInicio);
        params.month = fecha.getMonth() + 1;
      }

      if (filtros?.tipoProducto && filtros.tipoProducto !== "todos") {
        // El endpoint de ventas no filtra por tipo, necesitamos filtrar después
        params.limit = 1000; // Obtener todas para filtrar
      }

      // Obtener ventas del backend
      const sales = await this.getSalesFromBackend(params);

      // Filtrar por tipo de producto si se especificó
      let filteredSales = sales;
      if (filtros?.tipoProducto && filtros.tipoProducto !== "todos") {
        const tipoBackend = mapVentaTypeToProductType(filtros.tipoProducto);
        filteredSales = sales.filter((sale) => sale.product_type === tipoBackend);
      }

      // Transformar a formato esperado por la UI
      const ventasPorProducto = transformSalesToVentaProducto(filteredSales);

      console.log("✅ MarketingService: Ventas obtenidas");
      return ventasPorProducto;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo ventas:", error);
      throw error;
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - CLIENTES
  // ⚠️ ADVERTENCIA: Estos endpoints NO ESTÁN IMPLEMENTADOS en el backend
  // ========================================================================

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/clientes-renovacion NO EXISTE
   * Use datos mock desde data.ts: getMockClientesRenovacion()
   */
  static async getClientesRenovacion(dias: number = 7): Promise<ClienteRenovacion[]> {
    console.warn("⚠️ MarketingService.getClientesRenovacion: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error(
      "Endpoint no implementado: GET /api/v1/admin-panel/marketing/clientes-renovacion. Use getMockClientesRenovacion() de data.ts",
    );

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log(`🔄 MarketingService: Obteniendo clientes con renovación en ${dias} días...`);
    //   const response = await MarketingApiClient.makeRequest<ClienteRenovacion[]>(
    //     `/api/v1/admin-panel/marketing/clientes-renovacion?dias=${dias}`,
    //   );
    //   console.log(`✅ MarketingService: ${response.length} clientes con renovación próxima`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo clientes renovación:", error);
    //   throw error;
    // }
  }

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/clientes-falta-pago NO EXISTE
   * Use datos mock desde data.ts: getMockClientesFaltaPago()
   */
  static async getClientesFaltaPago(): Promise<ClienteFaltaPago[]> {
    console.warn("⚠️ MarketingService.getClientesFaltaPago: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error(
      "Endpoint no implementado: GET /api/v1/admin-panel/marketing/clientes-falta-pago. Use getMockClientesFaltaPago() de data.ts",
    );

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log("💳 MarketingService: Obteniendo clientes con falta de pago...");
    //   const response = await MarketingApiClient.makeRequest<ClienteFaltaPago[]>(
    //     `/api/v1/admin-panel/marketing/clientes-falta-pago`,
    //   );
    //   console.log(`✅ MarketingService: ${response.length} clientes con falta de pago`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo clientes falta pago:", error);
    //   throw error;
    // }
  }

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/clientes-sin-contacto NO EXISTE
   * Use datos mock desde data.ts: getMockClientesSinContacto()
   */
  static async getClientesSinContacto(dias: number = 7): Promise<ClienteInactivo[]> {
    console.warn("⚠️ MarketingService.getClientesSinContacto: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error(
      "Endpoint no implementado: GET /api/v1/admin-panel/marketing/clientes-sin-contacto. Use getMockClientesSinContacto() de data.ts",
    );

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log(`📭 MarketingService: Obteniendo clientes sin contacto en ${dias} días...`);
    //   const response = await MarketingApiClient.makeRequest<ClienteInactivo[]>(
    //     `/api/v1/admin-panel/marketing/clientes-sin-contacto?dias=${dias}`,
    //   );
    //   console.log(`✅ MarketingService: ${response.length} clientes sin contacto`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo clientes sin contacto:", error);
    //   throw error;
    // }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - TAREAS Y TICKETS
  // ========================================================================

  /**
   * Obtiene tareas pendientes agrupadas por área
   * Endpoint: GET /api/v1/admin-panel/tasks/assigned-to-me
   */
  static async getTareasPendientes(): Promise<TareasPorArea> {
    try {
      console.log("📋 MarketingService: Obteniendo tareas pendientes...");

      // Obtener todas las tareas pendientes y en progreso
      const [pendingTasks, inProgressTasks] = await Promise.all([
        this.getTasksFromBackend({ status: "pending", limit: 1000 }),
        this.getTasksFromBackend({ status: "in_progress", limit: 1000 }),
      ]);

      // Combinar tareas
      const allTasks = [...pendingTasks.tasks, ...inProgressTasks.tasks];

      // Transformar a formato esperado por la UI
      const tareasPorArea = transformTasksToTareasPorArea(allTasks);

      console.log("✅ MarketingService: Tareas pendientes obtenidas");
      return tareasPorArea;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo tareas:", error);
      // Retornar estructura vacía en caso de error
      return {
        nutricion: 0,
        entreno: 0,
        soporte: 0,
        total: 0,
      };
    }
  }

  /**
   * Obtiene el top de causas de tickets
   * Endpoint: GET /api/v1/support/backoffice/dashboard/metrics
   */
  static async getTopCausasTickets(limit: number = 5): Promise<CausaTicket[]> {
    try {
      console.log(`🎫 MarketingService: Obteniendo top ${limit} causas de tickets...`);

      // Obtener métricas de soporte
      const metrics = await this.getSupportMetricsFromBackend();

      // Transformar distribución de categorías en top causas
      const causas = transformMetricsToTopCausas(metrics, limit);

      console.log("✅ MarketingService: Causas de tickets obtenidas");
      return causas;
    } catch (error) {
      console.error("❌ MarketingService: Error obteniendo causas tickets:", error);
      // Retornar array vacío en caso de error
      return [];
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - NOTIFICACIONES
  // ⚠️ ADVERTENCIA: Estos endpoints NO ESTÁN IMPLEMENTADOS en el backend
  // ========================================================================

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/notificaciones NO EXISTE
   * Use datos mock desde data.ts: getMockNotificaciones()
   */
  static async getNotificaciones(filtros?: {
    tipo?: string;
    leidas?: boolean;
    limit?: number;
  }): Promise<Notificacion[]> {
    console.warn("⚠️ MarketingService.getNotificaciones: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error(
      "Endpoint no implementado: GET /api/v1/admin-panel/marketing/notificaciones. Use getMockNotificaciones() de data.ts",
    );

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log("🔔 MarketingService: Obteniendo notificaciones...");
    //   const params = new URLSearchParams();
    //   if (filtros?.tipo) params.append("tipo", filtros.tipo);
    //   if (filtros?.leidas !== undefined) params.append("leidas", String(filtros.leidas));
    //   if (filtros?.limit) params.append("limit", String(filtros.limit));
    //   const queryString = params.toString();
    //   const response = await MarketingApiClient.makeRequest<Notificacion[]>(
    //     `/api/v1/admin-panel/marketing/notificaciones${queryString ? `?${queryString}` : ""}`,
    //   );
    //   console.log(`✅ MarketingService: ${response.length} notificaciones obtenidas`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo notificaciones:", error);
    //   throw error;
    // }
  }

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint PUT /api/v1/admin-panel/marketing/notificaciones/:id/leer NO EXISTE
   */
  static async marcarNotificacionLeida(id: string): Promise<void> {
    console.warn("⚠️ MarketingService.marcarNotificacionLeida: Endpoint NO implementado en el backend.");
    throw new Error("Endpoint no implementado: PUT /api/v1/admin-panel/marketing/notificaciones/:id/leer");

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log(`📖 MarketingService: Marcando notificación ${id} como leída...`);
    //   await MarketingApiClient.makeRequest<void>(`/api/v1/admin-panel/marketing/notificaciones/${id}/leer`, {
    //     method: "PUT",
    //   });
    //   console.log("✅ MarketingService: Notificación marcada como leída");
    // } catch (error) {
    //   console.error("❌ MarketingService: Error marcando notificación:", error);
    //   throw error;
    // }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - SISTEMA XP
  // ⚠️ ADVERTENCIA: Estos endpoints NO ESTÁN IMPLEMENTADOS en el backend
  // ========================================================================

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/tabla-xp NO EXISTE
   * Use datos mock desde data.ts: getMockTablaXP()
   */
  static async getTablaXP(): Promise<AccionXP[]> {
    console.warn("⚠️ MarketingService.getTablaXP: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error(
      "Endpoint no implementado: GET /api/v1/admin-panel/marketing/tabla-xp. Use getMockTablaXP() de data.ts",
    );

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log("⭐ MarketingService: Obteniendo tabla XP...");
    //   const response = await MarketingApiClient.makeRequest<AccionXP[]>(`/api/v1/admin-panel/marketing/tabla-xp`);
    //   console.log(`✅ MarketingService: ${response.length} acciones XP obtenidas`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo tabla XP:", error);
    //   throw error;
    // }
  }

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/creditos-mensuales NO EXISTE
   * Use datos mock desde data.ts: getMockCreditosMensuales()
   */
  static async getCreditosMensuales(): Promise<CreditoMensual[]> {
    console.warn("⚠️ MarketingService.getCreditosMensuales: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error(
      "Endpoint no implementado: GET /api/v1/admin-panel/marketing/creditos-mensuales. Use getMockCreditosMensuales() de data.ts",
    );

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log("🏆 MarketingService: Obteniendo créditos mensuales...");
    //   const response = await MarketingApiClient.makeRequest<CreditoMensual[]>(
    //     `/api/v1/admin-panel/marketing/creditos-mensuales`,
    //   );
    //   console.log(`✅ MarketingService: ${response.length} créditos mensuales obtenidos`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo créditos mensuales:", error);
    //   throw error;
    // }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - ALERTAS
  // ⚠️ ADVERTENCIA: Este endpoint NO ESTÁ IMPLEMENTADO en el backend
  // ========================================================================

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/alertas NO EXISTE
   * Use datos mock desde data.ts: getMockAlertasCriticas()
   */
  static async getAlertasCriticas(): Promise<AlertaCritica[]> {
    console.warn("⚠️ MarketingService.getAlertasCriticas: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error(
      "Endpoint no implementado: GET /api/v1/admin-panel/marketing/alertas. Use getMockAlertasCriticas() de data.ts",
    );

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log("⚠️ MarketingService: Obteniendo alertas críticas...");
    //   const response = await MarketingApiClient.makeRequest<AlertaCritica[]>(`/api/v1/admin-panel/marketing/alertas`);
    //   console.log(`✅ MarketingService: ${response.length} alertas obtenidas`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo alertas:", error);
    //   throw error;
    // }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS - UTILIDADES
  // ========================================================================

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/coaches NO EXISTE
   * Use datos mock desde data.ts: getMockCoaches()
   */
  static async getCoaches(): Promise<CoachOption[]> {
    console.warn("⚠️ MarketingService.getCoaches: Endpoint NO implementado en el backend. Use datos mock.");
    throw new Error("Endpoint no implementado: GET /api/v1/admin-panel/coaches. Use getMockCoaches() de data.ts");

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log("👥 MarketingService: Obteniendo coaches...");
    //   const response = await MarketingApiClient.makeRequest<CoachOption[]>(`/api/v1/admin-panel/coaches`);
    //   console.log(`✅ MarketingService: ${response.length} coaches obtenidos`);
    //   return response;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error obteniendo coaches:", error);
    //   throw error;
    // }
  }

  /**
   * ⚠️ NO CONECTADO AL BACKEND
   * El endpoint /api/v1/admin-panel/marketing/export NO EXISTE
   */
  static async exportCSV(
    tipo: "kpis" | "clientes" | "ventas" | "notificaciones" | "xp",
    filtros?: FiltrosMarketing,
  ): Promise<Blob> {
    console.warn("⚠️ MarketingService.exportCSV: Endpoint NO implementado en el backend.");
    throw new Error("Endpoint no implementado: GET /api/v1/admin-panel/marketing/export");

    // Código comentado - NO FUNCIONAL
    // try {
    //   console.log(`📥 MarketingService: Exportando ${tipo} a CSV...`);
    //   const token = getAuthToken();
    //   const queryString = MarketingApiClient.buildQueryString(filtros);
    //   const response = await fetch(
    //     `${API_BASE_URL}/api/v1/admin-panel/marketing/export?tipo=${tipo}${queryString ? `&${queryString.slice(1)}` : ""}`,
    //     { headers: MarketingApiClient.getDefaultHeaders(token) },
    //   );
    //   if (!response.ok) throw new Error(`Error exportando: ${response.statusText}`);
    //   const blob = await response.blob();
    //   console.log("✅ MarketingService: Exportación completada");
    //   return blob;
    // } catch (error) {
    //   console.error("❌ MarketingService: Error exportando:", error);
    //   throw error;
    // }
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
