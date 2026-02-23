import { z } from "zod";

/**
 * Schema para editar una versión (sin PDF, solo metadata)
 */
export const editVersionFormSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título no puede exceder 200 caracteres"),

  price: z
    .string()
    .min(1, "El precio es requerido")
    .refine((val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Precio inválido"),

  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export type EditVersionFormValues = z.infer<typeof editVersionFormSchema>;
