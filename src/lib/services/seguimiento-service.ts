/**
 * Servicio para manejar operaciones relacionadas con Seguimiento de Nutrición
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 *
 * Endpoints disponibles:
 * - GET /api/v1/recipe/meals - Obtiene comidas del usuario por fecha
 * - POST /api/v1/recipe/meal - Crea una comida (registra consumo)
 * - GET /api/v1/calculator/history - Historial de IMC
 * - POST /api/v1/calculator/imc - Calcula y guarda IMC
 * - GET /api/v1/admin-panel/form-user-answer - Respuestas de formularios nutricionales
 */

import { CalculatorService } from "./calculator-service";
import type { IMCHistoryRecord } from "./calculator-types";
import { getFormUserAnswer, getNutritionalForms } from "./form-service";
import type { FormType, FormUserAnswer } from "./form-service";
import { getMealsByDate, createMeal } from "./recipe-service";
import type { BackendMeal, CreateMealPayload } from "./recipe-types";

// ============================================
// TIPOS
// ============================================

/**
 * Datos de seguimiento nutricional para un usuario
 */
export interface SeguimientoNutricionalData {
  imcHistory: IMCHistoryRecord[];
  meals: BackendMeal[];
  formAnswers?: FormUserAnswer[];
  nutritionalForms: FormType[];
}

/**
 * Estadísticas de seguimiento nutricional
 */
export interface SeguimientoStats {
  totalMeals: number;
  mealsThisWeek: number;
  mealsToday: number;
  imcRecords: number;
  lastIMC?: IMCHistoryRecord;
  averageCalories: number;
  formAnswersCount: number;
}

// ============================================
// SERVICIO
// ============================================

/**
 * Servicio de Seguimiento con métodos estáticos
 */
export class SeguimientoService {
  /**
   * Obtiene el historial de IMC del usuario
   * Endpoint: GET /api/v1/calculator/history
   * @param date - Fecha opcional para filtrar
   * @returns Array de registros de IMC
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
   * @param weight - Peso en kg
   * @param height - Altura en cm
   * @returns Resultado del cálculo de IMC
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
   * Obtiene las comidas del usuario para una fecha específica
   * Endpoint: GET /api/v1/recipe/meals
   * @param date - Fecha en formato ISO (YYYY-MM-DD)
   * @returns Array de comidas
   */
  static async getMealsByDate(date: string): Promise<BackendMeal[]> {
    try {
      return await getMealsByDate(date);
    } catch (error) {
      console.error("Error al obtener comidas por fecha:", error);
      throw error;
    }
  }

  /**
   * Crea una nueva comida (registra consumo de receta)
   * Endpoint: POST /api/v1/recipe/meal
   * @param data - Datos de la comida a crear
   * @returns Comida creada
   */
  static async createMeal(data: CreateMealPayload): Promise<BackendMeal> {
    try {
      return await createMeal(data);
    } catch (error) {
      console.error("Error al crear comida:", error);
      throw error;
    }
  }

  /**
   * Obtiene las respuestas de un usuario a un formulario nutricional
   * Endpoint: GET /api/v1/admin-panel/form-user-answer
   * @param userId - ID del usuario
   * @param formId - ID del formulario
   * @returns Respuesta del formulario o null si no existe
   */
  static async getFormUserAnswer(userId: string, formId: string): Promise<FormUserAnswer | null> {
    try {
      return await getFormUserAnswer(userId, formId);
    } catch (error) {
      console.error("Error al obtener respuestas de formulario:", error);
      return null;
    }
  }

  /**
   * Obtiene todos los formularios nutricionales disponibles
   * Endpoint: GET /api/v1/admin-panel/form-types (filtrado por tipo nutricional)
   * @returns Array de formularios nutricionales
   */
  static async getNutritionalForms(): Promise<FormType[]> {
    try {
      return await getNutritionalForms();
    } catch (error) {
      console.error("Error al obtener formularios nutricionales:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los datos de seguimiento nutricional para un usuario
   * @param userId - ID del usuario (opcional, si no se proporciona usa el usuario autenticado)
   * @param date - Fecha para filtrar comidas e IMC (opcional)
   * @returns Datos completos de seguimiento
   */
  static async getSeguimientoData(userId?: string, date?: string): Promise<SeguimientoNutricionalData> {
    try {
      const [imcHistory, meals, nutritionalForms] = await Promise.all([
        this.getIMCHistory(date).catch(() => []),
        date ? this.getMealsByDate(date).catch(() => []) : Promise.resolve([]),
        this.getNutritionalForms().catch(() => []),
      ]);

      // Si hay userId y formularios, obtener respuestas
      let formAnswers: FormUserAnswer[] | undefined;
      if (userId && nutritionalForms.length > 0) {
        const answersPromises = nutritionalForms.map((form) =>
          this.getFormUserAnswer(userId, form.id).catch(() => null),
        );
        const answers = await Promise.all(answersPromises);
        formAnswers = answers.filter((a): a is FormUserAnswer => a !== null);
      }

      return {
        imcHistory,
        meals,
        nutritionalForms,
        formAnswers,
      };
    } catch (error) {
      console.error("Error al obtener datos de seguimiento:", error);
      throw error;
    }
  }

  /**
   * Calcula estadísticas de seguimiento nutricional
   * @param userId - ID del usuario (opcional)
   * @param date - Fecha para calcular estadísticas (opcional, por defecto hoy)
   * @returns Estadísticas calculadas
   */
  static async getStats(userId?: string, date?: string): Promise<SeguimientoStats> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const [meals, imcHistory, nutritionalForms] = await Promise.all([
        this.getMealsByDate(targetDate).catch(() => []),
        this.getIMCHistory().catch(() => []),
        userId ? this.getNutritionalForms().catch(() => []) : Promise.resolve([]),
      ]);

      // Calcular comidas de esta semana
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split("T")[0];

      const mealsThisWeek = meals.filter((meal) => {
        const mealDate = new Date(meal.date);
        return mealDate >= weekStart && mealDate <= today;
      });

      // Calcular promedio de calorías
      const totalCalories = meals.reduce((sum, meal) => {
        return sum + (meal.recipe?.kcal || 0);
      }, 0);
      const averageCalories = meals.length > 0 ? Math.round(totalCalories / meals.length) : 0;

      // Obtener último IMC
      const lastIMC = imcHistory.length > 0 ? imcHistory[imcHistory.length - 1] : undefined;

      // Contar respuestas de formularios si hay userId
      let formAnswersCount = 0;
      if (userId && nutritionalForms.length > 0) {
        const answersPromises = nutritionalForms.map((form) =>
          this.getFormUserAnswer(userId, form.id).catch(() => null),
        );
        const answers = await Promise.all(answersPromises);
        formAnswersCount = answers.filter((a) => a !== null).length;
      }

      return {
        totalMeals: meals.length,
        mealsThisWeek: mealsThisWeek.length,
        mealsToday: meals.filter((meal) => {
          const mealDate = new Date(meal.date).toISOString().split("T")[0];
          return mealDate === targetDate;
        }).length,
        imcRecords: imcHistory.length,
        lastIMC,
        averageCalories,
        formAnswersCount,
      };
    } catch (error) {
      console.error("Error al calcular estadísticas de seguimiento:", error);
      return {
        totalMeals: 0,
        mealsThisWeek: 0,
        mealsToday: 0,
        imcRecords: 0,
        averageCalories: 0,
        formAnswersCount: 0,
      };
    }
  }
}
