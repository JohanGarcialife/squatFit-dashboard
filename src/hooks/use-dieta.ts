/**
 * Hooks para gestión de datos de Dieta
 * Conectados al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useMemo } from "react";

import type { DietaStats } from "@/app/(main)/dashboard/dieta/_components/schema";

// Importar useRecetas para usarlo en useDietaStats
import { useRecetas } from "./use-recetas";

// Alimentos
export {
  useAlimentosDieta,
  useAlimentosFiltrados,
  useCrearAlimento,
  useActualizarAlimento,
  useEliminarAlimento,
  useBuscarOpenFoodFacts,
  useBuscarBEDCA,
} from "./use-alimentos";

// Recetas
export {
  useRecetas,
  useRecetasUsuario,
  useReceta,
  useRecetasFiltradas,
  useCrearReceta,
  useSubirImagenReceta,
  useDuplicarReceta,
} from "./use-recetas";

// Menús, Sustituciones y Restricciones
export {
  useMenus,
  useMenu,
  useCrearMenu,
  useSustituciones,
  useSustitucionesPorRestriccion,
  useCrearSustitucion,
  useRestricciones,
  useRestriccionesActivas,
  useCrearRestriccion,
} from "./use-menus";

/**
 * Hook para obtener estadísticas de Dieta desde el backend
 * Calcula stats basándose en datos reales de recetas
 */
export function useDietaStats(): { stats: DietaStats; isLoading: boolean } {
  const { data: recetas, isLoading } = useRecetas();

  const stats = useMemo(() => {
    const recetasPublicadas = recetas.filter((r) => r.estado === "publicado").length;
    const recetasBorrador = recetas.filter((r) => r.estado === "borrador").length;

    return {
      // Datos reales del backend
      totalRecetas: recetas.length,
      recetasPublicadas,
      recetasBorrador,
      // TODO: Estos datos son mock hasta que se implementen en el backend
      totalAlimentos: 0,
      alimentosManuales: 0,
      alimentosApi: 0,
      totalMenus: 0,
      menusActivos: 0,
      totalSustituciones: 0,
      totalRestricciones: 0,
    };
  }, [recetas]);

  return { stats, isLoading };
}
