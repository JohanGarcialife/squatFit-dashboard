import { Instagram, Globe, BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  LEAD_OBJECTION_LABEL,
  LEAD_SOURCE_LABEL,
  type LeadObjection,
  type LeadSource,
  type LeadState,
} from "@/lib/services/leads-service";
import { cn } from "@/lib/utils";

/** Colores de estado con la paleta de marca (naranja/índigo/melocotón/lavanda). */
export const STATE_STYLES: Record<LeadState, { badge: string; dot: string; column: string }> = {
  Nuevo: { badge: "bg-[#EBEAF2] text-[#363C98]", dot: "bg-[#363C98]", column: "border-t-[#363C98]" },
  Contactado: { badge: "bg-[#FFEDE0] text-[#FF690B]", dot: "bg-[#FF690B]", column: "border-t-[#FF690B]" },
  Agendado: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500", column: "border-t-amber-500" },
  "Llamada hecha": { badge: "bg-sky-100 text-sky-800", dot: "bg-sky-500", column: "border-t-sky-500" },
  "Esperando pago": { badge: "bg-violet-100 text-violet-800", dot: "bg-violet-500", column: "border-t-violet-500" },
  Ganado: { badge: "bg-green-100 text-green-800", dot: "bg-green-500", column: "border-t-green-500" },
  Perdido: { badge: "bg-rose-100 text-rose-800", dot: "bg-rose-500", column: "border-t-rose-400" },
  Seguimiento: { badge: "bg-teal-100 text-teal-800", dot: "bg-teal-500", column: "border-t-teal-500" },
};

export function LeadStateBadge({ state, className }: { state: LeadState; className?: string }) {
  return (
    <Badge className={cn("gap-1.5 font-medium", STATE_STYLES[state].badge, className)}>
      <span className={cn("size-1.5 rounded-full", STATE_STYLES[state].dot)} />
      {state}
    </Badge>
  );
}

export function LeadSourceBadge({ source }: { source: LeadSource }) {
  const Icon = source === "ig" ? Instagram : Globe;
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
      <Icon className="size-3.5" />
      {LEAD_SOURCE_LABEL[source]}
    </span>
  );
}

export function LeadObjectionBadge({ objection, className }: { objection: LeadObjection; className?: string }) {
  return (
    <Badge variant="outline" className={cn("text-muted-foreground font-normal", className)}>
      {LEAD_OBJECTION_LABEL[objection]}
    </Badge>
  );
}

/** «✅ ya es cliente» — se muestra cuando `is_customer`. */
export function LeadCustomerBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn("gap-1 bg-green-100 font-medium text-green-800", className)}>
      <BadgeCheck className="size-3.5" />
      Ya es cliente
    </Badge>
  );
}
