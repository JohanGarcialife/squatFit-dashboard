import { z } from "zod";

// Schema basado en la respuesta del API
export const entrenadorSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profile_picture: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email(),
  user_id: z.string(),
  user_status: z.number(), // 0 = Inactivo, 1 = Activo
});

export type Entrenador = z.infer<typeof entrenadorSchema>;

// Tipo extendido para la UI con campos computados
export type EntrenadorUI = Omit<Entrenador, 'firstName' | 'lastName'> & {
  firstName: string;
  lastName: string;
  status: "Activo" | "Inactivo";
  fullName: string;
  avatar?: string;
};

