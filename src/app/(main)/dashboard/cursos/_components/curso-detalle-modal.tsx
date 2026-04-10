"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCourseDetail } from "@/hooks/use-cursos";

import { CursoDetalleContent } from "./curso-detalle-content";

interface CursoDetalleModalProps {
  courseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CursoDetalleModal({ courseId, open, onOpenChange }: CursoDetalleModalProps) {
  const { data, isLoading, isError, error, refetch } = useCourseDetail(courseId, { enabled: open && !!courseId });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,820px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="bg-background/95 shrink-0 border-b px-7 py-5 text-left backdrop-blur">
          <DialogTitle className="pr-10 text-xl leading-tight">{data?.title ?? "Detalle del curso"}</DialogTitle>
          <DialogDescription className="sr-only">
            Información del curso, tutor y currículo de videos obtenida del servidor.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          {!courseId ? null : isLoading ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
              <p className="text-sm">Cargando detalle…</p>
            </div>
          ) : isError ? (
            <div className="space-y-3 py-6 text-center">
              <p className="text-destructive text-sm font-medium">No se pudo cargar el curso</p>
              <p className="text-muted-foreground text-xs">
                {error instanceof Error ? error.message : "Error desconocido"}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : data ? (
            <CursoDetalleContent data={data} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
