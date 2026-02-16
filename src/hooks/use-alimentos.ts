/**
 * Hooks para gestión de Alimentos
 */

import { useState, useCallback, useMemo } from "react";

import { alimentosData } from "@/app/(main)/dashboard/dieta/_components/data";
import { Alimento, FiltrosAlimentos } from "@/app/(main)/dashboard/dieta/_components/schema";

/**
 * Hook para obtener todos los alimentos
 */
export function useAlimentosDieta() {
  const data = alimentosData;
  const isLoading = false;
  const isError = false;
  const error = null;

  return {
    data: data ?? [],
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook para buscar alimentos con filtros
 */
export function useAlimentosFiltrados(filtros: FiltrosAlimentos) {
  const { data: alimentos } = useAlimentosDieta();

  const alimentosFiltrados = useMemo(() => {
    return alimentos.filter((alimento) => {
      const matchBusqueda = !filtros.busqueda || alimento.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());

      const matchCategoria = !filtros.categoria?.length || filtros.categoria.includes(alimento.categoria);

      const matchOrigen = !filtros.origen?.length || filtros.origen.includes(alimento.origen);

      const matchEtiquetas =
        !filtros.etiquetas?.length || filtros.etiquetas.some((e) => alimento.etiquetas?.includes(e));

      return matchBusqueda && matchCategoria && matchOrigen && matchEtiquetas;
    });
  }, [alimentos, filtros]);

  return alimentosFiltrados;
}

/**
 * Hook para crear un alimento
 */
export function useCrearAlimento() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const crearAlimento = useCallback(async (alimento: Omit<Alimento, "id" | "createdAt">) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Creando alimento:", alimento);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...alimento,
        id: `alim-${Date.now()}`,
        origen: "manual" as const,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { crearAlimento, isLoading, error };
}

/**
 * Hook para actualizar un alimento
 */
export function useActualizarAlimento() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const actualizarAlimento = useCallback(async (id: string, datos: Partial<Alimento>) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Actualizando alimento:", id, datos);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id, ...datos };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { actualizarAlimento, isLoading, error };
}

/**
 * Hook para eliminar un alimento
 */
export function useEliminarAlimento() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const eliminarAlimento = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Eliminando alimento:", id);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { eliminarAlimento, isLoading, error };
}

/**
 * Hook para buscar alimentos en Open Food Facts
 */
export function useBuscarOpenFoodFacts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buscar = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Buscando en Open Food Facts:", query);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [];
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { buscar, isLoading, error };
}

/**
 * Hook para buscar alimentos en BEDCA
 */
export function useBuscarBEDCA() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buscar = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Buscando en BEDCA:", query);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [];
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { buscar, isLoading, error };
}
