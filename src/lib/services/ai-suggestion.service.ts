import { getAuthToken } from "@/lib/auth/auth-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000";
const REQUEST_TIMEOUT = 10000;

export interface AISuggestion {
  id: string;
  suggestion: string;
  model_used?: string;
  created_at: string;
}

export interface GenerateSuggestionRequest {
  message: string;
  context?: string;
  usage_type?: "internal_assistant" | "direct_client";
}

class AISuggestionService {
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    if (!token && typeof window !== "undefined") {
      try {
        const fallbackToken = localStorage.getItem("authToken");
        if (fallbackToken) {
          defaultHeaders.Authorization = `Bearer ${fallbackToken}`;
        }
      } catch (error) {
        console.warn("Error accessing localStorage:", error);
      }
    }
    return defaultHeaders;
  }

  private static async handleResponseError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      console.warn("Token de autenticación inválido o expirado");
      throw new Error("Unauthorized");
    }
    if (response.status === 503) {
      throw new Error("IA no está activa actualmente");
    }
    throw new Error(errorData.message ?? errorData.error ?? `Error ${response.status}: ${response.statusText}`);
  }

  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = this.getDefaultHeaders(token);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        await this.handleResponseError(response);
      }
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("La petición tardó demasiado tiempo");
        }
        throw error;
      }
      throw new Error("Error de conexión con el servidor");
    }
  }

  async generateSuggestion(chatId: string, request: GenerateSuggestionRequest): Promise<AISuggestion> {
    return AISuggestionService.makeRequest<AISuggestion>(`/api/v1/admin-panel/chat/${chatId}/ai-suggestions`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getSuggestionsForMessage(messageId: string): Promise<AISuggestion[]> {
    return AISuggestionService.makeRequest<AISuggestion[]>(`/api/v1/admin-panel/messages/${messageId}/ai-suggestions`);
  }

  async markSuggestionAsUsed(suggestionId: string): Promise<void> {
    return AISuggestionService.makeRequest<void>(`/api/v1/admin-panel/ai-suggestions/${suggestionId}/mark-as-used`, {
      method: "PUT",
    });
  }
}

export const aiSuggestionService = new AISuggestionService();
