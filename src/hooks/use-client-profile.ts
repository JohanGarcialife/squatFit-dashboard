import { useQuery } from "@tanstack/react-query";

import { getFormTypes, getFormUserAnswer, type FormType, type FormUserAnswer } from "@/lib/services/form-service";
import { SalesService } from "@/lib/services/sales-service";
import type { Sale } from "@/lib/services/sales-types";
import {
  SALES_BY_USER_READY,
  USER_DETAIL_API_READY,
  UsersService,
  type ConvertedLead,
  type UserCourseAccess,
  type UserDetailResponse,
  type UserLibrarySubscription,
  type UserResponse,
} from "@/lib/services/users-service";

export interface ClientFormEntry {
  formType: FormType;
  answer: FormUserAnswer | null;
}

/** Un acceso concedido/comprado por el cliente (curso, libro o pack). */
export interface ClientAccess {
  id: string;
  title: string;
  type: Sale["type"];
  date: string;
  /** Cómo obtuvo el acceso (compra o concesión manual del staff). */
  origin: "purchase" | "grant";
  status?: string;
}

export interface ClientProfileData {
  user: UserResponse | null;
  /** Detalle completo (medidas del onboarding) cuando el backend expone el GET. */
  userDetail: UserDetailResponse | null;
  purchases: Sale[];
  /** true si las compras se filtraron por nombre (el backend no filtra por user_id). */
  purchasesByNameOnly: boolean;
  /** Accesos concedidos/comprados (13.12). Derivados de las ventas mientras no
   *  exista un endpoint dedicado de accesos por usuario. */
  accesses: ClientAccess[];
  /** Cursos con su caducidad (Fase 14.4; presente tras el deploy backend). */
  courses: UserCourseAccess[];
  /** Suscripciones de biblioteca con su fin. */
  librarySubscriptions: UserLibrarySubscription[];
  /** Lead que se convirtió en este cliente (enlace inverso). */
  convertedLead: ConvertedLead | null;
  forms: ClientFormEntry[];
}

/**
 * Reúne, para un usuario, los datos del admin-panel usando DETECCIÓN de
 * endpoints (Fase 6 en paralelo):
 *  • datos de usuario: intenta el GET de detalle por id (USER_DETAIL_API_READY);
 *    si no, usa la lista `users` como fallback.
 *  • compras: intenta `sales?user_id` (SALES_BY_USER_READY); si no, filtra por
 *    nombre (aproximado) y lo avisa.
 *  • accesos concedidos: derivados de las compras (marca los ADMIN_GRANT como
 *    concesión manual).
 *  • respuestas de formularios (`form-types` + `form-user-answer`).
 *
 * Cada fuente falla de forma aislada (Promise.allSettled).
 */
export function useClientProfile(userId: string, fallbackName?: string) {
  return useQuery<ClientProfileData>({
    queryKey: ["client-profile", userId],
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      const salesParams = SALES_BY_USER_READY ? { page: 1, limit: 1000, user_id: userId } : { page: 1, limit: 1000 };

      const [detailRes, usersRes, salesRes, formTypesRes] = await Promise.allSettled([
        UsersService.getUserById(userId),
        UsersService.getAlumnos({ page: 1, limit: 1000 }),
        SalesService.getSales(salesParams),
        getFormTypes(),
      ]);

      const userDetail = detailRes.status === "fulfilled" ? detailRes.value : null;

      const users = usersRes.status === "fulfilled" ? usersRes.value : [];
      const user = users.find((u) => u.id === userId) ?? null;
      const name = (user ? `${user.firstName}` : fallbackName)?.trim().toLowerCase();

      const allSales = salesRes.status === "fulfilled" ? salesRes.value.sales : [];
      // Con el filtro por usuario del backend, las ventas ya vienen acotadas; si
      // no, filtramos por nombre como aproximación.
      const purchases = SALES_BY_USER_READY
        ? allSales
        : name
          ? allSales.filter((s) => s.firstName?.trim().toLowerCase() === name)
          : [];

      const accesses: ClientAccess[] = purchases.map((s) => ({
        id: s.id,
        title: s.title,
        type: s.type,
        date: s.date,
        // El backend marca las concesiones manuales con purchase_from='ADMIN_GRANT'.
        origin: String(s.purchase_from).toUpperCase() === "ADMIN_GRANT" ? "grant" : "purchase",
        status: s.status,
      }));

      // Respuestas de formularios: una consulta por tipo de formulario.
      const formTypes = formTypesRes.status === "fulfilled" ? formTypesRes.value : [];
      const forms: ClientFormEntry[] = await Promise.all(
        formTypes.map(async (ft) => {
          const answer = await getFormUserAnswer(userId, ft.id).catch(() => null);
          return { formType: ft, answer };
        }),
      );

      return {
        user,
        userDetail: USER_DETAIL_API_READY ? userDetail : null,
        purchases,
        purchasesByNameOnly: !SALES_BY_USER_READY,
        accesses,
        courses: userDetail?.courses ?? [],
        librarySubscriptions: userDetail?.library_subscriptions ?? [],
        convertedLead: userDetail?.converted_lead ?? null,
        forms,
      };
    },
  });
}
