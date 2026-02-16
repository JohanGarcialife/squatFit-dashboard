import { ComidaMenu, IngredienteReceta } from "../schema";

export interface ComidaEditorProps {
  comida: ComidaMenu;
  onUpdate: (comida: ComidaMenu) => void;
  onDelete: () => void;
}

export interface DiaSelectorProps {
  diaActivo: string;
  setDiaActivo: (dia: string) => void;
  comidas: Record<string, ComidaMenu[]>;
}

export interface ConfiguracionPanelProps {
  objetivo: string;
  setObjetivo: (objetivo: string) => void;
  restriccionesSeleccionadas: string[];
  onToggleRestriccion: (codigo: string) => void;
  totalesDia: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
}

export interface MacroCalculadoraProps {
  className?: string;
}

export interface GuardarMenuDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nombreMenu: string;
  setNombreMenu: (nombre: string) => void;
  onGuardar: () => void;
}

export const diasSemana = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

export type { ComidaMenu, IngredienteReceta };
