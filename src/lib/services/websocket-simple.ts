import { io, Socket } from "socket.io-client";

import { getAuthToken } from "@/lib/auth/auth-utils";

/**
 * Servicio WebSocket SIMPLE basado EXACTAMENTE en test-hamlet-quick.js
 * Sin complicaciones, sin múltiples implementaciones, sin conflictos
 */

// Configuración EXACTA del script funcional
const PRODUCTION_URL = "https://squatfit-api-985835765452.europe-southwest1.run.app";
const WEBSOCKET_URL = PRODUCTION_URL;

console.log("🚀 WEBSOCKET SIMPLE: Basado en script funcional");
console.log("=".repeat(60));
console.log(`🌐 URL: ${PRODUCTION_URL}`);

class WebSocketSimple {
  private socket: Socket | null = null;
  private notificationsReceived = 0;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private callbacks: {
    onNotification?: (notification: any) => void;
    onConnected?: (data: any) => void;
    onError?: (error: any) => void;
    onDisconnect?: (reason: string) => void;
  } = {};

  constructor() {
    console.log("🔧 WebSocketSimple: Inicializado");
  }

  /**
   * Verificar si ya está conectado o conectando
   */
  private isAlreadyConnecting(): boolean {
    return this.isConnecting || (this.socket?.connected ?? false);
  }

  /**
   * Limpiar conexión anterior
   */
  private cleanupPreviousConnection(): void {
    if (this.socket) {
      console.log("🧹 WebSocketSimple: Limpiando conexión anterior...");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Obtener y limpiar token de autenticación
   */
  private async getCleanToken(): Promise<string> {
    console.log("\n🔐 Obteniendo token...");

    // Esperar un poco para asegurar que el token esté disponible
    await new Promise((resolve) => setTimeout(resolve, 200));

    const token = getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    // Limpiar el token si tiene "Bearer " al inicio
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    console.log("✅ Token obtenido correctamente");
    console.log("🔑 Token (primeros 50 chars):", cleanToken.substring(0, 50) + "...");

    return cleanToken;
  }

  /**
   * Decodificar y mostrar información del token
   */
  private logTokenInfo(cleanToken: string): void {
    try {
      const base64Payload = cleanToken.split(".")[1];
      const decodedPayload = atob(base64Payload);
      const tokenPayload = JSON.parse(decodedPayload);
      console.log("🔍 Token payload:", {
        id: tokenPayload.id,
        email: tokenPayload.email,
        firstName: tokenPayload.firstName,
        lastName: tokenPayload.lastName,
        role: tokenPayload.role,
        exp: new Date(tokenPayload.exp * 1000).toISOString(),
      });
    } catch (e) {
      console.error("❌ Error decodificando token:", e);
    }
  }

  /**
   * Crear socket con configuración específica
   */
  private createSocket(cleanToken: string): void {
    console.log("\n🔌 Conectando al WebSocket...");

    this.socket = io(`${WEBSOCKET_URL}/notifications`, {
      auth: {
        token: cleanToken,
      },
      query: {
        token: cleanToken,
      },
      transports: ["websocket", "polling"],
      timeout: 15000,
      forceNew: true,
      reconnection: false,
    });
  }

  /**
   * Conectar EXACTAMENTE como en el script funcional
   */
  async connect(callbacks?: any): Promise<void> {
    // Evitar múltiples conexiones simultáneas
    if (this.isAlreadyConnecting()) {
      console.log("⚠️ WebSocketSimple: Ya conectado o conectando...");
      return;
    }

    // Limpiar conexión anterior si existe
    this.cleanupPreviousConnection();

    this.callbacks = callbacks ?? {};
    this.isConnecting = true;

    try {
      const cleanToken = await this.getCleanToken();
      this.logTokenInfo(cleanToken);
      this.createSocket(cleanToken);
      this.setupSocketListeners();
    } catch (error) {
      console.error("❌ Error conectando:", error);
      this.isConnecting = false;
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * Configurar listeners EXACTAMENTE como en el script funcional
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Conectado al WebSocket");
      console.log(`🔗 Socket ID: ${this.socket?.id}`);
      this.isConnecting = false;
    });

    this.socket.on("connected", (data) => {
      console.log("✅ Autenticación exitosa:", data);

      // Registrar como coach EXACTAMENTE como en el script funcional
      this.socket?.emit("coach_register", { assignedChats: [] });
      this.callbacks.onConnected?.(data);
    });

    this.socket.on("coach_registered", (data) => {
      console.log("✅ Coach registrado exitosamente:", data);
      console.log("👂 Escuchando notificaciones...");
      console.log("💡 WebSocket listo para recibir notificaciones");
    });

    this.socket.on("notification", (notification) => {
      this.notificationsReceived++;
      console.log(`\n🔔 NOTIFICACIÓN #${this.notificationsReceived} RECIBIDA!`);
      console.log("📨 Tipo:", notification.type);
      console.log("💬 Mensaje:", notification.data.message);
      console.log("👤 Usuario:", notification.data.userId);
      console.log("🏷️  Chat ID:", notification.data.chatId);
      console.log("⏰ Timestamp:", notification.data.timestamp);
      console.log("🔗 Socket ID:", this.socket?.id);

      this.callbacks.onNotification?.(notification);
    });

    this.socket.on("error", (error) => {
      console.error("❌ Error WebSocket:", error);
      this.callbacks.onError?.(error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Desconectado:", reason);
      this.isConnecting = false;
      this.callbacks.onDisconnect?.(reason);
    });

    // Mantener conexión activa EXACTAMENTE como en el script funcional
    this.keepAliveInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log(`💓 Activo - Notificaciones: ${this.notificationsReceived}`);
      } else {
        this.stopKeepAlive();
      }
    }, 30000);
  }

  /**
   * Detener keep alive
   */
  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    console.log("\n🛑 Desconectando...");
    this.stopKeepAlive();
    this.isConnecting = false;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Obtener número de notificaciones recibidas
   */
  getNotificationsReceived(): number {
    return this.notificationsReceived;
  }

  /**
   * Verificar si está conectando
   */
  isConnectingState(): boolean {
    return this.isConnecting;
  }
}

// Instancia singleton
export const webSocketSimple = new WebSocketSimple();
