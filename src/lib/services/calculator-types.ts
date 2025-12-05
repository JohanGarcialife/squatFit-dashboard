/**
 * Tipos para la calculadora de IMC
 * Basado en el análisis de ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import type { IMCHistoryRecord, IMCCalculationResponse, CalculateIMCDto } from "./trainer-types";

// Re-exportar tipos desde trainer-types para mantener compatibilidad
export type { IMCHistoryRecord, IMCCalculationResponse, CalculateIMCDto };

/**
 * Categorías de IMC según la OMS
 */
export type IMCCategory =
  | "bajo_peso"
  | "normal"
  | "sobrepeso"
  | "obesidad_grado_1"
  | "obesidad_grado_2"
  | "obesidad_grado_3";

/**
 * Mapa de categorías de IMC con información visual
 */
export const IMCCategoryMap: Record<IMCCategory, { label: string; description: string; color: string }> = {
  bajo_peso: {
    label: "Bajo peso",
    description: "IMC menor a 18.5",
    color: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  normal: {
    label: "Normal",
    description: "IMC entre 18.5 y 24.9",
    color: "border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  sobrepeso: {
    label: "Sobrepeso",
    description: "IMC entre 25 y 29.9",
    color: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  },
  obesidad_grado_1: {
    label: "Obesidad Grado I",
    description: "IMC entre 30 y 34.9",
    color: "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  },
  obesidad_grado_2: {
    label: "Obesidad Grado II",
    description: "IMC entre 35 y 39.9",
    color: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  obesidad_grado_3: {
    label: "Obesidad Grado III",
    description: "IMC mayor a 40",
    color: "border-red-300 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

/**
 * Obtiene la categoría de IMC según el valor
 */
export function getIMCCategory(imc: number): IMCCategory {
  if (imc < 18.5) return "bajo_peso";
  if (imc < 25) return "normal";
  if (imc < 30) return "sobrepeso";
  if (imc < 35) return "obesidad_grado_1";
  if (imc < 40) return "obesidad_grado_2";
  return "obesidad_grado_3";
}

/**
 * Calcula el IMC localmente sin hacer petición al servidor
 */
export function calculateIMCLocal(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) {
    return 0;
  }
  // Convertir altura de cm a metros
  const heightInMeters = height / 100;
  // Calcular IMC: peso (kg) / altura (m)²
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Respuesta del historial de IMC (formato alternativo del backend)
 */
export interface IMCHistoryResponse {
  history?: IMCHistoryRecord[];
}
