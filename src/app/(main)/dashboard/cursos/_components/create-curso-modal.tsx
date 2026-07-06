"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateCurso } from "@/hooks/use-cursos";
import { CursosService } from "@/lib/services/cursos-service";

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
      const createdCurso = await createCursoMutation.mutateAsync({
        name: values.name,
        description: values.description,
        instructor: values.instructor,
        price: values.price,
        image: values.image,
        video_presentation: values.video_presentation,
      });

      // Si se marcó agregar el primer video de instrucción y tenemos el ID del curso
      if (values.add_course_video && createdCurso?.id) {
        if (values.course_video_type === "local" && values.course_video_file) {
          try {
            await CursosService.uploadCursoVideo(
              createdCurso.id,
              values.course_video_file,
              values.course_video_description || undefined,
              values.course_video_priority,
            );
          } catch (uploadError) {
            console.error("Error al subir el video local del curso:", uploadError);
          }
        } else if (values.course_video_type === "external" && values.course_video_title && values.course_video_url) {
          try {
            await CursosService.linkCursoVideo(createdCurso.id, {
              title: values.course_video_title.trim(),
              url: values.course_video_url.trim(),
              description: values.course_video_description?.trim() || undefined,
              priority: values.course_video_priority,
            });
          } catch (linkError) {
            console.error("Error al vincular el video externo del curso:", linkError);
          }
        }
      }

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
