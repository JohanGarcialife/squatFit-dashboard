"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

import { Search, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { getAuthToken } from "@/lib/auth/auth-utils";
import { decodeToken } from "@/lib/auth/jwt-utils";
import { ChatParticipantsService, type Professional } from "@/lib/services/chat-participants.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

interface CreateProfessionalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (chatId: string) => void;
}

export default function CreateProfessionalChatModal({ isOpen, onClose, onSuccess }: CreateProfessionalChatModalProps) {
  const { token } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Obtener ID del usuario actual
  const currentUserId = useMemo(() => {
    try {
      if (token) {
        const decoded = decodeToken(token);
        return decoded?.sub || null;
      }
    } catch (error) {
      console.error("Error decodificando token:", error);
    }
    return null;
  }, [token]);

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
      loadProfessionals();
      // Resetear selección al abrir
      setSelectedProfessional(null);
      setSearchQuery("");
    }
  }, [isOpen, loadProfessionals]);

  /**
   * Filtra profesionales según el término de búsqueda y excluye al usuario actual
   */
  const filteredProfessionals = useMemo(() => {
    // Primero excluir al usuario actual
    let filtered = professionals.filter((prof) => prof.id !== currentUserId);

    // Luego filtrar por término de búsqueda si existe
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((prof) => {
        const fullName = `${prof.firstName || ""} ${prof.lastName || ""}`.toLowerCase();
        const email = prof.email?.toLowerCase() || "";
        const roleName = prof.role_name?.toLowerCase() || "";
        return fullName.includes(query) || email.includes(query) || roleName.includes(query);
      });
    }

    return filtered;
  }, [professionals, searchQuery, currentUserId]);

  /**
   * Crea el chat entre profesionales
   */
  const handleCreateChat = async () => {
    if (!selectedProfessional) {
      toast.error("Selecciona un profesional para iniciar el chat");
      return;
    }

    setCreating(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin-panel/chat/professional`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ professional_id: selectedProfessional }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success("Chat creado exitosamente");
      onSuccess(result.chat.id);
      onClose();
    } catch (error: any) {
      console.error("Error creando chat:", error);
      toast.error(`Error al crear el chat: ${error.message || "Error desconocido"}`);
    } finally {
      setCreating(false);
    }
  };

  /**
   * Obtiene el color del badge según el rol
   */
  const getRoleBadgeColor = (roleName: string): string => {
    const roleColors: Record<string, string> = {
      adviser: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      coach: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      dietitian: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      support_agent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      sales: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      psychologist: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      admin: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return roleColors[roleName.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  /**
   * Obtiene el nombre de visualización del rol
   */
  const getRoleDisplayName = (roleName: string): string => {
    const roleNames: Record<string, string> = {
      adviser: "Coach",
      coach: "Coach",
      dietitian: "Nutricionista",
      support_agent: "Soporte",
      sales: "Ventas",
      psychologist: "Psicóloga",
      admin: "Administrador",
    };
    return roleNames[roleName.toLowerCase()] || roleName;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Iniciar conversación con profesional</DialogTitle>
          <DialogDescription>
            Selecciona un profesional con quien deseas chatear. Los agentes de soporte pueden comunicarse con otros
            profesionales usando este chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar profesional por nombre, email o rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de profesionales */}
          <ScrollArea className="h-[400px] rounded-md border">
            {loadingProfessionals ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Cargando profesionales...</span>
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <UserPlus className="h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery ? "No se encontraron profesionales" : "No hay profesionales disponibles"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {filteredProfessionals.map((prof) => {
                  const isSelected = selectedProfessional === prof.id;
                  const initials =
                    `${prof.firstName?.[0] || ""}${prof.lastName?.[0] || ""}`.toUpperCase() ||
                    prof.email?.[0].toUpperCase() ||
                    "?";

                  return (
                    <button
                      key={prof.id}
                      onClick={() => setSelectedProfessional(prof.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 dark:bg-primary/20"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {prof.firstName && prof.lastName
                            ? `${prof.firstName} ${prof.lastName}`
                            : prof.username || prof.email || "Sin nombre"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${getRoleBadgeColor(prof.role_name)}`}>
                            {getRoleDisplayName(prof.role_name)}
                          </span>
                          {prof.email && <span className="text-xs text-gray-500 dark:text-gray-400">{prof.email}</span>}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="bg-primary h-4 w-4 rounded-full border-2 border-white dark:border-gray-800" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateChat} disabled={!selectedProfessional || creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear chat
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
