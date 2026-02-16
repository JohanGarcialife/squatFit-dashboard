/**
 * Componente reutilizable: Badge de Estado con Icono
 */

import { CheckCircle2, AlertTriangle, Clock, X, LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EstadoType =
  | "completada"
  | "parcial"
  | "pendiente"
  | "saltada"
  | "completed"
  | "in_progress"
  | "pending"
  | "cancelled";

interface EstadoBadgeProps {
  estado: EstadoType;
  className?: string;
  showIcon?: boolean;
}

const getEstadoConfig = (
  estado: EstadoType,
): {
  label: string;
  className: string;
  icon: LucideIcon;
} => {
  // Normalizar estados
  const normalizado =
    estado === "completed"
      ? "completada"
      : estado === "in_progress"
        ? "parcial"
        : estado === "pending"
          ? "pendiente"
          : estado === "cancelled"
            ? "saltada"
            : estado;

  switch (normalizado) {
    case "completada":
      return {
        label: "Completada",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        icon: CheckCircle2,
      };
    case "parcial":
      return {
        label: "En Progreso",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        icon: AlertTriangle,
      };
    case "pendiente":
      return {
        label: "Pendiente",
        className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
        icon: Clock,
      };
    case "saltada":
      return {
        label: "Cancelada",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: X,
      };
    default:
      return {
        label: "Desconocido",
        className: "bg-slate-100 text-slate-800",
        icon: Clock,
      };
  }
};

export function EstadoBadge({ estado, className, showIcon = true }: EstadoBadgeProps) {
  const config = getEstadoConfig(estado);
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {showIcon && <Icon className="mr-1 size-3" />}
      {config.label}
    </Badge>
  );
}
