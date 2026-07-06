"use client";

import { useState } from "react";

import { X, FileVideo, Upload, Link2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { InstructorSelect } from "@/components/forms/instructor-select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PriceInput } from "@/components/ui/price-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { CreateCursoFormValues } from "./create-curso-schema";

interface CreateCursoFormProps {
  form: UseFormReturn<CreateCursoFormValues>;
  onSubmit: (values: CreateCursoFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
  submitLabel?: string;
  loadingLabel?: string;
}

export function CreateCursoForm({
  form,
  onSubmit,
  isLoading,
  onCancel,
  submitLabel = "Crear Curso",
  loadingLabel = "Creando...",
}: CreateCursoFormProps) {
  const addVideo = form.watch("add_course_video");
  const videoType = form.watch("course_video_type");

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleVideoFileChange = (file: File | null) => {
    if (file) {
      setVideoFile(file);
      form.setValue("course_video_file", file);
    } else {
      setVideoFile(null);
      form.setValue("course_video_file", undefined);
    }
  };

  const clearVideoFile = () => {
    setVideoFile(null);
    form.setValue("course_video_file", undefined);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bloque: Información básica */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Información básica</p>
          {/* Nombre del Curso */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Curso *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Fundamentos de Yoga" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe el contenido y objetivos del curso..."
                    className="min-h-[100px] resize-none"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>Mínimo 10 caracteres, máximo 500</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bloque: Instructor y precio */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Instructor y precio</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Instructor */}
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

            {/* Precio */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (€) *</FormLabel>
                  <FormControl>
                    <PriceInput valueType="number" placeholder="0.00" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bloque: Imagen y video de presentación */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Imagen y video de presentación (URLs)</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
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
                  <FormDescription>Enlace a la imagen del curso</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video_presentation"
              render={({ field }) => (
                <FormItem>
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
                  <FormDescription>Enlace al video de presentación</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bloque: Primer video de instrucción (Opcional) */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Video del curso</p>
              <p className="text-muted-foreground text-xs">Vincular o subir el primer video educativo del curso</p>
            </div>
            <FormField
              control={form.control}
              name="add_course_video"
              render={({ field }) => (
                <FormItem className="flex items-center space-y-0 space-x-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {addVideo && (
            <div className="space-y-4 border-t pt-3">
              {/* Selector de tipo (Local vs Externo) */}
              <div className="space-y-2">
                <FormLabel>Tipo de video</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={videoType === "external" ? "default" : "outline"}
                    size="sm"
                    onClick={() => form.setValue("course_video_type", "external")}
                    disabled={isLoading}
                    className="gap-1.5"
                  >
                    <Link2 className="h-4 w-4" />
                    Vincular Externo
                  </Button>
                  <Button
                    type="button"
                    variant={videoType === "local" ? "default" : "outline"}
                    size="sm"
                    onClick={() => form.setValue("course_video_type", "local")}
                    disabled={isLoading}
                    className="gap-1.5"
                  >
                    <Upload className="h-4 w-4" />
                    Subir Local
                  </Button>
                </div>
              </div>

              {videoType === "external" ? (
                // Video Externo
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="course_video_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del video *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Introducción teórica" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="course_video_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del video externo *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.youtube.com/watch?v=..." {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                // Video Local
                <FormField
                  control={form.control}
                  name="course_video_file"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Archivo de video *</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleVideoFileChange(file);
                                onChange(file);
                              }}
                              disabled={isLoading}
                              className="cursor-pointer"
                              {...field}
                            />
                            {videoFile && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={clearVideoFile}
                                disabled={isLoading}
                              >
                                <X className="size-4" />
                              </Button>
                            )}
                          </div>
                          {videoFile && (
                            <div className="text-muted-foreground bg-muted/20 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                              <FileVideo className="text-primary h-4 w-4" />
                              <span className="text-foreground truncate font-medium">{videoFile.name}</span>
                              <span className="text-xs">({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Campos comunes (Descripción, Prioridad) */}
              <FormField
                control={form.control}
                name="course_video_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del video (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Breve resumen del contenido del video..." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="course_video_priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad / Orden (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 1"
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? loadingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
