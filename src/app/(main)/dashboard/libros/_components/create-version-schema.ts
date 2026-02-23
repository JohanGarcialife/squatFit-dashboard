import { z } from "zod";

/**
 * Schema de validación para crear una versión de libro
 * Requiere: title, price, file (PDF obligatorio)
 */
export const createVersionFormSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título no puede exceder 200 caracteres"),

  price: z
    .string()
    .min(1, "El precio es requerido")
    .refine((val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Precio inválido"),

  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),

  file: z
    .union([z.instanceof(File), z.undefined()])
    .refine((f) => f instanceof File && f.type === "application/pdf" && f.size > 0, "Selecciona un archivo PDF válido"),
});

export type CreateVersionFormValues = z.infer<typeof createVersionFormSchema>;

export const createVersionDefaultValues: CreateVersionFormValues = {
  title: "",
  price: "",
  image: "",
  file: undefined,
};
