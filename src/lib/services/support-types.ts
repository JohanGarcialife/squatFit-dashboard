/**
 * Tipos para el sistema de soporte
 * Basado en la documentación del sistema de mensajería de soporte
 */

// ============================================================================
// ENUMS
// ============================================================================

export type TicketStatus = "pending" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Usuario del ticket (puede ser cliente o agente)
 */
export interface TicketUser {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

/**
 * Ticket de soporte
 */
export interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  created_at: string;
  updated_at: string;
  user?: TicketUser;
  unread?: number; // Contador de mensajes no leídos
  lastMessage?: SupportMessage;
}

/**
 * Mensaje de soporte
 */
export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  classified_channel?: string;
  confidence_score?: number;
  classification_factors?: unknown;
  sender?: TicketUser;
}

/**
 * Estadísticas de soporte
 */
export interface SupportStats {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResponseTime?: number;
  assignedToMe?: number;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

/**
 * Datos para enviar un mensaje
 */
export interface SendSupportMessageData {
  content: string;
  senderId: string;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Notificación de WebSocket para soporte
 */
export interface SupportWebSocketNotification {
  type: string;
  data: {
    ticketId: string;
    message: string;
    userId: string;
    timestamp: string;
    agentId?: string;
  };
}
