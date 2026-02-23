"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdatePack } from "@/hooks/use-packs";

import { EditPackForm } from "./edit-pack-form";
import { editPackFormSchema, EditPackFormValues } from "./edit-pack-schema";
import type { Pack } from "./schema";

interface EditPackModalProps {
  pack: Pack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditPackModal({ pack, open, onOpenChange, onSuccess }: EditPackModalProps) {
  const updateMutation = useUpdatePack();
  const form = useForm<EditPackFormValues>({
    resolver: zodResolver(editPackFormSchema),
    defaultValues: { name: "", description: "", price: "" },
  });

  useEffect(() => {
    if (pack && open) {
      form.reset({
        name: pack.name,
        description: pack.description ?? "",
        price: pack.price.toString(),
      });
    }
  }, [pack, open, form]);

  const handleSubmit = async (values: EditPackFormValues) => {
    if (!pack) return;
    try {
      await updateMutation.mutateAsync({
        id: pack.id,
        data: {
          name: values.name,
          description: values.description || undefined,
          price: values.price,
        },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error manejado por el hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar pack</DialogTitle>
          <DialogDescription>Las versiones incluidas no se pueden modificar desde aquí.</DialogDescription>
        </DialogHeader>
        <EditPackForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
