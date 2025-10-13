import { z } from "zod";

// Schema del tutor según la API
export const tutorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profile_picture: z.string().optional(),
});

// Schema del curso según la estructura REAL de la API
export const cursoApiSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  price: z.string(), // La API devuelve string, no number
  tutor: tutorSchema.optional(), // Opcional: algunos endpoints no lo incluyen
  image: z.string().optional().nullable(),
  video_presentation: z.string().optional().nullable(),
  students: z.number().default(0),
});

// Schema adaptado para la UI (mantiene compatibilidad con componentes existentes)
export const cursoSchema = z.object({
  id: z.string(),
  name: z.string(), // Mapeado de "title"
  description: z.string(), // Mapeado de "subtitle"
  instructor: z.string(), // Mapeado de "tutor.firstName + lastName"
  price: z.number(), // Convertido de string a number
  currency: z.string().default("€"),
  status: z.enum(["Activo", "Inactivo", "En Desarrollo"]).default("Activo"),
  students: z.number().default(0),
  duration: z.string().default("8 semanas"), // Valor por defecto
  level: z.enum(["Principiante", "Intermedio", "Avanzado"]).default("Principiante"),
  category: z.string().default("General"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  thumbnail: z.string().optional(),
  // Campos originales de la API (opcionales para referencia)
  tutorId: z.string().optional(),
  tutorFirstName: z.string().optional(),
  tutorLastName: z.string().optional(),
  tutorProfilePicture: z.string().optional(),
  videoPresentation: z.string().optional(),
});

export type CursoApi = z.infer<typeof cursoApiSchema>;
export type Tutor = z.infer<typeof tutorSchema>;
export type Curso = z.infer<typeof cursoSchema>;

