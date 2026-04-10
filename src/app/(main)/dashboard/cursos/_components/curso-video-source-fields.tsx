"use client";

import type { UseFormReturn } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { CreateCursoFormValues } from "./create-curso-schema";

const ACCEPTED_VIDEO_EXTENSIONS = ".mp4,.mov,.avi,.mkv,.webm";

interface CursoVideoSourceFieldsProps {
  form: UseFormReturn<CreateCursoFormValues>;
  isLoading?: boolean;
}

function VideoSourceHeader({ checked }: { checked: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">Video inicial</p>
      <h3 className="text-base font-semibold tracking-tight">Configuración inicial del video del curso</h3>
      <p className="text-muted-foreground text-sm">
        {checked
          ? "Se vinculara un video externo usando /api/v1/course/link-video."
          : "Se subira un archivo usando /api/v1/course/upload-video."}
      </p>
    </div>
  );
}

function ExternalVideoFields({ form, isLoading }: CursoVideoSourceFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormField
        control={form.control}
        name="videoTitle"
        render={({ field }) => (
          <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
            <FormLabel>Titulo del video *</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ej: Introduccion al curso"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="videoUrl"
        render={({ field }) => (
          <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
            <FormLabel>URL externa *</FormLabel>
            <FormControl>
              <Input
                type="url"
                {...field}
                value={field.value ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>Debe ser una URL web estricta desde un portal externo.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="videoDescription"
        render={({ field }) => (
          <FormItem className="bg-background/85 md:col-span-2 rounded-lg border px-4 py-4">
            <FormLabel>Descripcion del video</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                className="min-h-[80px] resize-none"
                placeholder="Resumen textual sobre el video"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="videoPriority"
        render={({ field }) => (
          <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
            <FormLabel>Prioridad</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="1"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                placeholder="0"
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>Opcional. Si se omite, el servidor lo ubica al final.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function UploadVideoFields({ form, isLoading }: CursoVideoSourceFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormField
        control={form.control}
        name="uploadVideoFile"
        render={({ field }) => (
          <FormItem className="bg-background/85 md:col-span-2 rounded-lg border px-4 py-4">
            <FormLabel>Archivo de video</FormLabel>
            <FormControl>
              <input
                type="file"
                accept={ACCEPTED_VIDEO_EXTENSIONS}
                className="border-input bg-background file:text-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:px-0 file:py-0 file:text-sm file:font-medium"
                onChange={(event) => field.onChange(event.target.files?.[0])}
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>
              Opcional. Si seleccionas archivo, tras crear el curso se enviara a upload-video.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="videoDescription"
        render={({ field }) => (
          <FormItem className="bg-background/85 md:col-span-2 rounded-lg border px-4 py-4">
            <FormLabel>Descripcion del video</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                className="min-h-[80px] resize-none"
                placeholder="Sinopsis o resumen textual sobre el contenido del video"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="videoPriority"
        render={({ field }) => (
          <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
            <FormLabel>Prioridad</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="1"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                placeholder="0"
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>Opcional. Si se omite, se coloca al final.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function CursoVideoSourceFields({ form, isLoading }: CursoVideoSourceFieldsProps) {
  const isExternalVideoCourse = form.watch("isExternalVideoCourse");

  return (
    <section className="border-border/70 bg-muted/20 space-y-5 rounded-xl border p-5 shadow-sm">
      <VideoSourceHeader checked={isExternalVideoCourse} />

      <FormField
        control={form.control}
        name="isExternalVideoCourse"
        render={({ field }) => (
          <FormItem className="bg-background/85 flex flex-row items-center justify-between rounded-lg border px-4 py-4">
            <div className="space-y-1">
              <FormLabel className="cursor-pointer">Curso con URL externa?</FormLabel>
              <FormDescription>Activalo para vincular un video externo en vez de subir un archivo.</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  form.setValue("videoDescription", undefined);
                  form.setValue("videoPriority", undefined);
                  form.setValue("uploadVideoFile", undefined);
                  form.setValue("videoTitle", undefined);
                  form.setValue("videoUrl", undefined);
                }}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {isExternalVideoCourse ? (
        <ExternalVideoFields form={form} isLoading={isLoading} />
      ) : (
        <UploadVideoFields form={form} isLoading={isLoading} />
      )}
    </section>
  );
}
