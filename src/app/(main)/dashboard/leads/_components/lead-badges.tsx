import { Instagram, Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LEAD_SOURCE_LABEL, type LeadSource, type LeadState } from "@/lib/services/leads-service";
import { cn } from "@/lib/utils";

/** Colores de estado con la paleta de marca (naranja/índigo/melocotón/lavanda). */
export const STATE_STYLES: Record<LeadState, { badge: string; dot: string; column: string }> = {
  Nuevo: { badge: "bg-[#EBEAF2] text-[#363C98]", dot: "bg-[#363C98]", column: "border-t-[#363C98]" },
  Contactado: { badge: "bg-[#FFEDE0] text-[#FF690B]", dot: "bg-[#FF690B]", column: "border-t-[#FF690B]" },
  Agendado: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500", column: "border-t-amber-500" },
  Asistió: { badge: "bg-sky-100 text-sky-800", dot: "bg-sky-500", column: "border-t-sky-500" },
  Ganado: { badge: "bg-green-100 text-green-800", dot: "bg-green-500", column: "border-t-green-500" },
  Perdido: { badge: "bg-rose-100 text-rose-800", dot: "bg-rose-500", column: "border-t-rose-400" },
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
