"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OrdersService, REFUND_REASONS, type RefundReason } from "@/lib/services/orders-service";

interface RefundOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pedido a reembolsar. */
  orderId: string;
  /** Referencia legible del pedido (nº o cliente) para el mensaje. */
  orderRef?: string;
  /** Callback tras un reembolso correcto (p. ej. refrescar la fila). */
  onRefunded?: () => void;
}

/**
 * Diálogo «Reembolsar pedido» (15.11): selector de MOTIVO obligatorio + nota
 * opcional. Envía `reason` (y la nota adjunta) a `POST orders/:id/refund`.
 * Reutilizable desde las acciones por fila del módulo de Pedidos (cuando exista)
 * o desde el detalle del pedido.
 */
export function RefundOrderDialog({ open, onOpenChange, orderId, orderRef, onRefunded }: RefundOrderDialogProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<RefundReason | "">("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReason("");
    setNote("");
    setSubmitting(false);
  };

  const handleConfirm = async () => {
    if (!reason) {
      toast.error("Selecciona un motivo de reembolso.");
      return;
    }
    setSubmitting(true);
    try {
      const { message } = await OrdersService.refundOrder({ orderId, reason, note });
      toast.success(message || "Reembolso procesado");
      // Refresca cualquier vista de pedidos que dependa de este dato.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      onRefunded?.();
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo procesar el reembolso");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="size-5" />
            Reembolsar pedido
          </DialogTitle>
          <DialogDescription>
            Indica el motivo del reembolso{orderRef ? ` del pedido ${orderRef}` : ""}. El motivo queda registrado en el
            pedido y, si el pago fue con tarjeta (Stripe), se ejecuta la devolución automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="refund-reason">
              Motivo <span className="text-destructive">*</span>
            </Label>
            <Select value={reason} onValueChange={(v: RefundReason) => setReason(v)}>
              <SelectTrigger id="refund-reason">
                <SelectValue placeholder="Selecciona un motivo…" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-note">Nota (opcional)</Label>
            <Textarea
              id="refund-note"
              placeholder="Detalle interno del reembolso…"
              className="min-h-[80px] resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!reason || submitting} className="gap-2">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Confirmar reembolso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
