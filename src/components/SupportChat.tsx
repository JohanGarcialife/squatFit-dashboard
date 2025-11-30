"use client";

import { useEffect, useState, useRef } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSupportWebSocket } from "@/hooks/useSupportWebSocket";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  created_at: string;
}

interface SupportChatProps {
  ticketId: string;
  userId: string;
  agentId: string;
}

export default function SupportChat({ ticketId, userId, agentId }: SupportChatProps) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Configurar WebSocket para soporte
  const { isConnected, error, connect, sendMessage } = useSupportWebSocket({
    autoConnect: false, // Conectar manualmente
    onNewMessage: (data) => {
      console.log("📨 Nuevo mensaje de soporte recibido:", data);

      // Verificar si es del ticket actual
      if (data.message.chat_id === ticketId) {
        // Agregar mensaje a la lista
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            content: data.message.message,
            sender_id: data.message.from,
            created_at:
              typeof data.message.timestamp === "string"
                ? data.message.timestamp
                : new Date(data.message.timestamp).toISOString(),
            isRead: false,
            messageType: "text",
          } as Message,
        ]);
      }
    },
    onError: (error) => {
      console.error("❌ Error en WebSocket de soporte:", error);
    },
  });

  // Cargar mensajes iniciales del ticket
  useEffect(() => {
    loadMessages();
  }, [ticketId]);

  // Conectar al WebSocket cuando hay token
  useEffect(() => {
    if (token) {
      connect();
    }
  }, [token, connect]);

  // Los nuevos mensajes se manejan en el callback del hook

  // Scroll automático a nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar mensajes del ticket desde la API
  async function loadMessages() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/support/backoffice/tickets/${ticketId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    }
  }

  // Enviar mensaje de soporte
  async function handleSendMessage() {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      // ⚠️ IMPORTANTE: ÚNICA FORMA DE ENVIAR MENSAJES - Solo WebSocket
      // NO uses fetch() o axios para enviar mensajes
      const response = await sendMessage({
        chat_id: ticketId, // UUID del ticket (IMPORTANTE: UUID para soporte)
        to: userId, // UUID del usuario
        message: newMessage,
      });

      console.log("✅ Mensaje de soporte enviado:", response);

      // Agregar mensaje a la lista (optimistic update)
      setMessages((prev) => [
        ...prev,
        {
          id: response.message.id,
          content: response.message.message,
          sender_id: agentId,
          created_at:
            typeof response.message.timestamp === "string"
              ? response.message.timestamp
              : new Date(response.message.timestamp).toISOString(),
          isRead: false,
          messageType: "text",
        } as Message,
      ]);

      setNewMessage("");
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      alert("Error enviando mensaje. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header del ticket */}
      <div className="border-b bg-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ticket #{ticketId.slice(0, 8)}</h2>
            <p className="text-sm text-gray-600">Usuario: {userId.slice(0, 8)}...</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-gray-600">{isConnected ? "Conectado" : "Desconectado"}</span>
          </div>
        </div>
        {error && <div className="mt-2 text-sm text-red-600">Error: {error.message}</div>}
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === agentId ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender_id === agentId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="mt-1 block text-xs opacity-75">{new Date(msg.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe tu respuesta al usuario..."
            disabled={!isConnected || isLoading}
            className="flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || isLoading || !newMessage.trim()}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">💡 El mensaje se enviará automáticamente al usuario en Telegram</p>
      </div>
    </div>
  );
}
