/**
 * Hooks para gestión de Seguimiento Nutricional con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { IMCHistoryRecord } from "@/lib/services/calculator-types";
import type { CreateMealPayload } from "@/lib/services/recipe-types";
import type { BackendMeal } from "@/lib/services/recipe-types";
import { SeguimientoService } from "@/lib/services/seguimiento-service";
import type { SeguimientoNutricionalData, SeguimientoStats } from "@/lib/services/seguimiento-service";

// Query keys para React Query
export const seguimientoKeys = {
  all: ["seguimiento"] as const,
  data: (userId?: string, date?: string) => [...seguimientoKeys.all, "data", userId, date] as const,
  stats: (userId?: string, date?: string) => [...seguimientoKeys.all, "stats", userId, date] as const,
  meals: (date: string) => [...seguimientoKeys.all, "meals", date] as const,
  imcHistory: (date?: string) => [...seguimientoKeys.all, "imc-history", date] as const,
};

/**
 * Hook para obtener datos completos de seguimiento nutricional
 */
interface UseSeguimientoDataOptions {
  userId?: string;
  date?: string;
  enabled?: boolean;
}

export function useSeguimientoData(options: UseSeguimientoDataOptions = {}) {
  const { userId, date, enabled = true } = options;

  const query = useQuery({
    queryKey: seguimientoKeys.data(userId, date),
    queryFn: () => SeguimientoService.getSeguimientoData(userId, date),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener estadísticas de seguimiento nutricional
 */
export function useSeguimientoStats(options: UseSeguimientoDataOptions = {}) {
  const { userId, date, enabled = true } = options;

  const query = useQuery({
    queryKey: seguimientoKeys.stats(userId, date),
    queryFn: () => SeguimientoService.getStats(userId, date),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener comidas por fecha
 */
interface UseMealsOptions {
  date: string;
  enabled?: boolean;
}

export function useMeals(options: UseMealsOptions) {
  const { date, enabled = true } = options;

  const query = useQuery({
    queryKey: seguimientoKeys.meals(date),
    queryFn: () => SeguimientoService.getMealsByDate(date),
    enabled: enabled && !!date,
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: 2,
  });

  return {
    meals: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para crear una comida
 */
export function useCreateMeal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateMealPayload) => SeguimientoService.createMeal(data),
    onSuccess: (data: BackendMeal) => {
      // Invalidar queries de comidas para refrescar
      const mealDate = new Date(data.date).toISOString().split("T")[0];
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.meals(mealDate) });
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.stats() });
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.data() });
      toast.success("Comida registrada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar comida: ${error.message}`);
    },
  });

  return {
    createMeal: mutation.mutateAsync,
    isCreating: mutation.isPending,
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
    queryKey: seguimientoKeys.imcHistory(date),
    queryFn: () => SeguimientoService.getIMCHistory(date),
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
 * Hook para calcular IMC
 */
export function useCalculateIMC() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ weight, height }: { weight: number; height: number }) =>
      SeguimientoService.calculateIMC(weight, height),
    onSuccess: () => {
      // Invalidar historial de IMC
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.imcHistory() });
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.stats() });
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.data() });
      toast.success("IMC calculado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al calcular IMC: ${error.message}`);
    },
  });

  return {
    calculateIMC: mutation.mutateAsync,
    isCalculating: mutation.isPending,
  };
}
