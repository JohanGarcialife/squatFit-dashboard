"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateCurso } from "@/hooks/use-cursos";

import { CreateCursoForm } from "./create-curso-form";
import { createCursoFormSchema, CreateCursoFormValues, createCursoDefaultValues } from "./create-curso-schema";

interface CreateCursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCursoModal({ open, onOpenChange }: CreateCursoModalProps) {
  const createCursoMutation = useCreateCurso();

  const form = useForm<CreateCursoFormValues>({
    resolver: zodResolver(createCursoFormSchema),
    defaultValues: createCursoDefaultValues,
  });

  const handleSubmit = async (values: CreateCursoFormValues) => {
    try {
      await createCursoMutation.mutateAsync(values);

      // Cerrar modal y resetear formulario
      onOpenChange(false);
      form.reset();
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
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
          <DialogDescription>
            Completa la información del curso. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <CreateCursoForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={createCursoMutation.isPending}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
