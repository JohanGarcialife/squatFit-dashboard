/**
 * Hooks para gestión de Menús, Sustituciones y Restricciones
 */

import { useState, useCallback, useMemo } from "react";

import {
  menusData,
  sustitucionesData,
  restriccionesData,
  getDietaStats,
} from "@/app/(main)/dashboard/dieta/_components/data";
import { MenuSemanal, Sustitucion, Restriccion } from "@/app/(main)/dashboard/dieta/_components/schema";

// ============================================
// MENÚS
// ============================================

/**
 * Hook para obtener todos los menús
 */
export function useMenus() {
  const data = menusData;
  const isLoading = false;
  const isError = false;
  const error = null;

  return { data: data ?? [], isLoading, isError, error };
}

/**
 * Hook para obtener un menú por ID
 */
export function useMenu(id: string | null) {
  const { data: menus } = useMenus();

  return useMemo(() => {
    if (!id) return null;
    return menus.find((m) => m.id === id) ?? null;
  }, [menus, id]);
}

/**
 * Hook para crear un menú
 */
export function useCrearMenu() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const crearMenu = useCallback(async (menu: Omit<MenuSemanal, "id" | "createdAt">) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Creando menú:", menu);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...menu,
        id: `menu-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { crearMenu, isLoading, error };
}

// ============================================
// SUSTITUCIONES
// ============================================

/**
 * Hook para obtener todas las sustituciones
 */
export function useSustituciones() {
  const data = sustitucionesData;
  const isLoading = false;
  const isError = false;
  const error = null;

  return { data: data ?? [], isLoading, isError, error };
}

/**
 * Hook para obtener sustituciones por restricción
 */
export function useSustitucionesPorRestriccion(restriccion: string) {
  const { data: sustituciones } = useSustituciones();

  return useMemo(() => {
    return sustituciones.filter((s) => s.restriccion === restriccion && s.activo);
  }, [sustituciones, restriccion]);
}

/**
 * Hook para crear una sustitución
 */
export function useCrearSustitucion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const crearSustitucion = useCallback(async (sustitucion: Omit<Sustitucion, "id">) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Creando sustitución:", sustitucion);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...sustitucion,
        id: `sust-${Date.now()}`,
      };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { crearSustitucion, isLoading, error };
}

// ============================================
// RESTRICCIONES
// ============================================

/**
 * Hook para obtener todas las restricciones
 */
export function useRestricciones() {
  const data = restriccionesData;
  const isLoading = false;
  const isError = false;
  const error = null;

  return { data: data ?? [], isLoading, isError, error };
}

/**
 * Hook para obtener restricciones activas
 */
export function useRestriccionesActivas() {
  const { data: restricciones } = useRestricciones();

  return useMemo(() => {
    return restricciones.filter((r) => r.activo);
  }, [restricciones]);
}

/**
 * Hook para crear una restricción
 */
export function useCrearRestriccion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const crearRestriccion = useCallback(async (restriccion: Omit<Restriccion, "id">) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Creando restricción:", restriccion);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...restriccion,
        id: `rest-${Date.now()}`,
      };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { crearRestriccion, isLoading, error };
}

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Hook para obtener estadísticas de dieta
 */
export function useDietaStats() {
  return useMemo(() => getDietaStats(), []);
}
