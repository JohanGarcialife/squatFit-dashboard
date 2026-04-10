"use client";

import type { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";

import { InstructorSelect } from "@/components/forms/instructor-select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { CreateCursoFormValues, cursoFormOptions } from "./create-curso-schema";
import { CursoVideoSourceFields } from "./curso-video-source-fields";

interface CreateCursoFormProps {
  form: UseFormReturn<CreateCursoFormValues>;
  onSubmit: (values: CreateCursoFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
  submitLabel?: string;
  loadingLabel?: string;
  showVideoSourceFields?: boolean;
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">{children}</p>;
}

function FormSection({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-border/70 bg-muted/20 space-y-5 rounded-xl border p-5 shadow-sm">
      <div className="space-y-1">
        <SectionEyebrow>{label}</SectionEyebrow>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function CreateCursoForm({
  form,
  onSubmit,
  isLoading,
  onCancel,
  submitLabel = "Crear Curso",
  loadingLabel = "Creando...",
  showVideoSourceFields = false,
}: CreateCursoFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <FormSection
            label="Contenido"
            title="Información básica"
            description="Define el nombre y la descripción principal del curso."
          >
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del curso *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Fundamentos de Yoga" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el contenido, objetivos y beneficios del curso..."
                        className="min-h-[140px] resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Mínimo 10 caracteres, máximo 500.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <FormSection
            label="Publicación"
            title="Instructor y configuración"
            description="Asigna al instructor y define las propiedades de publicación."
          >
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor *</FormLabel>
                    <FormControl>
                      <InstructorSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                        placeholder="Selecciona un instructor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
                      <FormLabel>Precio *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
                      <FormLabel>Duración *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Duración" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cursoFormOptions.durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cursoFormOptions.status.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Controla si el curso queda visible o no tras su creación.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        </div>

        <FormSection
          label="Multimedia"
          title="Imagen y video de presentación"
          description="Añade recursos opcionales para mejorar la presentación del curso."
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
                  <FormLabel>URL de la imagen</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      {...field}
                      value={field.value ?? ""}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>Enlace a la portada del curso.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video_presentation"
              render={({ field }) => (
                <FormItem className="bg-background/85 rounded-lg border px-4 py-4">
                  <FormLabel>URL del video de presentación</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/video.mp4"
                      {...field}
                      value={field.value ?? ""}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>Enlace al video destacado del curso.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {showVideoSourceFields ? <CursoVideoSourceFields form={form} isLoading={isLoading} /> : null}

        <div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 border-t pt-6 backdrop-blur">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="min-w-28">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-36">
            {isLoading ? loadingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
