"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import clsx from "clsx";
import { MoreHorizontal, Paperclip, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/contexts/chat-context";
import { getAuthTokenFromClient, getAuthTokenFromStorage } from "@/lib/auth/cookie-utils";
import { decodeToken } from "@/lib/auth/jwt-utils";
import { formatMessageTime, isRecentMessage, ChatService } from "@/lib/services/chat-service";

// Componente MessageInput separado para evitar re-renders
const MessageInput = React.memo(
  ({
    selectedConversation,
    sendMessage,
    loading,
    isConnected,
    inputRef,
  }: {
    selectedConversation: any;
    sendMessage: any;
    loading: boolean;
    isConnected: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => {
    const [messageText, setMessageText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSendMessage = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation || loading) return;

        const content = messageText.trim();
        setMessageText("");
        setIsTyping(false);

        try {
          await sendMessage(content);
        } catch (error) {
          console.error("Error enviando mensaje:", error);
        }
      },
      [messageText, selectedConversation, loading, sendMessage],
    );

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMessageText(value);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      const hasContent = value.trim().length > 0;
      typingTimeoutRef.current = setTimeout(() => setIsTyping(hasContent), 300);
    }, []);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    }, [handleSendMessage]);

    useEffect(() => () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }, []);

    return (
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-4">
        <Button type="button" variant="ghost" size="icon" className="h-10 w-10">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          ref={inputRef}
          value={messageText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          disabled={loading || !isConnected}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-primary h-10 w-10 rounded-full"
          disabled={!messageText.trim() || loading || !isConnected}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    );
  },
);

MessageInput.displayName = "MessageInput";

// Componente Conversation - Muestra conversación seleccionada y permite enviar mensajes
export default function Conversation() {
  const { selectedConversation, messages, sendMessage, loading, error, isConnected } = useChat();

  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      newSet.has(messageId) ? newSet.delete(messageId) : newSet.add(messageId);
      return newSet;
    });
  };

  const isLongMessage = (content: string): boolean => {
    if (!content || typeof content !== "string") return false;
    return content.length > 200 || content.split("\n").length > 3;
  };

  const currentUserId = useMemo(() => {
    try {
      let token = getAuthTokenFromClient();
      token ??= getAuthTokenFromStorage();
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) return decoded.sub ?? null;
      }
    } catch (error) {
      console.error("Error obteniendo ID del usuario:", error);
    }
    return null;
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight >= 100);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0 || selectedConversation) scrollToBottom();
    if (selectedConversation && inputRef.current) inputRef.current.focus();
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [messages, selectedConversation]);

  const processedMessages = useMemo(() => {
    if (!messages.length) return [];
    return messages.map((message) => ({
      ...message,
      messageDate: new Date(message.created_at).toDateString(),
      isFromMe: (message as any).sender_id === currentUserId,
      isRecent: isRecentMessage(message.created_at),
      stableKey: message.id ?? `msg-${message.created_at}-${message.content?.substring(0, 10)}`,
    }));
  }, [messages, currentUserId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";
    return date.toLocaleDateString("es-ES", { weekday: "long", month: "long", day: "numeric" });
  };

  if (!selectedConversation) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-white dark:bg-gray-900/50">
        <div className="text-center">
          <div className="mb-4 text-gray-400"><MoreHorizontal size={48} /></div>
          <p className="mb-2 text-lg font-semibold text-gray-500 dark:text-gray-400">Selecciona una conversación</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Elige un chat de la lista para comenzar a conversar</p>
        </div>
      </div>
    );
  }

  let lastDate: string | null = null;

  return (
    <div className="flex h-screen max-h-screen flex-col rounded-lg bg-white dark:bg-gray-900/50">
      <header className="flex items-center border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedConversation.name}</h2>
            {selectedConversation.isActive && <div className="h-2 w-2 rounded-full bg-green-500" />}
          </div>
          <p className="text-primary dark:text-primary-400 text-sm">
            {selectedConversation.tags.length > 0 ? selectedConversation.tags.join(" | ") : "Sin etiquetas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected && (
            <div className="flex items-center gap-1 text-xs text-red-500">
              <div className="h-2 w-2 rounded-full bg-red-500" />Sin conexión
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => {}} className="text-xs">
            Probar Límites
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => {
            if (selectedConversation) {
              try { await ChatService.getMessages(selectedConversation.id); } catch (error) { console.error("Error obteniendo todos los mensajes:", error); }
            }
          }} className="text-xs">Obtener Todos</Button>
          <Button variant="ghost" size="icon"><MoreHorizontal className="text-gray-500 dark:text-gray-400" /></Button>
        </div>
      </header>

      <main ref={messagesContainerRef} className="relative min-h-0 flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
        {loading && messages.length === 0 ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-end gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="max-w-md rounded-lg bg-gray-200 p-3 dark:bg-gray-700">
                  <div className="mb-1 h-4 rounded bg-gray-300 dark:bg-gray-600" />
                  <div className="h-3 w-1/3 rounded bg-gray-300 dark:bg-gray-600" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {processedMessages.map((message) => {
              const showDateSeparator = message.messageDate !== lastDate;
              if (showDateSeparator) lastDate = message.messageDate;

              return (
                <React.Fragment key={message.stableKey}>
                  {showDateSeparator && (
                    <div className="my-2 flex justify-center">
                      <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300">{formatDate(message.created_at)}</span>
                    </div>
                  )}
                  <div className={clsx("flex items-end gap-2", { "justify-end": message.isFromMe, "justify-start": !message.isFromMe })}>
                    <div className={clsx("max-w-2xl rounded-lg p-3 transition-all duration-200", {
                      "bg-primary text-primary-foreground rounded-br-none": message.isFromMe,
                      "bg-muted text-foreground rounded-bl-none": !message.isFromMe,
                      "ring-2 ring-blue-300 dark:ring-blue-600": message.isRecent && !message.isFromMe,
                      "opacity-90": !message.isRead && !message.isFromMe,
                    })}>
                      <div className="text-sm break-words whitespace-pre-wrap">
                        {(() => {
                          const isExpanded = expandedMessages.has(message.id);
                          const content = message.content ?? "";
                          const isLong = isLongMessage(content);

                          if (!isLong || isExpanded) {
                            return (
                              <div>
                                {content}
                                {isLong && isExpanded && (
                                  <div className="mt-2">
                                    <button
                                      onClick={() => toggleMessageExpansion(message.id)}
                                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Ver menos <ChevronUp className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Mostrar solo las primeras líneas para mensajes largos
                          const lines = content.split("\n");
                          const preview = lines.slice(0, 3).join("\n");
                          const hasMore = lines.length > 3 || content.length > 200;

                          return (
                            <div>
                              {preview}
                              {hasMore && (
                                <div className="mt-2">
                                  <button onClick={() => toggleMessageExpansion(message.id)} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                    Ver más <ChevronDown className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <p className="text-xs opacity-70">{formatMessageTime(message.created_at)}</p>
                        {message.isFromMe && <div className="text-xs opacity-70">{message.isRead ? "✓✓" : "✓"}</div>}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {showScrollButton && (
          <button onClick={scrollToBottom} className="bg-primary hover:bg-primary/90 fixed right-8 bottom-20 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200" title="Ir al final">
            <ChevronDown className="h-5 w-5" />
          </button>
        )}
      </main>

      <MessageInput selectedConversation={selectedConversation} sendMessage={sendMessage} loading={loading} isConnected={isConnected} inputRef={inputRef} />
    </div>
  );
}
