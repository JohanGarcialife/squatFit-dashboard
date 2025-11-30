import { jwtDecode } from "jwt-decode";

import { getAuthToken } from "@/lib/auth/auth-utils";
import { Message } from "@/lib/services/chat-types";

/**
 * Obtiene el ID del usuario actual del token JWT
 */
export const getCurrentUserId = (): string | null | undefined => {
  try {
    const token = getAuthToken();
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.sub;
    }
  } catch {
    // Silently fail
  }
  return null;
};

/**
 * Verifica si una notificación ya fue procesada
 */
export const isNotificationProcessed = (processedNotifications: Set<string>, notificationId: string): boolean => {
  return processedNotifications.has(notificationId);
};

/**
 * Verifica si un mensaje es duplicado en el cache
 */
export const isMessageDuplicate = (
  messagesCache: Map<string, Message[]>,
  chatId: string,
  message: string,
  userId: string,
): boolean => {
  const cachedMessages = messagesCache.get(chatId) ?? [];
  return cachedMessages.some(
    (msg) => msg.content === message && (msg as any).sender_id === userId && msg.chatId === chatId,
  );
};

/**
 * Verifica si un mensaje es duplicado en el estado actual
 */
export const isCurrentMessageDuplicate = (
  messages: Message[],
  message: string,
  userId: string,
  chatId: string,
): boolean => {
  return messages.some((msg) => msg.content === message && (msg as any).sender_id === userId && msg.chatId === chatId);
};

/**
 * Crea un nuevo mensaje con formato normalizado
 */
export const createNewMessage = (
  id: string | null,
  chatId: string,
  message: string,
  userId: string,
  timestamp: string,
  generateUniqueMessageId: () => string,
  senderInfo?: any,
): Message => {
  const currentUserId = getCurrentUserId();
  const isFromCurrentUser = userId === currentUserId;

  return {
    id: id ?? generateUniqueMessageId(),
    chatId: chatId,
    content: message ?? "Nuevo mensaje",
    sender_id: isFromCurrentUser ? currentUserId : userId,
    created_at: timestamp ?? new Date().toISOString(),
    isRead: false,
    messageType: "text" as const,
    sender: senderInfo,
  } as Message;
};

/**
 * Busca un chat en el cache por chatId o userId
 */
export const findChatInCache = (
  messagesCache: Map<string, Message[]>,
  conversations: any[],
  chatId: string,
  userId: string,
): { targetChatId: string; currentCachedMessages: Message[] } => {
  let targetChatId = chatId;
  let currentCachedMessages = messagesCache.get(chatId) ?? [];

  if (currentCachedMessages.length === 0) {
    for (const [cachedChatId, cachedMessages] of messagesCache.entries()) {
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

/**
 * Actualiza el cache con un nuevo mensaje
 */
export const updateCacheWithMessage = (
  messagesCache: Map<string, Message[]>,
  targetChatId: string,
  currentCachedMessages: Message[],
  newMessage: Message,
): void => {
  const messageExistsInCache = currentCachedMessages.some(
    (msg) =>
      msg.content === newMessage.content &&
      Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 2000,
  );

  if (!messageExistsInCache) {
    const updatedCachedMessages = [...currentCachedMessages, newMessage];
    messagesCache.set(targetChatId, updatedCachedMessages);
  }
};
