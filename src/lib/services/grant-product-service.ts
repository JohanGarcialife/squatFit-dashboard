import { getAuthToken } from "@/lib/auth/auth-utils";

import { CursosService } from "./cursos-service";
import { LibrosService } from "./libros-service";
import { PacksService } from "./packs-service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";

// ============================================================================
// GRANT PRODUCT
// ----------------------------------------------------------------------------
// La Fase 2 está creando `POST /api/v1/admin-panel/grant-product` (asignar un
// producto a un usuario / a un pedido). A 19 jul 2026 el endpoint NO existe aún
// en prod ni en ninguna rama del backend (verificado: 404). Dejamos la llamada
// lista tras esta constante: cuando exista, basta poner GRANT_PRODUCT_AVAILABLE
// en true (o quitar la guarda) y el botón «Añadir producto» funcionará.
// Cuerpo esperado (a confirmar con Fase 2): { user_id, product_id, product_type }.
// ============================================================================
export const GRANT_PRODUCT_ENDPOINT = "/api/v1/admin-panel/grant-product";
export const GRANT_PRODUCT_AVAILABLE = false;

export type GrantableProductType = "course" | "book" | "pack" | "product";

export interface GrantableProduct {
  id: string;
  name: string;
  type: GrantableProductType;
  price?: number;
}

export interface GrantProductPayload {
  userId: string;
  productId: string;
  productType: GrantableProductType;
  /** Contexto opcional: id del pedido desde el que se concede. */
  orderId?: string;
}

export class GrantProductService {
  /**
   * Reúne todos los productos concebibles (cursos, libros y packs) en una lista
   * homogénea para el selector. Tolera que algún catálogo falle (devuelve el
   * resto). Ordenado por tipo y nombre.
   */
  static async getGrantableProducts(): Promise<GrantableProduct[]> {
    const [cursos, libros, packs] = await Promise.allSettled([
      CursosService.getCursos(),
      LibrosService.getLibros(),
      PacksService.getPacks(),
    ]);

    const out: GrantableProduct[] = [];

    if (cursos.status === "fulfilled") {
      for (const c of cursos.value) out.push({ id: c.id, name: c.name, type: "course", price: c.price });
    }
    if (libros.status === "fulfilled") {
      for (const l of libros.value) {
        // El precio del libro vive en sus versiones; usamos la más barata como referencia.
        const prices = (l.versions ?? [])
          .map((v) => Number(v.version_price))
          .filter((n) => Number.isFinite(n) && n > 0);
        out.push({
          id: l.id,
          name: l.title,
          type: "book",
          price: prices.length ? Math.min(...prices) : undefined,
        });
      }
    }
    if (packs.status === "fulfilled") {
      for (const p of packs.value) out.push({ id: p.id, name: p.name, type: "pack", price: p.price });
    }

    return out.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  }

  /**
   * Concede un producto a un usuario. Lanza un error claro mientras el backend
   * no exponga el endpoint (GRANT_PRODUCT_AVAILABLE === false).
   */
  static async grantProduct(payload: GrantProductPayload): Promise<void> {
    if (!GRANT_PRODUCT_AVAILABLE) {
      throw new Error(
        "El endpoint para asignar productos (grant-product) todavía no está disponible en el backend (Fase 2). La acción quedará operativa en cuanto se despliegue.",
      );
    }

    const token = getAuthToken() ?? (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);
    const res = await fetch(`${API_BASE_URL}${GRANT_PRODUCT_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        user_id: payload.userId,
        product_id: payload.productId,
        product_type: payload.productType,
        ...(payload.orderId ? { order_id: payload.orderId } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? body.error ?? `Error ${res.status} al asignar el producto`);
    }
  }
}
