import { z } from "zod";

/**
 * Schema de validación para crear un nuevo curso
 * Usado en el formulario de creación de cursos
 */
export const createCursoFormSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),

  instructor: z.string().min(1, "Debes seleccionar un instructor"),

  price: z
    .number({
      required_error: "El precio es requerido",
      invalid_type_error: "El precio debe ser un número",
    })
    .min(0, "El precio debe ser mayor o igual a 0")
    .max(9999, "El precio no puede exceder 9999"),

  currency: z.string().default("€").optional(),

  status: z.enum(["Activo", "Inactivo", "En Desarrollo"]).default("En Desarrollo"),

  duration: z.string().min(3, "La duración es requerida").max(50, "La duración no puede exceder 50 caracteres"),

  level: z.enum(["Principiante", "Intermedio", "Avanzado"], {
    required_error: "Debes seleccionar un nivel",
  }),

  category: z
    .string()
    .min(3, "La categoría debe tener al menos 3 caracteres")
    .max(50, "La categoría no puede exceder 50 caracteres"),

  image: z.union([z.string().url("Introduce una URL válida"), z.literal("")]).optional(),
  video_presentation: z.union([z.string().url("Introduce una URL válida"), z.literal("")]).optional(),
});

export type CreateCursoFormValues = z.infer<typeof createCursoFormSchema>;

/**
 * Valores por defecto del formulario
 * IMPORTANTE: Todos los campos deben tener valores iniciales definidos
 * para evitar el error "changing uncontrolled input to controlled"
 */
export const createCursoDefaultValues: CreateCursoFormValues = {
  name: "",
  description: "",
  instructor: "",
  category: "",
  level: "Principiante",
  price: 0,
  duration: "",
  status: "En Desarrollo",
  currency: "€",
  image: "",
  video_presentation: "",
};

/**
 * Opciones para los selectores del formulario
 */
export const cursoFormOptions = {
  status: [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
    { value: "En Desarrollo", label: "En Desarrollo" },
  ] as const,

  level: [
    { value: "Principiante", label: "Principiante" },
    { value: "Intermedio", label: "Intermedio" },
    { value: "Avanzado", label: "Avanzado" },
  ] as const,

  categories: [
    { value: "Entrenamiento", label: "Entrenamiento" },
    { value: "Nutrición", label: "Nutrición" },
    { value: "Yoga", label: "Yoga" },
    { value: "CrossFit", label: "CrossFit" },
    { value: "Pilates", label: "Pilates" },
    { value: "Running", label: "Running" },
    { value: "Bienestar", label: "Bienestar" },
    { value: "Certificación", label: "Certificación" },
    { value: "Otro", label: "Otro" },
  ] as const,

  durations: [
    { value: "4 semanas", label: "4 semanas" },
    { value: "6 semanas", label: "6 semanas" },
    { value: "8 semanas", label: "8 semanas" },
    { value: "10 semanas", label: "10 semanas" },
    { value: "12 semanas", label: "12 semanas" },
    { value: "16 semanas", label: "16 semanas" },
    { value: "20 semanas", label: "20 semanas" },
  ] as const,
};
