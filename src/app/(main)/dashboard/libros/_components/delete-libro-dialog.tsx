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
import { useDeleteLibro } from "@/hooks/use-libros";

import { Libro } from "./schema";

interface DeleteLibroDialogProps {
  libro: Libro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLibroDialog({ libro, open, onOpenChange }: DeleteLibroDialogProps) {
  const deleteLibroMutation = useDeleteLibro();

  const handleDelete = async () => {
    if (!libro) return;

    try {
      await deleteLibroMutation.mutateAsync(libro.id);
      onOpenChange(false);
    } catch (error) {
      // El error ya es manejado por el hook
      console.error("Error eliminando libro:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Esta acción no se puede deshacer. Esto eliminará permanentemente el libro:</p>
            {libro && <p className="text-foreground font-semibold">&quot;{libro.title}&quot;</p>}
            <p>Se eliminarán todos los datos asociados a este libro.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLibroMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteLibroMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteLibroMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
