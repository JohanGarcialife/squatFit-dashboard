"use client";
/* eslint-disable max-lines */

import React, { useState, useEffect, useMemo } from "react";

import clsx from "clsx";
import { jwtDecode } from "jwt-decode";
import {
  ChevronRight,
  Circle,
  Clock,
  MessageSquare,
  Users,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
} from "lucide-react";

import AddCollaboratorModal from "@/components/chat/AddCollaboratorModal";
import CreateTaskModal from "@/components/chat/CreateTaskModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { getAuthToken } from "@/lib/auth/auth-utils";
import { ChatCompleteService } from "@/lib/services/chat-complete.service";
import { ChatParticipantsService, type ChatParticipant } from "@/lib/services/chat-participants.service";
import { getInitials, formatMessageTime, getRoleDisplayName } from "@/lib/services/chat-service";
import { chatTasksService, type Task } from "@/lib/services/chat-tasks.service";

/**
 * Componente DetailItem - Elemento de detalle en la ficha tÃ©cnica
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
 * Componente FichaTecnica - Panel de informaciÃ³n del usuario
 *
 * Este componente muestra informaciÃ³n detallada del usuario seleccionado
 * y estadÃ­sticas del chat.
 *
 * CaracterÃ­sticas:
 * - InformaciÃ³n del usuario
 * - EstadÃ­sticas del chat
 * - Acciones principales y secundarias
 * - Estados de carga y error
 */
export default function FichaTecnica() {
  const { selectedConversation, stats, loading, error, loadConversations } = useChat();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [completingChat, setCompletingChat] = useState(false);
  const [reassigningTicket, setReassigningTicket] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  /**
   * Carga los participantes del chat seleccionado
   */
  const loadParticipants = async () => {
    if (!selectedConversation) return;

    setLoadingParticipants(true);
    try {
      const data = await ChatParticipantsService.getChatParticipants(selectedConversation.id);
      setParticipants(data);
    } catch (error) {
      console.error("Error cargando participantes:", error);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  /**
   * Carga las tareas del chat seleccionado
   */
  const loadTasks = async () => {
    if (!selectedConversation) return;

    setLoadingTasks(true);
    try {
      const data = await chatTasksService.getTasksByChat(selectedConversation.id);
      setTasks(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  /**
   * Actualiza el estado de una tarea
   */
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await chatTasksService.updateTaskStatus(taskId, newStatus);
      await loadTasks(); // Recargar tareas
    } catch (error) {
      console.error("Error actualizando estado de tarea:", error);
      alert("Error al actualizar el estado de la tarea");
    }
  };

  /**
   * Verifica si la conversaciÃ³n es un ticket de soporte
   */
  const isSupportTicket = useMemo(() => {
    // Un ticket de soporte tiene al menos un participante con rol support_agent y is_representative: true
    return participants.some((p) => p.participant?.role_name === "support_agent" && p.is_representative);
  }, [participants]);

  /**
   * Reasigna el ticket de soporte a otro agente
   */
  const handleReassignTicket = async (newAgentId: string) => {
    if (!selectedConversation) return;

    const confirmed = window.confirm(
      `Â¿EstÃ¡s seguro de que deseas reasignar este ticket a otro agente?\n\n` +
        `El agente actual se convertirÃ¡ en colaborador y el nuevo agente serÃ¡ el principal.`,
    );

    if (!confirmed) return;

    setReassigningTicket(true);
    try {
      await ChatParticipantsService.reassignTicket(selectedConversation.id, {
        agent_id: newAgentId,
      });

      alert("âœ… Ticket reasignado exitosamente");

      // Recargar participantes y conversaciones
      await loadParticipants();
      await loadConversations();
      setIsReassignModalOpen(false);
    } catch (error: any) {
      console.error("Error reasignando ticket:", error);
      alert(`âŒ Error al reasignar ticket: ${error.message ?? "Error desconocido"}`);
    } finally {
      setReassigningTicket(false);
    }
  };

  /**
   * Reasigna el chat normal a otro profesional
   */
  const handleReassignChat = async (newProfessionalId: string) => {
    if (!selectedConversation) return;

    const confirmed = window.confirm(
      `Â¿EstÃ¡s seguro de que deseas reasignar este chat a otro profesional?\n\n` +
        `El profesional actual se convertirÃ¡ en colaborador y el nuevo profesional serÃ¡ el principal.`,
    );

    if (!confirmed) return;

    setReassigningTicket(true); // Reutilizar el mismo estado de carga
    try {
      await ChatParticipantsService.reassignChat(selectedConversation.id, {
        professional_id: newProfessionalId,
      });

      alert("âœ… Chat reasignado exitosamente");

      // Recargar participantes y conversaciones
      await loadParticipants();
      await loadConversations();
      setIsReassignModalOpen(false);
    } catch (error: any) {
      console.error("Error reasignando chat:", error);
      alert(`âŒ Error al reasignar chat: ${error.message ?? "Error desconocido"}`);
    } finally {
      setReassigningTicket(false);
    }
  };

  /**
   * Marca el chat actual como completado
   */
  const handleCompleteChat = async () => {
    console.log("ðŸ”µ [COMPLETE_CHAT] handleCompleteChat llamado");
    console.log("ðŸ”µ [COMPLETE_CHAT] selectedConversation:", selectedConversation);

    if (!selectedConversation) {
      console.warn("âš ï¸ [COMPLETE_CHAT] No hay conversaciÃ³n seleccionada");
      return;
    }

    console.log("ðŸ”µ [COMPLETE_CHAT] Mostrando confirmaciÃ³n...");
    const confirmed = window.confirm(
      `Â¿EstÃ¡s seguro de que deseas marcar esta conversaciÃ³n con ${selectedConversation.name} como completada?\n\n` +
        `Esto cerrarÃ¡ el chat activo y enviarÃ¡ un mensaje de despedida al usuario vÃ­a Telegram.`,
    );

    console.log("ðŸ”µ [COMPLETE_CHAT] ConfirmaciÃ³n:", confirmed);
    if (!confirmed) {
      console.log("ðŸ”µ [COMPLETE_CHAT] Usuario cancelÃ³ la operaciÃ³n");
      return;
    }

    setCompletingChat(true);
    const chatIdToComplete = selectedConversation.id;
    const userName = selectedConversation.name;

    console.log("ðŸ”µ [COMPLETE_CHAT] Iniciando proceso de completar chat:", {
      chatId: chatIdToComplete,
      userName,
      professionalId: selectedConversation.professionalId,
    });

    try {
      console.log("ðŸ”µ [COMPLETE_CHAT] Llamando a ChatCompleteService.completeChat...");
      await ChatCompleteService.completeChat(chatIdToComplete);
      console.log("âœ… [COMPLETE_CHAT] Chat completado exitosamente");

      // Mostrar mensaje de Ã©xito
      alert(`âœ… Chat completado exitosamente.\n\nSe ha enviado un mensaje de despedida a ${userName} vÃ­a Telegram.`);

      // âœ… Recargar la lista de conversaciones para actualizar la UI
      // El chat completado desaparecerÃ¡ de la lista automÃ¡ticamente
      // NO usar window.location.reload() - esto desconecta el WebSocket innecesariamente
      if (loadConversations) {
        await loadConversations();
      }
    } catch (error: any) {
      console.error("Error completando chat:", error);
      alert(`âŒ Error al completar el chat:\n\n${error.message ?? "Error desconocido"}`);
    } finally {
      setCompletingChat(false);
    }
  };

  /**
   * Obtener el ID del usuario actual desde el JWT
   */
  const getCurrentUserId = () => {
    try {
      const token = getAuthToken();
      if (token) {
        const decoded: any = jwtDecode(token);
        return decoded.sub ?? decoded.id;
      }
    } catch (error) {
      console.error("Error obteniendo usuario actual:", error);
    }
    return null;
  };

  /**
   * Verificar si el usuario actual es el profesional principal del chat o admin
   */
  const isMainProfessional = useMemo(() => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;

    // Verificar rol del usuario actual primero
    try {
      const token = getAuthToken();
      if (token) {
        const decoded: any = jwtDecode(token);

        // Permitir si es admin
        if (decoded.role === "admin") return true;

        // âœ… NUEVO: Para agentes de soporte, permitir que vean el botÃ³n
        // El backend validarÃ¡ los permisos reales (si es el agente asignado o puede asignarse)
        if (decoded.role === "support_agent") {
          return true;
        }
      }
    } catch (e) {
      console.error("Error verificando rol:", e);
    }

    // Para otros roles, verificar si es el profesional asignado
    if (!selectedConversation?.professionalId) return false;

    // Permitir si es el profesional asignado
    if (selectedConversation.professionalId === currentUserId) return true;

    return false;
  }, [selectedConversation]);

  /**
   * Cargar participantes y tareas cuando cambia la conversaciÃ³n seleccionada
   */
  useEffect(() => {
    if (selectedConversation) {
      loadParticipants();
      loadTasks();
    } else {
      setParticipants([]);
      setTasks([]);
    }
  }, [selectedConversation?.id]);

  // Renderizar estado sin conversaciÃ³n seleccionada
  if (!selectedConversation) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-gray-50/50 p-4 dark:bg-gray-900/20">
        <div className="text-center">
          <div className="mb-4 text-gray-400">
            <Users size={48} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona una conversaciÃ³n para ver detalles</p>
        </div>
      </div>
    );
  }

  // Obtener iniciales del usuario
  const initials = getInitials(selectedConversation.name);

  // Calcular tiempo desde Ãºltimo mensaje
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

  // Obtener el nombre del colaborador principal
  const getMainCollaboratorName = (): string => {
    if (loadingParticipants) return "Cargando...";
    const activeParticipants = participants.filter((p) => p.is_active);
    if (activeParticipants.length === 0) return "Sin asignar";
    if (activeParticipants.length === 1) {
      const p = activeParticipants[0].participant;
      return p ? `${p.firstName} ${p.lastName}` : "Sin nombre";
    }
    return `${activeParticipants.length} colaboradores`;
  };

  // FunciÃ³n para obtener el color de una etiqueta
  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "nutrition":
      case "nutriciÃ³n":
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

  // Datos de la ficha tÃ©cnica
  const fichaData = {
    initials,
    name: selectedConversation.name,
    tags: selectedConversation.tags,
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
        label: "Mensajes no leÃ­dos",
        value: selectedConversation.unread.toString(),
        icon: <MessageSquare size={14} className="text-blue-500" />,
      },
      {
        label: "Ãšltima actividad",
        value: getLastActivity(),
        icon: <Clock size={14} className="text-gray-500" />,
      },
      {
        label: "Colaboradores",
        value: getMainCollaboratorName(),
        interactive: true,
        onClick: () => setIsModalOpen(true),
      },
    ],
    mainActions: [
      "AÃ±adir colaborador",
      ...(isSupportTicket ? ["Reasignar ticket"] : ["Reasignar chat"]),
      // "Marcar como completado", // Comentado temporalmente
    ],
    // secondaryActions: ["Asignar rutina", "Actualizar estado", "Agregar nota"], // Comentadas temporalmente
    secondaryActions: [],
  };

  return (
    <div className="flex h-full flex-col gap-6 rounded-lg bg-gray-50/50 p-4 dark:bg-gray-900/20">
      <h2 className="text-primary text-lg font-bold">Ficha TÃ©cnica</h2>

      {/* InformaciÃ³n del Usuario */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="h-20 w-20 bg-gradient-to-br from-orange-500 to-red-500">
          <AvatarFallback className="bg-transparent text-2xl font-bold text-white">{fichaData.initials}</AvatarFallback>
        </Avatar>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{fichaData.name}</p>
        {/* Etiquetas como badges */}
        {fichaData.tags && fichaData.tags.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1">
            {fichaData.tags.map((tag: string, index: number) => (
              <span key={index} className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        ) : (
          // âœ… Mostrar rol del profesional si es professional_professional, sino "Sin etiquetas"
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedConversation?.chat_type === "professional_professional" && selectedConversation?.professionalRole
              ? `Rol: ${getRoleDisplayName(selectedConversation.professionalRole)}`
              : "Sin etiquetas"}
          </p>
        )}

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
            {selectedConversation.isActive ? "En lÃ­nea" : "Desconectado"}
          </span>
        </div>
      </div>

      {/* Detalles */}
      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
        {fichaData.details.map((item) => (
          <DetailItem key={item.label} {...item} onClick={item.onClick ?? (() => {})} />
        ))}
      </div>

      {/* Tareas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Circle size={16} />
            Tareas
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setIsCreateTaskModalOpen(true)} className="h-7 px-2 text-xs">
            <Plus size={14} className="mr-1" />
            Crear
          </Button>
        </div>
        {loadingTasks ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No hay tareas asignadas
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const getStatusIcon = () => {
                switch (task.status) {
                  case "completed":
                    return <CheckCircle2 size={14} className="text-green-500" />;
                  case "in_progress":
                    return <Circle size={14} className="text-blue-500" />;
                  case "cancelled":
                    return <XCircle size={14} className="text-red-500" />;
                  default:
                    return <AlertCircle size={14} className="text-yellow-500" />;
                }
              };

              const getPriorityColor = () => {
                switch (task.priority) {
                  case "urgent":
                    return "text-red-600 dark:text-red-400";
                  case "high":
                    return "text-orange-600 dark:text-orange-400";
                  case "medium":
                    return "text-yellow-600 dark:text-yellow-400";
                  default:
                    return "text-gray-600 dark:text-gray-400";
                }
              };

              return (
                <div
                  key={task.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{task.title}</span>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{task.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className={getPriorityColor()}>
                          {task.priority === "urgent"
                            ? "Urgente"
                            : task.priority === "high"
                              ? "Alta"
                              : task.priority === "medium"
                                ? "Media"
                                : "Baja"}
                        </span>
                        {task.assigned_to_user && (
                          <span>
                            Asignada a: {task.assigned_to_user.firstName} {task.assigned_to_user.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.status !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                        className="ml-2 h-6 px-2 text-xs"
                      >
                        Completar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EstadÃ­sticas del Chat */}
      {stats && (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <TrendingUp size={16} />
            EstadÃ­sticas
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
                  <p className="text-xs text-green-600 dark:text-green-400">No leÃ­dos</p>
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
        {fichaData.mainActions.map((action) => {
          const isCompleteButton = action === "Marcar como completado";
          const isAddCollaborator = action === "AÃ±adir colaborador";
          const isReassignTicket = action === "Reasignar ticket";
          const isReassignChat = action === "Reasignar chat";

          // Ocultar botÃ³n de completar si no es el profesional principal
          if (isCompleteButton && !isMainProfessional) {
            console.log("âš ï¸ [BUTTON] BotÃ³n de completar oculto - isMainProfessional:", isMainProfessional);
            return null;
          }

          // Log para depuraciÃ³n del botÃ³n de completar
          if (isCompleteButton) {
            console.log("âœ… [BUTTON] BotÃ³n de completar renderizado - isMainProfessional:", isMainProfessional);
          }

          return (
            <Button
              key={action}
              variant="ghost"
              onClick={(e) => {
                console.log("ðŸ”µ [BUTTON] onClick disparado para:", action);
                if (isAddCollaborator) {
                  setIsModalOpen(true);
                } else if (isReassignTicket || isReassignChat) {
                  setIsReassignModalOpen(true);
                } else if (isCompleteButton) {
                  console.log("ðŸ”µ [BUTTON] Ejecutando handleCompleteChat");
                  handleCompleteChat();
                }
              }}
              disabled={
                (completingChat && isCompleteButton) || (reassigningTicket && (isReassignTicket || isReassignChat))
              }
              className="w-full justify-center bg-orange-400/20 text-orange-800 hover:bg-orange-400/30 hover:text-orange-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30"
            >
              {completingChat && isCompleteButton ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando...
                </>
              ) : reassigningTicket && (isReassignTicket || isReassignChat) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reasignando...
                </>
              ) : (
                action
              )}
            </Button>
          );
        })}
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
          <p className="text-sm text-red-600 dark:text-red-400">Error cargando informaciÃ³n</p>
        </div>
      )}

      {/* Modal para Agregar Colaboradores */}
      <AddCollaboratorModal
        chatId={selectedConversation.id}
        currentParticipants={participants}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadParticipants();
          setIsModalOpen(false);
        }}
      />

      {/* Modal para Reasignar Ticket o Chat */}
      <AddCollaboratorModal
        chatId={selectedConversation.id}
        currentParticipants={participants}
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        onSuccess={(newProfessionalId) => {
          if (newProfessionalId) {
            if (isSupportTicket) {
              handleReassignTicket(newProfessionalId);
            } else {
              handleReassignChat(newProfessionalId);
            }
          } else {
            setIsReassignModalOpen(false);
          }
        }}
        mode="reassign"
      />

      {/* Modal para Crear Tarea */}
      <CreateTaskModal
        chatId={selectedConversation.id}
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSuccess={() => {
          loadTasks();
        }}
      />
    </div>
  );
}
