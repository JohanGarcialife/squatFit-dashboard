"use client";

import { useEffect, useState } from "react";

import { Loader2, Link2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGrantTargets, useUpdateProduct } from "@/hooks/use-products-catalog";
import {
  GRANT_TYPES,
  GRANT_TYPE_LABEL,
  accessLabel,
  formatPrice,
  grantNeedsTarget,
  grantTargetKind,
  type GrantType,
  type Product,
} from "@/lib/services/products-service";

interface ProductGrantModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Valor centinela para «sin concesión». */
const NO_GRANT = "none";
/** Valor centinela para «acceso permanente». */
const PERMANENT = "permanent";

export function ProductGrantModal({ product, open, onOpenChange }: ProductGrantModalProps) {
  const updateProduct = useUpdateProduct();
  const [grantType, setGrantType] = useState<GrantType | null>(null);
  const [grantId, setGrantId] = useState<string | null>(null);
  const [accessType, setAccessType] = useState<"permanent" | "months">("permanent");
  const [accessMonths, setAccessMonths] = useState<number | undefined>(undefined);

  // Sincroniza el formulario cuando cambia el producto abierto.
  useEffect(() => {
    if (!product) return;
    setGrantType(product.grantType);
    setGrantId(product.grantId);
    setAccessType(product.accessMonths ? "months" : "permanent");
    setAccessMonths(product.accessMonths ?? undefined);
  }, [product]);

  const targetKind = grantTargetKind(grantType);
  const { data: targets = [], isLoading: targetsLoading } = useGrantTargets(open ? targetKind : null);

  if (!product) return null;

  const handleGrantType = (value: string) => {
    const next = value === NO_GRANT ? null : (value as GrantType);
    setGrantType(next);
    // Al cambiar de tipo, el grant_id anterior deja de ser válido.
    setGrantId(null);
  };

  const handleSave = () => {
    const needsTarget = grantNeedsTarget(grantType);
    if (needsTarget && !grantId) {
      toast.error("Elige el curso/libro/pack que concede este producto.");
      return;
    }
    const months = accessType === "months" ? (accessMonths ?? null) : null;
    if (accessType === "months" && (!months || months < 1)) {
      toast.error("Indica los meses de acceso (mínimo 1) o marca «Permanente».");
      return;
    }
    updateProduct.mutate(
      {
        id: product.id,
        patch: {
          grant_type: grantType,
          // digital_library / sin concesión no llevan grant_id.
          grant_id: needsTarget ? grantId : null,
          access_months: months,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Mapeo guardado para «${product.name}»`);
          onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo guardar"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="size-5 text-[#363C98] dark:text-[#b9bce8]" />
            {product.name}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span>{formatPrice(product.price, product.currency)}</span>
            {product.area && <Badge variant="outline">{product.area}</Badge>}
            <Badge variant="outline">{product.type}</Badge>
            {product.needsMapping && (
              <Badge className="bg-[#FFEDE0] text-[#8a3d06] dark:bg-[#FF690B]/20 dark:text-[#ffa266]">Sin mapear</Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Qué concede la compra */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Link2 className="size-4" /> Qué concede la compra
            </Label>
            <Select value={grantType ?? NO_GRANT} onValueChange={handleGrantType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_GRANT}>Sin concesión automática</SelectItem>
                {GRANT_TYPES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {GRANT_TYPE_LABEL[g]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {grantType === "digital_library" && (
              <p className="text-muted-foreground text-xs">
                La biblioteca digital concede una suscripción; no necesita seleccionar un elemento.
              </p>
            )}
            {grantType == null && (
              <p className="text-muted-foreground text-xs">
                Sin concesión: la compra se cobra pero no da acceso a ningún contenido (p. ej. Premium o consultas).
              </p>
            )}
          </div>

          {/* Selector de curso/libro/pack */}
          {grantNeedsTarget(grantType) && (
            <div className="space-y-2">
              <Label>{targetKind === "course" ? "Curso" : targetKind === "book" ? "Libro" : "Pack"} que concede</Label>
              <Select value={grantId ?? ""} onValueChange={setGrantId} disabled={targetsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={targetsLoading ? "Cargando…" : "Selecciona…"} />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!targetsLoading && targets.length === 0 && (
                <p className="text-muted-foreground text-xs">No hay elementos disponibles de este tipo.</p>
              )}
              {grantType === "program" && (
                <p className="text-muted-foreground text-xs">
                  El Programa TMV concede el curso seleccionado y activa «Mi Programa» (asesoría) del cliente.
                </p>
              )}
            </div>
          )}

          {/* Tramo / duración de acceso */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tramo de acceso</Label>
              <Select
                value={accessType}
                onValueChange={(v: "permanent" | "months") => {
                  setAccessType(v);
                  if (v === "permanent") setAccessMonths(undefined);
                  else setAccessMonths((m) => m ?? 12);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PERMANENT}>Permanente</SelectItem>
                  <SelectItem value="months">Limitado (meses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {accessType === "months" && (
              <div className="space-y-2">
                <Label>Meses</Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="Ej: 12"
                  value={accessMonths ?? ""}
                  onChange={(e) => setAccessMonths(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                />
              </div>
            )}
          </div>
          <p className="text-muted-foreground -mt-2 text-xs">
            Vista previa:{" "}
            <span className="text-foreground font-medium">
              {accessLabel(accessType === "months" ? (accessMonths ?? null) : null)}
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateProduct.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateProduct.isPending} className="gap-2">
            {updateProduct.isPending && <Loader2 className="size-4 animate-spin" />}
            Guardar mapeo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
