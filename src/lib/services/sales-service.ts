/**
 * Servicio para manejar operaciones relacionadas con ventas
 * Endpoints: /api/v1/admin-panel/total-sales, /api/v1/admin-panel/sales
 * Sigue el patrón de CalculatorService y CursosService
 */

import { getAuthToken } from "@/lib/auth/auth-utils";

import type { GetSalesParams, SalesListResponse, TotalSalesResponse } from "./sales-types";

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";
const REQUEST_TIMEOUT = 10000;

// ============================================================================
// SERVICIO DE VENTAS
// ============================================================================

/**
 * Servicio para manejar todas las operaciones relacionadas con ventas
 */
export class SalesService {
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
   * Crear una instancia de AbortController con timeout
   */
  private static createAbortController(timeout: number = REQUEST_TIMEOUT): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /**
   * Manejar errores HTTP
   */
  private static async handleHttpError(response: Response): Promise<never> {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }

    throw new Error(errorMessage);
  }

  // ==========================================================================
  // MÉTODOS PÚBLICOS - LECTURA
  // ==========================================================================

  /**
   * Obtener el total de ventas del sistema
   * Endpoint: GET /api/v1/admin-panel/total-sales
   *
   * @returns Total de ventas
   * @throws Error si falla la petición
   */
  static async getTotalSales(): Promise<TotalSalesResponse> {
    try {
      const token = getAuthToken();
      const headers = this.getDefaultHeaders(token);
      const controller = this.createAbortController();

      const response = await fetch(`${API_BASE_URL}/api/v1/admin-panel/total-sales`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("La petición ha excedido el tiempo límite");
        }
        throw error;
      }
      throw new Error("Error desconocido al obtener el total de ventas");
    }
  }

  /**
   * Obtener lista de ventas con paginación y filtros
   * Endpoint: GET /api/v1/admin-panel/sales
   *
   * @param params - Parámetros de filtrado (limit, page, month, search)
   * @returns Lista paginada de ventas
   * @throws Error si falla la petición
   */
  static async getSales(params?: GetSalesParams): Promise<SalesListResponse> {
    try {
      const token = getAuthToken();
      const headers = this.getDefaultHeaders(token);
      const controller = this.createAbortController();

      // Construir query params
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.month) queryParams.append("month", params.month.toString());
      if (params?.search) queryParams.append("search", params.search);

      const url = `${API_BASE_URL}/api/v1/admin-panel/sales${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("La petición ha excedido el tiempo límite");
        }
        throw error;
      }
      throw new Error("Error desconocido al obtener las ventas");
    }
  }
}
