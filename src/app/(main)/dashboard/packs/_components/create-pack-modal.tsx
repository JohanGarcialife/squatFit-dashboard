"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreatePack } from "@/hooks/use-packs";

import { CreatePackForm } from "./create-pack-form";
import { createPackDefaultValues, createPackFormSchema, CreatePackFormValues } from "./create-pack-schema";

interface CreatePackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePackModal({ open, onOpenChange, onSuccess }: CreatePackModalProps) {
  const createMutation = useCreatePack();
  const form = useForm<CreatePackFormValues>({
    resolver: zodResolver(createPackFormSchema),
    defaultValues: createPackDefaultValues,
  });

  const handleSubmit = async (values: CreatePackFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        price: values.price,
        version_ids: values.version_ids,
      });
      onOpenChange(false);
      form.reset(createPackDefaultValues);
      onSuccess?.();
    } catch {
      // Error manejado por el hook
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset(createPackDefaultValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nuevo pack</DialogTitle>
          <DialogDescription>
            Crea un pack que incluye varias versiones de libros. El usuario compra el pack completo.
          </DialogDescription>
        </DialogHeader>
        <CreatePackForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
