"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateCurso, useCurso } from "@/hooks/use-cursos";

import { CreateCursoForm } from "./create-curso-form";
import { createCursoFormSchema, CreateCursoFormValues, createCursoDefaultValues } from "./create-curso-schema";
import { Curso } from "./schema";

interface EditCursoModalProps {
  curso: Curso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCursoModal({ curso, open, onOpenChange }: EditCursoModalProps) {
  const updateCursoMutation = useUpdateCurso();

  console.log("Información del curso a editar:", curso);

  // Cargar detalles completos del curso (incluyendo array de videos)
  const { data: cursoDetail } = useCurso(curso?.id ?? "");

  const form = useForm<CreateCursoFormValues>({
    resolver: zodResolver(createCursoFormSchema),
    defaultValues: createCursoDefaultValues,
  });

  // Prellenar el formulario priorizando los detalles completos de la API
  useEffect(() => {
    if (open) {
      if (cursoDetail) {
        form.reset({
          name: cursoDetail.name || "",
          description: cursoDetail.description || "",
          instructor: cursoDetail.tutorId || cursoDetail.instructor || "",
          price: cursoDetail.price || 0,
          image: cursoDetail.thumbnail || "",
          video_presentation: cursoDetail.videoPresentation || "",
        });
      } else if (curso) {
        form.reset({
          name: curso.name,
          description: curso.description,
          instructor: curso.tutorId ?? curso.instructor ?? "",
          price: curso.price,
          image: curso.thumbnail ?? "",
          video_presentation: curso.videoPresentation ?? "",
        });
      }
    }
  }, [curso, cursoDetail, open, form]);

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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-h-[90vh] w-full overflow-x-hidden overflow-y-auto sm:max-w-[650px]">
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
          currentVideos={cursoDetail?.videos}
          videoPresentationUrl={form.watch("video_presentation")}
          cursoId={curso?.id}
        />
      </DialogContent>
    </Dialog>
  );
}
