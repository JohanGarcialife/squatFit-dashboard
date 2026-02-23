import { z } from "zod";

// Schema de versión según la API (endpoint detalle / listado)
export const versionApiSchema = z.object({
  id: z.string(),
  book_id: z.string(),
  title: z.string(),
  image: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  version: z.string().optional(),
  price: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type VersionApi = z.infer<typeof versionApiSchema>;

// Tipo unificado para UI (compatible con VersionApi y con libroVersionSchema)
export interface Version {
  id: string;
  book_id?: string;
  title: string;
  image?: string | null;
  url?: string | null;
  price: string;
}
