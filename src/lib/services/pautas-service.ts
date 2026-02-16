/**
 * Servicio para manejar operaciones relacionadas con Pautas Nutricionales
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 *
 * Nota: El backend NO tiene endpoints CRUD completos para pautas nutricionales.
 * Este servicio agrega funcionalidades disponibles relacionadas con pautas.
 */

import { CalculatorService } from "./calculator-service";
import { getNutritionalForms, getFormUserAnswer } from "./form-service";
import type { FormType, FormUserAnswer } from "./form-service";
import { getAllRecipes, getUserRecipes, getMealsByDate } from "./recipe-service";
import type { BackendRecipe, BackendMeal } from "./recipe-types";
import type { IMCHistoryRecord } from "./trainer-types";

// ============================================
// TIPOS
// ============================================

/**
 * Estadísticas de pautas nutricionales
 */
export interface PautasStats {
  totalPautas: number;
  pautasActivas: number;
  pautasBorrador: number;
  pautasCompletadas: number;
  clientesSinPauta: number;
  promedioMacros: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
  ultimasActualizaciones: number;
}

/**
 * Datos relacionados con una pauta nutricional desde el backend
 */
export interface PautaBackendData {
  imcHistory: IMCHistoryRecord[];
  recipes: BackendRecipe[];
  meals: BackendMeal[];
  nutritionalForms: FormType[];
  formAnswers?: FormUserAnswer[];
}

// ============================================
// SERVICIO
// ============================================

/**
 * Servicio de Pautas con métodos estáticos
 */
export class PautasService {
  /**
   * Obtiene el historial de IMC del usuario
   * Endpoint: GET /api/v1/calculator/history
   */
  static async getIMCHistory(date?: string): Promise<IMCHistoryRecord[]> {
    try {
      return await CalculatorService.getIMCHistory(date);
    } catch (error) {
      console.error("Error al obtener historial de IMC:", error);
      throw error;
    }
  }

  /**
   * Calcula y guarda el IMC del usuario
   * Endpoint: POST /api/v1/calculator/imc
   */
  static async calculateIMC(weight: number, height: number) {
    try {
      return await CalculatorService.calculateIMC({ weight, height });
    } catch (error) {
      console.error("Error al calcular IMC:", error);
      throw error;
    }
  }

  /**
   * Obtiene todas las recetas disponibles
   * Endpoint: GET /api/v1/recipe/all
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
   * Endpoint: GET /api/v1/recipe/by-user
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
   * Obtiene las comidas del usuario para una fecha específica
   * Endpoint: GET /api/v1/recipe/meals
   */
  static async getComidasPorFecha(date: string): Promise<BackendMeal[]> {
    try {
      return await getMealsByDate(date);
    } catch (error) {
      console.error("Error al obtener comidas por fecha:", error);
      throw error;
    }
  }

  /**
   * Obtiene los formularios nutricionales disponibles
   * Endpoint: GET /api/v1/admin-panel/form-types
   */
  static async getFormulariosNutricionales(): Promise<FormType[]> {
    try {
      return await getNutritionalForms();
    } catch (error) {
      console.error("Error al obtener formularios nutricionales:", error);
      throw error;
    }
  }

  /**
   * Obtiene las respuestas de un usuario a un formulario nutricional
   * Endpoint: GET /api/v1/admin-panel/form-user-answer
   */
  static async getRespuestasFormulario(userId: string, formId: string): Promise<FormUserAnswer | null> {
    try {
      return await getFormUserAnswer(userId, formId);
    } catch (error) {
      console.error("Error al obtener respuestas de formulario:", error);
      throw error;
    }
  }

  /**
   * Calcula estadísticas básicas de pautas basándose en datos disponibles del backend
   * Nota: Como no existe endpoint de pautas, se calculan estadísticas aproximadas
   */
  static async getStats(): Promise<Partial<PautasStats>> {
    try {
      const [recetas, comidas] = await Promise.all([
        this.getRecetas().catch(() => []),
        this.getComidasPorFecha(new Date().toISOString().split("T")[0]).catch(() => []),
      ]);

      // Calcular macros promedio desde recetas
      const totalRecetas = recetas.length;
      const macrosPromedio = recetas.reduce(
        (acc, receta) => ({
          calorias: acc.calorias + receta.kcal,
          proteinas: acc.proteinas + receta.proteins,
          carbohidratos: acc.carbohidratos + receta.carbohydrates,
          grasas: acc.grasas + receta.fats,
        }),
        { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
      );

      return {
        promedioMacros: {
          calorias: totalRecetas > 0 ? Math.round(macrosPromedio.calorias / totalRecetas) : 0,
          proteinas: totalRecetas > 0 ? Math.round(macrosPromedio.proteinas / totalRecetas) : 0,
          carbohidratos: totalRecetas > 0 ? Math.round(macrosPromedio.carbohidratos / totalRecetas) : 0,
          grasas: totalRecetas > 0 ? Math.round(macrosPromedio.grasas / totalRecetas) : 0,
        },
        ultimasActualizaciones: comidas.length, // Comidas registradas hoy
      };
    } catch (error) {
      console.error("Error al obtener estadísticas de pautas:", error);
      return {
        promedioMacros: {
          calorias: 0,
          proteinas: 0,
          carbohidratos: 0,
          grasas: 0,
        },
        ultimasActualizaciones: 0,
      };
    }
  }

  /**
   * Obtiene todos los datos relacionados con pautas para un usuario
   */
  static async getPautaData(userId?: string, date?: string): Promise<PautaBackendData> {
    try {
      const [imcHistory, recipes, meals, nutritionalForms] = await Promise.all([
        this.getIMCHistory(date).catch(() => []),
        userId ? this.getRecetasUsuario().catch(() => []) : this.getRecetas().catch(() => []),
        date ? this.getComidasPorFecha(date).catch(() => []) : Promise.resolve([]),
        this.getFormulariosNutricionales().catch(() => []),
      ]);

      return {
        imcHistory,
        recipes,
        meals,
        nutritionalForms,
      };
    } catch (error) {
      console.error("Error al obtener datos de pauta:", error);
      throw error;
    }
  }
}
