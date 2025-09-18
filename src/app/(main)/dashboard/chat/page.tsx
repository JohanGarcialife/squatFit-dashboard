"use client";

import React, { useState, useEffect } from "react";

import { Search, Plus } from "lucide-react";

import WebSocketSimple from "@/components/WebSocketSimple";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";

import Chat from "./_components/Chat";
import Conversation from "./_components/Conversation";
import FichaTecnica from "./_components/FichaTecnica";
import Filtros from "./_components/Filtros";
/**
 * Página principal del Chat
 *
 * Esta página organiza el layout del sistema de chat en tres columnas:
 * - Columna izquierda: Búsqueda, filtros y lista de conversaciones
 * - Columna central: Área de mensajes y envío
 * - Columna derecha: Ficha técnica del usuario seleccionado
 *
 * Características:
 * - Layout responsivo de 3 columnas
 * - Búsqueda en tiempo real
 * - Integración completa con el contexto de chat
 * - Botón para crear nueva conversación
 */
export default function Page() {
  const { conversations, loading } = useChat();
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Manejar búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  // Log para debugging
  useEffect(() => {
    console.log("🔐 JWT Token del contexto:", token);
    console.log("👤 Usuario del contexto:", user);
  }, [token, user]);

  // Manejar creación de nueva conversación
  const handleNewConversation = () => {
    // TODO: Implementar modal para crear nueva conversación
    console.log("Crear nueva conversación");
  };

  if (!token) return null;
  return (
    <div className="flex h-screen max-h-screen flex-col gap-4 lg:flex-row">
      {/* COLUMNA IZQUIERDA - Lista de conversaciones */}
      <div className="border-primary/10 h-full w-full space-y-5 border-r pr-2 lg:w-1/5">
        {/* Barra de búsqueda */}
        <div className="border-border flex h-fit w-full flex-row items-center gap-2 rounded-full border bg-[#d7e3ee] p-2">
          <Search className="text-[#6c727e]" size={16} />
          <input
            placeholder="Buscar un chat o iniciar nuevo"
            type="text"
            className="w-full bg-transparent text-sm outline-none"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filtros */}
        <Filtros />

        {/* Componente WebSocket Simple */}
        <WebSocketSimple />

        {/* Lista de conversaciones */}
        <div className="flex-grow overflow-hidden">
          <Chat />
        </div>

        {/* Botón para nueva conversación */}
        <div className="flex w-full items-end justify-end p-4">
          <button
            onClick={handleNewConversation}
            className="bg-primary flex w-fit cursor-pointer items-center justify-center rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            disabled={loading}
          >
            <Plus className="text-white" size={20} />
          </button>
        </div>
      </div>

      {/* COLUMNA CENTRAL - Área de mensajes */}
      <div className="flex h-full w-full flex-col gap-4 lg:w-3/5">
        <Conversation />
      </div>

      {/* COLUMNA DERECHA - Ficha técnica */}
      <div className="flex h-full w-full flex-col gap-4 lg:w-1/4">
        <FichaTecnica />
      </div>
    </div>
  );
}
