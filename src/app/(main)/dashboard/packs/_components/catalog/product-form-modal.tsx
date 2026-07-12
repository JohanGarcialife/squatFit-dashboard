"use client";

import { useEffect, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { useCreateProducto, useUpdateProducto } from "@/hooks/use-productos";
import type { Producto } from "@/lib/services/products-service";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si se pasa, el modal edita; si es null, crea. */
  producto?: Producto | null;
}

const EMPTY = {
  name: "",
  price: "",
  type: "product",
  billingPeriod: "monthly",
  description: "",
  stripePriceId: "",
};

export function ProductFormModal({ open, onOpenChange, producto }: ProductFormModalProps) {
  const isEdit = !!producto;
  const createMut = useCreateProducto();
  const updateMut = useUpdateProducto();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (producto) {
      setForm({
        name: producto.name,
        price: producto.price.toString(),
        type: producto.type || "product",
        billingPeriod: producto.billingPeriod || "monthly",
        description: producto.description ?? "",
        stripePriceId: producto.stripePriceId ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [producto, open]);

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isSubscription = form.type === "subscription";
  const isPending = createMut.isPending || updateMut.isPending;
  const canSubmit = form.name.trim().length > 0 && parseFloat(form.price) >= 0 && !Number.isNaN(parseFloat(form.price));

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: form.price,
      type: form.type,
      billing_period: isSubscription ? form.billingPeriod : "one_time",
      stripe_price_id: form.stripePriceId.trim() || undefined,
    };
    try {
      if (isEdit && producto) {
        await updateMut.mutateAsync({ id: producto.id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // el toast del hook ya informa del error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            Da de alta un producto suelto del catálogo (por ejemplo una suscripción).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Nombre</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Cocina mensual"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="p-price">Precio (€)</Label>
              <Input
                id="p-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="9.99"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Producto</SelectItem>
                  <SelectItem value="subscription">Suscripción</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isSubscription && (
            <div className="grid gap-2">
              <Label>Periodo de facturación</Label>
              <Select value={form.billingPeriod} onValueChange={(v) => set("billingPeriod", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="p-desc">Descripción</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Suscripción mensual a la biblioteca de cocina"
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-stripe">Stripe Price ID (opcional)</Label>
            <Input
              id="p-stripe"
              value={form.stripePriceId}
              onChange={(e) => set("stripePriceId", e.target.value)}
              placeholder="price_1Abc..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
