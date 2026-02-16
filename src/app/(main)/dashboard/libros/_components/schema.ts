import { z } from "zod";

// ============================================================================
// SCHEMAS DE VERSIONES DE LIBROS
// ============================================================================

// Schema de versión de libro según la API
export const libroVersionSchema = z.object({
  version_id: z.string(),
  version_title: z.string(),
  version_image: z.string().optional(),
});

// ============================================================================
// SCHEMAS DE LIBROS
// ============================================================================

// Schema del libro según la estructura REAL de la API
export const libroApiSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  price: z.string(), // La API devuelve string, no number
  versions: z.array(libroVersionSchema).optional(),
});

// Schema adaptado para la UI
export const libroSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  image: z.string().optional(),
  price: z.number(), // Convertido de string a number
  versions: z.array(libroVersionSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export type LibroApi = z.infer<typeof libroApiSchema>;
export type LibroVersion = z.infer<typeof libroVersionSchema>;
export type Libro = z.infer<typeof libroSchema>;
