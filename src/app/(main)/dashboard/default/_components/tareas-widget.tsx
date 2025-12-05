"use client";

/**
 * Widget de tareas pendientes para el HOME
 * Muestra las tareas asignadas al usuario con badges de prioridad
 */

import Link from "next/link";

import { AlertCircle, ArrowRight, Calendar, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPendingTasks } from "@/hooks/use-admin-tasks";
import type { Task, TaskPriority } from "@/lib/services/admin-tasks-types";

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatea la fecha al formato local
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateString;
  }
}

/**
 * Obtiene el color del badge según la prioridad
 */
function getPriorityBadgeVariant(priority: TaskPriority): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "urgent":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Traduce la prioridad al español
 */
function translatePriority(priority: TaskPriority): string {
  switch (priority) {
    case "urgent":
      return "Urgente";
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "low":
      return "Baja";
    default:
      return priority;
  }
}

/**
 * Verifica si la tarea está vencida
 */
function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  try {
    return new Date(dueDate) < new Date();
  } catch {
    return false;
  }
}

// ============================================================================
// COMPONENTE: ITEM DE TAREA
// ============================================================================

function TareaItem({ tarea }: { tarea: Task }) {
  const vencida = isOverdue(tarea.due_date);

  return (
    <div className="hover:bg-muted/50 flex items-start space-x-3 rounded-lg border p-3 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm leading-none font-medium">{tarea.title}</p>
          {vencida && <AlertCircle className="text-destructive h-3 w-3" />}
        </div>
        {tarea.description && <p className="text-muted-foreground line-clamp-1 text-xs">{tarea.description}</p>}
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          {tarea.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={vencida ? "text-destructive" : ""}>{formatDate(tarea.due_date)}</span>
            </div>
          )}
        </div>
      </div>
      <Badge variant={getPriorityBadgeVariant(tarea.priority)} className="shrink-0">
        {translatePriority(tarea.priority)}
      </Badge>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function TareasWidget() {
  const { data, isLoading, error } = useMyPendingTasks(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Mis Tareas Pendientes
        </CardTitle>
        <CardDescription>Tareas asignadas a ti que requieren atención</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">No se obtuvieron datos</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {data.tasks.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <Clock className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">No tienes tareas pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.tasks.map((tarea) => (
                  <TareaItem key={tarea.id} tarea={tarea} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      {data && data.total > 0 && (
        <CardFooter>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/chat">
              Ver todas las tareas ({data.total})
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
