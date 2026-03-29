"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrearReceta, useSubirImagenReceta } from "@/hooks/use-recetas";

import { CreateRecipeForm } from "./create-recipe-form";
import { createRecipeFormSchema, CreateRecipeFormValues, createRecipeDefaultValues } from "./create-recipe-schema";

interface CreateRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRecipeModal({ open, onOpenChange }: CreateRecipeModalProps) {
  const { crearReceta, isLoading } = useCrearReceta();
  const { subirImagen, isLoading: isUploadingImage } = useSubirImagenReceta();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<CreateRecipeFormValues>({
    resolver: zodResolver(createRecipeFormSchema),
    defaultValues: createRecipeDefaultValues,
  });

  const handleSubmit = async (values: CreateRecipeFormValues) => {
    try {
      // Transformar los valores del formulario al formato que espera el hook
      // El hook espera Partial<Receta> pero solo usará los campos que transformUIToBackend mapea
      const recetaData = {
        nombre: values.name,
        descripcion: values.description ?? "",
        caloriasTotal: values.kcal,
        carbohidratosTotal: values.carbohydrates,
        proteinasTotal: values.proteins,
        grasasTotal: values.fats,
      };

      const nuevaReceta = await crearReceta(recetaData);

      // Si hay una imagen seleccionada, subirla automáticamente
      if (selectedImage && nuevaReceta.id) {
        try {
          await subirImagen({ recipeId: nuevaReceta.id, file: selectedImage });
          // Limpiar estado y cerrar modal
          handleClose();
        } catch (error) {
          // Si falla la subida de imagen, mantener el modal abierto para que el usuario pueda reintentar
          console.error("Error al subir imagen:", error);
        }
      } else {
        // Si no hay imagen, cerrar modal directamente
        handleClose();
      }
    } catch (error) {
      // El error ya es manejado por el hook con toast
      console.error("Error en modal:", error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        form.setError("root", { message: "Por favor selecciona un archivo de imagen válido" });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        form.setError("root", { message: "La imagen no puede exceder 5MB" });
        return;
      }

      setSelectedImage(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setCreatedRecipeId(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCancel = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Receta</DialogTitle>
          <DialogDescription>
            Completa la información nutricional de la receta. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <CreateRecipeForm form={form} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />

          {/* Sección opcional para subir imagen */}
          <div className="space-y-2 border-t pt-4">
            <label className="text-sm font-medium">Imagen de la Receta (Opcional)</label>
            <p className="text-muted-foreground text-xs">
              Puedes agregar una imagen a la receta. Se subirá automáticamente después de crear la receta.
            </p>

            {imagePreview ? (
              <div className="relative">
                <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                  <img alt="Preview" className="h-full w-full object-cover" src={imagePreview} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={isLoading || isUploadingImage}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6">
                <label
                  htmlFor="recipe-image-upload"
                  className="flex cursor-pointer flex-col items-center gap-2 text-center"
                >
                  <ImageIcon className="text-muted-foreground size-8" />
                  <span className="text-muted-foreground text-sm">Haz clic para seleccionar una imagen</span>
                  <span className="text-muted-foreground text-xs">JPG, PNG o WEBP (máx. 5MB)</span>
                  <input
                    id="recipe-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={isLoading || isUploadingImage}
                  />
                </label>
              </div>
            )}

            {isUploadingImage && <p className="text-muted-foreground text-xs">Subiendo imagen...</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
