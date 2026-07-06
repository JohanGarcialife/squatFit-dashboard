/**
 * Servicio para obtener métricas de rendimiento del sistema
 * Endpoint real: /api/v1/admin/system-metrics/performance-dashboard
 * Utiliza el proxy local en /api/admin/system-metrics
 */

import { getAuthToken } from "@/lib/auth/auth-utils";

import type { SystemMetricsResponse } from "./system-metrics-types";

const REQUEST_TIMEOUT = 10000;

export class SystemMetricsService {
  private static createAbortController(timeout: number = REQUEST_TIMEOUT): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  private static async handleHttpError(response: Response): Promise<never> {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Ignorar si falla el parseo
    }

    throw new Error(errorMessage);
  }

  /**
   * Obtiene el dashboard completo de rendimiento
   */
  static async getPerformanceDashboard(): Promise<SystemMetricsResponse> {
    try {
      const controller = this.createAbortController();

      const response = await fetch("/api/admin/system-metrics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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
      throw new Error("Error desconocido al obtener las métricas de sistema");
    }
  }
}
