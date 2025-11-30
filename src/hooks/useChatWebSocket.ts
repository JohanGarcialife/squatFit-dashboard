import { useEffect, useState, useCallback } from "react";

import { getAuthToken, getCurrentUser } from "@/lib/auth/auth-utils";
import { rolesConfigService } from "@/lib/services/roles-config.service";
import { websocketService, WebSocketConfig, MessageData, NewMessageEvent } from "@/lib/services/websocket.service";

interface UseChatWebSocketOptions {
  autoConnect?: boolean;
  onNewMessage?: (data: NewMessageEvent) => void;
  onMessagesHistory?: (data: { chat_id: string; messages: any[]; total: number }) => void;
  onError?: (error: Error) => void;
  onNewConversation?: (data: { conversation: any }) => void;
  onParticipantRemoved?: (data: { chat_id: string; participant_id: string }) => void;
}

/**
 * Hook genérico para WebSocket de Chat
 * Detecta automáticamente el rol del usuario (coach/dietitian/support/user)
 * Maneja la conexión y comunicación para todos los canales
 */
export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notificationsReceived, setNotificationsReceived] = useState(0);

  // Detectar el tipo de usuario desde el token JWT con mapeo dinámico
  const getUserType = async (): Promise<"coach" | "dietitian" | "support"> => {
    const user = getCurrentUser();

    if (!user || !user.role) {
      console.warn('⚠️ No se pudo detectar el rol del usuario, usando "coach" por defecto');
      return "coach";
    }

    try {
      // Obtener mapeo dinámico desde el backend
      const roleMapping = await rolesConfigService.getRoleMapping(user.role.toLowerCase());
      console.log(`🎯 Rol detectado dinámicamente: ${user.role} → userType: ${roleMapping.uiRole}`);

      // Filtrar solo los tipos permitidos
      const allowedTypes = ["coach", "dietitian", "support"] as const;
      const uiRole = roleMapping.uiRole;
      if (uiRole === "coach" || uiRole === "dietitian" || uiRole === "support") {
        return uiRole;
      }
      return "coach";
    } catch (error) {
      console.warn('⚠️ Error obteniendo mapeo dinámico de rol, usando "coach" por defecto:', error);
      return "coach";
    }
  };

  // Conectar al WebSocket (detecta automáticamente el rol)
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      console.log("⚠️ useChatWebSocket: Ya conectado o conectando");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay token de autenticación disponible");
      }

      const userType = await getUserType();

      const config: WebSocketConfig = {
        url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000",
        token: token,
        userType: userType, // Detectado dinámicamente del token JWT desde el backend
        platform: "web",
      };

      await websocketService.connect(config, {
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          console.log(`✅ WebSocket conectado como ${userType}`);
        },
        onDisconnect: (reason) => {
          setIsConnected(false);
          setIsConnecting(false);
          console.log("🔌 Chat WebSocket desconectado:", reason);
        },
        onError: (error) => {
          setIsConnected(false);
          setIsConnecting(false);
          setError(error);
          options.onError?.(error);
          console.error("❌ Error Chat WebSocket:", error);
        },
        onNewMessage: (data) => {
          setNotificationsReceived((prev) => prev + 1);
          options.onNewMessage?.(data);
        },
        onMessagesHistory: (data) => {
          options.onMessagesHistory?.(data);
        },
        onNewConversation: (data) => {
          options.onNewConversation?.(data);
        },
        onParticipantRemoved: (data) => {
          options.onParticipantRemoved?.(data);
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      setError(error);
      setIsConnecting(false);
      setIsConnected(false);
      options.onError?.(error);
      console.error("❌ Error conectando Chat WebSocket:", error);
    }
  }, [isConnecting, isConnected, options]);

  // Desconectar
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    console.log("🔌 Chat WebSocket desconectado");
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (data: MessageData) => {
      if (!isConnected) {
        throw new Error("WebSocket no conectado");
      }

      try {
        const response = await websocketService.sendMessage(data);
        console.log("✅ Mensaje de chat enviado:", response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error enviando mensaje");
        setError(error);
        options.onError?.(error);
        throw error;
      }
    },
    [isConnected, options],
  );

  // Obtener mensajes de un chat
  const getMessages = useCallback(
    async (chatId: string, page: number = 1, limit: number = 100) => {
      if (!isConnected) {
        throw new Error("WebSocket no conectado");
      }

      try {
        await websocketService.getMessages(chatId, page, limit);
        console.log("✅ Historial de mensajes solicitado para chat:", chatId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error obteniendo mensajes");
        setError(error);
        options.onError?.(error);
        throw error;
      }
    },
    [isConnected, options],
  );

  // Auto-conectar si está habilitado
  useEffect(() => {
    if (options.autoConnect) {
      // Conectar con un pequeño delay para evitar errores en desarrollo
      const timer = setTimeout(() => {
        connect().catch((err) => {
          console.warn("⚠️ No se pudo conectar al WebSocket:", err.message);
          // No lanzar error, solo advertir
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        disconnect();
      };
    }
  }, [options.autoConnect]);

  // Actualizar estado de notificaciones
  useEffect(() => {
    const interval = setInterval(() => {
      if (websocketService.isConnected()) {
        setNotificationsReceived(websocketService.getNotificationsReceived());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    notificationsReceived,
    connect,
    disconnect,
    sendMessage,
    getMessages,
  };
}
