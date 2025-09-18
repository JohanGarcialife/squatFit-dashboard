"use client";

import { useWebSocketSimple } from "@/hooks/use-websocket-simple";

/**
 * Componente SIMPLE para WebSocket
 * Reemplaza todas las implementaciones complejas
 * Basado EXACTAMENTE en el script funcional
 */
export default function WebSocketSimple() {
  const { isConnected, isConnecting, notificationsReceived, error } = useWebSocketSimple();

  // No renderiza nada visible, solo maneja la conexión
  // Los logs se muestran en la consola del navegador
  return null;
}
