"use client";

import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { EditVersionFormValues } from "./edit-version-schema";

interface EditVersionFormProps {
  form: UseFormReturn<EditVersionFormValues>;
  onSubmit: (values: EditVersionFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function EditVersionForm({ form, onSubmit, isLoading, onCancel }: EditVersionFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio (EUR) *</FormLabel>
              <FormControl>
                <Input type="text" inputMode="decimal" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de imagen (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Para reemplazar el PDF usa la opción &quot;Reemplazar PDF&quot;</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
