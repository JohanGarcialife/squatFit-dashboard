"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateCurso } from "@/hooks/use-cursos";
import { Curso } from "./schema";

import { CreateCursoForm } from "./create-curso-form";
import { createCursoFormSchema, CreateCursoFormValues, createCursoDefaultValues } from "./create-curso-schema";

interface EditCursoModalProps {
  curso: Curso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCursoModal({ curso, open, onOpenChange }: EditCursoModalProps) {
  const updateCursoMutation = useUpdateCurso();

  const form = useForm<CreateCursoFormValues>({
    resolver: zodResolver(createCursoFormSchema),
    defaultValues: createCursoDefaultValues,
  });

  // Prellenar el formulario cuando se selecciona un curso
  useEffect(() => {
    if (curso && open) {
      form.reset({
        name: curso.name,
        description: curso.description,
        instructor: curso.instructor,
        price: curso.price,
        currency: curso.currency || "€",
        status: curso.status,
        duration: curso.duration,
        level: curso.level,
        category: curso.category,
      });
    }
  }, [curso, open, form]);

  const handleSubmit = async (values: CreateCursoFormValues) => {
    if (!curso) return;

    try {
      await updateCursoMutation.mutateAsync({
        id: curso.id,
        data: values,
      });

      // Cerrar modal
      onOpenChange(false);
    } catch (error) {
      // El error ya es manejado por el hook
      console.error("Error en modal de edición:", error);
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
          <DialogTitle>Editar Curso</DialogTitle>
          <DialogDescription>
            Modifica la información del curso. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <CreateCursoForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={updateCursoMutation.isPending}
          onCancel={handleCancel}
          submitLabel="Actualizar Curso"
          loadingLabel="Actualizando..."
        />
      </DialogContent>
    </Dialog>
  );
}
