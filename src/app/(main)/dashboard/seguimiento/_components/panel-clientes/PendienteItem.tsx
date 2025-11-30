"use client";

import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { PendienteItemProps } from "./types";
import { formatDate, getPrioridadColor } from "./utils";

export function PendienteItem({ pendiente }: PendienteItemProps) {
  const isVencido = pendiente.estado === "vencida";

  return (
    <div
      className={cn(
        "rounded-md border p-3 text-sm",
        isVencido ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30" : "bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <p className="leading-none font-medium">{pendiente.titulo}</p>
          {pendiente.descripcion && (
            <p className="text-muted-foreground line-clamp-2 text-xs">{pendiente.descripcion}</p>
          )}
        </div>
        <Badge variant="secondary" className={cn("shrink-0 text-xs", getPrioridadColor(pendiente.prioridad))}>
          {pendiente.prioridad}
        </Badge>
      </div>
      <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <CalendarDays className="size-3" />
          {formatDate(pendiente.fechaEntrega)}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            isVencido ? "border-red-300 text-red-700 dark:text-red-400" : "border-muted-foreground/30",
          )}
        >
          {pendiente.estado}
        </Badge>
      </div>
    </div>
  );
}
