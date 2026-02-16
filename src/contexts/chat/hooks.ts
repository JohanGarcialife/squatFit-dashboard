"use client";

import { useContext } from "react";

import { ChatContext } from "./ChatProvider";
import type { ChatContextType } from "./types";

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
