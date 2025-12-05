/**
 * Hooks para Marketing y KPIs con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useQuery } from "@tanstack/react-query";

import type { FiltrosMarketing } from "@/app/(main)/dashboard/marketing/_components/schema";
import type {
  MarketingKPIs,
  IngresoData,
  VentaProducto,
  TareasPorArea,
  CausaTicket,
} from "@/app/(main)/dashboard/marketing/_components/schema";
import { MarketingService } from "@/lib/services/marketing-service";

// Query keys para React Query
export const marketingKeys = {
  all: ["marketing"] as const,
  kpis: (filtros?: FiltrosMarketing) => [...marketingKeys.all, "kpis", filtros] as const,
  ingresos: (periodo: "mensual" | "anual") => [...marketingKeys.all, "ingresos", periodo] as const,
  ventasProducto: (filtros?: FiltrosMarketing) => [...marketingKeys.all, "ventas-producto", filtros] as const,
  tareasPendientes: () => [...marketingKeys.all, "tareas-pendientes"] as const,
  topCausasTickets: (limit?: number) => [...marketingKeys.all, "top-causas-tickets", limit] as const,
};

/**
 * Hook para obtener KPIs principales
 */
export function useMarketingKPIs(filtros?: FiltrosMarketing) {
  return useQuery({
    queryKey: marketingKeys.kpis(filtros),
    queryFn: () => MarketingService.getKPIs(filtros),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener ingresos acumulados
 * NOTA: El backend no implementa esto aún, retornará error
 */
export function useIngresosAcumulados(periodo: "mensual" | "anual", enabled: boolean = false) {
  return useQuery({
    queryKey: marketingKeys.ingresos(periodo),
    queryFn: () => MarketingService.getIngresosAcumulados(periodo),
    enabled, // Deshabilitado por defecto ya que el backend no lo implementa
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar si falla
  });
}

/**
 * Hook para obtener ventas por producto
 */
export function useVentasPorProducto(filtros?: FiltrosMarketing) {
  return useQuery({
    queryKey: marketingKeys.ventasProducto(filtros),
    queryFn: () => MarketingService.getVentasPorProducto(filtros),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener tareas pendientes por área
 */
export function useTareasPendientes() {
  return useQuery({
    queryKey: marketingKeys.tareasPendientes(),
    queryFn: () => MarketingService.getTareasPendientes(),
    staleTime: 1 * 60 * 1000, // 1 minuto (datos más dinámicos)
    gcTime: 3 * 60 * 1000, // 3 minutos
    retry: 2,
    refetchOnWindowFocus: true, // Refrescar al enfocar ventana
  });
}

/**
 * Hook para obtener top causas de tickets
 */
export function useTopCausasTickets(limit: number = 5) {
  return useQuery({
    queryKey: marketingKeys.topCausasTickets(limit),
    queryFn: () => MarketingService.getTopCausasTickets(limit),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
