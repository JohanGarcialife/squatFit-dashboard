"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateLibro } from "@/hooks/use-libros";

import { CreateLibroForm } from "./create-libro-form";
import { createLibroFormSchema, CreateLibroFormValues, createLibroDefaultValues } from "./create-libro-schema";
import { Libro } from "./schema";

interface EditLibroModalProps {
  libro: Libro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLibroModal({ libro, open, onOpenChange }: EditLibroModalProps) {
  const updateLibroMutation = useUpdateLibro();

  const form = useForm<CreateLibroFormValues>({
    resolver: zodResolver(createLibroFormSchema),
    defaultValues: createLibroDefaultValues,
  });

  // Prellenar el formulario cuando se selecciona un libro
  useEffect(() => {
    if (libro && open) {
      form.reset({
        title: libro.title,
        subtitle: libro.subtitle,
        image: null,
        imageUrl: libro.image || "",
      });
    }
  }, [libro, open, form]);

  const handleSubmit = async (values: CreateLibroFormValues) => {
    if (!libro) return;

    // Transformar valores para que coincidan con Partial<CreateLibroDto>
    const dto = {
      title: values.title,
      subtitle: values.subtitle,
      image: values.image instanceof File ? values.image : null,
      imageUrl: typeof values.image === "string" ? values.image : values.imageUrl || undefined,
    };

    const payload = { id: libro.id, data: dto };
    console.log("📤 Actualizar libro - datos enviados:", payload);

    try {
      await updateLibroMutation.mutateAsync(payload);

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
          <DialogTitle>Editar Libro</DialogTitle>
          <DialogDescription>
            Modifica la información del libro. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <CreateLibroForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={updateLibroMutation.isPending}
          onCancel={handleCancel}
          submitLabel="Actualizar Libro"
          loadingLabel="Actualizando..."
        />
      </DialogContent>
    </Dialog>
  );
}
