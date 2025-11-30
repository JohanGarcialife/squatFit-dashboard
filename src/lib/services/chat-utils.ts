// ============================================================================
// FUNCIONES UTILITARIAS PARA EL SISTEMA DE CHAT
// ============================================================================

/**
 * Formatear tiempo de mensaje para mostrar en la UI
 * @param timestamp - Timestamp del mensaje
 * @returns String formateado con el tiempo
 */
export function formatMessageTime(timestamp: string): string {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes < 1 ? "Ahora" : `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else if (diffInHours < 168) {
    // 7 días
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  } else {
    return messageDate.toLocaleDateString();
  }
}

/**
 * Verificar si un mensaje es reciente (menos de 5 minutos)
 * @param timestamp - Timestamp del mensaje
 * @returns true si el mensaje es reciente
 */
export function isRecentMessage(timestamp: string): boolean {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now.getTime() - messageDate.getTime()) / (1000 * 60);
  return diffInMinutes < 5;
}

/**
 * Obtener iniciales de un nombre para avatar
 * @param name - Nombre completo
 * @returns Iniciales del nombre
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "??";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Validar si un ID de conversación es válido
 * @param chatId - ID de la conversación
 * @returns true si el ID es válido
 */
export function isValidChatId(chatId: string): boolean {
  return !!(chatId && typeof chatId === "string" && chatId.trim() !== "");
}

/**
 * Generar un ID temporal para conversaciones
 * @param prefix - Prefijo para el ID
 * @returns ID temporal único
 */
export function generateTempId(prefix: string = "temp"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtener nombre amigable para mostrar de un rol
 * @param roleName - Nombre técnico del rol (adviser, dietitian, support_agent, etc.)
 * @returns Nombre amigable en español
 */
export function getRoleDisplayName(roleName: string): string {
  if (!roleName) return "";

  const roleNames: Record<string, string> = {
    adviser: "Coach",
    coach: "Coach",
    dietitian: "Nutricionista",
    support_agent: "Soporte",
    sales: "Ventas",
    psychologist: "Psicóloga",
    admin: "Administrador",
  };

  return roleNames[roleName.toLowerCase()] || roleName;
}
