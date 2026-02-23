import { z } from "zod";

export const createPackFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200, "El nombre no puede exceder 200 caracteres"),

  description: z.string().max(500, "Máximo 500 caracteres").optional(),

  price: z
    .string()
    .min(1, "El precio es requerido")
    .refine((val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Precio inválido"),

  version_ids: z.array(z.string().min(1, "ID de versión requerido")).min(1, "Selecciona al menos una versión"),
});

export type CreatePackFormValues = z.infer<typeof createPackFormSchema>;

export const createPackDefaultValues: CreatePackFormValues = {
  name: "",
  description: "",
  price: "",
  version_ids: [],
};
