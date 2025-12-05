/**
 * Servicio para manejar operaciones relacionadas con la calculadora de IMC
 * Sigue el patrón de DietaService y otros servicios
 */

import { getAuthToken } from "@/lib/auth/auth-utils";

import type { CalculateIMCDto, IMCCalculationResponse, IMCHistoryRecord, IMCHistoryResponse } from "./calculator-types";

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const REQUEST_TIMEOUT = 10000;

// ============================================================================
// SERVICIO DE CALCULADORA
// ============================================================================

/**
 * Servicio para manejar todas las operaciones relacionadas con la calculadora de IMC
 */
export class CalculatorService {
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
   * Manejar errores de respuesta HTTP
   */
  private static async handleResponseError(response: Response): Promise<never> {
    let errorData: unknown = {};
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : {};
    } catch {
      // Si no se puede parsear, usar objeto vacío
      errorData = {};
    }

    // Manejar errores de autenticación
    if (response.status === 401 || response.status === 403) {
      console.warn("🔐 CalculatorService: Token de autenticación inválido o expirado");
      throw new Error("Unauthorized");
    }

    // Manejar error 404
    if (response.status === 404) {
      console.error(`❌ CalculatorService: Endpoint no encontrado (404): ${response.url}`);
      throw new Error(`Endpoint no encontrado: ${response.url}. Verifica que el endpoint exista en el backend.`);
    }

    const errorMessage =
      (errorData as { message?: string }).message ??
      (errorData as { error?: string }).error ??
      `Error ${response.status}: ${response.statusText}`;

    throw new Error(errorMessage);
  }

  /**
   * Manejar errores de conexión
   */
  private static handleRequestError(error: unknown, timeoutId: NodeJS.Timeout): never {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Tiempo de espera agotado. Por favor, intenta nuevamente.");
    }

    console.error("❌ CalculatorService: Error en petición:", error);
    throw new Error("Error de conexión con el servidor");
  }

  /**
   * Método privado para realizar peticiones HTTP al backend
   */
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🧮 CalculatorService: Haciendo petición a:", url);
    console.log("🔑 CalculatorService: Token disponible:", !!token);

    const defaultHeaders = this.getDefaultHeaders(token);

    // Crear controlador de abort para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("📥 CalculatorService: Respuesta status:", response.status);

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const data = await response.json();
      console.log("✅ CalculatorService: Datos recibidos:", data);

      return data;
    } catch (error) {
      console.error("❌ CalculatorService: Error en petición:", error);
      this.handleRequestError(error, timeoutId);
    }
  }

  // ==========================================================================
  // MÉTODOS PÚBLICOS
  // ==========================================================================

  /**
   * Calcula y guarda el IMC del usuario
   * Endpoint: POST /api/v1/calculator/imc
   */
  static async calculateIMC(data: CalculateIMCDto): Promise<IMCCalculationResponse> {
    if (data.weight <= 0 || data.height <= 0) {
      throw new Error("El peso y la altura deben ser mayores a 0");
    }

    try {
      console.log("🧮 CalculatorService: Calculando IMC:", data);

      const response = await this.makeRequest<IMCCalculationResponse>("/api/v1/calculator/imc", {
        method: "POST",
        body: JSON.stringify({
          weight: data.weight,
          height: data.height,
        }),
      });

      console.log("✅ CalculatorService: IMC calculado exitosamente");
      return response;
    } catch (error) {
      console.error("❌ CalculatorService: Error calculando IMC:", error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de cálculos de IMC del usuario
   * Endpoint: GET /api/v1/calculator/history
   */
  static async getIMCHistory(date?: string): Promise<IMCHistoryRecord[]> {
    try {
      console.log("🧮 CalculatorService: Obteniendo historial de IMC");

      const queryParams = date ? `?date=${encodeURIComponent(date)}` : "";
      const response = await this.makeRequest<IMCHistoryRecord[] | IMCHistoryResponse>(
        `/api/v1/calculator/history${queryParams}`,
      );

      // Manejar diferentes formatos de respuesta
      const history = Array.isArray(response) ? response : (response.history ?? []);

      console.log("✅ CalculatorService: Historial obtenido:", history.length, "registros");
      return history;
    } catch (error) {
      console.error("❌ CalculatorService: Error obteniendo historial:", error);
      throw error;
    }
  }
}
