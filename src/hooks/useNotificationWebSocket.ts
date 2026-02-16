import { useState, useCallback, useEffect } from "react";

import { jwtDecode } from "jwt-decode";
import { io, Socket } from "socket.io-client";

import { getAuthToken } from "@/lib/auth";
import { rolesConfigService } from "@/lib/services/roles-config.service";

interface UseNotificationWebSocketOptions {
  onNewMessage?: (data: any) => void;
  onMessageRead?: (data: any) => void;
  onCoachAssigned?: (data: any) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

interface DecodedToken {
  id: string;
  role?: {
    id: string;
    name: string;
  };
}

/**
 * Hook para conectarse al gateway de notificaciones (/notifications)
 *
 * Este hook maneja la conexión al namespace de notificaciones del backend,
 * que es donde se envían las alertas cuando un usuario envía un mensaje.
 *
 * Diferencia con useChatWebSocket:
 * - useChatWebSocket (/messages-chat): Para enviar/recibir mensajes en un chat activo
 * - useNotificationWebSocket (/notifications): Para recibir alertas de "alguien te escribió"
 *
 * @param options - Opciones de configuración y callbacks
 * @returns Estado de conexión y métodos de control
 */
export function useNotificationWebSocket(options: UseNotificationWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [notificationsReceived, setNotificationsReceived] = useState(0);

  /**
   * Detecta el tipo de usuario desde el token JWT con mapeo dinámico
   */
  const getUserRole = useCallback(async (): Promise<"coach" | "dietitian" | "support"> => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('⚠️ No hay token, usando "coach" por defecto');
        return "coach";
      }

      const decoded = jwtDecode<DecodedToken>(token);
      const roleName = decoded.role?.name?.toLowerCase();

      if (!roleName) {
        console.warn('⚠️ No se pudo extraer rol del token, usando "coach" por defecto');
        return "coach";
      }

      // Obtener mapeo dinámico desde el backend
      const roleMapping = await rolesConfigService.getRoleMapping(roleName);
      console.log(`🎯 [Notifications] Rol detectado dinámicamente: ${roleName} → ${roleMapping.uiRole}`);

      // Filtrar solo los tipos permitidos
      const uiRole = roleMapping.uiRole;
      if (uiRole === "coach" || uiRole === "dietitian" || uiRole === "support") {
        return uiRole;
      }
      return "coach";
    } catch (error) {
      console.error("❌ Error obteniendo rol dinámico:", error);
      return "coach";
    }
  }, []);

  /**
   * Conecta al gateway de notificaciones
   */
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      console.log("⚠️ useNotificationWebSocket: Ya conectado o conectando");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const userRole = await getUserRole();
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

      console.log(`🔔 Conectando al gateway de notificaciones como ${userRole} (dinámico)...`);

      // ✅ Conectar al namespace de notificaciones
      const socket = io(`${url}/notifications`, {
        extraHeaders: {
          from: userRole,
          platform: "web",
          authorization: `Bearer ${token}`,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 3,
        timeout: 10000,
      });

      // Evento: Conexión exitosa
      socket.on("connect", () => {
        console.log(`✅ Conectado al gateway de notificaciones (${userRole})`);
        console.log(`🔗 Socket ID: ${socket.id}`);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);

        // ✅ Registrarse como profesional
        // El backend tiene eventos legacy 'coach_register' y 'agent_register'
        // pero detecta automáticamente el rol desde el token
        if (userRole === "coach" || userRole === "dietitian") {
          socket.emit("coach_register", {
            assignedChats: [],
          });
        } else if (userRole === "support") {
          socket.emit("agent_register", {
            activeTickets: [],
          });
        }
      });

      // Evento: Registro exitoso
      socket.on("coach_registered", (data) => {
        console.log("✅ Registrado como coach/dietitian en notificaciones:", data);
      });

      socket.on("agent_registered", (data) => {
        console.log("✅ Registrado como support en notificaciones:", data);
      });

      // Evento: Nueva notificación
      socket.on("notification", (notification) => {
        console.log("🔔 Notificación recibida:", notification);
        setNotificationsReceived((prev) => prev + 1);

        // Despachar según el tipo de notificación
        switch (notification.type) {
          case "new_message":
            options.onNewMessage?.(notification.data);
            break;
          case "message_read":
            options.onMessageRead?.(notification.data);
            break;
          case "coach_assigned":
            options.onCoachAssigned?.(notification.data);
            break;
          default:
            console.log("Notificación de tipo desconocido:", notification.type);
        }
      });

      // Evento: Conexión establecida (legacy, para compatibilidad)
      socket.on("connected", (data) => {
        console.log("✅ Evento connected recibido:", data);
      });

      // Evento: Desconexión
      socket.on("disconnect", (reason) => {
        console.log("🔌 Desconectado de notificaciones:", reason);
        setIsConnected(false);
        setIsConnecting(false);
      });

      // Evento: Error de conexión
      socket.on("connect_error", (err) => {
        console.error("❌ Error conectando a notificaciones:", err);
        const error = new Error(`Error de conexión: ${err.message}`);
        setError(error);
        setIsConnecting(false);
        setIsConnected(false);
        options.onError?.(error);
      });

      // Evento: Error general
      socket.on("error", (err) => {
        console.error("❌ Error en gateway de notificaciones:", err);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
      });

      setNotificationSocket(socket);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("❌ Error conectando a notificaciones:", error);
      setError(error);
      setIsConnecting(false);
      setIsConnected(false);
      options.onError?.(error);
    }
  }, [isConnecting, isConnected, getUserRole, options]);

  /**
   * Desconecta del gateway de notificaciones
   */
  const disconnect = useCallback(() => {
    if (notificationSocket) {
      console.log("🔌 Desconectando del gateway de notificaciones...");
      notificationSocket.disconnect();
      setNotificationSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [notificationSocket]);

  /**
   * Reconecta al gateway
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [connect, disconnect]);

  // Auto-conectar si está habilitado
  useEffect(() => {
    if (options.autoConnect) {
      // Delay de 500ms para evitar conexión simultánea con chat
      const timer = setTimeout(() => connect(), 500);
      return () => clearTimeout(timer);
    }
  }, [options.autoConnect, connect]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    reconnect,
    isConnected,
    isConnecting,
    error,
    notificationsReceived,
    socket: notificationSocket,
  };
}
