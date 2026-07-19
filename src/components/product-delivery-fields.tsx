"use client";

import { CalendarClock, Infinity as InfinityIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ============================================================================
// DURACIÓN Y ENTREGA DE PRODUCTO (15.9)
// ----------------------------------------------------------------------------
// El backend aún NO expone columnas de acceso/goteo en `course`/`products`
// (verificado 19 jul 2026). Por eso:
//   • La sección se OCULTA cuando el detalle del producto no trae estos campos
//     (ver `apiHasDeliveryFields`), para no prometer controles sin efecto.
//   • Cuando el backend los añada, poner las claves en el objeto de detalle y la
//     sección aparece sola; además hay que enviar el DTO (gate en el servicio).
// ============================================================================

/**
 * Interruptor global: ponlo en `true` cuando el backend acepte y devuelva los
 * campos de acceso/goteo. Mientras sea `false`, la sección solo aparece si el
 * detalle del producto ya trae las claves (`apiHasDeliveryFields`), y el DTO no
 * envía estos campos para no romper el alta/edición actuales.
 */
export const PRODUCT_DELIVERY_SUPPORTED = false;

export type AccessType = "permanent" | "months";
export type DripMode = "none" | "interval" | "scheduled";

export interface ProductDeliveryValue {
  accessType: AccessType;
  accessMonths?: number;
  dripMode: DripMode;
  /** Días entre desbloqueos (modo `interval`). */
  dripIntervalDays?: number;
  /** Días desde la compra hasta el primer desbloqueo. */
  dripStartDelayDays?: number;
}

/** Claves que el backend usaría para estos campos (para detección tolerante). */
export const DELIVERY_API_KEYS = [
  "access_type",
  "access_months",
  "drip_mode",
  "drip_interval_days",
  "drip_start_delay_days",
] as const;

/** Devuelve true si el objeto de detalle del API trae ALGÚN campo de entrega. */
export function apiHasDeliveryFields(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  return DELIVERY_API_KEYS.some((k) => k in (raw as Record<string, unknown>));
}

export const defaultDeliveryValue: ProductDeliveryValue = {
  accessType: "permanent",
  accessMonths: undefined,
  dripMode: "none",
  dripIntervalDays: undefined,
  dripStartDelayDays: undefined,
};

/** Extrae los valores de entrega desde un objeto de detalle del API. */
export function deliveryFromApi(raw: Record<string, unknown>): ProductDeliveryValue {
  const num = (v: unknown) => (v == null || v === "" ? undefined : Number(v));
  return {
    accessType: (raw.access_type as AccessType) ?? (raw.access_months ? "months" : "permanent"),
    accessMonths: num(raw.access_months),
    dripMode: (raw.drip_mode as DripMode) ?? "none",
    dripIntervalDays: num(raw.drip_interval_days),
    dripStartDelayDays: num(raw.drip_start_delay_days),
  };
}

interface ProductDeliveryFieldsProps {
  value: ProductDeliveryValue;
  onChange: (value: ProductDeliveryValue) => void;
  disabled?: boolean;
}

export function ProductDeliveryFields({ value, onChange, disabled }: ProductDeliveryFieldsProps) {
  const set = (patch: Partial<ProductDeliveryValue>) => onChange({ ...value, ...patch });

  return (
    <div className="border-border/70 bg-background space-y-5 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="text-muted-foreground size-4" />
        <p className="text-muted-foreground text-sm font-medium">Duración y entrega</p>
      </div>

      {/* Tiempo de acceso */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tiempo de acceso</Label>
          <Select
            value={value.accessType}
            onValueChange={(v: AccessType) =>
              set({ accessType: v, accessMonths: v === "permanent" ? undefined : (value.accessMonths ?? 1) })
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="permanent">
                <span className="flex items-center gap-2">
                  <InfinityIcon className="size-4" /> Permanente
                </span>
              </SelectItem>
              <SelectItem value="months">Limitado (meses)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.accessType === "months" && (
          <div className="space-y-2">
            <Label>Meses de acceso</Label>
            <Input
              type="number"
              min={1}
              max={120}
              placeholder="Ej: 12"
              value={value.accessMonths ?? ""}
              onChange={(e) => set({ accessMonths: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* Goteo (drip) */}
      <div className="space-y-4 border-t pt-4">
        <div className="space-y-2">
          <Label>Goteo de contenido</Label>
          <Select value={value.dripMode} onValueChange={(v: DripMode) => set({ dripMode: v })} disabled={disabled}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin goteo (todo disponible al comprar)</SelectItem>
              <SelectItem value="interval">Por intervalo (cada X días)</SelectItem>
              <SelectItem value="scheduled">Programado (retraso inicial + intervalo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.dripMode !== "none" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Intervalo entre desbloqueos (días)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Ej: 7"
                value={value.dripIntervalDays ?? ""}
                onChange={(e) => set({ dripIntervalDays: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                disabled={disabled}
              />
            </div>
            {value.dripMode === "scheduled" && (
              <div className="space-y-2">
                <Label>Retraso hasta el primer desbloqueo (días)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ej: 0"
                  value={value.dripStartDelayDays ?? ""}
                  onChange={(e) =>
                    set({ dripStartDelayDays: e.target.value ? parseInt(e.target.value, 10) : undefined })
                  }
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
