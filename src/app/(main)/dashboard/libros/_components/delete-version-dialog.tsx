"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteVersion } from "@/hooks/use-versions";
import type { VersionApi } from "@/lib/services/libros-service";

interface DeleteVersionDialogProps {
  version: VersionApi | null;
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteVersionDialog({ version, bookId, open, onOpenChange, onSuccess }: DeleteVersionDialogProps) {
  const deleteVersionMutation = useDeleteVersion(bookId);

  const handleDelete = async () => {
    if (!version) return;
    try {
      await deleteVersionMutation.mutateAsync(version.id);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error manejado por el hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar versión?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Esta acción no se puede deshacer.</p>
            {version && <p className="font-semibold">&quot;{version.title}&quot;</p>}
            <p>Solo se puede eliminar si la versión no está en uso (no hay compras ni está en ningún pack).</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteVersionMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteVersionMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteVersionMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
