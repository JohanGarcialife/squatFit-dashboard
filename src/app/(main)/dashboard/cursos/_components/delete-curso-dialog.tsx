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
import { useDeleteCurso } from "@/hooks/use-cursos";
import { Curso } from "./schema";

interface DeleteCursoDialogProps {
  curso: Curso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCursoDialog({ curso, open, onOpenChange }: DeleteCursoDialogProps) {
  const deleteCursoMutation = useDeleteCurso();

  const handleDelete = async () => {
    if (!curso) return;

    try {
      await deleteCursoMutation.mutateAsync(curso.id);
      onOpenChange(false);
    } catch (error) {
      // El error ya es manejado por el hook
      console.error("Error eliminando curso:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el curso:
            </p>
            {curso && (
              <p className="font-semibold text-foreground">
                &quot;{curso.name}&quot;
              </p>
            )}
            <p>
              Se eliminarán todos los datos asociados a este curso.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCursoMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCursoMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteCursoMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

