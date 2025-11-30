import { Conversation, Message, ChatStats, SendMessageData } from "@/lib/services/chat-types";

export interface WebSocketNotification {
  type: string;
  data: {
    chatId: string;
    message: string;
    userId: string;
    timestamp: string;
    coachId?: string;
  };
}

export interface ChatContextType {
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
  sendMessage: (
    content: string,
    messageType?: SendMessageData["messageType"],
    replyToMessageId?: string,
  ) => Promise<void>;
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

export interface ChatProviderProps {
  children: React.ReactNode;
}

export type { Conversation, Message, ChatStats, SendMessageData };
