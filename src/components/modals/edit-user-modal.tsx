"use client";

import { useState, useEffect } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditUserForm, EditUserFormData } from "@/components/forms/edit-user-form";
import { useUpdateUser } from "@/hooks/use-update-user";

// ============================================================================
// TIPOS
// ============================================================================

export interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userType?: "coach" | "alumno" | "usuario";
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    phone_number?: string;
    birth?: string;
    description?: string;
    profile_picture?: string;
  };
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Modal reutilizable para editar información de usuarios
 * Puede usarse para coaches, alumnos o cualquier tipo de usuario
 */
export function EditUserModal({ open, onOpenChange, userId, userType = "usuario", defaultValues }: EditUserModalProps) {
  const updateUserMutation = useUpdateUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (data: EditUserFormData) => {
    setIsSubmitting(true);

    try {
      await updateUserMutation.mutateAsync(data);

      // Cerrar modal después de actualizar exitosamente
      onOpenChange(false);
    } catch (error) {
      // El error ya se maneja en el hook
      console.error("Error en modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const getTitleByUserType = () => {
    switch (userType) {
      case "coach":
        return "Editar Entrenador";
      case "alumno":
        return "Editar Alumno";
      default:
        return "Editar Usuario";
    }
  };

  const getDescriptionByUserType = () => {
    switch (userType) {
      case "coach":
        return "Actualiza la información del entrenador.";
      case "alumno":
        return "Actualiza la información del alumno.";
      default:
        return "Actualiza la información del usuario.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitleByUserType()}</DialogTitle>
          <DialogDescription>{getDescriptionByUserType()}</DialogDescription>
        </DialogHeader>

        <EditUserForm
          userId={userId}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
