"use client";

/**
 * Componente de overview de asesorías para el HOME
 * Muestra las asesorías recientes del sistema
 */

import Link from "next/link";

import { ArrowRight, MessageSquare, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentAdvices } from "@/hooks/use-advices";
import type { Advice } from "@/lib/services/advices-types";

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene las iniciales del nombre de usuario
 */
function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
}

/**
 * Formatea la fecha al formato local
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

// ============================================================================
// COMPONENTE: ITEM DE ASESORÍA
// ============================================================================

function AsesoriaItem({ asesoria }: { asesoria: Advice }) {
  return (
    <div className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{getInitials(asesoria.user_name, asesoria.user_email)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm leading-none font-medium">
            {asesoria.user_name || asesoria.user_email || "Sin nombre"}
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          {asesoria.type && <span className="capitalize">{asesoria.type}</span>}
          {asesoria.created_at && (
            <>
              <span>•</span>
              <span>{formatDate(asesoria.created_at)}</span>
            </>
          )}
        </div>
      </div>
      {asesoria.adviser_name && (
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <User className="h-3 w-3" />
          <span className="max-w-[100px] truncate">{asesoria.adviser_name}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AsesoriasOverview() {
  const { data, isLoading, error } = useRecentAdvices();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Asesorías Recientes
        </CardTitle>
        <CardDescription>Últimas asesorías registradas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">No se obtuvieron datos</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {data.advices.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <MessageSquare className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">No hay asesorías registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.advices.map((asesoria, index) => (
                  <AsesoriaItem key={`asesoria-${asesoria.id || index}-${index}`} asesoria={asesoria} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      {data && data.advices.length > 0 && (
        <CardFooter>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/chat">
              Ver todas las asesorías
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
