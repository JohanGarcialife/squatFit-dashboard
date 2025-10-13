import { z } from "zod";

// Schema basado en la respuesta real del API de usuarios
export const alumnoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  birth: z.string().nullable(),
  role: z.string(),
  status: z.string(), // "active" o "inactive"
});

export type Alumno = z.infer<typeof alumnoSchema>;

// Tipo extendido para la UI con campos computados
export type AlumnoUI = Alumno & {
  fullName: string;
  statusDisplay: "Activo" | "Inactivo";
};

