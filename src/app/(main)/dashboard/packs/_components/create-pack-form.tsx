"use client";

import { useMemo } from "react";

import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useLibros } from "@/hooks/use-libros";

import { CreatePackFormValues } from "./create-pack-schema";

interface VersionOption {
  version_id: string;
  label: string;
}

interface CreatePackFormProps {
  form: UseFormReturn<CreatePackFormValues>;
  onSubmit: (values: CreatePackFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function CreatePackForm({ form, onSubmit, isLoading, onCancel }: CreatePackFormProps) {
  const { data: libros = [] } = useLibros();

  const versionOptions = useMemo<VersionOption[]>(() => {
    const opts: VersionOption[] = [];
    for (const libro of libros) {
      for (const v of libro.versions ?? []) {
        opts.push({
          version_id: v.version_id,
          label: `${libro.title} - ${v.version_title}`,
        });
      }
    }
    return opts;
  }, [libros]);

  const selectedIds = form.watch("version_ids") ?? [];

  const toggleVersion = (versionId: string) => {
    const current = form.getValues("version_ids") ?? [];
    const next = current.includes(versionId) ? current.filter((id) => id !== versionId) : [...current, versionId];
    form.setValue("version_ids", next);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del pack *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pack Combo Libros" {...field} disabled={isLoading} />
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
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Libro Europa + América" {...field} disabled={isLoading} />
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
                <Input type="text" inputMode="decimal" placeholder="40" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="version_ids"
          render={() => (
            <FormItem>
              <FormLabel>Versiones incluidas *</FormLabel>
              <FormControl>
                <ScrollArea className="h-[200px] rounded-lg border p-3">
                  <div className="space-y-2">
                    {versionOptions.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No hay versiones disponibles. Crea libros y versiones primero.
                      </p>
                    ) : (
                      versionOptions.map((opt) => (
                        <div key={opt.version_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={opt.version_id}
                            checked={selectedIds.includes(opt.version_id)}
                            onCheckedChange={() => toggleVersion(opt.version_id)}
                            disabled={isLoading}
                          />
                          <label
                            htmlFor={opt.version_id}
                            className="cursor-pointer text-sm leading-none font-medium peer-disabled:opacity-70"
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </FormControl>
              <FormDescription>Selecciona al menos una versión para el pack</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || versionOptions.length === 0}>
            {isLoading ? "Creando..." : "Crear pack"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
