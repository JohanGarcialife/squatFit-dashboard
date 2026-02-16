"use client";

import { useState, useMemo, useRef, useEffect } from "react";

import clsx from "clsx";
import { jwtDecode } from "jwt-decode";
import { User, MoreHorizontal, Wifi, WifiOff, Loader2 } from "lucide-react";

import { useChat } from "@/contexts/chat-context";
import { getAuthToken } from "@/lib/auth/auth-utils";
import { formatMessageTime, getInitials, getRoleDisplayName } from "@/lib/services/chat-service";

export default function Chat() {
  const { conversations, selectedConversation, selectConversation, loading, error, isConnected } = useChat();

  // Función para obtener el ID del usuario actual
  const getCurrentUserId = () => {
    try {
      const token = getAuthToken();
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.sub;
      }
    } catch (error) {
      console.error("Error obteniendo ID del usuario actual:", error);
    }
    return null;
  };

  // Filtrar conversaciones por búsqueda
  const filteredConversations = useMemo(() => {
    return conversations;
  }, [conversations]);

  // Ordenar conversaciones por última actividad
  const sortedConversations = useMemo(() => {
    const sorted = [...filteredConversations].sort((a, b) => {
      // Primero las que tienen mensajes no leídos
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;

      // Luego por fecha de última actividad
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();

      return bTime - aTime;
    });

    return sorted;
  }, [filteredConversations]);

  // Agrupar conversaciones por tipo
  const groupedConversations = useMemo(() => {
    const groups = {
      userProfessional: [] as typeof conversations, // Chats con usuarios (user_professional)
      professionalProfessional: [] as typeof conversations, // Chats entre profesionales (professional_professional, otro NO es admin)
      adminChats: [] as typeof conversations, // Chats con admins (professional_professional, otro ES admin)
    };

    sortedConversations.forEach((chat) => {
      if (chat.chat_type === "professional_professional") {
        // Verificar si el otro profesional es admin
        // professionalRole contiene el rol del otro participante
        if (chat.professionalRole === "admin") {
          groups.adminChats.push(chat);
        } else {
          groups.professionalProfessional.push(chat);
        }
      } else {
        // Es user_professional
        groups.userProfessional.push(chat);
      }
    });

    return groups;
  }, [sortedConversations]);

  // Ref para debounce de selección de conversación
  const selectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup del timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (selectTimeoutRef.current) {
        clearTimeout(selectTimeoutRef.current);
      }
    };
  }, []);

  // Manejar selección de conversación con debounce
  const handleSelectConversation = (chatId: string) => {
    if (!chatId || typeof chatId !== "string" || chatId.trim() === "") {
      return;
    }

    // Limpiar timeout anterior si existe
    if (selectTimeoutRef.current) {
      clearTimeout(selectTimeoutRef.current);
    }

    // Debounce de 300ms para evitar múltiples clics rápidos y throttling
    selectTimeoutRef.current = setTimeout(() => {
      selectConversation(chatId);
    }, 300);
  };

  // Renderizar estado de carga
  const renderLoadingState = () => {
    if (!(loading && conversations.length === 0)) return null;

    return (
      <div className="flex flex-col gap-1 p-2">
        <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando conversaciones...
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={`loading-${i}`} className="flex animate-pulse items-center gap-3 rounded-lg p-2.5">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-grow">
              <div className="mb-1 h-4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar estado de error
  const renderErrorState = () => {
    if (!(error && conversations.length === 0)) return null;

    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-2 text-red-500">
          <WifiOff size={24} />
        </div>
        <p className="mb-2 text-sm text-red-600 dark:text-red-400">Error cargando conversaciones</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  };

  // Renderizar lista vacía (solo si no está cargando y no hay error)
  const renderEmptyState = () => {
    if (!(conversations.length === 0 && !loading && !error)) return null;

    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-2 text-gray-400">
          <User size={24} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay conversaciones disponibles</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Las conversaciones aparecerán aquí cuando estén disponibles
        </p>
      </div>
    );
  };

  // Renderizar avatar del chat
  const renderChatAvatar = (chat: unknown) => (
    <div className="relative flex-shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
        {getInitials(chat.name)}
      </div>
      {/* Indicador de actividad */}
      {chat.isActive && (
        <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
      )}
    </div>
  );

  // Renderizar información del chat
  const renderChatInfo = (chat: unknown) => (
    <div className="min-w-0 flex-grow overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{chat.name}</p>
        {chat.lastMessage && (
          <span className="ml-2 flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
            {formatMessageTime(chat.lastMessage.created_at)}
          </span>
        )}
      </div>

      {/* Etiquetas como badges */}
      {chat.tags && chat.tags.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {chat.tags.map((tag: string, index: number) => {
            const getTagColor = () => {
              switch (tag.toLowerCase()) {
                case "nutrition":
                case "nutrición":
                  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                case "training":
                case "entrenamiento":
                  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
                case "emotional":
                case "emocional":
                  return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
                case "support":
                case "soporte":
                  return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
                case "sales":
                case "ventas":
                  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
                default:
                  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
              }
            };

            return (
              <span key={index} className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTagColor()}`}>
                {tag}
              </span>
            );
          })}
        </div>
      ) : (
        // ✅ Mostrar rol del profesional si es professional_professional, sino "Sin etiquetas"
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {chat.chat_type === "professional_professional" && chat.professionalRole
            ? `Rol: ${getRoleDisplayName(chat.professionalRole)}`
            : "Sin etiquetas"}
        </p>
      )}

      {chat.lastMessage && (
        <p className="truncate text-xs text-gray-400 dark:text-gray-500">
          {chat.lastMessage.sender === getCurrentUserId() ? "Tú: " : ""}
          {chat.lastMessage.content}
        </p>
      )}
    </div>
  );

  // Renderizar metadata y contadores
  const renderChatMetadata = (chat: unknown) => (
    <div className="ml-2 flex flex-shrink-0 flex-col items-end gap-y-1">
      {chat.name === "Nuevos Leads" ? (
        <MoreHorizontal size={16} className="text-gray-500 dark:text-gray-400" />
      ) : (
        <div className="h-4 w-4" />
      )}

      {chat.unread > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
          {chat.unread > 99 ? "99+" : chat.unread}
        </div>
      )}
    </div>
  );

  // Renderizar un elemento de conversación individual
  const renderConversationItem = (chat: unknown) => {
    // Validar que el chat tenga un ID válido
    if (!chat.id || typeof chat.id !== "string" || chat.id.trim() === "") {
      return null;
    }

    return (
      <div
        key={chat.id}
        className={clsx("flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all duration-150", {
          "bg-blue-100/70 shadow-sm dark:bg-blue-900/40": selectedConversation?.id === chat.id,
          "hover:bg-gray-100/80 dark:hover:bg-gray-800/60": selectedConversation?.id !== chat.id,
          "border-l-2 border-blue-500": chat.unread > 0,
          // ✅ Color diferenciado para chats professional_professional
          "bg-purple-50 dark:bg-purple-900/20":
            chat.chat_type === "professional_professional" && selectedConversation?.id !== chat.id,
          "hover:bg-purple-100/80 dark:hover:bg-purple-800/30":
            chat.chat_type === "professional_professional" && selectedConversation?.id !== chat.id,
        })}
        onClick={() => handleSelectConversation(chat.id)}
      >
        {renderChatAvatar(chat)}
        {renderChatInfo(chat)}
        {renderChatMetadata(chat)}
      </div>
    );
  };

  // Renderizar estados especiales
  const loadingState = renderLoadingState();
  if (loadingState) return loadingState;

  const errorState = renderErrorState();
  if (errorState) return errorState;

  const emptyState = renderEmptyState();
  if (emptyState) return emptyState;

  return (
    <div className="flex flex-col gap-1 p-2">
      {/* Indicador de estado de conexión */}
      <div className="flex items-center justify-between px-2 py-1 text-xs">
        <span className="text-gray-500 dark:text-gray-400">{conversations.length} conversaciones</span>
        <div className="flex items-center gap-1">
          {isConnected ? (
            <>
              <Wifi size={12} className="text-green-500" />
              <span className="text-green-600 dark:text-green-400">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-red-500" />
              <span className="text-red-600 dark:text-red-400">Desconectado</span>
            </>
          )}
        </div>
      </div>

      {/* Sección: Chats con Usuarios */}
      {groupedConversations.userProfessional.length > 0 && (
        <>
          <div className="border-b border-gray-200 px-2 py-2 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:border-gray-700 dark:text-gray-400">
            👤 Chats con Usuarios ({groupedConversations.userProfessional.length})
          </div>
          {groupedConversations.userProfessional.map((chat) => renderConversationItem(chat))}
        </>
      )}

      {/* Sección: Chats entre Profesionales */}
      {groupedConversations.professionalProfessional.length > 0 && (
        <>
          <div className="mt-2 border-b border-gray-200 px-2 py-2 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:border-gray-700 dark:text-gray-400">
            👥 Chats entre Profesionales ({groupedConversations.professionalProfessional.length})
          </div>
          {groupedConversations.professionalProfessional.map((chat) => renderConversationItem(chat))}
        </>
      )}

      {/* Sección: Chats con Admins */}
      {groupedConversations.adminChats.length > 0 && (
        <>
          <div className="mt-2 border-b border-gray-200 px-2 py-2 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:border-gray-700 dark:text-gray-400">
            🔐 Chats con Admins ({groupedConversations.adminChats.length})
          </div>
          {groupedConversations.adminChats.map((chat) => renderConversationItem(chat))}
        </>
      )}

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {searchQuery && sortedConversations.length === 0 && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-2 text-gray-400">
            <User size={24} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron conversaciones</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
}
