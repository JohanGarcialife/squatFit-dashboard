import { getAuthToken } from "@/lib/auth/auth-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";

// ============================================================================
// PEDIDOS / REEMBOLSOS (15.11)
// ----------------------------------------------------------------------------
// El backend (Fase 6, módulo Pedidos) ya expone:
//   • GET    /api/v1/admin-panel/orders           (lista con estado/búsqueda)
//   • GET    /api/v1/admin-panel/orders/:id        (detalle; incluye refund_reason)
//   • POST   /api/v1/admin-panel/orders/:id/refund { reason, amount_cents? }
//
// El endpoint de reembolso VALIDA `reason` como obligatorio (IsNotEmpty) y, si
// hay PaymentIntent de Stripe, ejecuta el reembolso; si es pago manual, marca
// el pedido como devuelto con el motivo. El motivo se guarda en la columna
// `refund_reason` y vuelve en el detalle del pedido.
//
// Los seis motivos son el contrato acordado con el backend (RefundOrderDTO):
//   Equivocación · Pausa/Baja · Insatisfecho · Completa con éxito ·
//   Atrasos entrega · Cambia tarifa
//
// NOTA DE INTEGRACIÓN: este repo aún no tiene la página de Pedidos (es un build
// aparte, ver INFORME-FASE-7). Cuando exista, la acción «Reembolsar» de cada
// fila abre `RefundOrderDialog` (components/modals/refund-order-dialog.tsx) y el
// detalle muestra el motivo con `formatRefundReason`.
// ============================================================================

/** Motivos de reembolso (contrato exacto con RefundOrderDTO del backend). */
export const REFUND_REASONS = [
  "Equivocación",
  "Pausa/Baja",
  "Insatisfecho",
  "Completa con éxito",
  "Atrasos entrega",
  "Cambia tarifa",
] as const;

export type RefundReason = (typeof REFUND_REASONS)[number];

export interface RefundOrderPayload {
  orderId: string;
  /** Motivo obligatorio (uno de REFUND_REASONS). */
  reason: RefundReason;
  /** Nota interna opcional; se concatena al motivo enviado al backend. */
  note?: string;
  /** Importe parcial en céntimos; si se omite, reembolso total. */
  amountCents?: number;
}

/**
 * Devuelve el motivo de reembolso en formato legible. El backend guarda en
 * `refund_reason` el motivo (y, si el staff añadió nota, «Motivo — nota»).
 */
export function formatRefundReason(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "—";
  return raw.trim();
}

export class OrdersService {
  private static authHeaders(): Record<string, string> {
    const token = getAuthToken() ?? (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Reembolsa (o marca como devuelto) un pedido con motivo obligatorio.
   * POST /api/v1/admin-panel/orders/:id/refund
   *
   * Tolerante: si un backend antiguo aún no aceptara el campo `reason`, la
   * llamada seguiría enviándolo (el DTO lo exige); ante un 4xx se propaga el
   * mensaje del backend para mostrarlo en el toast.
   */
  static async refundOrder({ orderId, reason, note, amountCents }: RefundOrderPayload): Promise<{ message: string }> {
    if (!reason) {
      throw new Error("El motivo del reembolso es obligatorio.");
    }

    // El backend guarda un único string en `refund_reason`. Si hay nota, la
    // adjuntamos al motivo con un separador legible.
    const reasonWithNote = note?.trim() ? `${reason} — ${note.trim()}` : reason;

    const body: Record<string, unknown> = { reason: reasonWithNote };
    if (typeof amountCents === "number" && amountCents > 0) {
      body.amount_cents = amountCents;
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin-panel/orders/${orderId}/refund`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.message ?? payload.error ?? `Error ${res.status} al procesar el reembolso`);
    }

    return res.json().catch(() => ({ message: "Reembolso procesado" }));
  }
}
