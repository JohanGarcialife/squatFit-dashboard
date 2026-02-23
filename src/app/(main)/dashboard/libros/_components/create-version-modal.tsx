"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateVersion } from "@/hooks/use-versions";

import { CreateVersionForm } from "./create-version-form";
import { createVersionDefaultValues, createVersionFormSchema, CreateVersionFormValues } from "./create-version-schema";

interface CreateVersionModalProps {
  bookId: string;
  bookTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateVersionModal({ bookId, bookTitle, open, onOpenChange, onSuccess }: CreateVersionModalProps) {
  const createVersionMutation = useCreateVersion(bookId);

  const form = useForm<CreateVersionFormValues>({
    resolver: zodResolver(createVersionFormSchema),
    defaultValues: createVersionDefaultValues,
  });

  const handleSubmit = async (values: CreateVersionFormValues) => {
    if (!values.file) return;
    try {
      await createVersionMutation.mutateAsync({
        title: values.title,
        price: values.price,
        image: values.image || undefined,
        file: values.file,
      });
      onOpenChange(false);
      form.reset(createVersionDefaultValues);
      onSuccess?.();
    } catch {
      // Error manejado por el hook
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset(createVersionDefaultValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva versión</DialogTitle>
          <DialogDescription>Crear versión para &quot;{bookTitle}&quot;. El PDF es obligatorio.</DialogDescription>
        </DialogHeader>
        <CreateVersionForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={createVersionMutation.isPending}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
