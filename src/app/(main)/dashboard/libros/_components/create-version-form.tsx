"use client";

import { FileText } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PriceInput } from "@/components/ui/price-input";

import { CreateVersionFormValues } from "./create-version-schema";

interface CreateVersionFormProps {
  form: UseFormReturn<CreateVersionFormValues>;
  onSubmit: (values: CreateVersionFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function CreateVersionForm({ form, onSubmit, isLoading, onCancel }: CreateVersionFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bloque: Detalles de la versión */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Detalles de la versión</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la versión *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Edición Europa, Tapa blanda..." {...field} disabled={isLoading} />
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
                  <FormDescription>Precio en euros</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bloque: Archivos y Multimedia */}
        <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Archivos y multimedia</p>
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de imagen (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Archivo PDF *</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="application/pdf"
                      className="cursor-pointer"
                      disabled={isLoading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      {...field}
                    />
                    {value instanceof File && (
                      <div className="text-muted-foreground bg-background flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                        <FileText className="text-primary size-4 shrink-0" />
                        <span className="truncate">{value.name}</span>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>El PDF es obligatorio para cada versión (físico + digital)</FormDescription>
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
            {isLoading ? "Creando..." : "Crear versión"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
