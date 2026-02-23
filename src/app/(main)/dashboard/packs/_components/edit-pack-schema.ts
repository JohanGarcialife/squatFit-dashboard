import { z } from "zod";

export const editPackFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200, "El nombre no puede exceder 200 caracteres"),

  description: z.string().max(500, "Máximo 500 caracteres").optional(),

  price: z
    .string()
    .min(1, "El precio es requerido")
    .refine((val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Precio inválido"),
});

export type EditPackFormValues = z.infer<typeof editPackFormSchema>;
