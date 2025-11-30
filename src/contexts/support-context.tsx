"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";

import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { getAuthToken } from "@/lib/auth/auth-utils";
import { SupportService, getInitials } from "@/lib/services/support-service";
import { Ticket, SupportMessage, SupportStats, SendSupportMessageData } from "@/lib/services/support-types";
import { websocketService } from "@/lib/services/websocket.service";

interface SupportContextType {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  messages: SupportMessage[];
  stats: SupportStats | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  isMarkingAsRead: boolean;
  selectTicket: (ticketId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  refreshTickets: () => Promise<void>;
  loadTickets: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  refreshStats: () => Promise<void>;
  getCurrentUserId: () => string | null;
  getSelectedTicketInitials: () => string;
  hasUnreadMessages: () => boolean;
  getTotalUnreadCount: () => number;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

interface SupportProviderProps {
  children: React.ReactNode;
}

export function SupportProvider({ children }: SupportProviderProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isSelectingTicket, setIsSelectingTicket] = useState(false);

  const selectTicketTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingMessages = useRef(false);
  const messagesCache = useRef<Map<string, SupportMessage[]>>(new Map());
  const isLoadingTickets = useRef(false);
  const hasInitialized = useRef(false);
  const isSendingMessage = useRef(false);
  const lastSelectedTicket = useRef<string | null>(null);
  const requestThrottle = useRef<Map<string, number>>(new Map());
  const lastTicketLoad = useRef<number>(0);
  const isInitializing = useRef(false);

  // ========================================================================
  // FUNCIONES DE UTILIDAD
  // ========================================================================

  /**
   * Obtiene el ID del usuario actual del token JWT
   */
  const getCurrentUserId = useCallback(() => {
    try {
      const token = getAuthToken();
      if (token) {
        const decoded: any = jwtDecode(token);
        return decoded.sub ?? decoded.id;
      }
    } catch (error) {
      console.error("Error obteniendo ID del usuario actual:", error);
    }
    return null;
  }, []);

  /**
   * Maneja errores de manera consistente
   */
  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;

    // No mostrar toast para errores de autenticación
    if (errorMessage === "Unauthorized") {
      setError(null);
      return;
    }

    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================================
  // FUNCIONES DE REFRESH
  // ========================================================================

  /**
   * Recarga la lista de tickets desde el backend
   */
  const refreshTickets = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const agentId = getCurrentUserId();
      if (!agentId) {
        throw new Error("No se pudo obtener el ID del agente");
      }

      const data = await SupportService.getTickets(agentId);
      setTickets(data);
      setIsConnected(true);

      console.log(`✅ SupportContext: Cargados ${data.length} tickets`);
    } catch (err) {
      handleError(err, "Error cargando tickets");
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError, getCurrentUserId]);

  /**
   * Carga tickets - lógica original simple
   */
  const loadTickets = useCallback(async () => {
    // Evitar llamadas simultáneas
    if (isLoadingTickets.current || isInitializing.current) {
      console.log("⚠️ SupportContext: Ya cargando tickets o inicializando");
      return;
    }

    // Si ya hay tickets cargados, no volver a cargar
    if (tickets.length > 0) {
      console.log("⚠️ SupportContext: Tickets ya cargados, saltando");
      return;
    }

    try {
      isInitializing.current = true;
      isLoadingTickets.current = true;
      setLoading(true);
      clearError();

      console.log("🔄 SupportContext: Iniciando carga de tickets...");

      const agentId = getCurrentUserId();
      if (!agentId) {
        throw new Error("No se pudo obtener el ID del agente");
      }

      const data = await SupportService.getTickets(agentId);
      setTickets(data);
      setIsConnected(true);

      console.log(`✅ SupportContext: Cargados ${data.length} tickets`);
    } catch (err) {
      console.error("❌ SupportContext: Error cargando tickets:", err);
      handleError(err, "Error cargando tickets");
      setIsConnected(false);
    } finally {
      setLoading(false);
      isLoadingTickets.current = false;
      isInitializing.current = false;
    }
  }, [handleError, clearError, tickets.length, getCurrentUserId]);

  /**
   * Recarga los mensajes del ticket actual
   */
  const refreshMessages = useCallback(async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      clearError();

      const data = await SupportService.getMessages(selectedTicket.id);
      setMessages(data);
    } catch (err) {
      handleError(err, "Error cargando mensajes");
    } finally {
      setLoading(false);
    }
  }, [selectedTicket, handleError, clearError]);

  /**
   * Recarga las estadísticas de soporte
   */
  const refreshStats = useCallback(async () => {
    try {
      const data = await SupportService.getStats();
      setStats(data);
      console.log("✅ Estadísticas actualizadas:", data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  }, []);

  // ========================================================================
  // FUNCIONES PRINCIPALES
  // ========================================================================

  /**
   * Selecciona un ticket y carga sus mensajes
   */
  const selectTicket = useCallback(
    async (ticketId: string) => {
      if (!ticketId || typeof ticketId !== "string" || ticketId.trim() === "") {
        handleError(new Error("ID de ticket inválido"), "ID de ticket inválido");
        return;
      }

      // Evitar selección del mismo ticket
      if (selectedTicket?.id === ticketId || lastSelectedTicket.current === ticketId) {
        console.log("⚠️ SupportContext: Ticket ya seleccionado:", ticketId);
        return;
      }

      // Throttling: evitar múltiples llamadas en menos de 1 segundo
      const now = Date.now();
      const lastRequest = requestThrottle.current.get(ticketId);
      if (lastRequest && now - lastRequest < 1000) {
        console.log("⚠️ SupportContext: Throttling request para ticket:", ticketId);
        return;
      }
      requestThrottle.current.set(ticketId, now);

      if (isSelectingTicket || isLoadingMessages.current) {
        console.log("⚠️ SupportContext: Ya hay una selección en progreso");
        return;
      }

      // Limpiar timeout anterior
      if (selectTicketTimeoutRef.current) {
        clearTimeout(selectTicketTimeoutRef.current);
      }

      setIsSelectingTicket(true);

      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) {
        handleError(new Error("Ticket no encontrado"), "Ticket no encontrado");
        setIsSelectingTicket(false);
        return;
      }

      try {
        console.log("🎫 SupportContext: Seleccionando ticket:", ticketId);
        console.log("👤 SupportContext: Ticket user_id:", ticket.user_id);
        console.log("📋 SupportContext: Ticket completo:", ticket);
        setSelectedTicket(ticket);
        lastSelectedTicket.current = ticketId;

        // Intentar cargar desde cache (como chat de coach)
        const cachedMessages = messagesCache.current.get(ticketId);
        console.log("💾 SupportContext: Mensajes en cache:", cachedMessages?.length ?? 0);

        if (cachedMessages && cachedMessages.length > 0) {
          console.log("✅ SupportContext: Usando mensajes del cache");
          setMessages(cachedMessages);
          setIsSelectingTicket(false);
          return;
        }

        // Cargar mensajes desde la API con timeout (como chat de coach)
        console.log("🌐 SupportContext: Cargando mensajes desde API...");
        selectTicketTimeoutRef.current = setTimeout(async () => {
          if (isLoadingMessages.current) {
            console.log("⏭️ SupportContext: Ya hay una carga en progreso");
            setIsSelectingTicket(false);
            return;
          }

          try {
            isLoadingMessages.current = true;
            console.log("📥 SupportContext: Iniciando petición de mensajes...");
            const data = await SupportService.getMessages(ticketId);
            console.log("📥 SupportContext: Mensajes recibidos:", data.length, data);

            // Guardar en cache (como chat de coach)
            messagesCache.current.set(ticketId, data);
            setMessages(data);
            console.log("✅ SupportContext: Mensajes establecidos en el estado");
          } catch (err) {
            console.error("❌ SupportContext: Error cargando mensajes:", err);

            // Si es un error de throttling, intentar usar cache si está disponible (como chat de coach)
            if (err instanceof Error && (err.message.includes("ThrottlerException") || err.message.includes("429"))) {
              console.warn("⚠️ SupportContext: Throttling detectado, intentando usar cache...");

              const cachedMessages = messagesCache.current.get(ticketId);
              if (cachedMessages && cachedMessages.length > 0) {
                console.log("📨 SupportContext: Usando mensajes del cache por throttling");
                setMessages(cachedMessages);
                setIsSelectingTicket(false);
                return;
              } else {
                console.log("📨 SupportContext: No hay cache disponible");
              }
            }

            setMessages([]);
            handleError(err, "Error cargando mensajes");
          } finally {
            setIsSelectingTicket(false);
            isLoadingMessages.current = false;
          }
        }, 1000); // Timeout de 1 segundo como chat de coach
      } catch (err) {
        console.error("❌ SupportContext: Error seleccionando ticket:", err);
        handleError(err, "Error seleccionando ticket");
        setIsSelectingTicket(false);
      }
    },
    [tickets, handleError, selectedTicket, isSelectingTicket],
  );

  /**
   * Envía un mensaje al ticket seleccionado vía WebSocket
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (isSendingMessage.current) {
        console.log("⏭️ SupportContext: Ya se está enviando un mensaje");
        return;
      }

      if (!selectedTicket) {
        handleError(new Error("No hay ticket seleccionado"), "Selecciona un ticket primero");
        return;
      }

      if (!content.trim()) {
        handleError(new Error("El mensaje no puede estar vacío"), "El mensaje no puede estar vacío");
        return;
      }

      // Verificar que el ticket tenga user_id
      if (!selectedTicket.user_id) {
        handleError(new Error("El ticket no tiene usuario asignado"), "Error en el ticket");
        return;
      }

      try {
        isSendingMessage.current = true;
        setLoading(true);
        clearError();

        const currentUserId = getCurrentUserId();
        if (!currentUserId) {
          throw new Error("No se pudo obtener el ID del usuario");
        }

        // Log del estado del WebSocket
        console.log("🔌 SupportContext: Estado WebSocket:", {
          isConnected: websocketService.isConnected(),
          socketId: websocketService.getSocketId(),
          ticketId: selectedTicket.id,
          userId: selectedTicket.user_id,
          currentUserId,
        });

        // ⚠️ IMPORTANTE: Usar SOLO WebSocket según la guía actualizada
        // El endpoint HTTP POST ya no existe
        console.log("🔌 SupportContext: Enviando mensaje vía WebSocket:", {
          chat_id: selectedTicket.id,
          to: selectedTicket.user_id,
          message: content.trim(),
        });

        // Crear mensaje optimista
        const tempId = `temp-${Date.now()}`;
        const tempMessage: SupportMessage = {
          id: tempId,
          ticket_id: selectedTicket.id,
          sender_id: currentUserId,
          content: content.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Agregar mensaje temporalmente (optimistic update)
        setMessages((prev) => [...prev, tempMessage]);

        // Enviar vía WebSocket usando el servicio unificado
        if (!websocketService.isConnected()) {
          // Conectar si no está conectado
          const token = getAuthToken();
          if (token) {
            await websocketService.connect({
              url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000",
              token: token,
              userType: "support", // IMPORTANTE: 'support' para soporte
              platform: "web",
            });
          }
        }

        // Enviar mensaje vía WebSocket
        const response = await websocketService.sendMessage({
          chat_id: selectedTicket.id, // UUID del ticket
          to: selectedTicket.user_id, // UUID del usuario
          message: content.trim(),
        });

        console.log("✅ SupportContext: Mensaje enviado vía WebSocket:", response);

        // Actualizar mensaje temporal con el real
        const newMessage: SupportMessage = {
          id: response.message.id,
          ticket_id: selectedTicket.id,
          sender_id: response.message.from,
          content: response.message.message,
          is_read: false,
          created_at:
            typeof response.message.timestamp === "string"
              ? response.message.timestamp
              : new Date(response.message.timestamp).toISOString(),
          updated_at:
            typeof response.message.timestamp === "string"
              ? response.message.timestamp
              : new Date(response.message.timestamp).toISOString(),
        };

        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? newMessage : msg)));

        // Actualizar cache
        messagesCache.current.set(
          selectedTicket.id,
          messagesCache.current.get(selectedTicket.id)?.map((msg) => (msg.id === tempId ? newMessage : msg)) || [
            newMessage,
          ],
        );

        toast.success("Mensaje enviado");

        // Actualizar el ticket con el último mensaje
        setTickets((prev) =>
          prev.map((ticket) => {
            if (ticket.id === selectedTicket.id) {
              return {
                ...ticket,
                updated_at: new Date().toISOString(),
              };
            }
            return ticket;
          }),
        );
      } catch (err) {
        console.error("❌ SupportContext: Error enviando mensaje:", err);
        handleError(err, "Error enviando mensaje");
      } finally {
        setLoading(false);
        isSendingMessage.current = false;
      }
    },
    [selectedTicket, handleError, clearError, getCurrentUserId],
  );

  // ========================================================================
  // FUNCIONES DE UTILIDAD DEL CONTEXTO
  // ========================================================================

  /**
   * Obtiene las iniciales del ticket seleccionado
   */
  const getSelectedTicketInitials = useCallback(() => {
    if (!selectedTicket) return "??";
    return getInitials(selectedTicket.user?.email ?? selectedTicket.title);
  }, [selectedTicket]);

  /**
   * Verifica si hay mensajes no leídos en cualquier ticket
   */
  const hasUnreadMessages = useCallback(() => {
    return tickets.some((ticket) => (ticket.unread ?? 0) > 0);
  }, [tickets]);

  /**
   * Obtiene el total de mensajes no leídos
   */
  const getTotalUnreadCount = useCallback(() => {
    return tickets.reduce((total, ticket) => total + (ticket.unread ?? 0), 0);
  }, [tickets]);

  // ========================================================================
  // EFECTOS
  // ========================================================================

  /**
   * Efecto para manejar eventos personalizados de WebSocket para soporte
   */
  useEffect(() => {
    const handleWebSocketSupportMessage = (event: any) => {
      console.log("🔔 SupportContext: Notificación de WebSocket recibida", event.detail);
      const notification = event.detail;

      if (notification.type === "new_message_coach") {
        // Extraer datos del mensaje según el nuevo formato
        const messageData = notification.data.message || notification.data;
        const chatData = notification.data.chat;

        const ticketId = messageData.chat_id || chatData?.id;
        const message = messageData.message || messageData.content;
        const userId = messageData.from || messageData.sender_id;
        const timestamp = messageData.timestamp || messageData.created_at;
        const messageId = messageData.id;

        // Determinar si es un mensaje de soporte
        const isSupport = ticketId && ticketId.length > 20; // UUID tiene más de 20 caracteres

        if (!isSupport && chatData?.type !== "support") {
          // No es un mensaje de soporte, ignorar
          return;
        }

        console.log("📨 SupportContext: Nuevo mensaje de soporte:", {
          ticketId,
          message,
          userId,
          timestamp,
          messageId,
        });

        // Crear nuevo mensaje
        const newMessage: SupportMessage = {
          id: messageId || `ws-${Date.now()}`,
          ticket_id: ticketId,
          sender_id: userId,
          content: message,
          is_read: false,
          created_at: timestamp ?? new Date().toISOString(),
          updated_at: timestamp ?? new Date().toISOString(),
        };

        // Si es el ticket seleccionado, agregar el mensaje
        if (selectedTicket && selectedTicket.id === ticketId) {
          setMessages((prev) => {
            // Verificar duplicados
            const isDuplicate = prev.some((msg) => msg.content === message && msg.sender_id === userId);
            if (isDuplicate) {
              console.log("⚠️ SupportContext: Mensaje duplicado, ignorando");
              return prev;
            }
            return [...prev, newMessage];
          });
        }

        // Actualizar cache
        const cachedMessages = messagesCache.current.get(ticketId) ?? [];
        messagesCache.current.set(ticketId, [...cachedMessages, newMessage]);

        // Actualizar el ticket en la lista
        setTickets((prev) =>
          prev.map((ticket) => {
            if (ticket.id === ticketId) {
              return {
                ...ticket,
                lastMessage: newMessage,
                updated_at: timestamp ?? new Date().toISOString(),
                unread: (ticket.unread ?? 0) + 1,
              };
            }
            return ticket;
          }),
        );
      }
    };

    // Agregar listener para eventos personalizados
    window.addEventListener("websocket-support-message", handleWebSocketSupportMessage);

    // Cleanup
    return () => {
      window.removeEventListener("websocket-support-message", handleWebSocketSupportMessage);
    };
  }, [selectedTicket]);

  /**
   * Cargar datos iniciales al montar el componente
   */
  useEffect(() => {
    const initializeSupport = async () => {
      if (hasInitialized.current || isLoadingTickets.current) {
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.log("Support: No hay token disponible");
        setIsConnected(false);
        return;
      }

      try {
        hasInitialized.current = true;
        // Usar loadTickets (versión simple sin retry) para evitar throttling (como chat de coach)
        await loadTickets();
        console.log("✅ SupportContext: Inicialización completada");
      } catch (error) {
        console.error("Error inicializando soporte:", error);
        setIsConnected(false);
        hasInitialized.current = false;
      }
    };

    initializeSupport();
  }, [loadTickets]);

  /**
   * Cleanup del timeout
   */
  useEffect(() => {
    return () => {
      if (selectTicketTimeoutRef.current) {
        clearTimeout(selectTicketTimeoutRef.current);
      }
    };
  }, []);

  // ========================================================================
  // VALOR DEL CONTEXTO
  // ========================================================================

  const contextValue = useMemo(
    () => ({
      tickets,
      selectedTicket,
      messages,
      stats,
      loading,
      error,
      isConnected,
      isMarkingAsRead,
      selectTicket,
      sendMessage,
      refreshTickets,
      loadTickets,
      refreshMessages,
      refreshStats,
      getCurrentUserId,
      getSelectedTicketInitials,
      hasUnreadMessages,
      getTotalUnreadCount,
    }),
    [
      tickets,
      selectedTicket,
      messages,
      stats,
      loading,
      error,
      isConnected,
      isMarkingAsRead,
      selectTicket,
      sendMessage,
      refreshTickets,
      loadTickets,
      refreshMessages,
      refreshStats,
      getCurrentUserId,
      getSelectedTicketInitials,
      hasUnreadMessages,
      getTotalUnreadCount,
    ],
  );

  return <SupportContext.Provider value={contextValue}>{children}</SupportContext.Provider>;
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export const useSupport = (): SupportContextType => {
  const context = useContext(SupportContext);

  if (context === undefined) {
    throw new Error("useSupport must be used within a SupportProvider");
  }

  return context;
};
