import { getAuthToken } from "@/lib/auth/auth-utils";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
const REQUEST_TIMEOUT = 30000; // 30 segundos

export interface ChatParticipant {
  id: string;
  participant_id: string;
  chat_id: string;
  role: "adviser" | "dietitian" | "support_agent" | "sales" | "psychologist";
  is_active: boolean;
  is_representative: boolean; // ✅ Indica si es el profesional principal del chat
  added_by: string;
  added_at: string;
  participant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role_name: string;
  };
}

export interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profile_picture?: string;
  role_name: string;
  role_id: string;
  fullName: string;
}

export interface AddParticipantRequest {
  participant_id: string;
  role: "adviser" | "dietitian" | "support_agent" | "sales" | "psychologist";
}

export interface ReassignTicketRequest {
  agent_id: string;
}

export interface ReassignChatRequest {
  professional_id: string;
}

// ============================================================================
// SERVICIO PARA GESTIÓN DE PARTICIPANTES DE CHAT
// ============================================================================

/**
 * Servicio para gestionar participantes de chats
 */
export class ChatParticipantsService {
  /**
   * Configurar headers por defecto con token de autenticación
   */
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Manejar errores de respuesta HTTP
   */
  private static async handleResponseError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      console.warn("Token de autenticación inválido o expirado");
      throw new Error("Unauthorized");
    }

    throw new Error(errorData.message ?? errorData.error ?? `Error ${response.status}: ${response.statusText}`);
  }

  /**
   * Método privado para realizar peticiones HTTP al backend
   */
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🌐 ChatParticipantsService: Haciendo petición a:", url);

    const defaultHeaders = this.getDefaultHeaders(token);
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
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("La petición tardó demasiado tiempo");
        }
        throw error;
      }

      throw new Error("Error de conexión con el servidor");
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS DEL SERVICIO
  // ========================================================================

  /**
   * Obtiene los participantes de un chat
   * Endpoint: GET /api/v1/admin-panel/chat/{chatId}/participants
   */
  static async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    if (!chatId) {
      throw new Error("ID de chat requerido");
    }

    console.log("📋 Obteniendo participantes del chat:", chatId);
    return await this.makeRequest<ChatParticipant[]>(`/api/v1/admin-panel/chat/${chatId}/participants`);
  }

  /**
   * Agrega un participante a un chat
   * Endpoint: POST /api/v1/admin-panel/chat/{chatId}/add-participant
   */
  static async addParticipant(chatId: string, data: AddParticipantRequest): Promise<ChatParticipant> {
    if (!chatId) {
      throw new Error("ID de chat requerido");
    }

    if (!data.participant_id || !data.role) {
      throw new Error("participant_id y role son requeridos");
    }

    console.log("➕ Agregando participante al chat:", { chatId, ...data });
    return await this.makeRequest<ChatParticipant>(`/api/v1/admin-panel/chat/${chatId}/add-participant`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Remueve un participante de un chat
   * Endpoint: POST /api/v1/admin-panel/chat/{chatId}/remove-participant
   */
  static async removeParticipant(chatId: string, participantId: string): Promise<void> {
    if (!chatId || !participantId) {
      throw new Error("ID de chat y participante requeridos");
    }

    console.log("➖ Removiendo participante del chat:", { chatId, participantId });
    await this.makeRequest<void>(`/api/v1/admin-panel/chat/${chatId}/remove-participant`, {
      method: "POST",
      body: JSON.stringify({ participant_id: participantId }),
    });
  }

  /**
   * Obtiene la lista de profesionales disponibles
   * Endpoint: GET /api/v1/admin-panel/professionals
   */
  static async getAvailableProfessionals(role?: string): Promise<Professional[]> {
    const queryParams = role ? `?role=${role}` : "";
    console.log("👥 Obteniendo lista de profesionales disponibles");
    return await this.makeRequest<Professional[]>(`/api/v1/admin-panel/professionals${queryParams}`);
  }

  /**
   * Cambia el representante de un chat
   * Endpoint: PUT /api/v1/admin-panel/chat/{chatId}/representative
   */
  static async setChatRepresentative(chatId: string, participantId: string): Promise<void> {
    if (!chatId || !participantId) {
      throw new Error("ID de chat y participante requeridos");
    }

    console.log("🔄 Cambiando representante del chat:", { chatId, participantId });
    await this.makeRequest<void>(`/api/v1/admin-panel/chat/${chatId}/representative`, {
      method: "PUT",
      body: JSON.stringify({ participant_id: participantId }),
    });
  }

  /**
   * Reasigna el agente principal de un ticket de soporte
   * Endpoint: PUT /api/v1/admin-panel/support/ticket/{ticketId}/reassign
   */
  static async reassignTicket(ticketId: string, data: ReassignTicketRequest): Promise<ChatParticipant> {
    if (!ticketId) {
      throw new Error("ID de ticket requerido");
    }

    if (!data.agent_id) {
      throw new Error("agent_id es requerido");
    }

    console.log("🔄 Reasignando ticket:", { ticketId, newAgentId: data.agent_id });
    return await this.makeRequest<ChatParticipant>(`/api/v1/admin-panel/support/ticket/${ticketId}/reassign`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Reasigna el profesional principal de un chat normal
   * Endpoint: PUT /api/v1/admin-panel/chat/{chatId}/reassign
   */
  static async reassignChat(chatId: string, data: ReassignChatRequest): Promise<ChatParticipant> {
    if (!chatId) {
      throw new Error("ID de chat requerido");
    }

    if (!data.professional_id) {
      throw new Error("professional_id es requerido");
    }

    console.log("🔄 Reasignando chat:", { chatId, newProfessionalId: data.professional_id });
    return await this.makeRequest<ChatParticipant>(`/api/v1/admin-panel/chat/${chatId}/reassign`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}
