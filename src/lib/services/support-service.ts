import { getAuthToken } from "@/lib/auth/auth-utils";

import { Ticket, SupportMessage, SupportStats, SendSupportMessageData, ApiResponse } from "./support-types";

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";
const REQUEST_TIMEOUT = 10000;

/**
 * Servicio para manejar todas las operaciones relacionadas con el soporte
 */
export class SupportService {
  /**
   * Configurar headers por defecto con token de autenticación
   */
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    // Si no hay token, intentar obtenerlo de localStorage como fallback
    if (!token && typeof window !== "undefined") {
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
    const errorData = await response.json().catch(() => ({}));

    // Manejar errores de autenticación específicamente
    if (response.status === 401 || response.status === 403) {
      console.warn("Token de autenticación inválido o expirado");
      throw new Error("Unauthorized");
    }

    // Manejar rate limiting específicamente
    if (response.status === 429) {
      console.warn("Rate limiting detectado, esperando antes de reintentar...");
      throw new Error("RateLimited");
    }

    throw new Error(errorData.message ?? errorData.error ?? `Error ${response.status}: ${response.statusText}`);
  }

  /**
   * Manejar errores de petición
   */
  private static handleRequestError(error: unknown, timeoutId: NodeJS.Timeout): never {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado tiempo");
      }
      throw error;
    }

    throw new Error("Error de conexión con el servidor");
  }

  /**
   * Método privado para realizar peticiones HTTP al backend
   * @param endpoint - Endpoint de la API
   * @param options - Opciones de la petición HTTP
   * @returns Promise con la respuesta parseada
   */
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🌐 SupportService: Haciendo petición a:", url);
    console.log("🔑 SupportService: Token disponible:", !!token);

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

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      return await response.json();
    } catch (error) {
      this.handleRequestError(error, timeoutId);
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS DEL SERVICIO
  // ========================================================================

  /**
   * Obtiene todos los tickets asignados a un agente
   * Endpoint: GET /api/v1/support/backoffice/agents/:agentId/tickets
   * @param agentId - ID del agente
   * @returns Promise con array de tickets
   */
  static async getTickets(agentId: string): Promise<Ticket[]> {
    try {
      console.log("🔍 SupportService: Obteniendo tickets del agente:", agentId);
      const response = await this.makeRequest<unknown>(`/api/v1/support/backoffice/agents/${agentId}/tickets`);

      console.log("🔍 SupportService: Respuesta de tickets:", response);

      // Manejar diferentes estructuras de respuesta
      let tickets: Ticket[] = [];

      if (Array.isArray(response)) {
        // Respuesta directa como array
        tickets = response as Ticket[];
      } else if ((response as { data?: unknown[] })?.data && Array.isArray((response as { data?: unknown[] }).data)) {
        // Respuesta envuelta en objeto con propiedad data
        tickets = (response as { data: Ticket[] }).data;
      } else if (
        (response as { tickets?: unknown[] })?.tickets &&
        Array.isArray((response as { tickets?: unknown[] }).tickets)
      ) {
        // Respuesta con propiedad tickets
        tickets = (response as { tickets: Ticket[] }).tickets;
      } else {
        console.warn("⚠️ SupportService: Estructura de respuesta desconocida:", response);
        tickets = [];
      }

      console.log(`✅ SupportService: ${tickets.length} tickets obtenidos`, tickets);
      return tickets;
    } catch (error) {
      console.error("❌ SupportService: Error obteniendo tickets:", error);
      throw error;
    }
  }

  /**
   * Obtiene los detalles de un ticket específico
   * Endpoint: GET /api/v1/support/backoffice/tickets/:ticketId
   * @param ticketId - ID del ticket
   * @returns Promise con el ticket
   */
  static async getTicket(ticketId: string): Promise<Ticket> {
    try {
      const ticket = await this.makeRequest<Ticket>(`/api/v1/support/backoffice/tickets/${ticketId}`);
      return ticket;
    } catch (error) {
      console.error("Error obteniendo detalles del ticket:", error);
      throw error;
    }
  }

  /**
   * Obtiene los mensajes de un ticket específico
   * Endpoint: GET /api/v1/support/backoffice/tickets/:ticketId/messages
   * @param ticketId - ID del ticket
   * @returns Promise con array de mensajes
   */
  static async getMessages(ticketId: string): Promise<SupportMessage[]> {
    if (!ticketId) {
      throw new Error("ID de ticket requerido");
    }

    try {
      console.log("🔍 SupportService: Obteniendo mensajes del ticket:", ticketId);
      const response = await this.makeRequest<unknown>(`/api/v1/support/backoffice/tickets/${ticketId}/messages`);

      console.log("🔍 SupportService: Respuesta de mensajes:", response);

      // Manejar diferentes estructuras de respuesta
      let messages: SupportMessage[] = [];

      if (Array.isArray(response)) {
        // Respuesta directa como array
        messages = response as SupportMessage[];
      } else if ((response as { data?: unknown[] })?.data && Array.isArray((response as { data?: unknown[] }).data)) {
        // Respuesta envuelta en objeto con propiedad data
        messages = (response as { data: SupportMessage[] }).data;
      } else if (
        (response as { messages?: unknown[] })?.messages &&
        Array.isArray((response as { messages?: unknown[] }).messages)
      ) {
        // Respuesta con propiedad messages
        messages = (response as { messages: SupportMessage[] }).messages;
      } else {
        console.warn("⚠️ SupportService: Estructura de respuesta desconocida:", response);
        messages = [];
      }

      console.log(`✅ SupportService: ${messages.length} mensajes obtenidos`);
      return messages;
    } catch (error) {
      console.error("❌ SupportService: Error obteniendo mensajes:", error);
      throw error;
    }
  }

  /**
   * Envía un mensaje a un ticket específico vía REST API
   * Nota: Preferir envío vía WebSocket usando el evento 'add_message_support'
   * Endpoint: POST /api/v1/support/backoffice/tickets/:ticketId/message
   * @param ticketId - ID del ticket
   * @param messageData - Datos del mensaje a enviar
   * @returns Promise con el mensaje enviado
   */
  static async sendMessage(ticketId: string, messageData: SendSupportMessageData): Promise<SupportMessage> {
    if (!ticketId) {
      throw new Error("ID de ticket requerido");
    }

    if (!messageData.content?.trim()) {
      throw new Error("El contenido del mensaje es requerido");
    }

    try {
      console.log("🔍 SupportService: Enviando mensaje:", {
        ticketId,
        content: messageData.content,
      });

      const response = await this.makeRequest<ApiResponse<SupportMessage>>(
        `/api/v1/support/backoffice/tickets/${ticketId}/message`,
        {
          method: "POST",
          body: JSON.stringify({
            ticket_id: ticketId,
            message: messageData.content.trim(),
            user_id: messageData.senderId,
          }),
        },
      );

      console.log("🔍 SupportService: Respuesta del servidor:", response);

      // Validar que la respuesta tenga el contenido esperado
      if (!response.data) {
        console.error("❌ SupportService: El servidor no devolvió datos del mensaje");
        throw new Error("El servidor no devolvió datos del mensaje");
      }

      // Asegurar que el mensaje tenga contenido
      const message = {
        ...response.data,
        content: response.data.content ?? messageData.content.trim(),
      };

      console.log("🔍 SupportService: Mensaje final a devolver:", message);

      return message;
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de soporte
   * @returns Promise con las estadísticas
   */
  static async getStats(): Promise<SupportStats> {
    try {
      // Por ahora retornamos estadísticas mock
      // Cuando el backend implemente este endpoint, actualizar
      return {
        totalTickets: 0,
        pendingTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
        assignedToMe: 0,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      throw error;
    }
  }

  /**
   * Método de utilidad para verificar la conectividad con el backend
   * @returns Promise que se resuelve si la conexión es exitosa
   */
  static async healthCheck(): Promise<boolean> {
    try {
      // Verificar si hay token disponible antes de hacer la petición
      const token = getAuthToken();
      if (!token) {
        console.log("Health check: No hay token disponible");
        return false;
      }

      // Por ahora solo verificar que el token existe
      return true;
    } catch (error) {
      console.error("Health check falló:", error);
      return false;
    }
  }
}

/**
 * Formatea el tiempo del mensaje de manera relativa
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "ahora";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/**
 * Verifica si un mensaje es reciente (últimas 24 horas)
 */
export function isRecentMessage(timestamp: string): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
}

/**
 * Obtiene las iniciales de un nombre
 */
export function getInitials(name: string): string {
  if (!name) return "??";

  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
