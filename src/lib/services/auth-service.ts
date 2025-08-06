import { LoginRequest } from "../auth/types";

// Configuración del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";

// Servicio de autenticación
export class AuthService {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? `Error ${response.status}`);
    }

    return data;
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
