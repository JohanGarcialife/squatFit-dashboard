import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABEL,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/services/orders-service";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];
  return <Badge className={cn("font-medium", meta.badge, className)}>{meta.label}</Badge>;
}

export function PaymentBadge({ method }: { method: PaymentMethod | null }) {
  if (!method) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <Badge variant="outline" className="font-normal">
      {PAYMENT_METHOD_LABEL[method]}
    </Badge>
  );
}
