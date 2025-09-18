import { LoginRequest } from "../auth/types";

// Configuración del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";

// Servicio de autenticación
export class AuthService {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error(`Error parsing response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          data,
          url,
        });
        throw new Error(data.message ?? data.error ?? `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error("Request failed:", {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // Login
  static async login(credentials: LoginRequest): Promise<{ token: string }> {
    return this.makeRequest<{ token: string }>("/api/v1/admin-panel/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Logout (si el backend lo soporta)
  static async logout(): Promise<void> {
    try {
      await this.makeRequest("/api/v1/admin-panel/logout", {
        method: "POST",
      });
    } catch {
      // Ignorar errores en logout si el endpoint no existe
      console.warn("Logout endpoint not available");
    }
  }

  // Health check
  static async healthCheck(): Promise<unknown> {
    try {
      return await this.makeRequest("/api/v1/health");
    } catch {
      throw new Error("Backend health check failed");
    }
  }
}
