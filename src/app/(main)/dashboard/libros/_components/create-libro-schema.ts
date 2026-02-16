import { z } from "zod";

/**
 * Schema de validación para crear un nuevo libro
 * Usado en el formulario de creación de libros
 */
export const createLibroFormSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres"),

  subtitle: z
    .string()
    .min(3, "El subtítulo debe tener al menos 3 caracteres")
    .max(500, "El subtítulo no puede exceder 500 caracteres"),

  price: z
    .number({
      required_error: "El precio es requerido",
      invalid_type_error: "El precio debe ser un número",
    })
    .min(0, "El precio debe ser mayor o igual a 0")
    .max(9999, "El precio no puede exceder 9999"),

  image: z
    .union([
      z.instanceof(File, { message: "Debe ser un archivo válido" }),
      z.string().url("Debe ser una URL válida"),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  imageUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export type CreateLibroFormValues = z.infer<typeof createLibroFormSchema>;

/**
 * Valores por defecto del formulario
 * IMPORTANTE: Todos los campos deben tener valores iniciales definidos
 * para evitar el error "changing uncontrolled input to controlled"
 */
export const createLibroDefaultValues: CreateLibroFormValues = {
  title: "",
  subtitle: "",
  price: 0,
  image: null,
  imageUrl: "",
};

/**
 * Opciones para los selectores del formulario
 */
export const libroFormOptions = {
  // Si necesitas opciones de tipo de libro, categorías, etc. en el futuro
  tipos: [
    { value: "digital", label: "Digital" },
    { value: "fisico", label: "Físico" },
    { value: "ambos", label: "Digital + Físico" },
  ] as const,
};
