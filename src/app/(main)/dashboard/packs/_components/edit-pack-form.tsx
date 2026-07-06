"use client";

import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PriceInput } from "@/components/ui/price-input";
import { Textarea } from "@/components/ui/textarea";

import { EditPackFormValues } from "./edit-pack-schema";

interface EditPackFormProps {
  form: UseFormReturn<EditPackFormValues>;
  onSubmit: (values: EditPackFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function EditPackForm({ form, onSubmit, isLoading, onCancel }: EditPackFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bloque: Información del pack */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Información del pack</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
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
                    <PriceInput valueType="string" placeholder="0.00" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bloque: Detalle */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Descripción y detalles</p>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" rows={3} {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
