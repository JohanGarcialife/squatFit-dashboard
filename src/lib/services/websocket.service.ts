/* eslint-disable max-lines */
import { io, Socket } from "socket.io-client";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type UserType = "coach" | "dietitian" | "support" | "user";

export interface WebSocketConfig {
  url: string;
  token: string;
  userType: UserType;
  platform?: string;
}

export interface MessageData {
  chat_id: string;
  to: string;
  message: string;
  reply_to_message_id?: string;
}

export interface NewMessageEvent {
  message: {
    id: string;
    from: string;
    to: string;
    chat_id: string;
    message: string;
    timestamp: Date;
    created_at: Date;
    ticket_id?: string; // Para mensajes de soporte
  };
  channel?: string; // Canal detectado automáticamente (coach, dietitian, support)
  chat?: any;
}

export interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onNewMessage?: (data: NewMessageEvent) => void;
  onMessagesHistory?: (data: { chat_id: string; messages: any[]; total: number }) => void;
  onNotification?: (data: any) => void;
  onNewConversation?: (data: { conversation: any }) => void;
  onParticipantRemoved?: (data: { chat_id: string; participant_id: string }) => void;
}

// ============================================================================
// SERVICIO WEBSOCKET PRINCIPAL
// ============================================================================

/**
 * Servicio WebSocket unificado para comunicación en tiempo real
 * Maneja tanto canales de coach como de soporte
 */
class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig | null = null;
  private callbacks: WebSocketCallbacks = {};
  private isConnecting = false;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private notificationsReceived = 0;

  /**
   * Conecta al WebSocket con la configuración especificada
   */
  async connect(config: WebSocketConfig, callbacks?: WebSocketCallbacks): Promise<void> {
    // Evitar múltiples conexiones simultáneas
    if (this.isConnecting || this.socket?.connected) {
      console.log("⚠️ WebSocket: Ya conectado o conectando, evitando reconexión");
      return;
    }

    this.config = config;
    this.callbacks = callbacks || {};
    this.isConnecting = true;

    try {
      console.log(`🔌 Conectando WebSocket como ${config.userType}...`);

      // ✅ Determinar namespace según tipo de usuario
      let namespace = "messages-chat"; // Default para coach, dietitian, user
      if (config.userType === "support") {
        namespace = "messages-support"; // ✅ Agentes de soporte usan namespace específico
      }

      console.log(`🔌 Usando namespace: /${namespace}`);

      this.socket = io(`${config.url}/${namespace}`, {
        // ✅ CORREGIDO: Enviar token en auth.token (Socket.IO v4+)
        auth: {
          token: config.token, // El token sin "Bearer " prefix (el backend lo maneja)
        },
        extraHeaders: {
          from: config.userType,
          platform: config.platform || "web",
          // ✅ También incluir en headers por compatibilidad
          authorization: `Bearer ${config.token}`,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 3,
        autoConnect: true,
        // ✅ IMPORTANTE: Incluir credentials para CORS
        withCredentials: true,
      });

      this.setupEventListeners();

      // Esperar conexión
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout: No se pudo conectar al WebSocket"));
        }, 15000);

        this.socket!.on("connect", () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.log(`✅ WebSocket conectado como ${config.userType}`);
          console.log(`🔗 Socket ID: ${this.socket?.id}`);
          this.callbacks.onConnect?.();
          resolve();
        });

        this.socket!.on("connect_error", (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error("❌ Error de conexión WebSocket:", error);
          this.callbacks.onError?.(error);
          reject(error);
        });
      });

      this.startKeepAlive();
    } catch (error) {
      this.isConnecting = false;
      console.error("❌ Error conectando WebSocket:", error);
      throw error;
    }
  }

  /**
   * Configura los event listeners del WebSocket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Escuchar nuevos mensajes según el tipo de usuario
    const userType = this.config?.userType;
    const isSupport = userType === "support";

    if (isSupport) {
      // Para soporte, escuchar 'new_message_support'
      this.socket.on("new_message_support", (data: NewMessageEvent | any) => {
        this.notificationsReceived++;
        console.log(`📨 Mensaje de soporte #${this.notificationsReceived} recibido:`, data);

        // ✅ Normalizar datos: el backend puede enviar formato directo o formato anidado
        let normalizedData: NewMessageEvent;

        if (data.message && data.message.chat_id) {
          // ✅ Formato correcto ya viene del backend
          normalizedData = {
            message: data.message,
            channel: data.channel || "support",
            chat: data.chat,
          };
        } else if (data.data) {
          // ✅ Formato anidado (compatibilidad con formato antiguo)
          const nestedData = data.data;
          normalizedData = {
            message: {
              id: nestedData.message?.id || `temp_${Date.now()}`,
              from: nestedData.user_id || nestedData.message?.sender_id,
              to: nestedData.agent_id || "",
              chat_id: nestedData.chat_id,
              message: nestedData.message?.content || nestedData.message?.message || "",
              timestamp: nestedData.timestamp || nestedData.message?.created_at || new Date(),
              created_at: nestedData.message?.created_at || nestedData.timestamp || new Date(),
              ticket_id: nestedData.chat_id,
            },
            channel: "support",
            chat: data.chat,
          };
        } else {
          // ✅ Fallback: intentar usar datos directamente
          normalizedData = {
            message: data.message || data.message,
            channel: "support",
            chat: data.chat,
          };
        }

        this.callbacks.onNewMessage?.(normalizedData);
      });
    } else {
      // Para otros canales, escuchar 'new_message_chat'
      this.socket.on("new_message_chat", (data: NewMessageEvent) => {
        this.notificationsReceived++;
        console.log(`📨 Mensaje #${this.notificationsReceived} recibido:`, data);

        // Determinar tipo de canal desde el campo channel o por ticket_id
        const channelType = data.channel || (data.message.ticket_id ? "support" : "coach");
        console.log(`🎯 Canal detectado: ${channelType}`);

        this.callbacks.onNewMessage?.(data);
      });
    }

    // Escuchar historial de mensajes
    this.socket.on("messages_chat_history", (data: any) => {
      console.log(`📚 Historial de mensajes recibido:`, {
        chatId: data.chat_id,
        count: data.messages?.length || 0,
      });
      this.callbacks.onMessagesHistory?.(data);
    });

    // Escuchar notificaciones generales
    this.socket.on("notification", (data: any) => {
      this.notificationsReceived++;
      console.log(`🔔 Notificación #${this.notificationsReceived} recibida:`, data);
      this.callbacks.onNotification?.(data);
    });

    // ✅ NUEVO: Escuchar nuevas conversaciones disponibles
    this.socket.on("new_conversation_available", (data: { conversation: any }) => {
      console.log("📋 Nueva conversación disponible:", data);
      this.callbacks.onNewConversation?.(data);
    });

    // ✅ NUEVO: Escuchar cuando un participante es removido de un chat
    this.socket.on("participant_removed_from_chat", (data: { chat_id: string; participant_id: string }) => {
      console.log("❌ Participante removido del chat:", data);
      this.callbacks.onParticipantRemoved?.(data);
    });

    // Escuchar errores
    this.socket.on("error", (error: any) => {
      console.error("❌ Error del servidor WebSocket:", error);
      this.callbacks.onError?.(error);
    });

    // Escuchar desconexión
    this.socket.on("disconnect", (reason: string) => {
      console.log("🔌 WebSocket desconectado:", reason);
      this.isConnecting = false;
      this.stopKeepAlive();
      this.callbacks.onDisconnect?.(reason);

      // Si la desconexión es por error del servidor, no seguir intentando
      if (reason === "io server disconnect" || reason === "transport close") {
        console.warn("⚠️ Servidor WebSocket no disponible, deteniendo reconexiones");
        this.socket?.disconnect();
      }
    });
  }

  /**
   * Solicita el historial de mensajes para un chat
   */
  async getMessages(chatId: string, page: number = 1, limit: number = 100): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error("WebSocket no conectado");
    }

    console.log("📚 Solicitando historial de mensajes:", { chatId, page, limit });

    this.socket.emit("get_messages_chat", {
      chat_id: chatId,
      page,
      limit,
    });
  }

  /**
   * Marca mensajes como leídos a través del WebSocket
   */
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error("WebSocket no conectado");
    }

    // ✅ DETECTAR: Determinar si es soporte o chat normal según el namespace del usuario
    const isSupport = this.config?.userType === "support";
    const eventName = isSupport ? "update_message_support_read" : "update_message_chat_read";
    const responseEventName = isSupport ? "updated_message_support" : "updated_message_chat";

    console.log("✅ Marcando mensajes como leídos:", {
      chatId,
      messageIds: messageIds.length,
      namespace: isSupport ? "support" : "chat",
      eventName,
      responseEventName,
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout: El servidor no respondió al marcar mensajes"));
      }, 5000);

      // Escuchar confirmación
      const handleResponse = () => {
        clearTimeout(timeout);
        this.socket!.off(responseEventName, handleResponse);
        this.socket!.off("error", handleError);
        console.log("✅ Mensajes marcados como leídos exitosamente");
        resolve();
      };

      // Escuchar error
      const handleError = (error: any) => {
        clearTimeout(timeout);
        this.socket!.off(responseEventName, handleResponse);
        this.socket!.off("error", handleError);
        console.error("❌ Error marcando mensajes como leídos:", error);
        reject(new Error(error.message || "Error al marcar mensajes"));
      };

      this.socket!.once(responseEventName, handleResponse);
      this.socket!.once("error", handleError);

      // ✅ Enviar evento correcto según el namespace
      this.socket!.emit(eventName, {
        chat_id: chatId,
        messagesId: messageIds,
      });
    });
  }

  /**
   * Envía un mensaje a través del WebSocket
   */
  async sendMessage(data: MessageData): Promise<NewMessageEvent> {
    if (!this.socket?.connected) {
      throw new Error("WebSocket no conectado");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout: El servidor no respondió"));
      }, 10000);

      // Escuchar confirmación (evento genérico para todos los canales)
      const handleResponse = (response: NewMessageEvent) => {
        clearTimeout(timeout);
        this.socket!.off("new_message_chat", handleResponse);
        this.socket!.off("error", handleError);
        console.log("✅ Mensaje enviado exitosamente:", response);
        resolve(response);
      };

      // Escuchar error
      const handleError = (error: any) => {
        clearTimeout(timeout);
        this.socket!.off("new_message_chat", handleResponse);
        this.socket!.off("error", handleError);
        console.error("❌ Error enviando mensaje:", error);
        reject(new Error(error.message || "Error al enviar mensaje"));
      };

      // ✅ Determinar eventos según el tipo de usuario
      const userType = this.getUserType();
      const isSupport = userType === "support";

      // Escuchar respuesta según el tipo de usuario
      if (isSupport) {
        // Para soporte, escuchar 'new_message_support'
        this.socket!.once("new_message_support", handleResponse);
      } else {
        // Para otros canales, escuchar 'new_message_chat'
        this.socket!.once("new_message_chat", handleResponse);
      }
      this.socket!.once("error", handleError);

      // Enviar mensaje con el evento correcto según el tipo de usuario
      console.log("📤 Enviando mensaje:", data);
      console.log(
        `📤 Tipo de usuario: ${userType}, usando evento: ${isSupport ? "add_message_support" : "add_message_chat"}`,
      );

      if (isSupport) {
        // Para soporte, usar 'add_message_support'
        this.socket!.emit("add_message_support", data);
      } else {
        // Para otros canales, usar 'add_message_chat'
        this.socket!.emit("add_message_chat", data);
      }
    });
  }

  /**
   * Inicia el keep-alive para mantener la conexión activa
   */
  private startKeepAlive(): void {
    this.keepAliveInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log(`💓 WebSocket activo - Notificaciones: ${this.notificationsReceived}`);
      } else {
        this.stopKeepAlive();
      }
    }, 30000);
  }

  /**
   * Detiene el keep-alive
   */
  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Desconecta del WebSocket
   */
  disconnect(): void {
    console.log("🛑 Desconectando WebSocket...");
    this.stopKeepAlive();
    this.isConnecting = false;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Obtiene el número de notificaciones recibidas
   */
  getNotificationsReceived(): number {
    return this.notificationsReceived;
  }

  /**
   * Obtiene el tipo de usuario actual
   */
  getUserType(): UserType | null {
    return this.config?.userType || null;
  }

  /**
   * Obtiene el socket ID
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

export const websocketService = new WebSocketService();
