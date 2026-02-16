import { CheckCircle2, Clock, AlertCircle, CreditCard } from "lucide-react";

import type { EstadoPago } from "./types";

export const getInitials = (nombre: string) => {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const getEstadoPagoBadge = (estado: EstadoPago) => {
  const config = {
    pagado: {
      label: "Pagado",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    pendiente: {
      label: "Pendiente",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400",
      icon: Clock,
    },
    vencido: {
      label: "Vencido",
      className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
      icon: AlertCircle,
    },
    parcial: {
      label: "Parcial",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
      icon: CreditCard,
    },
  };
  return config[estado];
};

export const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case "alta":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "media":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "baja":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

export const getDiasRestantesText = (dias?: number) => {
  if (!dias) return "—";
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} días`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `${dias} días restantes`;
};
