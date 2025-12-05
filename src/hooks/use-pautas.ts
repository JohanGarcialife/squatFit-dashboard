/**
 * Hooks para gestión de Pautas Nutricionales con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useQuery } from "@tanstack/react-query";

import { PautasService } from "@/lib/services/pautas-service";
import type { PautasStats } from "@/lib/services/pautas-service";

// Query keys para React Query
export const pautasKeys = {
  all: ["pautas"] as const,
  stats: () => [...pautasKeys.all, "stats"] as const,
  imcHistory: (date?: string) => [...pautasKeys.all, "imc-history", date] as const,
  recipes: () => [...pautasKeys.all, "recipes"] as const,
  meals: (date: string) => [...pautasKeys.all, "meals", date] as const,
  forms: () => [...pautasKeys.all, "forms"] as const,
  data: (userId?: string, date?: string) => [...pautasKeys.all, "data", userId, date] as const,
};

/**
 * Hook para obtener estadísticas de pautas
 */
export function usePautasStats() {
  const query = useQuery({
    queryKey: pautasKeys.stats(),
    queryFn: () => PautasService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener historial de IMC relacionado con pautas
 */
export function usePautasIMCHistory(date?: string) {
  const query = useQuery({
    queryKey: pautasKeys.imcHistory(date),
    queryFn: () => PautasService.getIMCHistory(date),
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener recetas relacionadas con pautas
 */
export function usePautasRecipes(userId?: string) {
  const query = useQuery({
    queryKey: pautasKeys.recipes(),
    queryFn: () => (userId ? PautasService.getRecetasUsuario() : PautasService.getRecetas()),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  return {
    recipes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener comidas por fecha relacionadas con pautas
 */
export function usePautasMeals(date: string) {
  const query = useQuery({
    queryKey: pautasKeys.meals(date),
    queryFn: () => PautasService.getComidasPorFecha(date),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  return {
    meals: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener formularios nutricionales
 */
export function usePautasForms() {
  const query = useQuery({
    queryKey: pautasKeys.forms(),
    queryFn: () => PautasService.getFormulariosNutricionales(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });

  return {
    forms: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener todos los datos relacionados con pautas
 */
export function usePautaData(userId?: string, date?: string) {
  const query = useQuery({
    queryKey: pautasKeys.data(userId, date),
    queryFn: () => PautasService.getPautaData(userId, date),
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
