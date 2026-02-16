import { useEffect, useState, useCallback } from "react";

import { getAuthToken } from "@/lib/auth/auth-utils";
import { websocketService, WebSocketConfig, MessageData, NewMessageEvent } from "@/lib/services/websocket.service";

interface UseSupportWebSocketOptions {
  autoConnect?: boolean;
  onNewMessage?: (data: NewMessageEvent) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook específico para WebSocket de Soporte
 * Maneja la conexión y comunicación para el canal de soporte
 */
export function useSupportWebSocket(options: UseSupportWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notificationsReceived, setNotificationsReceived] = useState(0);

  // Conectar al WebSocket como soporte
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      console.log("⚠️ useSupportWebSocket: Ya conectado o conectando");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay token de autenticación disponible");
      }

      const config: WebSocketConfig = {
        url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000",
        token: token,
        userType: "support",
        platform: "web",
      };

      await websocketService.connect(config, {
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          console.log("✅ Support WebSocket conectado");
        },
        onDisconnect: (reason) => {
          setIsConnected(false);
          setIsConnecting(false);
          console.log("🔌 Support WebSocket desconectado:", reason);
        },
        onError: (error) => {
          setIsConnected(false);
          setIsConnecting(false);
          setError(error);
          options.onError?.(error);
          console.error("❌ Error Support WebSocket:", error);
        },
        onNewMessage: (data) => {
          setNotificationsReceived((prev) => prev + 1);
          options.onNewMessage?.(data);
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      setError(error);
      setIsConnecting(false);
      setIsConnected(false);
      options.onError?.(error);
      console.error("❌ Error conectando Support WebSocket:", error);
    }
  }, [isConnecting, isConnected, options]);

  // Desconectar
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    console.log("🔌 Support WebSocket desconectado");
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (data: MessageData) => {
      if (!isConnected) {
        throw new Error("WebSocket no conectado");
      }

      try {
        const response = await websocketService.sendMessage(data);
        console.log("✅ Mensaje de soporte enviado:", response);
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

  // Auto-conectar si está habilitado
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }

    return () => {
      if (options.autoConnect) {
        disconnect();
      }
    };
  }, [options.autoConnect, connect, disconnect]);

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
  };
}
