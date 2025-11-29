/**
 * Hooks para gestión de datos de Dieta
 *
 * Este archivo re-exporta todos los hooks de dieta desde archivos modulares.
 * Para integrar con backend, actualizar los archivos individuales.
 */

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
export { useRecetas, useReceta, useRecetasFiltradas, useCrearReceta, useDuplicarReceta } from "./use-recetas";

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
  useDietaStats,
} from "./use-menus";
