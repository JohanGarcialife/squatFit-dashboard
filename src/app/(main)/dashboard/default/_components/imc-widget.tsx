"use client";

/**
 * Widget de IMC para el HOME
 * Muestra el último IMC calculado y un gráfico simple de historial
 */

import Link from "next/link";

import { Activity, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIMCHistory } from "@/hooks/use-imc";

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
 * Obtiene el color y texto según el valor de IMC
 */
function getIMCStatus(imc: number): {
  color: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (imc < 18.5) {
    return { color: "text-blue-500", label: "Bajo peso", variant: "outline" };
  } else if (imc < 25) {
    return { color: "text-green-500", label: "Normal", variant: "default" };
  } else if (imc < 30) {
    return { color: "text-yellow-500", label: "Sobrepeso", variant: "secondary" };
  } else {
    return { color: "text-red-500", label: "Obesidad", variant: "destructive" };
  }
}

/**
 * Calcula la tendencia del IMC
 */
function calculateTrend(history: Array<{ imc: number }>): "up" | "down" | "stable" {
  if (history.length < 2) return "stable";

  const latest = history[0].imc;
  const previous = history[1].imc;
  const diff = latest - previous;

  if (Math.abs(diff) < 0.5) return "stable";
  return diff > 0 ? "up" : "down";
}

// ============================================================================
// COMPONENTE: MINI GRÁFICO DE BARRAS
// ============================================================================

function MiniBarChart({ data }: { data: Array<{ imc: number; date: string }> }) {
  if (data.length === 0) return null;

  const maxIMC = Math.max(...data.map((d) => d.imc));
  const minIMC = Math.min(...data.map((d) => d.imc));
  const range = maxIMC - minIMC || 1;

  return (
    <div className="flex h-24 items-end justify-between gap-1">
      {data
        .slice(0, 7)
        .reverse()
        .map((entry, index) => {
          const height = ((entry.imc - minIMC) / range) * 100;
          const status = getIMCStatus(entry.imc);

          return (
            <div key={index} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className={`w-full rounded-t transition-all hover:opacity-80 ${status.color.replace("text-", "bg-")}`}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
              <span className="text-muted-foreground mt-1 text-[10px]">{formatDate(entry.date)}</span>

              {/* Tooltip */}
              <div className="bg-popover absolute bottom-full mb-2 hidden rounded px-2 py-1 text-xs shadow-md group-hover:block">
                <p className="font-semibold">{entry.imc.toFixed(1)}</p>
                <p className="text-muted-foreground">{formatDate(entry.date)}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function IMCWidget() {
  const { history, isLoading, error } = useIMCHistory();

  const latestIMC = history.length > 0 ? history[0] : null;
  const trend = latestIMC ? calculateTrend(history) : "stable";
  const status = latestIMC ? getIMCStatus(latestIMC.imc) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Índice de Masa Corporal
        </CardTitle>
        <CardDescription>Tu historial de IMC reciente</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">No se obtuvieron datos</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!isLoading && !error && (
          <>
            {!latestIMC ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <Activity className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">No hay datos de IMC registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* IMC Actual */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-muted-foreground text-sm">IMC Actual</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${status?.color}`}>{latestIMC.imc.toFixed(1)}</span>
                      {trend !== "stable" && (
                        <div className="flex items-center gap-1 text-sm">
                          {trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {status && <Badge variant={status.variant}>{status.label}</Badge>}
                </div>

                {/* Mini Gráfico */}
                {history.length > 1 && (
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs">Últimas 7 mediciones</p>
                    <MiniBarChart data={history} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/pautas">
            Ver historial completo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
