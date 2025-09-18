"use client";

import React from "react";

import clsx from "clsx";
import { ChevronRight, Circle, Clock, MessageSquare, Users, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { getInitials, formatMessageTime } from "@/lib/services/chat-service";

/**
 * Componente DetailItem - Elemento de detalle en la ficha técnica
 */
interface DetailItemProps {
  label: string;
  value: string | number;
  interactive?: boolean;
  icon?: React.ReactNode;
  action?: string;
  onClick?: () => void;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, interactive, icon, action, onClick }) => (
  <div
    className={clsx("flex items-center justify-between py-3 transition-colors duration-150", {
      "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800": interactive ?? action,
    })}
    onClick={onClick}
  >
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</span>
      {interactive && <ChevronRight size={16} className="text-gray-400" />}
      {action && <button className="text-sm text-orange-500 hover:underline">{action}</button>}
    </div>
  </div>
);

/**
 * Componente FichaTecnica - Panel de información del usuario
 *
 * Este componente muestra información detallada del usuario seleccionado
 * y estadísticas del chat.
 *
 * Características:
 * - Información del usuario
 * - Estadísticas del chat
 * - Acciones principales y secundarias
 * - Estados de carga y error
 */
export default function FichaTecnica() {
  const { selectedConversation, stats, loading, error } = useChat();

  // Renderizar estado sin conversación seleccionada
  if (!selectedConversation) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-gray-50/50 p-4 dark:bg-gray-900/20">
        <div className="text-center">
          <div className="mb-4 text-gray-400">
            <Users size={48} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona una conversación para ver detalles</p>
        </div>
      </div>
    );
  }

  // Obtener iniciales del usuario
  const initials = getInitials(selectedConversation.name);

  // Calcular tiempo desde último mensaje
  const getLastActivity = () => {
    if (!selectedConversation.lastMessage) return "Sin actividad";

    const lastMessageTime = new Date(selectedConversation.lastMessage.created_at);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastMessageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  // Datos de la ficha técnica
  const fichaData = {
    initials,
    name: selectedConversation.name,
    tags: selectedConversation.tags.length > 0 ? selectedConversation.tags.join(" | ") : "Sin etiquetas",
    details: [
      {
        label: "Estado",
        value: selectedConversation.isActive ? "Activo" : "Inactivo",
        icon: (
          <Circle
            size={14}
            className={clsx("fill-current", selectedConversation.isActive ? "text-green-500" : "text-gray-400")}
          />
        ),
      },
      {
        label: "Mensajes no leídos",
        value: selectedConversation.unread.toString(),
        icon: <MessageSquare size={14} className="text-blue-500" />,
      },
      {
        label: "Última actividad",
        value: getLastActivity(),
        icon: <Clock size={14} className="text-gray-500" />,
      },
      {
        label: "Responsable",
        value: "Coach",
        interactive: true,
      },
      {
        label: "Tarea",
        value: "Seguimiento",
        interactive: true,
        icon: <Circle size={14} className="fill-current text-blue-500" />,
      },
    ],
    mainActions: ["Reasignar responsable", "Marcar como completado", "Ver historial completo"],
    secondaryActions: ["Asignar rutina", "Actualizar estado", "Agregar nota"],
  };

  return (
    <div className="flex h-full flex-col gap-6 rounded-lg bg-gray-50/50 p-4 dark:bg-gray-900/20">
      <h2 className="text-primary text-lg font-bold">Ficha Técnica</h2>

      {/* Información del Usuario */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="h-20 w-20 bg-gradient-to-br from-orange-500 to-red-500">
          <AvatarFallback className="bg-transparent text-2xl font-bold text-white">{fichaData.initials}</AvatarFallback>
        </Avatar>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{fichaData.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{fichaData.tags}</p>

        {/* Indicador de estado */}
        <div className="flex items-center gap-1 text-xs">
          <Circle
            size={8}
            className={clsx("fill-current", selectedConversation.isActive ? "text-green-500" : "text-gray-400")}
          />
          <span
            className={clsx(
              "font-medium",
              selectedConversation.isActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400",
            )}
          >
            {selectedConversation.isActive ? "En línea" : "Desconectado"}
          </span>
        </div>
      </div>

      {/* Detalles */}
      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
        {fichaData.details.map((item) => (
          <DetailItem key={item.label} {...item} />
        ))}
      </div>

      {/* Estadísticas del Chat */}
      {stats && (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <TrendingUp size={16} />
            Estadísticas
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{stats.totalConversations}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Conversaciones</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <div className="flex items-center gap-2">
                <Circle size={14} className="text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{stats.unreadMessages}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">No leídos</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{stats.activeConversations}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Activas</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-200">{stats.messagesToday}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Hoy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones Principales */}
      <div className="flex flex-col gap-3">
        {fichaData.mainActions.map((action) => (
          <Button
            key={action}
            variant="ghost"
            className="w-full justify-center bg-orange-400/20 text-orange-800 hover:bg-orange-400/30 hover:text-orange-900 dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30"
          >
            {action}
          </Button>
        ))}
      </div>

      {/* Acciones Secundarias */}
      <div className="flex flex-col gap-2">
        {fichaData.secondaryActions.map((action) => (
          <button
            key={action}
            className="text-left text-sm text-gray-600 transition-colors duration-150 hover:underline dark:text-gray-300"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">Error cargando información</p>
        </div>
      )}
    </div>
  );
}
