"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateCurso, useLinkCursoVideo, useUploadCursoVideo } from "@/hooks/use-cursos";

import { CreateCursoForm } from "./create-curso-form";
import {
  createCursoFormSchema,
  CreateCursoFormValues,
  createCursoDefaultValues,
  mapCreateCursoFormToDto,
} from "./create-curso-schema";

interface CreateCursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCursoModal({ open, onOpenChange }: CreateCursoModalProps) {
  const createCursoMutation = useCreateCurso();
  const uploadVideoMutation = useUploadCursoVideo();
  const linkVideoMutation = useLinkCursoVideo();

  const form = useForm<CreateCursoFormValues>({
    resolver: zodResolver(createCursoFormSchema),
    defaultValues: createCursoDefaultValues,
  });

  const handleSubmit = async (values: CreateCursoFormValues) => {
    try {
      const createdCurso = await createCursoMutation.mutateAsync(mapCreateCursoFormToDto(values));

      try {
        if (values.isExternalVideoCourse) {
          await linkVideoMutation.mutateAsync({
            courseId: createdCurso.id,
            title: values.videoTitle ?? "",
            url: values.videoUrl ?? "",
            description: values.videoDescription,
            priority: values.videoPriority,
          });
        } else if (values.uploadVideoFile) {
          await uploadVideoMutation.mutateAsync({
            courseId: createdCurso.id,
            file: values.uploadVideoFile,
            description: values.videoDescription,
            priority: values.videoPriority,
          });
        }
      } catch {
        toast.error("El curso se creó, pero no se pudo completar la configuracion inicial del video.");
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
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="bg-background/95 shrink-0 border-b px-7 py-5 text-left backdrop-blur">
          <DialogTitle className="pr-10 text-xl leading-tight">Crear Nuevo Curso</DialogTitle>
          <DialogDescription>
            Completa la información del curso. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          <CreateCursoForm
            form={form}
            onSubmit={handleSubmit}
            isLoading={createCursoMutation.isPending || uploadVideoMutation.isPending || linkVideoMutation.isPending}
            onCancel={handleCancel}
            showVideoSourceFields
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
