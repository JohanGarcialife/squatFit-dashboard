import { z } from "zod";

/**
 * Schema de validación para crear una nueva receta
 * Basado en los campos que acepta el backend: POST /api/v1/recipe/create
 * Solo incluye los campos que el backend puede procesar
 */
export const createRecipeFormSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional().or(z.literal("")),

  kcal: z
    .number({
      required_error: "Las calorías son requeridas",
      invalid_type_error: "Las calorías deben ser un número",
    })
    .min(0, "Las calorías deben ser mayor o igual a 0")
    .max(10000, "Las calorías no pueden exceder 10000"),

  carbohydrates: z
    .number({
      required_error: "Los carbohidratos son requeridos",
      invalid_type_error: "Los carbohidratos deben ser un número",
    })
    .min(0, "Los carbohidratos deben ser mayor o igual a 0")
    .max(2000, "Los carbohidratos no pueden exceder 2000g"),

  proteins: z
    .number({
      required_error: "Las proteínas son requeridas",
      invalid_type_error: "Las proteínas deben ser un número",
    })
    .min(0, "Las proteínas deben ser mayor o igual a 0")
    .max(1000, "Las proteínas no pueden exceder 1000g"),

  fats: z
    .number({
      required_error: "Las grasas son requeridas",
      invalid_type_error: "Las grasas deben ser un número",
    })
    .min(0, "Las grasas deben ser mayor o igual a 0")
    .max(1000, "Las grasas no pueden exceder 1000g"),
});

export type CreateRecipeFormValues = z.infer<typeof createRecipeFormSchema>;

/**
 * Valores por defecto del formulario
 * IMPORTANTE: Todos los campos deben tener valores iniciales definidos
 * para evitar el error "changing uncontrolled input to controlled"
 */
export const createRecipeDefaultValues: CreateRecipeFormValues = {
  name: "",
  description: "",
  kcal: 0,
  carbohydrates: 0,
  proteins: 0,
  fats: 0,
};
