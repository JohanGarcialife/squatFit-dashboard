"use client";

import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CreateRecipeFormValues } from "./create-recipe-schema";

interface CreateRecipeFormProps {
  form: UseFormReturn<CreateRecipeFormValues>;
  onSubmit: (values: CreateRecipeFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
}

export function CreateRecipeForm({
  form,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Crear Receta",
  loadingLabel = "Creando...",
}: CreateRecipeFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre de la Receta */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Receta *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ensalada de pollo y quinoa" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Mínimo 3 caracteres, máximo 100</FormDescription>
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe la receta (opcional)..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  disabled={isLoading}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Máximo 500 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Información Nutricional */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-sm font-semibold">Información Nutricional (Totales)</h3>
            <p className="text-muted-foreground text-xs">Ingresa los valores totales de la receta completa</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Calorías */}
            <FormField
              control={form.control}
              name="kcal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calorías (kcal) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Carbohidratos */}
            <FormField
              control={form.control}
              name="carbohydrates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbohidratos (g) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proteínas */}
            <FormField
              control={form.control}
              name="proteins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proteínas (g) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grasas */}
            <FormField
              control={form.control}
              name="fats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grasas (g) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? loadingLabel : submitLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
