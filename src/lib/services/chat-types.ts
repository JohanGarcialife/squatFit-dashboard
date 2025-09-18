// ============================================================================
// TIPOS DE DATOS PARA EL SISTEMA DE CHAT
// ============================================================================

/**
 * Interfaz para representar una conversación de chat
 */
export interface Conversation {
  id: string;
  name: string;
  tags: string[];
  unread: number;
  user_id?: string; // ID del usuario para comparaciones
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  updatedAt: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * Interfaz para representar un mensaje individual
 */
export interface Message {
  id: string;
  chatId: string;
  content: string;
  sender_id: string;
  created_at: string;
  isRead: boolean;
  messageType: "text" | "image" | "audio" | "file";
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  };
}

/**
 * Interfaz para estadísticas del chat
 */
export interface ChatStats {
  totalConversations: number;
  unreadMessages: number;
  activeConversations: number;
  messagesToday: number;
  messagesThisWeek: number;
  averageResponseTime: number; // en minutos
}

/**
 * Interfaz para datos de envío de mensaje
 */
export interface SendMessageData {
  content: string;
  messageType?: "text" | "image" | "audio" | "file";
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  };
}

/**
 * Interfaz para la respuesta de la API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Interfaz para filtros de conversación
 */
export interface ConversationFilters {
  tags?: string[];
  isActive?: boolean;
  hasUnread?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Interfaz para opciones de búsqueda
 */
export interface SearchOptions {
  query: string;
  includeMessages?: boolean;
  limit?: number;
  offset?: number;
}
