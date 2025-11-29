"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";

import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { getAuthToken, getCurrentUser } from "@/lib/auth/auth-utils";
import { ChatService, getInitials } from "@/lib/services/chat-service";
import { Conversation, Message, ChatStats, SendMessageData } from "@/lib/services/chat-types";
import { websocketService } from "@/lib/services/websocket.service";

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

interface ChatContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  stats: ChatStats | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  isMarkingAsRead: boolean;
  websocketConnected: boolean;
  websocketNotifications: WebSocketNotification[];
  totalWebSocketNotifications: number;
  unreadWebSocketNotifications: number;
  notificationsReceived: number;
  selectConversation: (chatId: string) => Promise<void>;
  sendMessage: (content: string, messageType?: SendMessageData["messageType"]) => Promise<void>;
  markAsRead: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  loadConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  refreshStats: () => Promise<void>;
  getSelectedConversationInitials: () => string;
  hasUnreadMessages: () => boolean;
  getTotalUnreadCount: () => number;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  updateWebSocketAssignedChats: (chats: string[]) => void;
  clearWebSocketNotifications: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
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
  const lastMarkedAsReadRef = useRef<number>(0);
  const lastMarkedChatIdRef = useRef<string | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);
  const isLoadingMessages = useRef(false);
  const messagesCache = useRef<Map<string, Message[]>>(new Map());
  const initializationAttempts = useRef(0);
  const messageIdCounter = useRef(0);
  const isLoadingConversations = useRef(false);
  const hasInitialized = useRef(false);
  const processedNotifications = useRef<Set<string>>(new Set());
  const isSendingMessage = useRef(false);

  const generateUniqueMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `ws-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  const {
    isConnected: websocketConnected,
    notificationsReceived,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
  } = useChatWebSocket({
    autoConnect: true,
    onNewMessage: (data) => {
      // Manejar nuevos mensajes (genérico para todos los canales)
      console.log("📨 Nuevo mensaje recibido:", data);
      console.log("🎯 Canal:", data.channel);

      // Disparar evento personalizado para el contexto
      const customEvent = new CustomEvent("websocket-message", {
        detail: {
          type: "new_message",
          data: {
            id: data.message.id,
            chatId: data.message.chat_id,
            message: data.message.message,
            userId: data.message.from,
            timestamp: data.message.timestamp || data.message.created_at,
            channel: data.channel,
            sender: data.message.sender,
          },
        },
      });
      window.dispatchEvent(customEvent);
    },
    onNewConversation: (data) => {
      console.log("📋 Nueva conversación disponible:", data);
      const conversation = data.conversation as Record<string, unknown>;

      // Verificar si la conversación ya existe en la lista
      const existingIndex = conversations.findIndex((c) => c.id === conversation.id || c.id === conversation.chat_id);

      if (existingIndex === -1) {
        // Convertir el formato del backend al formato del frontend
        const lastMessage = conversation.last_message as Record<string, unknown> | undefined;
        const newConversation: Conversation = {
          id: (conversation.id as string) || (conversation.chat_id as string),
          name:
            (conversation.user_email as string) ||
            `${conversation.user_firstName} ${conversation.user_lastName}` ||
            "Sin nombre",
          user_id: conversation.user_id as string,
          professionalId: conversation.professional_id as string,
          unread: (conversation.unread_count as number) || 0,
          lastMessage: lastMessage
            ? {
                content: lastMessage.message as string,
                created_at: lastMessage.created_at as string,
                sender_id: lastMessage.sender_id as string,
              }
            : undefined,
          tags: [],
          isActive: true,
          type: (conversation.type as "chat" | "support") || "chat",
        };

        // Agregar la nueva conversación al inicio de la lista
        setConversations((prev) => [newConversation, ...prev]);
        console.log("✅ Nueva conversación agregada a la lista:", newConversation);
      } else {
        // Si ya existe, actualizar la información
        setConversations((prev) => {
          const updated = [...prev];
          const lastMessage = conversation.last_message as Record<string, unknown> | undefined;
          updated[existingIndex] = {
            ...updated[existingIndex],
            unread: (conversation.unread_count as number) || updated[existingIndex].unread,
            lastMessage: lastMessage
              ? {
                  content: lastMessage.message as string,
                  created_at: lastMessage.created_at as string,
                  sender_id: lastMessage.sender_id as string,
                }
              : updated[existingIndex].lastMessage,
          };
          return updated;
        });
        console.log("✅ Conversación existente actualizada");
      }
    },
    onParticipantRemoved: (data) => {
      console.log("❌ Participante removido del chat:", data);

      // Obtener el ID del usuario actual
      const currentUserId = getCurrentUserId();

      // Si el participante removido es el usuario actual, remover el chat de la lista
      if (data.participant_id === currentUserId) {
        const currentSelected = selectedConversationRef.current;
        const isChatSelected = currentSelected?.id === data.chat_id || currentSelected?.chat_id === data.chat_id;

        // Remover el chat de la lista de conversaciones
        setConversations((prev) => prev.filter((c) => c.id !== data.chat_id));

        // Si el chat estaba seleccionado, cerrarlo y limpiar todo
        if (isChatSelected) {
          console.log(`🔒 Cerrando chat ${data.chat_id} - colaborador removido`);
          setSelectedConversation(null);
          setMessages([]);
          setStats(null);
          messagesCache.current.delete(data.chat_id);
        } else {
          // Si no estaba seleccionado, solo limpiar mensajes del chat de la lista y caché
          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg.chatId !== data.chat_id);
            if (filtered.length !== prev.length) {
              console.log(
                `🧹 Limpiando ${prev.length - filtered.length} mensajes del chat ${data.chat_id} de la lista`,
              );
            }
            return filtered;
          });
          messagesCache.current.delete(data.chat_id);
        }

        toast.info("Ya no tienes acceso a esta conversación");
        console.log(`✅ Chat ${data.chat_id} removido completamente para el usuario ${currentUserId}`);
      }
    },
    onMessagesHistory: (data) => {
      console.log("📚 Historial de mensajes recibido en contexto:", data);

      // Normalizar mensajes del backend al formato del frontend
      const normalizedMessages = (data.messages as Record<string, unknown>[]).map((msg) => ({
        id: (msg.message_id as string) || (msg.id as string),
        chatId: data.chat_id,
        content: (msg.message as string) || (msg.content as string),
        sender_id: (msg.from as string) || (msg.sender_id as string),
        created_at: (msg.sended_at as string) || (msg.created_at as string),
        isRead: (msg.read as boolean) ?? (msg.isRead as boolean) ?? false,
        messageType: ((msg.messageType as string) || "text") as "text" | "image" | "audio" | "file",
        sender: msg.sender as Message["sender"],
      }));

      console.log("✅ Mensajes normalizados:", normalizedMessages.length);
      if (normalizedMessages.length > 0) {
        console.log("📋 Primer mensaje con sender:", normalizedMessages[0]);
      }

      // Guardar en cache y estado
      messagesCache.current.set(data.chat_id, normalizedMessages);
      setMessages(normalizedMessages);
      setIsSelectingConversation(false);
      isLoadingMessages.current = false;
    },
  });

  const websocketNotifications: WebSocketNotification[] = [];
  const totalWebSocketNotifications = notificationsReceived;
  const unreadWebSocketNotifications = notificationsReceived;

  const updateWebSocketAssignedChats = useCallback(() => {
    // No hacer nada, las asignaciones se manejan automáticamente
  }, []);

  const clearWebSocketNotifications = useCallback(() => {
    console.log("🧹 Limpiando notificaciones WebSocket");
  }, []);

  // ========================================================================
  // EFECTOS PARA MANTENER REFS ACTUALIZADOS
  // ========================================================================

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {}, [selectedConversation]);

  // ========================================================================
  // FUNCIONES DE UTILIDAD
  // ========================================================================

  const getCurrentUserId = useCallback(() => {
    try {
      const token = getAuthToken();
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.sub;
      }
    } catch {
      // Token decode failed
    }
    return null;
  }, []);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;

    if (errorMessage === "Unauthorized") {
      setError(null);
      return;
    }

    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================================
  // FUNCIONES DE REFRESH
  // ========================================================================

  const refreshConversations = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);

      try {
        setLoading(true);
        clearError();

        const data = await ChatService.getConversations();

        setConversations(data);
        setIsConnected(true);
        initializationAttempts.current = 0;
      } catch (err) {
        if (retryCount < maxRetries) {
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

  const loadConversations = useCallback(async () => {
    console.log("🔍 [CHATCONTEXT] loadConversations() LLAMADO");

    if (isLoadingConversations.current) {
      console.log("⏭️ [CHATCONTEXT] Ya se están cargando conversaciones, saltando...");
      return;
    }

    try {
      console.log("🔍 [CHATCONTEXT] Paso 1: Marcando como cargando...");
      isLoadingConversations.current = true;
      setLoading(true);
      clearError();

      console.log("📥 [CHATCONTEXT] Paso 2: Llamando a ChatService.getConversations()...");
      const data = await ChatService.getConversations();

      console.log("📦 [CHATCONTEXT] Paso 3: Datos recibidos:", data);
      setConversations(data);
      setIsConnected(true);

      console.log(`✅ [CHATCONTEXT] Paso 4: Cargadas ${data.length} conversaciones exitosamente`);
    } catch (err) {
      console.error("❌ [CHATCONTEXT] ERROR CRÍTICO:", err);
      console.error("❌ [CHATCONTEXT] Tipo:", err instanceof Error ? err.message : String(err));
      handleError(err, "Error cargando conversaciones");
      setIsConnected(false);
    } finally {
      setLoading(false);
      isLoadingConversations.current = false;
    }
  }, [handleError, clearError]);

  const refreshMessages = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      setLoading(true);
      clearError();

      const data = await ChatService.getMessages(selectedConversation.id);

      setMessages(data);
    } catch (err) {
      handleError(err, "Error cargando mensajes");
    } finally {
      setLoading(false);
    }
  }, [selectedConversation, handleError, clearError]);

  const refreshStats = useCallback(async () => {
    try {
      const data = await ChatService.getStats();
      setStats(data);

      console.log("✅ Estadísticas actualizadas:", data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  }, []);

  // Funciones auxiliares para reducir complejidad
  const isNotificationProcessed = (notificationId: string): boolean => {
    return processedNotifications.current.has(notificationId);
  };

  const isMessageDuplicate = (chatId: string, message: string, userId: string): boolean => {
    const cachedMessages = messagesCache.current.get(chatId) ?? [];
    const messageExists = cachedMessages.some(
      (msg) => msg.content === message && (msg as { sender_id?: string }).sender_id === userId && msg.chatId === chatId,
    );
    return messageExists;
  };

  const isCurrentMessageDuplicate = (message: string, userId: string, chatId: string): boolean => {
    return messages.some(
      (msg) => msg.content === message && (msg as { sender_id?: string }).sender_id === userId && msg.chatId === chatId,
    );
  };

  const createNewMessage = (
    id: string | null,
    chatId: string,
    message: string,
    userId: string,
    timestamp: string,
    senderInfo?: Message["sender"],
  ) => {
    const currentUserId = getCurrentUserId();
    const isFromCurrentUser = userId === currentUserId;

    return {
      id: id || generateUniqueMessageId(),
      chatId: chatId,
      content: message ?? "Nuevo mensaje",
      sender_id: isFromCurrentUser ? currentUserId : userId,
      created_at: timestamp ?? new Date().toISOString(),
      isRead: false,
      messageType: "text" as const,
      sender: senderInfo,
    };
  };

  const findChatInCache = (chatId: string, userId: string) => {
    let targetChatId = chatId;
    let currentCachedMessages = messagesCache.current.get(chatId) ?? [];

    if (currentCachedMessages.length === 0) {
      for (const [cachedChatId, cachedMessages] of messagesCache.current.entries()) {
        const conversation = conversations.find((conv) => conv.id === cachedChatId);
        if (conversation && conversation.user_id === userId) {
          targetChatId = cachedChatId;
          currentCachedMessages = cachedMessages;
          console.log(`🔍 ChatContext: Encontrado chat por userId: ${cachedChatId}`);
          break;
        }
      }
    }
    return { targetChatId, currentCachedMessages };
  };

  const updateCacheWithMessage = (targetChatId: string, currentCachedMessages: Message[], newMessage: Message) => {
    const messageExistsInCache = currentCachedMessages.some(
      (msg) =>
        msg.content === newMessage.content &&
        Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 2000,
    );

    if (!messageExistsInCache) {
      const updatedCachedMessages = [...currentCachedMessages, newMessage];
      messagesCache.current.set(targetChatId, updatedCachedMessages);
    }
  };

  const addMessageToCurrentChat = (newMessage: Message, chatId: string, userId: string) => {
    const { targetChatId, currentCachedMessages } = findChatInCache(chatId, userId);
    updateCacheWithMessage(targetChatId, currentCachedMessages, newMessage);

    const isCurrentChatById = selectedConversation?.id === chatId;
    const isCurrentChatByUserId = selectedConversation?.user_id === userId;
    const isCurrentChat = isCurrentChatById || isCurrentChatByUserId;

    if (isCurrentChat) {
      setMessages((prev) => {
        const messageExists = prev.some(
          (msg) =>
            msg.content === newMessage.content &&
            Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 2000,
        );
        if (messageExists) {
          console.log(`⚠️ ChatContext: Mensaje duplicado detectado, no agregando: ${newMessage.content}`);
          return prev;
        }
        const newMessages = [...prev, newMessage];
        return newMessages;
      });
    } else {
      console.log(`📱 ChatContext: Mensaje recibido para chat diferente (${chatId}), no actualizando estado actual`);
    }
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
              sender_id: isFromCurrentUser ? currentUserId || "" : userId,
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
    const handleWebSocketMessage = (event: CustomEvent) => {
      const notification = event.detail;

      if (notification.type === "new_message") {
        const { id, chatId, message, userId, timestamp, sender } = notification.data;
        const notificationId = `${id || chatId}-${message}-${userId}`;

        console.log(
          `📨 Procesando mensaje WebSocket: ID=${id}, chatId=${chatId}, sender=${sender?.firstName || "unknown"}`,
        );

        // Verificaciones de duplicados
        if (isNotificationProcessed(notificationId)) {
          console.log(`⚠️ Notificación ya procesada: ${notificationId}`);
          return;
        }
        if (isMessageDuplicate(chatId, message, userId)) {
          console.log(`⚠️ Mensaje duplicado en cache: ${notificationId}`);
          return;
        }
        if (isCurrentMessageDuplicate(message, userId, chatId)) {
          console.log(`⚠️ Mensaje duplicado en estado actual: ${notificationId}`);
          return;
        }

        // Marcar como procesada
        processedNotifications.current.add(notificationId);

        // Crear el mensaje con el ID real del backend y la info del remitente
        const newMessage = createNewMessage(id, chatId, message, userId, timestamp, sender);
        addMessageToCurrentChat(newMessage, chatId, userId);

        // Actualizar contador de no leídos
        updateConversationUnreadCount(chatId, userId, message, timestamp);

        console.log(`✅ Mensaje agregado correctamente: ID=${id}, chatId=${chatId}`);
      }
    };

    window.addEventListener("websocket-message", handleWebSocketMessage as EventListener);

    return () => {
      window.removeEventListener("websocket-message", handleWebSocketMessage as EventListener);
    };
  }, [selectedConversation, generateUniqueMessageId, conversations, getCurrentUserId]);

  // ========================================================================
  // FUNCIONES PRINCIPALES
  // ========================================================================

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

    if (cachedMessages && cachedMessages.length > 0) {
      console.log(
        `✅ ChatContext: Mensajes encontrados en cache para chat ${chatId}: ${cachedMessages.length} mensajes`,
      );
      setMessages(cachedMessages);
      setIsSelectingConversation(false);
      return true;
    }

    console.log(`⚠️ ChatContext: No hay mensajes en cache para chat ${chatId}, se cargarán desde WebSocket`);
    return false;
  };

  const loadMessagesFromWebSocket = async (chatId: string) => {
    try {
      isLoadingMessages.current = true;

      // Cargar mensajes vía WebSocket en lugar de API REST
      console.log("🔍 ChatContext: Solicitando mensajes vía WebSocket para chat:", chatId);
      await websocketService.getMessages(chatId, 1, 100);

      // Los mensajes llegarán vía el evento 'messages_chat_history'
      // que se maneja en el callback onMessagesHistory del useChatWebSocket
    } catch (err) {
      // Si es un error de throttling, intentar usar cache si está disponible
      if (err instanceof Error && err.message.includes("ThrottlerException")) {
        const cachedMessages = messagesCache.current.get(chatId);
        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(cachedMessages);
          return;
        }
      }

      setMessages([]);
      handleError(err, "Error cargando mensajes");
    } finally {
      setIsSelectingConversation(false);
      isLoadingMessages.current = false;
    }
  };

  const validateSelectionRequest = (chatId: string): boolean => {
    if (!validateChatId(chatId)) return false;
    if (isSameConversation(chatId)) return false;
    if (isSelectingConversation) {
      console.log("⚠️ ChatContext: Ya hay una selección en progreso, ignorando...");
      return false;
    }
    if (isLoadingMessages.current) {
      return false;
    }
    return true;
  };

  const cleanupSelectionState = () => {
    if (selectConversationTimeoutRef.current) {
      clearTimeout(selectConversationTimeoutRef.current);
      selectConversationTimeoutRef.current = null;
    }
    if (processedNotifications.current.size > 100) {
      processedNotifications.current.clear();
    }
    cleanupPreviousSelection();
    setIsSelectingConversation(true);
  };

  const selectConversation = useCallback(
    async (chatId: string) => {
      if (!validateSelectionRequest(chatId)) return;
      cleanupSelectionState();

      const conversation = conversations.find((c) => c.id === chatId);
      if (!conversation) {
        handleError(new Error("Conversación no encontrada"), "Conversación no encontrada");
        setIsSelectingConversation(false);
        return;
      }

      try {
        setSelectedConversation(conversation);
        if (loadMessagesFromCache(chatId)) {
          setIsSelectingConversation(false);
          return;
        }

        selectConversationTimeoutRef.current = setTimeout(async () => {
          if (isLoadingMessages.current) {
            console.log("⚠️ ChatContext: Ya hay una carga de mensajes en progreso, cancelando...");
            setIsSelectingConversation(false);
            return;
          }
          await loadMessagesFromWebSocket(chatId);
        }, 1000);
      } catch (err) {
        handleError(err, "Error seleccionando conversación");
        setIsSelectingConversation(false);
      }
    },
    [conversations, handleError, selectedConversation, isSelectingConversation],
  );

  useEffect(() => {
    return () => {
      if (selectConversationTimeoutRef.current) {
        clearTimeout(selectConversationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Envía un mensaje a la conversación seleccionada vía WebSocket
   */
  const sendMessage = useCallback(
    async (content: string, messageType: SendMessageData["messageType"] = "text") => {
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

        console.log("🔌 ChatContext: Enviando mensaje vía WebSocket:", {
          chat_id: selectedConversation.id,
          to: selectedConversation.user_id,
          message: content.trim(),
        });

        // Crear mensaje optimista
        const tempId = `temp-${Date.now()}`;
        const currentUserId = getCurrentUserId();
        const tempMessage: Message = {
          id: tempId,
          chatId: selectedConversation.id,
          content: content.trim(),
          sender_id: currentUserId || "unknown",
          created_at: new Date().toISOString(),
          isRead: false,
          messageType: messageType,
        };

        // Agregar mensaje temporalmente (optimistic update)
        setMessages((prev) => {
          const updatedMessages = [...prev, tempMessage];
          if (selectedConversation) {
            messagesCache.current.set(selectedConversation.id, updatedMessages);
          }
          return updatedMessages;
        });

        // Verificar conexión y conectar si es necesario
        if (!websocketService.isConnected()) {
          const token = getAuthToken();
          if (token) {
            const user = getCurrentUser();
            const roleMapping: Record<string, "coach" | "dietitian" | "support"> = {
              adviser: "coach",
              dietitian: "dietitian",
              support_agent: "support",
              admin: "coach",
            };
            const userType = user?.role ? roleMapping[user.role.toLowerCase()] || "coach" : "coach";

            await websocketService.connect({
              url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000",
              token: token,
              userType: userType,
              platform: "web",
            });
          }
        }

        // Enviar mensaje vía WebSocket
        const response = await websocketService.sendMessage({
          chat_id: selectedConversation.id,
          to: selectedConversation.user_id || "",
          message: content.trim(),
        });

        console.log("✅ ChatContext: Mensaje enviado vía WebSocket:", response);

        // Actualizar mensaje temporal con el real
        const newMessage: Message = {
          id: response.message.id,
          chatId: selectedConversation.id,
          content: response.message.message,
          sender_id: response.message.from,
          created_at:
            typeof response.message.timestamp === "string"
              ? response.message.timestamp
              : new Date(response.message.timestamp).toISOString(),
          isRead: false,
          messageType: messageType,
        };

        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? newMessage : msg)));

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
                const updatedMessages = cachedMessages.map((msg) => (msg.id === tempId ? newMessage : msg));
                messagesCache.current.set(conv.id, updatedMessages);
              }

              return updatedConv;
            }
            return conv;
          });

          return updatedConversations;
        });

        toast.success("Mensaje enviado");
      } catch (err) {
        handleError(err, "Error enviando mensaje");
      } finally {
        setLoading(false);
        isSendingMessage.current = false;
      }
    },
    [selectedConversation, handleError, clearError, getCurrentUserId],
  );

  /**
   * Marca los mensajes de la conversación actual como leídos
   */
  const markAsRead = useCallback(async () => {
    if (!selectedConversation || isMarkingAsRead) {
      console.log("⏭️ ChatContext: markAsRead bloqueado - sin conversación o ya procesando");
      return;
    }

    const now = Date.now();
    if (lastMarkedAsReadRef.current && now - lastMarkedAsReadRef.current < 3000) {
      console.log("⏭️ ChatContext: markAsRead llamado muy recientemente, saltando...");
      return;
    }

    if (lastMarkedChatIdRef.current === selectedConversation.id) {
      const tiempoDesdeUltima = now - lastMarkedAsReadRef.current;
      if (tiempoDesdeUltima < 5000) {
        console.log("⏭️ ChatContext: Este chat ya fue marcado recientemente, saltando...");
        return;
      }
    }

    if (selectedConversation.unread === 0) {
      console.log("⏭️ ChatContext: No hay mensajes no leídos, saltando markAsRead");
      return;
    }

    try {
      setIsMarkingAsRead(true);
      lastMarkedAsReadRef.current = now;
      lastMarkedChatIdRef.current = selectedConversation.id;

      let unreadMessageIds: string[] = [];
      if (messages.length > 0) {
        unreadMessageIds = messages.filter((msg) => !msg.isRead).map((msg) => msg.id);
      }

      console.log("📝 ChatContext: Marcando mensajes como leídos:", {
        chatId: selectedConversation.id,
        unreadCount: unreadMessageIds.length || "todos",
      });

      await ChatService.markAsRead(selectedConversation.id);

      if (messages.length > 0) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
      setConversations((prev) =>
        prev.map((conv) => (conv.id === selectedConversation.id ? { ...conv, unread: 0 } : conv)),
      );

      console.log("✅ ChatContext: Mensajes marcados como leídos exitosamente");
    } catch (err) {
      console.error("❌ ChatContext: Error marcando mensajes como leídos:", err);
      lastMarkedAsReadRef.current = 0;
      lastMarkedChatIdRef.current = null;
    } finally {
      setIsMarkingAsRead(false);
    }
  }, [selectedConversation, isMarkingAsRead, messages]);

  // ========================================================================
  // FUNCIONES DE UTILIDAD DEL CONTEXTO
  // ========================================================================

  const getSelectedConversationInitials = useCallback(() => {
    if (!selectedConversation) return "??";
    return getInitials(selectedConversation.name);
  }, [selectedConversation]);

  const hasUnreadMessages = useCallback(() => {
    return conversations.some((conv) => conv.unread > 0);
  }, [conversations]);

  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + conv.unread, 0);
  }, [conversations]);

  // ========================================================================
  // EFECTOS
  // ========================================================================

  useEffect(() => {
    console.log("🔄 ChatContext: useEffect de inicialización ejecutado");
    const initializeChat = async () => {
      if (hasInitialized.current || isLoadingConversations.current) {
        console.log("⏭️ ChatContext: Ya se inicializó o está cargando, saltando...");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.log("⚠️ ChatContext: No hay token disponible, esperando autenticación...");
        setIsConnected(false);
        return;
      }

      try {
        hasInitialized.current = true;

        console.log("🚀 ChatContext: Iniciando carga de conversaciones...");
        await loadConversations();

        console.log("✅ ChatContext: Inicialización completada exitosamente");
      } catch (error) {
        console.error("❌ ChatContext: Error en inicialización:", error);
        setIsConnected(false);
        hasInitialized.current = false;
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    const currentUserId = getCurrentUserId();

    if (currentUserId && hasInitialized.current) {
      const lastUserId = localStorage.getItem("lastChatUserId");

      if (lastUserId && lastUserId !== currentUserId) {
        console.log("🔄 ChatContext: Detectado cambio de usuario, reseteando estado...");

        setConversations([]);
        setSelectedConversation(null);
        setMessages([]);
        messagesCache.current.clear();
        hasInitialized.current = false;
        isLoadingConversations.current = false;

        loadConversations();
      }

      localStorage.setItem("lastChatUserId", currentUserId);
    }
  }, [getCurrentUserId, loadConversations]);

  useEffect(() => {
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
      markAsReadTimeoutRef.current = null;
    }

    if (selectedConversation && selectedConversation.unread > 0) {
      const now = Date.now();
      if (lastMarkedChatIdRef.current === selectedConversation.id) {
        const tiempoDesdeUltima = now - lastMarkedAsReadRef.current;
        if (tiempoDesdeUltima < 5000) {
          console.log("⏭️ ChatContext: Este chat ya fue marcado recientemente en useEffect");
          return;
        }
      }

      console.log("📝 ChatContext: Conversación seleccionada - programando markAsRead");
      markAsReadTimeoutRef.current = setTimeout(() => {
        if (selectedConversation && selectedConversation.id === lastMarkedChatIdRef.current) {
          const tiempoDesdeUltima = Date.now() - lastMarkedAsReadRef.current;
          if (tiempoDesdeUltima < 5000) {
            console.log("⏭️ ChatContext: Chat ya marcado durante el delay, cancelando...");
            markAsReadTimeoutRef.current = null;
            return;
          }
        }
        markAsRead();
        markAsReadTimeoutRef.current = null;
      }, 800);

      return () => {
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
          markAsReadTimeoutRef.current = null;
        }
      };
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    const checkConnection = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsConnected(false);
        return;
      }
      setIsConnected(true);
    };

    checkConnection();
  }, []);

  // ========================================================================
  // VALOR DEL CONTEXTO
  // ========================================================================

  const contextValue = useMemo(
    () => ({
      conversations,
      selectedConversation,
      messages,
      stats,
      loading,
      error,
      isConnected,
      isMarkingAsRead,
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

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

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

export const useConversations = () => {
  const { conversations, loading, error, refreshConversations } = useChat();
  return { conversations, loading, error, refreshConversations };
};

export const useMessages = () => {
  const { messages, loading, error, refreshMessages } = useChat();
  return { messages, loading, error, refreshMessages };
};

export const useChatStats = () => {
  const { stats, loading, error, refreshStats } = useChat();
  return { stats, loading, error, refreshStats };
};
