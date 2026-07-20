"use client";

import { CalendarClock, Infinity as InfinityIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ============================================================================
// DURACIÓN Y ENTREGA DE PRODUCTO (15.9)
// ----------------------------------------------------------------------------
// Estado backend (verificado 20 jul 2026):
//   • LECTURA ✅ — las columnas `access_months`, `drip_mode`, `drip_config` YA
//     existen en prod en `course` y `products`, y el detalle del curso
//     (`GET /course/detail/:id`) las devuelve. Por eso `apiHasDeliveryFields`
//     detecta soporte real y la sección aparece con los valores guardados.
//   • ESCRITURA ⏳ — el admin de cursos (`Create/UpdateCourseDTO`) todavía NO
//     incluye estos campos en su whitelist y el backend valida con
//     `forbidNonWhitelisted:true` → enviarlos hoy daría 400 y rompería el alta.
//     Por eso el ENVÍO del DTO está tras `PRODUCT_DELIVERY_WRITE_READY` (abajo),
//     que se pondrá a `true` cuando la Fase 6 amplíe el DTO del curso.
// ============================================================================

/**
 * Muestra la sección de duración/entrega. Ya `true`: las columnas existen en
 * prod y el detalle las devuelve, así que la UI puede leer y editar los valores.
 */
export const PRODUCT_DELIVERY_SUPPORTED = true;

/**
 * Gobierna el ENVÍO de los campos de entrega en create/updateCurso. Mientras el
 * `Create/UpdateCourseDTO` del backend no los acepte (whitelist), mantener en
 * `false` para no provocar 400. Poner a `true` cuando la Fase 6 lo amplíe.
 */
export const PRODUCT_DELIVERY_WRITE_READY = true; // encendido 20-jul-2026 (backend lote 4 en prod);

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

/**
 * Claves reales del backend (migración 20260719000005): `access_months` (int),
 * `drip_mode` ('none'|'weekly'|'monthly'|'custom') y `drip_config` (jsonb).
 */
export const DELIVERY_API_KEYS = ["access_months", "drip_mode", "drip_config"] as const;

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

/**
 * Extrae los valores de entrega desde el detalle del API (contrato real:
 * `access_months`, `drip_mode`, `drip_config`). Tolera también el esquema
 * antiguo de claves planas por si algún endpoint las devolviera así.
 */
export function deliveryFromApi(raw: Record<string, unknown>): ProductDeliveryValue {
  const num = (v: unknown) => (v == null || v === "" ? undefined : Number(v));
  const cfg = (raw.drip_config ?? {}) as Record<string, unknown>;
  const backendMode = String(raw.drip_mode ?? "none");
  const intervalDays = num(cfg.interval_days) ?? num(raw.drip_interval_days);
  const startDelayDays = num(cfg.start_delay_days) ?? num(raw.drip_start_delay_days);

  // El backend usa 'none'|'weekly'|'monthly'|'custom'; la UI usa
  // 'none'|'interval'|'scheduled'. Si hay retraso inicial → 'scheduled'.
  let dripMode: DripMode = "none";
  if (backendMode !== "none") {
    dripMode = startDelayDays && startDelayDays > 0 ? "scheduled" : "interval";
  }

  return {
    accessType: raw.access_months ? "months" : "permanent",
    accessMonths: num(raw.access_months),
    dripMode,
    dripIntervalDays: intervalDays,
    dripStartDelayDays: startDelayDays,
  };
}

/** Payload de entrega en el contrato real del backend. */
export interface DeliveryApiPayload {
  access_months: number | null;
  drip_mode: "none" | "custom";
  drip_config: Record<string, number | string>;
}

/**
 * Mapea los valores de la UI al contrato del backend (`access_months`,
 * `drip_mode`, `drip_config`). Los modos 'interval'/'scheduled' de la UI se
 * envían como `drip_mode: 'custom'` con los parámetros en `drip_config`.
 */
export function deliveryToApi(value: ProductDeliveryValue): DeliveryApiPayload {
  const access_months = value.accessType === "months" ? (value.accessMonths ?? null) : null;

  if (value.dripMode === "none") {
    return { access_months, drip_mode: "none", drip_config: {} };
  }

  const drip_config: Record<string, number | string> = {};
  if (value.dripIntervalDays != null) drip_config.interval_days = value.dripIntervalDays;
  if (value.dripStartDelayDays != null) drip_config.start_delay_days = value.dripStartDelayDays;
  drip_config.start = value.dripStartDelayDays && value.dripStartDelayDays > 0 ? "delay" : "purchase";

  return { access_months, drip_mode: "custom", drip_config };
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
