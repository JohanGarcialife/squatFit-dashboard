import type { EstadoPago, ClienteSeguimiento, PendienteCliente } from "../schema";

export type { EstadoPago, ClienteSeguimiento, PendienteCliente };

export interface ClienteCardProps {
  cliente: ClienteSeguimiento;
}

export interface PendienteItemProps {
  pendiente: PendienteCliente;
}

export interface FilterBarProps {
  busqueda: string;
  setBusqueda: (value: string) => void;
  filtroEstadoPago: string;
  setFiltroEstadoPago: (value: string) => void;
  ordenarPor: string;
  setOrdenarPor: (value: string) => void;
}

export interface EstadosResumenProps {
  conteoEstados: {
    total: number;
    pagado: number;
    pendiente: number;
    vencido: number;
    parcial: number;
  };
  clientesFiltrados: number;
}
