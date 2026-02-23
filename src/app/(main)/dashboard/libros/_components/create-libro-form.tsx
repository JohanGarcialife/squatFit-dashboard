"use client";

import { useState } from "react";

import { Upload, X, Image as ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CreateLibroFormValues } from "./create-libro-schema";

interface CreateLibroFormProps {
  form: UseFormReturn<CreateLibroFormValues>;
  onSubmit: (values: CreateLibroFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
  submitLabel?: string;
  loadingLabel?: string;
}

export function CreateLibroForm({
  form,
  onSubmit,
  isLoading,
  onCancel,
  submitLabel = "Crear Libro",
  loadingLabel = "Creando...",
}: CreateLibroFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useUrl, setUseUrl] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (file) {
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      form.setValue("image", file);
      form.setValue("imageUrl", "");
    } else {
      setImagePreview(null);
      form.setValue("image", null);
    }
  };

  const handleUrlChange = (url: string) => {
    if (url) {
      setImagePreview(url);
      form.setValue("imageUrl", url);
      form.setValue("image", null);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    form.setValue("image", null);
    form.setValue("imageUrl", "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Título del Libro */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Libro *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Guía completa de nutrición deportiva" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subtítulo / Descripción */}
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo / Descripción *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el contenido y propósito del libro..."
                  className="min-h-[100px] resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Mínimo 3 caracteres, máximo 500</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Imagen del Libro */}
        <div className="space-y-3">
          <FormLabel>Imagen de portada</FormLabel>

          {/* Toggle entre archivo y URL */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!useUrl ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUseUrl(false);
                form.setValue("imageUrl", "");
              }}
              disabled={isLoading}
            >
              Subir Archivo
            </Button>
            <Button
              type="button"
              variant={useUrl ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUseUrl(true);
                form.setValue("image", null);
                setImagePreview(null);
              }}
              disabled={isLoading}
            >
              Usar URL
            </Button>
          </div>

          {!useUrl ? (
            // Upload de archivo
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleImageChange(file);
                            onChange(file);
                          }}
                          disabled={isLoading}
                          className="cursor-pointer"
                          {...field}
                        />
                        {imagePreview && (
                          <Button type="button" variant="ghost" size="icon" onClick={clearImage} disabled={isLoading}>
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Formatos: JPG, PNG, WEBP (máx. 5MB)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            // URL de imagen
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          placeholder="https://ejemplo.com/imagen.jpg"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleUrlChange(e.target.value);
                          }}
                          disabled={isLoading}
                        />
                        {imagePreview && (
                          <Button type="button" variant="ghost" size="icon" onClick={clearImage} disabled={isLoading}>
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            onError={() => setImagePreview(null)}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>URL pública de la imagen de portada</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
