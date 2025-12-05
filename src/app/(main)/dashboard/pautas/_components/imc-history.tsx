"use client";

import { useMemo, useState } from "react";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIMCHistory } from "@/hooks/use-imc";
import { IMCCategoryMap, getIMCCategory, type IMCHistoryRecord } from "@/lib/services/calculator-types";

// ============================================================================
// INTERFACES
// ============================================================================

interface IMCHistoryProps {
  /**
   * Callback cuando se selecciona un registro del historial
   */
  onSelect?: (record: IMCHistoryRecord) => void;
  /**
   * Si es true, muestra solo registros de una fecha específica
   */
  date?: string;
  /**
   * Si es true, muestra el componente en modo compacto
   */
  compact?: boolean;
}

// ============================================================================
// COMPONENTE DE HISTORIAL
// ============================================================================

export function IMCHistory({ onSelect, date, compact = false }: IMCHistoryProps) {
  const { history, isLoading, error, refetch } = useIMCHistory({
    date,
    enabled: true,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Ordenar historial por fecha (más reciente primero)
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(
        (a as { date?: string; created_at?: string }).date || a.created_at || a.createdAt,
      ).getTime();
      const dateB = new Date(
        (b as { date?: string; created_at?: string }).date || b.created_at || b.createdAt,
      ).getTime();
      return dateB - dateA;
    });
  }, [history]);

  // Calcular tendencia comparando con el registro anterior
  const getTrend = (currentIndex: number): "up" | "down" | "stable" => {
    if (currentIndex === 0 || sortedHistory.length === 1) {
      return "stable";
    }

    const current = sortedHistory[currentIndex];
    const previous = sortedHistory[currentIndex - 1];

    if (current.imc > previous.imc) {
      return "up";
    }
    if (current.imc < previous.imc) {
      return "down";
    }
    return "stable";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP", { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm", { locale: es });
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="text-muted-foreground mb-4 size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4 text-sm font-medium">Error al cargar el historial</p>
        <p className="text-muted-foreground mb-4 text-xs">
          {error instanceof Error ? error.message : "Error desconocido"}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (sortedHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Calendar className="text-muted-foreground mb-4 size-12" />
        <p className="text-sm font-medium">No hay registros de IMC</p>
        <p className="text-muted-foreground mt-1 text-xs">Calcula tu IMC para comenzar a llevar un registro</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {sortedHistory.length} {sortedHistory.length === 1 ? "registro" : "registros"}
          </p>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Actualizar
          </Button>
        </div>
      )}

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {sortedHistory.map((record, index) => {
            // Obtener categoría del IMC si no viene en el record
            const category = record.category || (record.imc ? getIMCCategory(record.imc) : "normal");
            const categoryInfo = IMCCategoryMap[category as keyof typeof IMCCategoryMap];
            const trend = getTrend(index);
            const isSelected = selectedId === record.id;

            return (
              <div
                key={record.id}
                className={`hover:border-primary cursor-pointer rounded-lg border p-4 transition-all ${
                  isSelected ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => {
                  setSelectedId(record.id);
                  if (onSelect) {
                    onSelect(record);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Fecha y hora */}
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground size-3" />
                      <span className="text-xs font-medium">
                        {formatDate(
                          (record as { date?: string; created_at?: string }).date ||
                            record.created_at ||
                            record.createdAt ||
                            "",
                        )}
                      </span>
                      {formatTime(
                        (record as { date?: string; created_at?: string }).date ||
                          record.created_at ||
                          record.createdAt ||
                          "",
                      ) && (
                        <>
                          <span className="text-muted-foreground text-xs">•</span>
                          <span className="text-muted-foreground text-xs">
                            {formatTime(
                              (record as { date?: string; created_at?: string }).date ||
                                record.created_at ||
                                record.createdAt ||
                                "",
                            )}
                          </span>
                        </>
                      )}
                    </div>

                    {/* IMC y categoría */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{record.imc.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs">IMC</span>
                      </div>

                      <Badge
                        variant="outline"
                        className={
                          categoryInfo?.color ??
                          "border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
                        }
                      >
                        {categoryInfo?.label ?? record.category ?? "N/A"}
                      </Badge>

                      {/* Tendencia */}
                      {trend !== "stable" && index > 0 && (
                        <div className="flex items-center gap-1">
                          {trend === "up" ? (
                            <TrendingUp className="size-3 text-orange-500" />
                          ) : (
                            <TrendingDown className="size-3 text-green-500" />
                          )}
                          <span className="text-muted-foreground text-xs">
                            {trend === "up" ? "Aumentó" : "Disminuyó"}
                          </span>
                        </div>
                      )}
                      {trend === "stable" && index > 0 && (
                        <div className="flex items-center gap-1">
                          <Minus className="text-muted-foreground size-3" />
                        </div>
                      )}
                    </div>

                    {/* Peso y altura */}
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>
                        Peso: <span className="font-medium">{record.weight} kg</span>
                      </span>
                      <span>•</span>
                      <span>
                        Altura: <span className="font-medium">{record.height} cm</span>
                      </span>
                    </div>

                    {/* Tips si existen */}
                    {record.tips && record.tips.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">Recomendaciones:</p>
                        <ul className="space-y-0.5">
                          {record.tips.slice(0, 2).map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-muted-foreground text-xs">
                              • {tip}
                            </li>
                          ))}
                          {record.tips.length > 2 && (
                            <li className="text-muted-foreground text-xs">+{record.tips.length - 2} más...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {index < sortedHistory.length - 1 && <Separator className="mt-3" />}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
