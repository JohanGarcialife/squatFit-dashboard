/**
 * Hooks para gestión de IMC con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CalculatorService } from "@/lib/services/calculator-service";
import type { CalculateIMCDto, IMCCalculationResponse, IMCHistoryRecord } from "@/lib/services/calculator-types";

// Query keys para React Query
export const imcKeys = {
  all: ["imc"] as const,
  history: (date?: string) => [...imcKeys.all, "history", date] as const,
  latest: () => [...imcKeys.all, "latest"] as const,
};

/**
 * Opciones para el hook useIMC
 */
interface UseIMCOptions {
  autoFetchHistory?: boolean;
}

/**
 * Hook principal para gestión de IMC
 */
export function useIMC(options: UseIMCOptions = {}) {
  const { autoFetchHistory = false } = options;
  const [lastCalculation, setLastCalculation] = useState<IMCCalculationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CalculateIMCDto) => {
      setIsCalculating(true);
      try {
        const result = await CalculatorService.calculateIMC(data);
        setLastCalculation(result);
        // Invalidar historial para refrescar
        queryClient.invalidateQueries({ queryKey: imcKeys.history() });
        return result;
      } finally {
        setIsCalculating(false);
      }
    },
    onSuccess: (data) => {
      toast.success("IMC calculado exitosamente");
      setLastCalculation(data);
    },
    onError: (error: Error) => {
      toast.error(`Error al calcular IMC: ${error.message}`);
    },
  });

  // Obtener historial si está habilitado
  const historyQuery = useQuery({
    queryKey: imcKeys.history(),
    queryFn: () => CalculatorService.getIMCHistory(),
    enabled: autoFetchHistory,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  return {
    calculateIMCAsync: mutation.mutateAsync,
    isCalculating: isCalculating || mutation.isPending,
    lastCalculation,
    resetCalculation: () => setLastCalculation(null),
    history: historyQuery.data ?? [],
    isLoadingHistory: historyQuery.isLoading,
    historyError: historyQuery.error,
  };
}

/**
 * Hook para obtener historial de IMC
 */
interface UseIMCHistoryOptions {
  date?: string;
  enabled?: boolean;
}

export function useIMCHistory(options: UseIMCHistoryOptions = {}) {
  const { date, enabled = true } = options;

  const query = useQuery({
    queryKey: imcKeys.history(date),
    queryFn: () => CalculatorService.getIMCHistory(date),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener el último cálculo de IMC
 */
export function useLatestIMC() {
  const { history } = useIMCHistory({ enabled: true });

  const latest = history.length > 0 ? history[0] : null;

  return {
    latestIMC: latest,
    isLoading: false,
  };
}
