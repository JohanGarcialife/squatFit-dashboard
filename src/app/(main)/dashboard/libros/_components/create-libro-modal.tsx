"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateLibro } from "@/hooks/use-libros";

import { CreateLibroForm } from "./create-libro-form";
import { createLibroFormSchema, CreateLibroFormValues, createLibroDefaultValues } from "./create-libro-schema";
import { Libro } from "./schema";

interface CreateLibroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (libro: Libro) => void;
}

export function CreateLibroModal({ open, onOpenChange, onSuccess }: CreateLibroModalProps) {
  const createLibroMutation = useCreateLibro();

  const form = useForm<CreateLibroFormValues>({
    resolver: zodResolver(createLibroFormSchema),
    defaultValues: createLibroDefaultValues,
  });

  const handleSubmit = async (values: CreateLibroFormValues) => {
    try {
      const newLibro = await createLibroMutation.mutateAsync(values);

      // Cerrar modal y resetear formulario
      onOpenChange(false);
      form.reset();

      // Abrir modal de versiones para que el usuario añada la primera versión (con precio y PDF)
      onSuccess?.(newLibro);
    } catch (error) {
      // El error ya es manejado por el hook con toast
      console.error("Error en modal:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Libro</DialogTitle>
          <DialogDescription>
            Completa la información del libro. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <CreateLibroForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={createLibroMutation.isPending}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
