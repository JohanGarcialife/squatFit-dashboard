// Re-exportar todo desde la nueva ubicación modularizada
export { ChatProvider, ChatContext } from "./chat/ChatProvider";
export { useChat, useConversations, useMessages, useChatStats } from "./chat/hooks";
export type {
  ChatContextType,
  ChatProviderProps,
  WebSocketNotification,
  Conversation,
  Message,
  SendMessageData,
} from "./chat/types";
