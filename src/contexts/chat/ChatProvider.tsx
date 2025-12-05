"use client";
/* eslint-disable max-lines */

import { createContext, useEffect, useState, useMemo, useCallback, useRef } from "react";

import { toast } from "sonner";

import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { getAuthToken } from "@/lib/auth/auth-utils";
import { ChatService, getInitials } from "@/lib/services/chat-service";
import { websocketService } from "@/lib/services/websocket.service";

import type {
  ChatContextType,
  ChatProviderProps,
  WebSocketNotification,
  Conversation,
  Message,
  SendMessageData,
} from "./types";
import {
  getCurrentUserId,
  isNotificationProcessed,
  isMessageDuplicate,
  isCurrentMessageDuplicate,
  createNewMessage,
  findChatInCache,
  updateCacheWithMessage,
} from "./utils";

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: ChatProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isSelectingConversation, setIsSelectingConversation] = useState(false);

  // Refs para evitar llamadas duplicadas
  const selectConversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMarkedAsReadRef = useRef<number>(0);
  const lastMarkedChatIdRef = useRef<string | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);
  const isLoadingMessages = useRef(false);
  const messagesCache = useRef<Map<string, Message[]>>(new Map());
  const messageIdCounter = useRef(0);
  const isLoadingConversations = useRef(false);
  const hasInitialized = useRef(false);
  const processedNotifications = useRef<Set<string>>(new Set());
  const isSendingMessage = useRef(false);

  const generateUniqueMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `ws-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  // WebSocket hook
  const {
    isConnected: websocketConnected,
    notificationsReceived,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
  } = useChatWebSocket({
    autoConnect: true,
    onNewMessage: (data) => {
      console.log("📨 Nuevo mensaje recibido:", data);
      const customEvent = new CustomEvent("websocket-message", {
        detail: {
          type: "new_message",
          data: {
            id: data.message.id,
            chatId: data.message.chat_id,
            message: data.message.message,
            userId: data.message.from,
            timestamp: data.message.timestamp ?? data.message.created_at,
            channel: data.channel,
            sender: (data.message as any).sender ?? null,
          },
        },
      });
      window.dispatchEvent(customEvent);
    },
    onNewConversation: (data) => {
      handleNewConversation(data);
    },
    onParticipantRemoved: (data) => {
      handleParticipantRemoved(data);
    },
    onMessagesHistory: (data) => {
      handleMessagesHistory(data);
    },
  });

  // Handlers de eventos WebSocket
  const handleNewConversation = useCallback(
    (data: { conversation: any }) => {
      const conversation = data.conversation;
      const existingIndex = conversations.findIndex((c) => c.id === conversation.id || c.id === conversation.chat_id);

      if (existingIndex === -1) {
        const newConversation: Conversation = {
          id: conversation.id ?? conversation.chat_id,
          name:
            conversation.user_email ??
            (`${conversation.user_firstName ?? ""} ${conversation.user_lastName ?? ""}`.trim() || "Sin nombre"),
          user_id: conversation.user_id,
          professionalId: conversation.professional_id,
          unread: conversation.unread_count ?? 0,
          lastMessage: conversation.last_message
            ? {
                content: conversation.last_message.message,
                created_at: conversation.last_message.created_at,
                sender_id: conversation.last_message.sender_id ?? conversation.last_message.from,
              }
            : undefined,
          tags: [],
          isActive: true,
          updatedAt: conversation.updated_at ?? conversation.last_message?.created_at ?? new Date().toISOString(),
          createdAt: conversation.created_at ?? new Date().toISOString(),
        };
        setConversations((prev) => [newConversation, ...prev]);
      }
    },
    [conversations],
  );

  const handleParticipantRemoved = useCallback((data: { chat_id: string; participant_id: string }) => {
    const currentUserId = getCurrentUserId();
    if (data.participant_id === currentUserId) {
      const currentSelected = selectedConversationRef.current;
      const isChatSelected = currentSelected?.id === data.chat_id;

      setConversations((prev) => prev.filter((c) => c.id !== data.chat_id));

      if (isChatSelected) {
        setSelectedConversation(null);
        setMessages([]);
        setStats(null);
        messagesCache.current.delete(data.chat_id);
      }
      toast.info("Ya no tienes acceso a esta conversación");
    }
  }, []);

  const handleMessagesHistory = useCallback((data: any) => {
    const normalizedMessages = data.messages.map((msg: any) => ({
      id: msg.message_id ?? msg.id,
      chatId: data.chat_id,
      content: msg.message ?? msg.content,
      sender_id: msg.from ?? msg.sender_id,
      created_at: msg.sended_at ?? msg.created_at,
      isRead: msg.read ?? msg.isRead ?? false,
      messageType: msg.messageType ?? "text",
      sender: msg.sender,
    }));

    messagesCache.current.set(data.chat_id, normalizedMessages);
    setMessages(normalizedMessages);
    setIsSelectingConversation(false);
    isLoadingMessages.current = false;
  }, []);

  // Mantener ref actualizado
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Manejo de errores
  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    if (errorMessage === "Unauthorized") {
      setError(null);
      return;
    }
    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Funciones de carga
  const loadConversations = useCallback(async () => {
    if (isLoadingConversations.current) return;

    try {
      isLoadingConversations.current = true;
      setLoading(true);
      clearError();

      const data = await ChatService.getConversations();
      setConversations(data);
      setIsConnected(true);
    } catch (err) {
      handleError(err, "Error cargando conversaciones");
      setIsConnected(false);
    } finally {
      setLoading(false);
      isLoadingConversations.current = false;
    }
  }, [handleError, clearError]);

  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

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
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  }, []);

  // Efecto para eventos WebSocket
  useEffect(() => {
    const handleWebSocketMessage = (event: any) => {
      const notification = event.detail;
      if (notification.type === "new_message") {
        const { id, chatId, message, userId, timestamp, sender } = notification.data;
        const notificationId = `${id ?? chatId}-${message}-${userId}`;

        if (isNotificationProcessed(processedNotifications.current, notificationId)) return;
        if (isMessageDuplicate(messagesCache.current, chatId, message, userId)) return;
        if (isCurrentMessageDuplicate(messages, message, userId, chatId)) return;

        processedNotifications.current.add(notificationId);

        const newMessage = createNewMessage(id, chatId, message, userId, timestamp, generateUniqueMessageId, sender);

        const { targetChatId, currentCachedMessages } = findChatInCache(
          messagesCache.current,
          conversations,
          chatId,
          userId,
        );
        updateCacheWithMessage(messagesCache.current, targetChatId, currentCachedMessages, newMessage);

        const isCurrentChat = selectedConversation?.id === chatId || selectedConversation?.user_id === userId;
        if (isCurrentChat) {
          setMessages((prev) => {
            const exists = prev.some(
              (msg) =>
                msg.content === newMessage.content &&
                Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 2000,
            );
            return exists ? prev : [...prev, newMessage];
          });
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === chatId || conv.user_id === userId
              ? {
                  ...conv,
                  unread: conv.unread + 1,
                  lastMessage: {
                    content: message ?? "Nuevo mensaje",
                    created_at: timestamp ?? new Date().toISOString(),
                    sender_id: userId,
                  },
                  updatedAt: timestamp ?? new Date().toISOString(),
                }
              : conv,
          ),
        );
      }
    };

    window.addEventListener("websocket-message", handleWebSocketMessage);
    return () => window.removeEventListener("websocket-message", handleWebSocketMessage);
  }, [selectedConversation, conversations, messages, generateUniqueMessageId]);

  // Seleccionar conversación
  const selectConversation = useCallback(
    async (chatId: string) => {
      if (!chatId || selectedConversation?.id === chatId || isSelectingConversation || isLoadingMessages.current)
        return;

      if (selectConversationTimeoutRef.current) clearTimeout(selectConversationTimeoutRef.current);
      setIsSelectingConversation(true);

      const conversation = conversations.find((c) => c.id === chatId);
      if (!conversation) {
        handleError(new Error("Conversación no encontrada"), "Conversación no encontrada");
        setIsSelectingConversation(false);
        return;
      }

      setSelectedConversation(conversation);

      const cachedMessages = messagesCache.current.get(chatId);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setIsSelectingConversation(false);
        return;
      }

      selectConversationTimeoutRef.current = setTimeout(async () => {
        if (isLoadingMessages.current) {
          setIsSelectingConversation(false);
          return;
        }
        try {
          isLoadingMessages.current = true;
          await websocketService.getMessages(chatId, 1, 100);
        } catch (err) {
          setMessages([]);
          handleError(err, "Error cargando mensajes");
        } finally {
          setIsSelectingConversation(false);
          isLoadingMessages.current = false;
        }
      }, 1000);
    },
    [conversations, handleError, selectedConversation, isSelectingConversation],
  );

  // Enviar mensaje
  const sendMessage = useCallback(
    async (content: string, messageType: SendMessageData["messageType"] = "text", replyToMessageId?: string) => {
      if (isSendingMessage.current || !selectedConversation || !content.trim()) return;

      try {
        isSendingMessage.current = true;
        setLoading(true);
        clearError();

        const tempId = `temp-${Date.now()}`;
        const currentUserId = getCurrentUserId();
        const tempMessage: Message = {
          id: tempId,
          chatId: selectedConversation.id,
          content: content.trim(),
          sender_id: currentUserId ?? "unknown",
          created_at: new Date().toISOString(),
          isRead: false,
          messageType: "text",
        };

        setMessages((prev) => {
          const updated = [...prev, tempMessage];
          messagesCache.current.set(selectedConversation.id, updated);
          return updated;
        });

        const { websocketService: ws } = await import("@/lib/services/websocket.service");
        const { getCurrentUser } = await import("@/lib/auth/auth-utils");

        if (!ws.isConnected()) {
          const token = getAuthToken();
          if (token) {
            const user = getCurrentUser();
            const roleMapping: Record<string, "coach" | "dietitian" | "support"> = {
              adviser: "coach",
              dietitian: "dietitian",
              support_agent: "support",
              admin: "coach",
            };
            const userType = user?.role ? (roleMapping[user.role.toLowerCase()] ?? "coach") : "coach";
            await ws.connect({
              url: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000",
              token,
              userType,
              platform: "web",
            });
          }
        }

        const response = await ws.sendMessage({
          chat_id: selectedConversation.id,
          to: selectedConversation.user_id ?? "",
          message: content.trim(),
          reply_to_message_id: replyToMessageId,
        });

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
          messageType: "text",
        };

        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? newMessage : msg)));

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: {
                    content: newMessage.content ?? content,
                    created_at: newMessage.created_at ?? new Date().toISOString(),
                    sender_id: newMessage.sender_id ?? currentUserId ?? "unknown",
                  },
                  updatedAt: newMessage.created_at ?? new Date().toISOString(),
                }
              : conv,
          ),
        );

        toast.success("Mensaje enviado");
      } catch (err) {
        handleError(err, "Error enviando mensaje");
      } finally {
        setLoading(false);
        isSendingMessage.current = false;
      }
    },
    [selectedConversation, handleError, clearError],
  );

  // Marcar como leído
  const markAsRead = useCallback(async () => {
    if (!selectedConversation || isMarkingAsRead || selectedConversation.unread === 0) return;

    const now = Date.now();
    if (lastMarkedAsReadRef.current && now - lastMarkedAsReadRef.current < 3000) return;
    if (lastMarkedChatIdRef.current === selectedConversation.id && now - lastMarkedAsReadRef.current < 5000) return;

    try {
      setIsMarkingAsRead(true);
      lastMarkedAsReadRef.current = now;
      lastMarkedChatIdRef.current = selectedConversation.id;

      const unreadMessageIds = messages.filter((msg) => !msg.isRead).map((msg) => msg.id);
      await ChatService.markAsRead(selectedConversation.id, unreadMessageIds);

      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      setConversations((prev) =>
        prev.map((conv) => (conv.id === selectedConversation.id ? { ...conv, unread: 0 } : conv)),
      );
    } catch (err) {
      lastMarkedAsReadRef.current = 0;
      lastMarkedChatIdRef.current = null;
    } finally {
      setIsMarkingAsRead(false);
    }
  }, [selectedConversation, isMarkingAsRead, messages]);

  // Utilidades
  const getSelectedConversationInitials = useCallback(
    () => (selectedConversation ? getInitials(selectedConversation.name) : "??"),
    [selectedConversation],
  );

  const hasUnreadMessages = useCallback(() => conversations.some((conv) => conv.unread > 0), [conversations]);

  const getTotalUnreadCount = useCallback(
    () => conversations.reduce((total, conv) => total + conv.unread, 0),
    [conversations],
  );

  // Efectos de inicialización
  useEffect(() => {
    if (hasInitialized.current || isLoadingConversations.current) return;
    const token = getAuthToken();
    if (!token) {
      setIsConnected(false);
      return;
    }
    hasInitialized.current = true;
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (markAsReadTimeoutRef.current) clearTimeout(markAsReadTimeoutRef.current);
    if (selectedConversation && selectedConversation.unread > 0) {
      markAsReadTimeoutRef.current = setTimeout(() => markAsRead(), 800);
      return () => {
        if (markAsReadTimeoutRef.current) clearTimeout(markAsReadTimeoutRef.current);
      };
    }
  }, [selectedConversation?.id]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (selectConversationTimeoutRef.current) clearTimeout(selectConversationTimeoutRef.current);
    };
  }, []);

  // Contexto
  const websocketNotifications: WebSocketNotification[] = [];

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
      totalWebSocketNotifications: notificationsReceived,
      unreadWebSocketNotifications: notificationsReceived,
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
      updateWebSocketAssignedChats: () => {},
      clearWebSocketNotifications: () => console.log("🧹 Limpiando notificaciones WebSocket"),
    }),
    [
      conversations,
      selectedConversation,
      messages,
      stats,
      loading,
      error,
      isConnected,
      isMarkingAsRead,
      websocketConnected,
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
    ],
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
