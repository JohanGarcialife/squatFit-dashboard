"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";

import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { useWebSocketSimple } from "@/hooks/use-websocket-simple";
import { getAuthToken } from "@/lib/auth/auth-utils";
import {
  ChatService,
  Conversation,
  Message,
  ChatStats,
  SendMessageData,
  getInitials,
} from "@/lib/services/chat-service";

// ============================================================================
// INTERFACES Y TIPOS DEL CONTEXTO
// ============================================================================

/**
 * Interfaz para notificaciones WebSocket
 */
interface WebSocketNotification {
  type: string;
  data: {
    chatId: string;
    message: string;
    userId: string;
    timestamp: string;
    coachId?: string;
  };
}

/**
 * Interfaz principal del contexto de chat
 * Define todas las propiedades y métodos disponibles para los componentes
 */
interface ChatContextType {
  // ========================================================================
  // ESTADO PRINCIPAL
  // ========================================================================

  /** Lista de todas las conversaciones */
  conversations: Conversation[];

  /** Conversación actualmente seleccionada */
  selectedConversation: Conversation | null;

  /** Mensajes de la conversación seleccionada */
  messages: Message[];

  /** Estadísticas del chat */
  stats: ChatStats | null;

  /** Estado de carga general */
  loading: boolean;

  /** Mensaje de error actual */
  error: string | null;

  /** Estado de conexión con el backend */
  isConnected: boolean;

  /** Estado para evitar múltiples llamadas simultáneas */
  isMarkingAsRead: boolean;

  // ========================================================================
  // ESTADO DE WEBSOCKET
  // ========================================================================

  /** Estado de conexión WebSocket */
  websocketConnected: boolean;

  /** Notificaciones WebSocket recibidas */
  websocketNotifications: WebSocketNotification[];

  /** Total de notificaciones WebSocket */
  totalWebSocketNotifications: number;

  /** Notificaciones WebSocket no leídas */
  unreadWebSocketNotifications: number;

  /** Número de notificaciones recibidas en tiempo real */
  notificationsReceived: number;

  // ========================================================================
  // ACCIONES PRINCIPALES
  // ========================================================================

  /** Selecciona una conversación y carga sus mensajes */
  selectConversation: (chatId: string) => Promise<void>;

  /** Envía un mensaje a la conversación seleccionada */
  sendMessage: (content: string, messageType?: SendMessageData["messageType"]) => Promise<void>;

  /** Marca los mensajes de la conversación actual como leídos */
  markAsRead: () => Promise<void>;

  // ========================================================================
  // ACCIONES DE REFRESH
  // ========================================================================

  /** Recarga la lista de conversaciones */
  refreshConversations: () => Promise<void>;

  /** Carga conversaciones manualmente (para uso en botones) */
  loadConversations: () => Promise<void>;

  /** Recarga los mensajes de la conversación actual */
  refreshMessages: () => Promise<void>;

  /** Recarga las estadísticas del chat */
  refreshStats: () => Promise<void>;

  // ========================================================================
  // UTILIDADES
  // ========================================================================

  /** Obtiene las iniciales de la conversación seleccionada */
  getSelectedConversationInitials: () => string;

  /** Verifica si hay mensajes no leídos */
  hasUnreadMessages: () => boolean;

  /** Obtiene el total de mensajes no leídos */
  getTotalUnreadCount: () => number;

  // ========================================================================
  // ACCIONES DE WEBSOCKET
  // ========================================================================

  /** Conecta al WebSocket */
  connectWebSocket: () => Promise<void>;

  /** Desconecta del WebSocket */
  disconnectWebSocket: () => void;

  /** Actualiza los chats asignados en WebSocket */
  updateWebSocketAssignedChats: (chats: string[]) => void;

  /** Limpia las notificaciones WebSocket */
  clearWebSocketNotifications: () => void;
}

// ============================================================================
// CONFIGURACIÓN DEL CONTEXTO
// ============================================================================

/**
 * Contexto de React para el sistema de chat
 * Proporciona estado global y métodos para todos los componentes de chat
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// ============================================================================
// PROVIDER DEL CONTEXTO
// ============================================================================

/**
 * Props del ChatProvider
 */
interface ChatProviderProps {
  children: React.ReactNode;
}

/**
 * Provider del contexto de chat
 * Maneja todo el estado global del sistema de chat y proporciona métodos
 * para interactuar con el backend
 */
export function ChatProvider({ children }: ChatProviderProps) {
  // ========================================================================
  // ESTADO LOCAL
  // ========================================================================

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isSelectingConversation, setIsSelectingConversation] = useState(false);
  const selectConversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingMessages = useRef(false);
  const messagesCache = useRef<Map<string, Message[]>>(new Map());
  const [isInitializing, setIsInitializing] = useState(false);
  const initializationAttempts = useRef(0);
  const messageIdCounter = useRef(0);
  const isLoadingConversations = useRef(false);
  const hasInitialized = useRef(false);
  const processedNotifications = useRef<Set<string>>(new Set());
  const isSendingMessage = useRef(false);
  // Función para generar IDs únicos para mensajes de WebSocket
  const generateUniqueMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `ws-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  // ========================================================================
  // WEBSOCKET HOOK SIMPLE
  // ========================================================================

  const {
    isConnected: websocketConnected,
    notifications: websocketNotifications,
    notificationsReceived,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    clearNotifications: clearWebSocketNotifications,
  } = useWebSocketSimple();

  // Propiedades calculadas para el contexto
  const totalWebSocketNotifications = websocketNotifications.length;
  const unreadWebSocketNotifications = websocketNotifications.length; // Por simplicidad, todas son no leídas

  const updateWebSocketAssignedChats = () => {
    // No hacer nada, como en el script de Hamlet
  };

  // ========================================================================
  // EFECTOS PARA ACTUALIZAR CALLBACKS DE WEBSOCKET
  // ========================================================================

  /**
   * Actualizar las funciones de callback cuando las funciones de refresh estén disponibles
   */
  useEffect(() => {}, [selectedConversation]);

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
        const decoded = jwtDecode(token);
        return decoded.sub;
      }
    } catch (error) {
      console.error("Error obteniendo ID del usuario actual:", error);
    }
    return null;
  }, []);

  /**
   * Maneja errores de manera consistente
   * @param error - Error a manejar
   * @param defaultMessage - Mensaje por defecto si no se puede extraer del error
   */
  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;

    // No mostrar toast para errores de autenticación (son esperados)
    if (errorMessage === "Unauthorized") {
      console.log("Error de autenticación (esperado durante inicialización)");
      setError(null); // Limpiar error
      return;
    }

    setError(errorMessage);
    toast.error(errorMessage);
    console.error(defaultMessage, error);
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
   * Recarga la lista de conversaciones desde el backend
   */
  const refreshConversations = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s

      try {
        setLoading(true);
        clearError();

        console.log(
          `🔄 ChatContext: Iniciando carga de conversaciones (intento ${retryCount + 1}/${maxRetries + 1})...`,
        );
        const data = await ChatService.getConversations();

        setConversations(data);
        setIsConnected(true);
        initializationAttempts.current = 0; // Reset attempts on success

        console.log(`✅ ChatContext: Cargadas ${data.length} conversaciones en el estado`);
      } catch (err) {
        console.error(`❌ ChatContext: Error cargando conversaciones (intento ${retryCount + 1}):`, err);

        if (retryCount < maxRetries) {
          console.log(`⏳ ChatContext: Reintentando en ${retryDelay}ms...`);
          setTimeout(() => {
            refreshConversations(retryCount + 1);
          }, retryDelay);
          return;
        }

        handleError(err, "Error cargando conversaciones");
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError],
  );

  /**
   * Carga conversaciones - una sola consulta simple
   */
  const loadConversations = useCallback(async () => {
    // PROTECCIÓN MÚLTIPLE: Evitar llamadas simultáneas y duplicadas
    if (isLoadingConversations.current ?? isInitializing) {
      console.log("⏭️ ChatContext: Ya se están cargando conversaciones o inicializando, saltando...");
      return;
    }

    // Verificar si ya hay conversaciones cargadas recientemente
    if (conversations.length > 0 && !loading) {
      console.log("⏭️ ChatContext: Ya hay conversaciones cargadas, saltando...");
      return;
    }

    try {
      isLoadingConversations.current = true;
      setLoading(true);
      clearError();

      console.log("🔄 ChatContext: Cargando conversaciones...");
      const data = await ChatService.getConversations();

      setConversations(data);
      setIsConnected(true);

      console.log(`✅ ChatContext: Cargadas ${data.length} conversaciones`);
    } catch (err) {
      console.error("❌ ChatContext: Error cargando conversaciones:", err);
      handleError(err, "Error cargando conversaciones");
      setIsConnected(false);
    } finally {
      setLoading(false);
      isLoadingConversations.current = false;
    }
  }, [handleError, clearError, conversations.length, loading, isInitializing]);

  /**
   * Recarga los mensajes de la conversación actual
   */
  const refreshMessages = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      setLoading(true);
      clearError();

      const data = await ChatService.getMessages(selectedConversation.id);

      setMessages(data);

      console.log(`✅ Cargados ${data.length} mensajes para ${selectedConversation.name}`);

      // 🔍 DEBUG: Mostrar todos los mensajes de la conversación
      console.log("🔍 DEBUG: Todos los mensajes de la conversación:", {
        conversationId: selectedConversation.id,
        conversationName: selectedConversation.name,
        totalMessages: data.length,
        messages: data.map((msg, index) => ({
          index: index + 1,
          id: msg.id,
          content: msg.content,
          sender_id: (msg as any).sender_id,
          created_at: msg.created_at,
          isRead: msg.isRead,
          messageType: msg.messageType,
          chatId: msg.chatId,
        })),
      });
    } catch (err) {
      handleError(err, "Error cargando mensajes");
    } finally {
      setLoading(false);
    }
  }, [selectedConversation, handleError, clearError]);

  /**
   * Recarga las estadísticas del chat
   */
  const refreshStats = useCallback(async () => {
    try {
      const data = await ChatService.getStats();
      setStats(data);

      console.log("✅ Estadísticas actualizadas:", data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
      // No mostramos toast para estadísticas ya que no es crítico
    }
  }, []);

  // ELIMINADO: Este useEffect causaba duplicación de mensajes
  // El manejo de notificaciones se hace solo en el useEffect de eventos personalizados

  // Funciones auxiliares para reducir complejidad
  const isNotificationProcessed = (notificationId: string): boolean => {
    return processedNotifications.current.has(notificationId);
  };

  const isMessageDuplicate = (chatId: string, message: string, userId: string): boolean => {
    const cachedMessages = messagesCache.current.get(chatId) ?? [];
    const messageExists = cachedMessages.some(
      (msg) => msg.content === message && (msg as any).sender_id === userId && msg.chatId === chatId,
    );
    return messageExists;
  };

  const isCurrentMessageDuplicate = (message: string, userId: string, chatId: string): boolean => {
    return messages.some(
      (msg) => msg.content === message && (msg as any).sender_id === userId && msg.chatId === chatId,
    );
  };

  const createNewMessage = (chatId: string, message: string, userId: string, timestamp: string) => {
    const currentUserId = getCurrentUserId();
    const isFromCurrentUser = userId === currentUserId;

    return {
      id: generateUniqueMessageId(),
      chatId: chatId,
      content: message ?? "Nuevo mensaje",
      sender_id: isFromCurrentUser ? currentUserId : userId,
      created_at: timestamp ?? new Date().toISOString(),
      isRead: false,
      messageType: "text" as const,
    };
  };

  const addMessageToCurrentChat = (newMessage: any, chatId: string) => {
    setMessages((prev) => {
      const messageExists = prev.some(
        (msg) =>
          msg.content === newMessage.content &&
          Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 2000,
      );

      if (messageExists) {
        return prev;
      }

      const newMessages = [...prev, newMessage];
      messagesCache.current.set(chatId, newMessages);
      return newMessages;
    });
  };

  const updateConversationUnreadCount = (chatId: string, userId: string, message: string, timestamp: string) => {
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === chatId || conv.user_id === userId) {
          const currentUserId = getCurrentUserId();
          const isFromCurrentUser = userId === currentUserId;

          const updatedConv = {
            ...conv,
            unread: conv.unread + 1,
            lastMessage: {
              content: message ?? "Nuevo mensaje",
              created_at: timestamp ?? new Date().toISOString(),
              sender_id: isFromCurrentUser ? currentUserId : userId,
            },
            updatedAt: timestamp ?? new Date().toISOString(),
          };

          return updatedConv;
        }
        return conv;
      });
    });
  };

  /**
   * Efecto para manejar eventos personalizados de WebSocket
   */
  useEffect(() => {
    const handleWebSocketMessage = (event: any) => {
      const notification = event.detail;

      if (notification.type === "new_message") {
        const { chatId, message, userId, timestamp } = notification.data;
        const notificationId = `${chatId}-${message}-${userId}`;

        // Verificaciones de duplicados
        if (isNotificationProcessed(notificationId)) return;
        if (isMessageDuplicate(chatId, message, userId)) return;
        if (isCurrentMessageDuplicate(message, userId, chatId)) return;

        // Marcar como procesada
        processedNotifications.current.add(notificationId);

        // Verificar si es la conversación actual
        const isCurrentChat =
          selectedConversation && (chatId === selectedConversation.id || userId === selectedConversation.user_id);

        if (isCurrentChat) {
          const newMessage = createNewMessage(chatId, message, userId, timestamp);
          addMessageToCurrentChat(newMessage, chatId);
        }

        // Actualizar contador de no leídos
        updateConversationUnreadCount(chatId, userId, message, timestamp);
      }
    };

    // Agregar listener para eventos personalizados
    window.addEventListener("websocket-message", handleWebSocketMessage);
    console.log("🎯 ChatContext: Listener de eventos personalizados agregado");
    console.log("🎯 ChatContext: selectedConversation al agregar listener:", selectedConversation);

    // Cleanup
    return () => {
      window.removeEventListener("websocket-message", handleWebSocketMessage);
      console.log("🎯 ChatContext: Listener de eventos personalizados removido");
    };
  }, [selectedConversation, generateUniqueMessageId]);

  // ========================================================================
  // FUNCIONES PRINCIPALES
  // ========================================================================

  // Funciones auxiliares para selectConversation
  const validateChatId = (chatId: string): boolean => {
    if (!chatId || typeof chatId !== "string" || chatId.trim() === "") {
      handleError(new Error("ID de conversación inválido"), "ID de conversación inválido");
      return false;
    }
    return true;
  };

  const isSameConversation = (chatId: string): boolean => {
    return selectedConversation?.id === chatId;
  };

  const cleanupPreviousSelection = () => {
    if (selectConversationTimeoutRef.current) {
      clearTimeout(selectConversationTimeoutRef.current);
    }
    if (isLoadingMessages.current) {
      isLoadingMessages.current = false;
    }
  };

  const loadMessagesFromCache = (chatId: string): boolean => {
    const cachedMessages = messagesCache.current.get(chatId);
    if (cachedMessages) {
      setMessages(cachedMessages);
      setIsSelectingConversation(false);
      return true;
    }
    return false;
  };

  const loadMessagesFromAPI = async (chatId: string, conversation: any) => {
    try {
      isLoadingMessages.current = true;
      const data = await ChatService.getMessages(chatId);
      messagesCache.current.set(chatId, data);
      setMessages(data);
      console.log(`✅ ChatContext: Seleccionada conversación: ${conversation.name} con ${data.length} mensajes`);
    } catch (err) {
      console.error("❌ ChatContext: Error cargando mensajes:", err);
      setMessages([]);
      handleError(err, "Error cargando mensajes");
    } finally {
      setIsSelectingConversation(false);
      isLoadingMessages.current = false;
    }
  };

  /**
   * Selecciona una conversación y carga sus mensajes
   * @param chatId - ID de la conversación a seleccionar
   */
  const selectConversation = useCallback(
    async (chatId: string) => {
      console.log("🔍 ChatContext: Solicitud de selección de conversación:", chatId);

      // Validaciones
      if (!validateChatId(chatId)) return;
      if (isSameConversation(chatId)) return;
      if (isSelectingConversation) return;

      // Limpiar notificaciones si hay demasiadas
      if (processedNotifications.current.size > 100) {
        processedNotifications.current.clear();
      }

      // Limpiar selección anterior
      cleanupPreviousSelection();
      setIsSelectingConversation(false);

      // Buscar conversación
      const conversation = conversations.find((c) => c.id === chatId);
      if (!conversation) {
        handleError(new Error("Conversación no encontrada"), "Conversación no encontrada");
        return;
      }

      try {
        setIsSelectingConversation(true);
        setSelectedConversation(conversation);

        // Intentar usar cache primero
        if (loadMessagesFromCache(chatId)) return;

        // Cargar desde API con delay
        selectConversationTimeoutRef.current = setTimeout(async () => {
          if (isLoadingMessages.current) {
            setIsSelectingConversation(false);
            return;
          }
          await loadMessagesFromAPI(chatId, conversation);
        }, 100);
      } catch (err) {
        console.error("❌ ChatContext: Error seleccionando conversación:", err);
        handleError(err, "Error seleccionando conversación");
        setIsSelectingConversation(false);
      }
    },
    [conversations, handleError, selectedConversation, isSelectingConversation],
  );

  // Cleanup del timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (selectConversationTimeoutRef.current) {
        clearTimeout(selectConversationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Envía un mensaje a la conversación seleccionada
   * @param content - Contenido del mensaje
   * @param messageType - Tipo de mensaje (texto, imagen, etc.)
   */
  const sendMessage = useCallback(
    async (content: string, messageType: SendMessageData["messageType"] = "text") => {
      // PROTECCIÓN: Evitar envíos simultáneos
      if (isSendingMessage.current) {
        console.log("⏭️ ChatContext: Ya se está enviando un mensaje, saltando...");
        return;
      }

      if (!selectedConversation) {
        handleError(new Error("No hay conversación seleccionada"), "Selecciona una conversación primero");
        return;
      }

      if (!content.trim()) {
        handleError(new Error("El mensaje no puede estar vacío"), "El mensaje no puede estar vacío");
        return;
      }

      try {
        isSendingMessage.current = true;
        setLoading(true);
        clearError();

        // Debug: Verificar el contenido antes de crear messageData
        console.log("🔍 ChatContext: Contenido recibido:", `"${content}"`);
        console.log("🔍 ChatContext: Contenido trimmeado:", `"${content.trim()}"`);
        console.log("🔍 ChatContext: Longitud del contenido:", content.trim().length);

        const messageData: SendMessageData = {
          content: content.trim(),
          messageType,
        };

        console.log("🔍 ChatContext: messageData creado:", messageData);

        const newMessage = await ChatService.sendMessage(selectedConversation.id, messageData);

        // Validar que el mensaje se haya creado correctamente
        if (!newMessage) {
          throw new Error("No se pudo enviar el mensaje");
        }

        console.log("✅ ChatContext: Mensaje enviado exitosamente:", newMessage);
        console.log("🔍 ChatContext: Estructura del mensaje:", {
          id: newMessage.id,
          content: newMessage.content,
          sender_id: (newMessage as any).sender_id,
          created_at: newMessage.created_at,
          isRead: newMessage.isRead,
        });

        // Asegurar que el sender_id sea el ID del usuario actual
        const token = getAuthToken();
        if (token) {
          try {
            const decoded = jwtDecode(token);
            const currentUserId = decoded.sub;
            newMessage.sender_id = currentUserId ?? newMessage.sender_id;
          } catch (error) {
            console.error("Error decodificando token:", error);
          }
        }

        // Agregar mensaje a la lista local inmediatamente
        setMessages((prev) => {
          // Validar que el mensaje tenga contenido antes de agregarlo
          const messageToAdd = {
            ...newMessage,
            content: newMessage.content ?? content, // Asegurar que siempre tenga contenido
          };

          console.log("🔍 ChatContext: Mensaje a agregar:", {
            id: messageToAdd.id,
            content: messageToAdd.content,
            originalContent: content,
            hasContent: !!messageToAdd.content,
            contentLength: messageToAdd.content?.length ?? 0,
          });

          const updatedMessages = [...prev, messageToAdd];
          console.log("🔍 ChatContext: Mensajes actualizados:", updatedMessages.length);

          // Actualizar cache
          if (selectedConversation) {
            messagesCache.current.set(selectedConversation.id, updatedMessages);
          }

          return updatedMessages;
        });

        // Actualizar la conversación con el último mensaje
        setConversations((prev) => {
          const updatedConversations = prev.map((conv) => {
            if (conv.id === selectedConversation.id) {
              const updatedConv = {
                ...conv,
                lastMessage: {
                  content: newMessage.content ?? content,
                  created_at: newMessage.created_at ?? new Date().toISOString(),
                  sender_id: newMessage.sender_id ?? getCurrentUserId() ?? "unknown",
                },
                updatedAt: newMessage.created_at ?? new Date().toISOString(),
              };

              // Actualizar cache con el mensaje enviado
              const cachedMessages = messagesCache.current.get(conv.id);
              if (cachedMessages) {
                const updatedMessages = [...cachedMessages, newMessage];
                messagesCache.current.set(conv.id, updatedMessages);
                console.log("🔄 ChatContext: Cache actualizado con mensaje enviado para conversación:", conv.id);
              }

              return updatedConv;
            }
            return conv;
          });

          return updatedConversations;
        });

        // Actualizar estadísticas - Comentado temporalmente para evitar "Too Many Requests"
        // await refreshStats();

        toast.success("Mensaje enviado");
        console.log(`✅ Mensaje enviado a ${selectedConversation.name}:`, newMessage.content);
      } catch (err) {
        console.error("❌ ChatContext: Error enviando mensaje:", err);
        handleError(err, "Error enviando mensaje");
      } finally {
        setLoading(false);
        isSendingMessage.current = false; // Limpiar flag de envío
      }
    },
    [selectedConversation, handleError, clearError],
  );

  /**
   * Marca los mensajes de la conversación actual como leídos
   */
  const markAsRead = useCallback(async () => {
    if (!selectedConversation || isMarkingAsRead) return;

    // Evitar llamadas innecesarias si no hay mensajes no leídos
    if (selectedConversation.unread === 0) {
      console.log("⏭️ ChatContext: No hay mensajes no leídos, saltando markAsRead");
      return;
    }

    try {
      setIsMarkingAsRead(true);
      await ChatService.markAsRead(selectedConversation.id);

      // Actualizar estado local
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      setConversations((prev) =>
        prev.map((conv) => (conv.id === selectedConversation.id ? { ...conv, unread: 0 } : conv)),
      );

      console.log(`✅ Mensajes marcados como leídos en ${selectedConversation.name}`);
    } catch (err) {
      console.error("Error marcando mensajes como leídos:", err);
      // No mostramos toast para esta operación ya que no es crítica
    } finally {
      setIsMarkingAsRead(false);
    }
  }, [selectedConversation, isMarkingAsRead]);

  // ========================================================================
  // FUNCIONES DE UTILIDAD DEL CONTEXTO
  // ========================================================================

  /**
   * Obtiene las iniciales de la conversación seleccionada
   */
  const getSelectedConversationInitials = useCallback(() => {
    if (!selectedConversation) return "??";
    return getInitials(selectedConversation.name);
  }, [selectedConversation]);

  /**
   * Verifica si hay mensajes no leídos en cualquier conversación
   */
  const hasUnreadMessages = useCallback(() => {
    return conversations.some((conv) => conv.unread > 0);
  }, [conversations]);

  /**
   * Obtiene el total de mensajes no leídos
   */
  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + conv.unread, 0);
  }, [conversations]);

  // ========================================================================
  // EFECTOS
  // ========================================================================

  /**
   * Cargar datos iniciales al montar el componente
   */
  useEffect(() => {
    console.log("🔍 ChatContext: useEffect de inicialización ejecutado");
    console.log("🔍 ChatContext: Estados actuales:", {
      hasInitialized: hasInitialized.current,
      isInitializing,
      isLoadingConversations: isLoadingConversations.current,
    });

    const initializeChat = async () => {
      // PROTECCIÓN MÚLTIPLE: Evitar cualquier inicialización duplicada
      if (hasInitialized.current ?? isInitializing ?? isLoadingConversations.current) {
        console.log("⏭️ ChatContext: Ya se inicializó, está inicializando o cargando, saltando...");
        return;
      }

      console.log("🚀 Inicializando sistema de chat...");

      // Verificar si hay token disponible antes de hacer peticiones
      const token = getAuthToken();
      if (!token) {
        console.log("Chat: No hay token disponible, esperando autenticación...");
        setIsConnected(false);
        return;
      }

      try {
        // MARCAR INMEDIATAMENTE para evitar llamadas concurrentes
        hasInitialized.current = true;
        setIsInitializing(true);

        console.log("🔄 ChatContext: Cargando conversaciones iniciales...");

        // Usar loadConversations (versión simple sin retry) para evitar throttling
        await loadConversations();

        console.log("✅ ChatContext: Inicialización completada exitosamente");
      } catch (error) {
        console.error("❌ ChatContext: Error inicializando chat:", error);
        setIsConnected(false);
        hasInitialized.current = false; // Permitir reintento en caso de error
      } finally {
        setIsInitializing(false);
      }
    };

    // Ejecutar inmediatamente
    initializeChat();

    console.log("🔍 ChatContext: useEffect de inicialización configurado");
  }, []); // Sin dependencias para evitar re-ejecuciones

  /**
   * Marcar mensajes como leídos cuando se selecciona una conversación
   */
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      // Solo marcar como leído una vez cuando se selecciona la conversación
      const timer = setTimeout(() => {
        markAsRead();
      }, 1000); // Aumentar el delay para evitar loops

      return () => clearTimeout(timer);
    }
  }, [selectedConversation?.id]); // Solo depender del ID de la conversación, no de messages ni markAsRead

  /**
   * Verificar conectividad periódicamente
   * TEMPORALMENTE DESHABILITADO para evitar "Too Many Requests"
   */
  useEffect(() => {
    // Verificación inicial única
    const checkConnection = async () => {
      // Solo verificar si hay token disponible
      const token = getAuthToken();
      if (!token) {
        setIsConnected(false);
        return;
      }

      // TEMPORALMENTE DESHABILITADO para evitar "Too Many Requests"
      console.log("⚠️ ChatContext: Health check deshabilitado temporalmente");
      setIsConnected(true); // Asumir conectado
    };

    // Solo verificar una vez al cargar, no periódicamente
    checkConnection();
  }, []);

  // ========================================================================
  // VALOR DEL CONTEXTO
  // ========================================================================

  /**
   * Valor del contexto memoizado para optimizar re-renderizados
   */
  const contextValue = useMemo(
    () => ({
      // Estado
      conversations,
      selectedConversation,
      messages,
      stats,
      loading,
      error,
      isConnected,
      isMarkingAsRead,

      // Estado WebSocket
      websocketConnected,
      websocketNotifications,
      totalWebSocketNotifications,
      unreadWebSocketNotifications,
      notificationsReceived,

      // Acciones principales
      selectConversation,
      sendMessage,
      markAsRead,

      // Acciones de refresh
      refreshConversations,
      loadConversations,
      refreshMessages,
      refreshStats,

      // Utilidades
      getSelectedConversationInitials,
      hasUnreadMessages,
      getTotalUnreadCount,

      // Acciones WebSocket
      connectWebSocket,
      disconnectWebSocket,
      updateWebSocketAssignedChats,
      clearWebSocketNotifications,
    }),
    [
      conversations,
      selectedConversation,
      messages,
      stats,
      loading,
      error,
      isConnected,
      websocketConnected,
      websocketNotifications,
      totalWebSocketNotifications,
      unreadWebSocketNotifications,
      notificationsReceived,
      selectConversation,
      sendMessage,
      markAsRead,
      refreshConversations,
      loadConversations,
      refreshMessages,
      refreshStats,
      getSelectedConversationInitials,
      hasUnreadMessages,
      getTotalUnreadCount,
      connectWebSocket,
      disconnectWebSocket,
      updateWebSocketAssignedChats,
      clearWebSocketNotifications,
    ],
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

/**
 * Hook personalizado para usar el contexto de chat
 * Proporciona acceso al estado y métodos del chat
 * @returns Contexto de chat
 * @throws Error si se usa fuera del ChatProvider
 */
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
};

// ============================================================================
// EXPORTACIONES ADICIONALES
// ============================================================================

/**
 * Hook para obtener solo las conversaciones
 * Útil para componentes que solo necesitan la lista de conversaciones
 */
export const useConversations = () => {
  const { conversations, loading, error, refreshConversations } = useChat();
  return { conversations, loading, error, refreshConversations };
};

/**
 * Hook para obtener solo los mensajes de la conversación actual
 * Útil para componentes que solo necesitan los mensajes
 */
export const useMessages = () => {
  const { messages, loading, error, refreshMessages } = useChat();
  return { messages, loading, error, refreshMessages };
};

/**
 * Hook para obtener solo las estadísticas
 * Útil para componentes que solo necesitan las estadísticas
 */
export const useChatStats = () => {
  const { stats, loading, error, refreshStats } = useChat();
  return { stats, loading, error, refreshStats };
};
