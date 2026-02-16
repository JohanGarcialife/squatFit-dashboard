/**
 * Servicio para manejar todas las operaciones relacionadas con Dieta/Nutrición
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import type { DietaStats } from "@/app/(main)/dashboard/dieta/_components/schema";

import { getAllRecipes, getUserRecipes } from "./recipe-service";
import type { BackendRecipe } from "./recipe-types";

/**
 * Servicio de Dieta con métodos estáticos para operaciones comunes
 */
export class DietaService {
  /**
   * Obtiene todas las recetas del sistema
   * @returns Array de recetas del backend
   */
  static async getRecetas(): Promise<BackendRecipe[]> {
    try {
      return await getAllRecipes();
    } catch (error) {
      console.error("Error al obtener recetas:", error);
      throw error;
    }
  }

  /**
   * Obtiene las recetas del usuario autenticado
   * @returns Array de recetas del usuario
   */
  static async getRecetasUsuario(): Promise<BackendRecipe[]> {
    try {
      return await getUserRecipes();
    } catch (error) {
      console.error("Error al obtener recetas del usuario:", error);
      throw error;
    }
  }

  /**
   * Calcula estadísticas de dieta basándose en datos del backend
   * @returns Estadísticas calculadas
   */
  static async getStats(): Promise<DietaStats> {
    try {
      const recetas = await getAllRecipes();

      // Calcular estadísticas desde las recetas
      const totalRecetas = recetas.length;
      // Nota: El backend no provee estado de recetas, asumimos todas publicadas
      const recetasPublicadas = totalRecetas;
      const recetasBorrador = 0;

      return {
        // Datos reales de recetas
        totalRecetas,
        recetasPublicadas,
        recetasBorrador,
        // TODO: Implementar cuando el backend tenga estos endpoints
        totalAlimentos: 0,
        alimentosManuales: 0,
        alimentosApi: 0,
        totalMenus: 0,
        menusActivos: 0,
        totalSustituciones: 0,
        totalRestricciones: 0,
      };
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      // Devolver estadísticas vacías en caso de error
      return {
        totalAlimentos: 0,
        alimentosManuales: 0,
        alimentosApi: 0,
        totalRecetas: 0,
        recetasPublicadas: 0,
        recetasBorrador: 0,
        totalMenus: 0,
        menusActivos: 0,
        totalSustituciones: 0,
        totalRestricciones: 0,
      };
    }
  }

  /**
   * Búsqueda de recetas por nombre o descripción
   * @param query - Término de búsqueda
   * @returns Recetas que coinciden con la búsqueda
   */
  static async buscarRecetas(query: string): Promise<BackendRecipe[]> {
    try {
      const recetas = await getAllRecipes();
      const queryLower = query.toLowerCase();

      return recetas.filter(
        (receta) =>
          receta.name.toLowerCase().includes(queryLower) || receta.description?.toLowerCase().includes(queryLower),
      );
    } catch (error) {
      console.error("Error al buscar recetas:", error);
      throw error;
    }
  }
}
