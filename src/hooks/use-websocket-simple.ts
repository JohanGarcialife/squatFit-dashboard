"use client";

import { useEffect, useState, useCallback } from "react";

import { toast } from "sonner";

import { webSocketSimple } from "@/lib/services/websocket-simple";

/**
 * Hook SIMPLE para WebSocket basado EXACTAMENTE en el script funcional
 * Sin complicaciones, sin múltiples estados, sin conflictos
 */

export const useWebSocketSimple = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsReceived, setNotificationsReceived] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Callback para notificaciones
  const handleNotification = useCallback((notification: any) => {
    setNotifications((prev) => [notification, ...prev]);
    setNotificationsReceived((prev) => prev + 1);

    // Mostrar toast con más información
    if (notification.type === "new_message") {
      const { chatId, message, userId, timestamp } = notification.data;

      // Crear un toast más informativo
      const messagePreview =
        message && message.length > 50 ? message.substring(0, 50) + "..." : (message ?? "Mensaje recibido");

      toast.success(`💬 Nuevo mensaje`, {
        description: messagePreview,
        duration: 5000,
        action: {
          label: "Ver chat",
          onClick: () => {
            console.log("🔍 Navegando al chat:", chatId);
            // Aquí podrías implementar navegación al chat específico
            // Por ejemplo, usando el contexto de chat para seleccionar la conversación
          },
        },
      });

      console.log("🔔 Toast mostrado para mensaje:", {
        chatId,
        messagePreview,
        userId,
        timestamp,
      });

      // DISPARAR EVENTO PERSONALIZADO para que el contexto de chat lo capture
      const customEvent = new CustomEvent("websocket-message", {
        detail: notification,
      });
      window.dispatchEvent(customEvent);
    } else {
      toast.info("🔔 Nueva notificación", {
        description: notification.data?.message ?? "Notificación recibida",
        duration: 3000,
      });
    }
  }, []);

  // Callback para conexión exitosa
  const handleConnected = useCallback((data: any) => {
    setIsConnected(true);
    setIsConnecting(false);
    setError(null);
    toast.success("WebSocket conectado", {
      description: "Notificaciones en tiempo real activas",
      duration: 3000,
    });
  }, []);

  // Callback para errores
  const handleError = useCallback((error: any) => {
    setError(error?.message ?? "Error de conexión");
    setIsConnected(false);
    setIsConnecting(false);
    toast.error("Error WebSocket", {
      description: error?.message ?? "Error de conexión",
      duration: 5000,
    });
  }, []);

  // Callback para desconexión
  const handleDisconnect = useCallback((reason: string) => {
    setIsConnected(false);
    setIsConnecting(false);
    console.log("🔌 WebSocket desconectado:", reason);
  }, []);

  // Función para conectar
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      await webSocketSimple.connect({
        onNotification: handleNotification,
        onConnected: handleConnected,
        onError: handleError,
        onDisconnect: handleDisconnect,
      });
    } catch (error) {
      console.error("Error conectando:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      setIsConnecting(false);
    }
  }, [handleNotification, handleConnected, handleError, handleDisconnect]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    webSocketSimple.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Función para limpiar notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setNotificationsReceived(0);
  }, []);

  // Conexión automática con delay para asegurar que el token esté disponible
  useEffect(() => {
    // Delay reducido para conexión más rápida
    const timer = setTimeout(() => {
      connect();
    }, 500); // 500ms de delay (reducido de 2000ms)

    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  // Actualizar estado de conexión periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = webSocketSimple.isConnected();
      const connecting = webSocketSimple.isConnectingState();
      const received = webSocketSimple.getNotificationsReceived();

      setIsConnected(connected);
      setIsConnecting(connecting);
      setNotificationsReceived(received);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isConnecting,
    notifications,
    notificationsReceived,
    error,
    connect,
    disconnect,
    clearNotifications,
  };
};
