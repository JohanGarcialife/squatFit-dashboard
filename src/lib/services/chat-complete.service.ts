import { getAuthToken } from "@/lib/auth/auth-utils";

/**
 * Servicio para gestionar chats completados
 */
export class ChatCompleteService {
  private static readonly BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin-panel`;

  /**
   * Marca un chat como completado
   */
  static async completeChat(chatId: string): Promise<any> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    try {
      const response = await fetch(`${this.BASE_URL}/chat/${chatId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error marcando chat como completado:", error);
      throw error;
    }
  }

  /**
   * Reabre un chat completado
   */
  static async reopenChat(chatId: string): Promise<any> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    try {
      const response = await fetch(`${this.BASE_URL}/chat/${chatId}/reopen`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error reabriendo chat:", error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de chats completados
   */
  static async getCompletedChats(limit: number = 50): Promise<any[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    try {
      const response = await fetch(`${this.BASE_URL}/chats/completed?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo chats completados:", error);
      throw error;
    }
  }
}
