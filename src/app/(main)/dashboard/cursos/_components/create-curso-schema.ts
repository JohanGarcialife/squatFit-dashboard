import { z } from "zod";

import type { CreateCursoDto } from "@/lib/services/cursos-service";

const optionalTrimmedStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
}, z.string().optional());

const optionalPrioritySchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? value : parsedValue;
  }

  return value;
}, z.number().int("La prioridad debe ser un número entero").min(0, "La prioridad debe ser 0 o mayor").optional());

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

    currency: z.string().default("€").optional(),

    status: z.enum(["Activo", "Inactivo", "En Desarrollo"]).default("En Desarrollo"),

    duration: z.string().min(3, "La duración es requerida").max(50, "La duración no puede exceder 50 caracteres"),

    isExternalVideoCourse: z.boolean().default(false),
    uploadVideoFile: z.custom<File | undefined>((value) => value === undefined || value instanceof File, {
      message: "Debes seleccionar un archivo válido",
    }),
    videoTitle: optionalTrimmedStringSchema,
    videoUrl: z.preprocess((value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmedValue = value.trim();
      return trimmedValue === "" ? undefined : trimmedValue;
    }, z.string().url("Introduce una URL válida").optional()),
    videoDescription: optionalTrimmedStringSchema,
    videoPriority: optionalPrioritySchema,

    image: z.union([z.string().url("Introduce una URL válida"), z.literal("")]).optional(),
    video_presentation: z.union([z.string().url("Introduce una URL válida"), z.literal("")]).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.isExternalVideoCourse) {
      if (!values.videoTitle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El título del video es obligatorio",
          path: ["videoTitle"],
        });
      }

      if (!values.videoUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La URL del video es obligatoria",
          path: ["videoUrl"],
        });
      }
    } else if ((values.videoDescription || values.videoPriority !== undefined) && !values.uploadVideoFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes seleccionar un archivo si indicas descripción o prioridad",
        path: ["uploadVideoFile"],
      });
    }
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
  price: 0,
  duration: "",
  status: "En Desarrollo",
  isExternalVideoCourse: false,
  uploadVideoFile: undefined,
  videoTitle: undefined,
  videoUrl: undefined,
  videoDescription: undefined,
  videoPriority: undefined,
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

export function mapCreateCursoFormToDto(values: CreateCursoFormValues): CreateCursoDto {
  return {
    name: values.name,
    description: values.description,
    instructor: values.instructor,
    price: values.price,
    currency: values.currency,
    status: values.status,
    duration: values.duration,
    image: values.image,
    video_presentation: values.video_presentation,
  };
}
