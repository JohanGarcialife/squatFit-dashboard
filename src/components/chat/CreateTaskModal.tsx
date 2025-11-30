"use client";

import React, { useState, useEffect, useCallback } from "react";

import { X, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChatParticipantsService, type Professional } from "@/lib/services/chat-participants.service";
import { chatTasksService, type CreateTaskData, type Task } from "@/lib/services/chat-tasks.service";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface CreateTaskModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CreateTaskModal({ chatId, isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [priority, setPriority] = useState<CreateTaskData["priority"]>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);

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
    }
  }, [isOpen, loadProfessionals]);

  /**
   * Limpia el formulario
   */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setPriority("medium");
    setDueDate("");
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("El título es requerido");
      return false;
    }
    if (!assignedTo) {
      toast.error("Debes asignar la tarea a un profesional");
      return false;
    }
    return true;
  };

  /**
   * Crea la tarea
   */
  const handleCreateTask = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData: CreateTaskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        assigned_to: assignedTo,
        priority,
        due_date: dueDate ? new Date(dueDate) : undefined,
      };

      await chatTasksService.createTask(chatId, taskData);
      toast.success("Tarea creada exitosamente");
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error creando tarea:", error);
      toast.error(error.message || "Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>Crea una nueva tarea para este chat o ticket de soporte.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Título */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej: Seguimiento de rutina de entrenamiento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe los detalles de la tarea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          {/* Asignar a */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="assignedTo">
              Asignar a <span className="text-red-500">*</span>
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} disabled={loading || loadingProfessionals}>
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Selecciona un profesional" />
              </SelectTrigger>
              <SelectContent>
                {loadingProfessionals ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  </div>
                ) : professionals.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No hay profesionales disponibles</div>
                ) : (
                  professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        <span>
                          {prof.firstName} {prof.lastName}
                        </span>
                        <span className="text-xs text-gray-500">({prof.role_name})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Prioridad y Fecha límite */}
          <div className="grid grid-cols-2 gap-4">
            {/* Prioridad */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as CreateTaskData["priority"])}
                disabled={loading}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha límite */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Fecha límite</Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <Calendar size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTask} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Tarea"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
