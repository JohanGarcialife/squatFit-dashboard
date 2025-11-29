import { getAuthToken, decodeToken } from "@/lib/auth/auth-utils";

import { Conversation, Message, ChatStats, SendMessageData, ApiResponse } from "./chat-types";
import { rolesConfigService } from "./roles-config.service";

// Importar tipos desde archivo separado

// ============================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";
const REQUEST_TIMEOUT = 10000;

/**
 * Servicio para manejar todas las operaciones relacionadas con el chat
 */
export class ChatService {
  /**
   * Configurar headers por defecto con token de autenticación
   */
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

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

    console.log("🌐 ChatService: Haciendo petición a:", url);
    console.log("🔑 ChatService: Token disponible:", !!token);

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

  /**
   * Mapear información básica de la conversación
   */
  private static mapBasicInfo(conv: any, index: number): Partial<Conversation> {
    return {
      id: conv.id ?? conv.chat_id ?? `temp-id-${index}`,
      name: conv.name ?? conv.user_email ?? "Conversación sin nombre",
      user_id: conv.user_id ?? conv.userId,
      professionalId: conv.professional_id ?? conv.professionalId, // ID del profesional principal
    };
  }

  /**
   * Mapear información de mensajes
   */
  private static mapMessageInfo(conv: any): Partial<Conversation> {
    return {
      unread: parseInt(conv.unread_count ?? conv.unread ?? "0"),
      lastMessage: conv.last_message
        ? {
            ...conv.last_message,
            created_at: conv.last_message.created_at ?? conv.last_message.timestamp ?? conv.last_message_time,
          }
        : conv.lastMessage,
    };
  }

  /**
   * Mapear información adicional
   */
  private static mapAdditionalInfo(conv: any): Partial<Conversation> {
    return {
      tags: conv.tags ?? [],
      isActive: conv.isActive ?? true,
    };
  }

  /**
   * Normalizar una conversación individual
   */
  private static normalizeConversation(conv: any, index: number): Conversation {
    return {
      ...conv,
      ...this.mapBasicInfo(conv, index),
      ...this.mapMessageInfo(conv),
      ...this.mapAdditionalInfo(conv),
    };
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS DEL SERVICIO
  // ========================================================================

  /**
   * Obtiene el rol REAL del usuario desde el JWT (sin mapeo)
   * Para uso en peticiones HTTP al backend
   */
  private static getRealUserRoleFromToken(): string {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("⚠️ No hay token disponible");
        return "";
      }

      // Decodificar JWT usando la utilidad existente
      const payload = decodeToken(token);
      if (!payload) {
        console.warn("⚠️ No se pudo decodificar el token");
        return "";
      }

      const role = payload.role?.toLowerCase() || "";
      console.log("🎭 Rol REAL extraído del JWT:", role);

      return role;
    } catch (error) {
      console.warn("⚠️ Error detectando rol del usuario:", error);
      return "";
    }
  }

  /**
   * Obtiene todas las conversaciones del usuario autenticado
   * Endpoint: GET /api/v1/admin-panel/chats?from={role}
   * @returns Promise con array de conversaciones
   */
  static async getConversations(): Promise<Conversation[]> {
    console.log("🔍 [GETCONVERSATIONS] INICIO - Obteniendo conversaciones...");

    try {
      // Usar el rol REAL del JWT para peticiones HTTP (sin mapeo)
      console.log("🔍 [GETCONVERSATIONS] Paso 1: Obteniendo rol del JWT...");
      const userRole = this.getRealUserRoleFromToken();
      console.log("🔍 [GETCONVERSATIONS] Rol obtenido:", userRole);

      if (!userRole) {
        console.error("❌ [GETCONVERSATIONS] ERROR: No se pudo obtener el rol del usuario");
        throw new Error("No se pudo obtener el rol del usuario");
      }

      console.log(`🎯 [GETCONVERSATIONS] Paso 2: Haciendo petición HTTP con rol: ${userRole}`);
      console.log(`🌐 [GETCONVERSATIONS] URL: /api/v1/admin-panel/chats?from=${userRole}`);

      const response = await this.makeRequest<ApiResponse<Conversation[]>>(
        `/api/v1/admin-panel/chats?from=${userRole}`,
      );

      console.log("📦 [GETCONVERSATIONS] Paso 3: Respuesta recibida del backend");

      console.log("📦 ChatService: Respuesta completa del backend:", response);
      console.log("📦 ChatService: Tipo de response:", typeof response);
      console.log("📦 ChatService: ¿Es Array response?", Array.isArray(response));
      console.log("📦 ChatService: response.data:", response.data);
      console.log("📦 ChatService: Tipo de response.data:", typeof response.data);
      console.log("📦 ChatService: ¿Es Array response.data?", Array.isArray(response.data));

      // Verificar si la respuesta es directamente un array
      let conversationsData = response.data;
      if (!Array.isArray(conversationsData) && response && Array.isArray(response)) {
        console.log("⚠️ ChatService: La respuesta es directamente un array, no tiene .data");
        conversationsData = response;
      }

      console.log("📋 ChatService: conversationsData a procesar:", conversationsData);
      console.log("📋 ChatService: Longitud:", conversationsData?.length);

      // Normalizar datos para asegurar que todas las conversaciones tengan la estructura correcta
      const conversations = (conversationsData ?? [])
        .filter((conv: any) => {
          const hasId = !!(conv && (conv.id ?? conv.chat_id));
          console.log("🔍 ChatService: Filtrando conversación:", {
            hasId,
            convId: conv?.id,
            chatId: conv?.chat_id,
            conv: conv,
          });
          return hasId;
        })
        .map((conv: any, index: number) => {
          const normalized = this.normalizeConversation(conv, index);
          console.log("🔄 ChatService: Conversación normalizada:", normalized);
          return normalized;
        });

      console.log(`✅ [GETCONVERSATIONS] Paso 4: ${conversations.length} conversaciones procesadas exitosamente`);
      console.log("📊 [GETCONVERSATIONS] Lista final de conversaciones:", conversations);
      console.log("🎉 [GETCONVERSATIONS] FIN - Retornando conversaciones");
      return conversations;
    } catch (error) {
      console.error("❌ [GETCONVERSATIONS] ERROR CRÍTICO:", error);
      console.error("❌ [GETCONVERSATIONS] Tipo de error:", error instanceof Error ? error.message : String(error));
      console.error("❌ [GETCONVERSATIONS] Stack:", error instanceof Error ? error.stack : "No stack trace");
      throw error;
    }
  }

  /**
   * Obtiene los mensajes de una conversación específica
   * Endpoint: GET /api/v1/coach-chat/conversations/{chatId}/messages
   * @param chatId - ID de la conversación
   * @returns Promise con array de mensajes
   */
  static async getMessages(chatId: string): Promise<Message[]> {
    if (!chatId) {
      throw new Error("ID de conversación requerido");
    }

    try {
      console.log("🔍 ChatService: Obteniendo mensajes para chat:", chatId);
      const response = await this.makeRequest<ApiResponse<any[]> | any[]>(
        `/api/v1/admin-panel/messages?chat_id=${chatId}&page=1&limit=100`,
      );

      // ✅ Manejar tanto respuesta con { data: [...] } como array directo
      const rawMessages = Array.isArray(response) ? response : (response.data ?? []);
      console.log("🔍 ChatService: Mensajes crudos recibidos:", rawMessages.length, rawMessages.slice(0, 2));

      // Normalizar mensajes del backend al formato del frontend
      const normalizedMessages = rawMessages.map((msg: any) => ({
        id: msg.message_id || msg.id,
        chatId: chatId,
        content: msg.message || msg.content,
        sender_id: msg.from || msg.sender_id,
        created_at: msg.sended_at || msg.created_at,
        isRead: msg.read ?? msg.isRead ?? false,
        messageType: msg.messageType || ("text" as "text" | "image" | "audio" | "file"),
      }));

      console.log("✅ ChatService: Mensajes normalizados:", normalizedMessages.length);
      return normalizedMessages;
    } catch (error) {
      console.error("❌ ChatService: Error obteniendo mensajes:", error);
      throw error;
    }
  }

  /**
   * Envía un mensaje a una conversación específica
   * Endpoint: POST /api/v1/coach-chat/conversations/{chatId}/messages
   * @param chatId - ID de la conversación
   * @param messageData - Datos del mensaje a enviar
   * @returns Promise con el mensaje enviado
   */
  static async sendMessage(chatId: string, messageData: SendMessageData): Promise<Message> {
    if (!chatId) {
      throw new Error("ID de conversación requerido");
    }

    if (!messageData.content?.trim()) {
      throw new Error("El contenido del mensaje es requerido");
    }

    try {
      console.log("🔍 ChatService: Enviando mensaje:", {
        chatId,
        content: messageData.content,
        messageType: messageData.messageType,
      });

      const response = await this.makeRequest<ApiResponse<Message>>(
        `/api/v1/coach-chat/conversations/${chatId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            message: messageData.content.trim(),
            messageType: messageData.messageType ?? "text",
          }),
        },
      );

      console.log("🔍 ChatService: Respuesta del servidor:", response);
      console.log("🔍 ChatService: response.data:", response.data);
      console.log("🔍 ChatService: response.data.content:", response.data?.content);

      // Validar que la respuesta tenga el contenido esperado
      if (!response.data) {
        throw new Error("El servidor no devolvió datos del mensaje");
      }

      // Asegurar que el mensaje tenga contenido
      const message = {
        ...response.data,
        content: response.data.content ?? messageData.content.trim(),
      };

      console.log("🔍 ChatService: Mensaje final a devolver:", message);

      return message;
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      throw error;
    }
  }

  /**
   * Marca los mensajes de una conversación como leídos
   * @param chatId - ID de la conversación
   * @param messageIds - IDs de los mensajes a marcar como leídos (opcional)
   * @returns Promise que se resuelve cuando se completa la operación
   */
  static async markAsRead(chatId: string, messageIds?: string[]): Promise<void> {
    if (!chatId) {
      throw new Error("ID de conversación requerido");
    }

    try {
      const { websocketService } = await import("@/lib/services/websocket.service");

      // Si no se proveen IDs, marcar con array vacío (el backend interpretará como "todos")
      const ids = messageIds || [];

      console.log("📝 Marcando mensajes como leídos vía WebSocket:", { chatId, count: ids.length });
      await websocketService.markMessagesAsRead(chatId, ids);
      console.log("✅ Mensajes marcados como leídos correctamente");
    } catch (error) {
      console.error("Error marcando mensajes como leídos:", error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del chat
   * Endpoint: GET /api/v1/admin-panel/chats/stats?channel={role}
   * @returns Promise con las estadísticas del chat
   */
  static async getStats(): Promise<ChatStats> {
    try {
      // Usar el rol REAL del JWT para peticiones HTTP
      const userRole = this.getRealUserRoleFromToken();

      if (!userRole) {
        console.error("❌ ChatService: No se pudo obtener el rol del usuario");
        throw new Error("No se pudo obtener el rol del usuario");
      }

      const response = await this.makeRequest<ApiResponse<ChatStats>>(
        `/api/v1/admin-panel/chats/stats?channel=${userRole}`,
      );
      return response.data;
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

      await this.makeRequest<ApiResponse<{ status: string }>>("/api/v1/coach-chat/stats");
      return true;
    } catch (error) {
      console.error("Health check falló:", error);
      return false;
    }
  }
}

// Re-exportar funciones utilitarias desde archivo separado
export { formatMessageTime, isRecentMessage, getInitials } from "./chat-utils";
