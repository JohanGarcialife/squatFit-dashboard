import { useQuery } from "@tanstack/react-query";

import { getFormTypes, getFormUserAnswer, type FormType, type FormUserAnswer } from "@/lib/services/form-service";
import { SalesService } from "@/lib/services/sales-service";
import type { Sale } from "@/lib/services/sales-types";
import { UsersService, type UserResponse } from "@/lib/services/users-service";

export interface ClientFormEntry {
  formType: FormType;
  answer: FormUserAnswer | null;
}

export interface ClientProfileData {
  user: UserResponse | null;
  purchases: Sale[];
  /** true si las compras se filtraron por nombre (el backend no filtra por user_id). */
  purchasesByNameOnly: boolean;
  forms: ClientFormEntry[];
}

/**
 * Reúne, para un usuario, los datos que hoy expone el admin-panel:
 *  • datos de usuario (de la lista `users`; no hay GET de detalle por id todavía),
 *  • compras (de `sales`, filtradas por nombre — el backend no filtra por user_id),
 *  • respuestas de formularios (`form-types` + `form-user-answer`).
 *
 * Cada fuente falla de forma aislada (Promise.allSettled) para que la ficha
 * muestre lo que haya disponible.
 */
export function useClientProfile(userId: string, fallbackName?: string) {
  return useQuery<ClientProfileData>({
    queryKey: ["client-profile", userId],
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      const [usersRes, salesRes, formTypesRes] = await Promise.allSettled([
        UsersService.getAlumnos({ page: 1, limit: 1000 }),
        SalesService.getSales({ page: 1, limit: 1000 }),
        getFormTypes(),
      ]);

      const users = usersRes.status === "fulfilled" ? usersRes.value : [];
      const user = users.find((u) => u.id === userId) ?? null;
      const name = (user ? `${user.firstName}` : fallbackName)?.trim().toLowerCase();

      const allSales = salesRes.status === "fulfilled" ? salesRes.value.sales : [];
      const purchases = name ? allSales.filter((s) => s.firstName?.trim().toLowerCase() === name) : [];

      // Respuestas de formularios: una consulta por tipo de formulario.
      const formTypes = formTypesRes.status === "fulfilled" ? formTypesRes.value : [];
      const forms: ClientFormEntry[] = await Promise.all(
        formTypes.map(async (ft) => {
          const answer = await getFormUserAnswer(userId, ft.id).catch(() => null);
          return { formType: ft, answer };
        }),
      );

      return { user, purchases, purchasesByNameOnly: true, forms };
    },
  });
}
