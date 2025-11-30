"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";

import { X, UserPlus, Trash2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChatParticipantsService,
  type ChatParticipant,
  type Professional,
} from "@/lib/services/chat-participants.service";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AddCollaboratorModalProps {
  chatId: string;
  currentParticipants: ChatParticipant[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAgentId?: string) => void;
  mode?: "add" | "reassign";
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AddCollaboratorModal({
  chatId,
  currentParticipants,
  isOpen,
  onClose,
  onSuccess,
  mode = "add",
}: AddCollaboratorModalProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<
    "adviser" | "dietitian" | "support_agent" | "sales" | "psychologist"
  >("adviser");
  const [loading, setLoading] = useState(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [removingParticipant, setRemovingParticipant] = useState<string | null>(null);

  // Detectar si es un ticket de soporte basándose en los participantes
  const isSupportTicket = useMemo(() => {
    return currentParticipants.some((p) => p.participant?.role_name === "support_agent" && p.is_representative);
  }, [currentParticipants]);

  /**
   * Carga la lista de profesionales disponibles
   */
  const loadProfessionals = useCallback(async () => {
    setLoadingProfessionals(true);
    try {
      const data = await ChatParticipantsService.getAvailableProfessionals();
      setProfessionals(data);
    } catch (error) {
      console.error("Error cargando profesionales:", error);
      toast.error("Error al cargar la lista de profesionales");
    } finally {
      setLoadingProfessionals(false);
    }
  }, []);

  // Cargar lista de profesionales al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // En modo reasignación, establecer rol según tipo de conversación
      if (mode === "reassign") {
        if (isSupportTicket) {
          setSelectedRole("support_agent");
        } else {
          // Para chats normales, no filtrar por rol (mostrar todos)
          setSelectedRole("adviser"); // Valor por defecto, pero no se usará para filtrar
        }
      }
      loadProfessionals();
    }
  }, [isOpen, mode, isSupportTicket, loadProfessionals]);

  /**
   * Agrega un participante al chat o reasigna el ticket
   */
  const handleAddParticipant = async () => {
    if (!selectedProfessional) {
      toast.error("Selecciona un profesional");
      return;
    }

    setLoading(true);
    try {
      if (mode === "reassign") {
        // En modo reasignación, llamar a onSuccess con el nuevo agente ID
        onSuccess(selectedProfessional);
      } else {
        // En modo agregar, agregar como colaborador
        await ChatParticipantsService.addParticipant(chatId, {
          participant_id: selectedProfessional,
          role: selectedRole,
        });

        toast.success("Colaborador agregado exitosamente");
        setSelectedProfessional("");
        onSuccess();
      }
    } catch (error) {
      console.error("Error agregando participante:", error);
      toast.error(error instanceof Error ? error.message : "Error al agregar colaborador");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remueve un participante del chat
   */
  const handleRemoveParticipant = async (participantId: string) => {
    setRemovingParticipant(participantId);
    try {
      await ChatParticipantsService.removeParticipant(chatId, participantId);
      toast.success("Colaborador removido exitosamente");
      onSuccess();
    } catch (error) {
      console.error("Error removiendo participante:", error);
      toast.error(error instanceof Error ? error.message : "Error al remover colaborador");
    } finally {
      setRemovingParticipant(null);
    }
  };

  /**
   * Obtiene las iniciales de un nombre
   */
  const getInitials = (firstName?: string, lastName?: string): string => {
    if (!firstName && !lastName) return "??";
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  /**
   * Filtra profesionales que ya son participantes
   * En modo agregar: filtrar por el rol seleccionado
   * En modo reasignación:
   * - Para tickets de soporte: solo mostrar agentes de soporte
   * - Para chats normales: mostrar todos los profesionales (adviser, dietitian, coach)
   */
  const availableProfessionals = useMemo(() => {
    return professionals.filter((prof) => {
      // En modo agregar, filtrar por el rol seleccionado
      if (mode === "add") {
        // Mapear el rol seleccionado al role_name de la BD
        const roleMapping: Record<string, string[]> = {
          adviser: ["adviser", "coach"], // Coach puede ser adviser o coach
          dietitian: ["dietitian"],
          support_agent: ["support_agent"],
          sales: ["sales"],
          psychologist: ["psychologist"],
        };

        const allowedRoles = roleMapping[selectedRole] || [];
        if (!allowedRoles.includes(prof.role_name)) {
          return false;
        }
      }

      // En modo reasignación, filtrar según tipo de conversación
      if (mode === "reassign") {
        if (isSupportTicket) {
          // Para tickets de soporte, solo mostrar agentes de soporte
          if (prof.role_name !== "support_agent") {
            return false;
          }
        } else {
          // Para chats normales, mostrar adviser, dietitian, coach, sales, psychologist (no support_agent)
          if (!["adviser", "dietitian", "coach", "sales", "psychologist"].includes(prof.role_name)) {
            return false;
          }
        }
      }

      // Excluir profesionales que ya son participantes activos
      return !currentParticipants.some((p) => p.participant_id === prof.id && p.is_active);
    });
  }, [professionals, selectedRole, mode, isSupportTicket, currentParticipants]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {mode === "reassign"
              ? isSupportTicket
                ? "Reasignar Ticket"
                : "Reasignar Chat"
              : "Gestionar Colaboradores"}
          </DialogTitle>
          <DialogDescription>
            {mode === "reassign"
              ? isSupportTicket
                ? "Selecciona un nuevo agente principal para este ticket. El agente actual se convertirá en colaborador."
                : "Selecciona un nuevo profesional principal para este chat. El profesional actual se convertirá en colaborador."
              : "Agrega o remueve profesionales que pueden participar en esta conversación"}
          </DialogDescription>
        </DialogHeader>

        {/* Participantes Actuales */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {mode === "reassign"
              ? isSupportTicket
                ? "Agente Principal Actual"
                : "Profesional Principal Actual"
              : `Participantes Actuales (${currentParticipants.filter((p) => p.is_active).length})`}
          </h3>

          <ScrollArea className="h-48 rounded-md border p-4">
            {currentParticipants.filter((p) => p.is_active).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <Users className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Solo el profesional principal está asignado a este chat</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentParticipants
                  .filter((p) => p.is_active)
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
                          <AvatarFallback className="bg-transparent text-sm font-semibold text-white">
                            {getInitials(participant.participant?.firstName, participant.participant?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {participant.participant?.firstName} {participant.participant?.lastName}
                            </p>
                            {participant.is_representative && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {participant.participant?.role_name} • {participant.participant?.email}
                          </p>
                        </div>
                      </div>
                      {/* Solo mostrar botón de eliminar para colaboradores adicionales */}
                      {!participant.is_representative && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participant.participant_id)}
                          disabled={removingParticipant === participant.participant_id}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        >
                          {removingParticipant === participant.participant_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Agregar Nuevo Participante */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {mode === "reassign"
              ? isSupportTicket
                ? "Seleccionar Nuevo Agente Principal"
                : "Seleccionar Nuevo Profesional Principal"
              : "Agregar Colaborador"}
          </h3>

          <div className={mode === "reassign" ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
            {mode !== "reassign" && (
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Rol</label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: any) => {
                    setSelectedRole(value);
                    // ✅ Limpiar selección de profesional cuando cambia el rol
                    setSelectedProfessional("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adviser">Coach</SelectItem>
                    <SelectItem value="dietitian">Nutricionista</SelectItem>
                    <SelectItem value="support_agent">Soporte</SelectItem>
                    <SelectItem value="sales">Ventas</SelectItem>
                    <SelectItem value="psychologist">Psicóloga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "reassign"
                  ? isSupportTicket
                    ? "Nuevo Agente Principal"
                    : "Nuevo Profesional Principal"
                  : "Profesional"}
              </label>
              <Select
                value={selectedProfessional}
                onValueChange={setSelectedProfessional}
                disabled={loadingProfessionals}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProfessionals ? "Cargando..." : "Selecciona"} />
                </SelectTrigger>
                <SelectContent>
                  {availableProfessionals.length === 0 ? (
                    <div className="p-2 text-center text-sm text-gray-500">No hay profesionales disponibles</div>
                  ) : (
                    availableProfessionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.fullName} ({prof.role_name})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAddParticipant} disabled={!selectedProfessional || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "reassign" ? "Reasignando..." : "Agregando..."}
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                {mode === "reassign"
                  ? isSupportTicket
                    ? "Reasignar Ticket"
                    : "Reasignar Chat"
                  : "Agregar Colaborador"}
              </>
            )}
          </Button>
        </div>

        {/* Botón Cerrar */}
        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
