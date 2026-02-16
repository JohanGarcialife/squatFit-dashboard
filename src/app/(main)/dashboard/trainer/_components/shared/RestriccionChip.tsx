/**
 * Componente reutilizable: Chip de Restricción/Lesión
 */

import { Heart, Ban, AlertTriangle, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TipoLesion = "lumbar" | "rodilla" | "hombro" | "cervical" | "codo" | "muneca" | "cadera" | "tobillo";
type TipoRestriccion =
  | "sin_barra"
  | "solo_mancuernas"
  | "sin_impacto"
  | "sin_flexion_rodilla"
  | "sin_press_vertical"
  | "sin_peso_libre"
  | "sin_rotacion_externa"
  | "rango_limitado";

interface RestriccionChipProps {
  tipo: "lesion" | "restriccion" | "custom";
  valor?: TipoLesion | TipoRestriccion;
  texto?: string;
  editable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const getLesionConfig = (lesion: TipoLesion) => {
  const configs: Record<TipoLesion, { label: string; color: string }> = {
    lumbar: { label: "Lumbar", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    rodilla: { label: "Rodilla", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    hombro: { label: "Hombro", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
    cervical: { label: "Cervical", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    codo: { label: "Codo", color: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200" },
    muneca: { label: "Muñeca", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    cadera: { label: "Cadera", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
    tobillo: { label: "Tobillo", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
  };
  return configs[lesion] || { label: lesion, color: "bg-slate-100 text-slate-800" };
};

const getRestriccionConfig = (restriccion: TipoRestriccion) => {
  const configs: Record<TipoRestriccion, { label: string; color: string }> = {
    sin_barra: { label: "Sin barra", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
    solo_mancuernas: {
      label: "Solo mancuernas",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    sin_impacto: {
      label: "Sin impacto",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
    sin_flexion_rodilla: {
      label: "Sin flexión rodilla",
      color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    },
    sin_press_vertical: {
      label: "Sin press vertical",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    },
    sin_peso_libre: {
      label: "Sin peso libre",
      color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    },
    sin_rotacion_externa: {
      label: "Sin rotación externa",
      color: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    },
    rango_limitado: {
      label: "Rango limitado",
      color: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200",
    },
  };
  return configs[restriccion] || { label: restriccion, color: "bg-slate-100 text-slate-800" };
};

export function RestriccionChip({ tipo, valor, texto, editable, onRemove, className }: RestriccionChipProps) {
  let config: { label: string; color: string; icon: typeof Heart } = {
    label: texto || "",
    color: "bg-slate-100 text-slate-800",
    icon: AlertTriangle,
  };

  if (tipo === "lesion" && valor) {
    const lesionConfig = getLesionConfig(valor as TipoLesion);
    config = { ...lesionConfig, icon: Heart };
  } else if (tipo === "restriccion" && valor) {
    const restriccionConfig = getRestriccionConfig(valor as TipoRestriccion);
    config = { ...restriccionConfig, icon: Ban };
  }

  const Icon = config.icon;
  const variant = tipo === "restriccion" ? "outline" : "secondary";

  return (
    <Badge variant={variant} className={cn("gap-1", config.color, className)}>
      <Icon className="size-3" />
      {config.label}
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-black/10"
          type="button"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}
