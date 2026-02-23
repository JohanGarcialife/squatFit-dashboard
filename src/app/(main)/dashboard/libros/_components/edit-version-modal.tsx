"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateVersion } from "@/hooks/use-versions";
import type { VersionApi } from "@/lib/services/libros-service";

import { EditVersionForm } from "./edit-version-form";
import { editVersionFormSchema, EditVersionFormValues } from "./edit-version-schema";

interface EditVersionModalProps {
  version: VersionApi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditVersionModal({ version, open, onOpenChange, onSuccess }: EditVersionModalProps) {
  const updateVersionMutation = useUpdateVersion();

  const form = useForm<EditVersionFormValues>({
    resolver: zodResolver(editVersionFormSchema),
    defaultValues: { title: "", price: "", image: "" },
  });

  useEffect(() => {
    if (version && open) {
      form.reset({
        title: version.title,
        price: version.price,
        image: version.image || "",
      });
    }
  }, [version, open, form]);

  const handleSubmit = async (values: EditVersionFormValues) => {
    if (!version) return;
    try {
      await updateVersionMutation.mutateAsync({
        versionId: version.id,
        data: {
          title: values.title,
          price: values.price,
          image: values.image || undefined,
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
          <DialogTitle>Editar versión</DialogTitle>
          <DialogDescription>Modifica el título, precio e imagen de la versión.</DialogDescription>
        </DialogHeader>
        <EditVersionForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={updateVersionMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
