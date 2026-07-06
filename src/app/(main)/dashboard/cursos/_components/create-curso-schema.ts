import { z } from "zod";

/**
 * Schema de validación para crear un nuevo curso
 * Usado en el formulario de creación de cursos
 */
export const createCursoFormSchema = z
  .object({
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

    image: z.union([z.string().url("Introduce una URL válida"), z.literal("")]).optional(),
    video_presentation: z.union([z.string().url("Introduce una URL válida"), z.literal("")]).optional(),

    // Primer ón (opcional)
    add_course_video: z.boolean().default(false),
    course_video_type: z.enum(["local", "external"]).default("external"),
    course_video_title: z.string().optional(),
    course_video_url: z.union([z.string().url("Introduce una URL válida"), z.literal("")]).optional(),
    course_video_file: z.any().optional(),
    course_video_description: z.string().optional(),
    course_video_priority: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.add_course_video && data.course_video_type === "external") {
        return !!data.course_video_title?.trim() && !!data.course_video_url?.trim();
      }
      return true;
    },
    {
      message: "El título y la URL del video externo son obligatorios",
      path: ["course_video_url"],
    },
  )
  .refine(
    (data) => {
      if (data.add_course_video && data.course_video_type === "local") {
        return !!data.course_video_file;
      }
      return true;
    },
    {
      message: "Debes seleccionar un archivo de video para subir",
      path: ["course_video_file"],
    },
  );

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
  price: 0,
  image: "",
  video_presentation: "",
  add_course_video: false,
  course_video_type: "external",
  course_video_title: "",
  course_video_url: "",
  course_video_file: undefined,
  course_video_description: "",
  course_video_priority: undefined,
};
