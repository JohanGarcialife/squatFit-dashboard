// ============================================
// TIPOS PARA EL MÓDULO DE SEGUIMIENTO
// ============================================

// Estado de pago del cliente
export type EstadoPago = "pagado" | "pendiente" | "vencido" | "parcial";

// Tipo de revisión
export type TipoRevision = "semanal" | "quincenal" | "mensual" | "extraordinaria";

// Estado de una tarea/pendiente
export type EstadoTarea = "pendiente" | "en_progreso" | "completada" | "vencida" | "cancelada";

// Prioridad de alerta
export type PrioridadAlerta = "alta" | "media" | "baja";

// Tipo de alerta
export type TipoAlerta =
  | "formulario_pendiente"
  | "accion_diaria_incumplida"
  | "entrega_pendiente"
  | "revision_proxima"
  | "pago_pendiente"
  | "sin_actividad";

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface ClienteSeguimiento {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  avatar?: string;
  plan: string;
  fechaInicio: string;
  proximaRevision?: string;
  estadoPago: EstadoPago;
  montoMensual: number;
  diasRestantes?: number;
  pendientes: PendienteCliente[];
  ultimaActividad?: string;
  cumplimientoSemanal: number; // Porcentaje 0-100
}

export interface PendienteCliente {
  id: string;
  clienteId: string;
  titulo: string;
  descripcion?: string;
  fechaEntrega: string;
  estado: EstadoTarea;
  prioridad: PrioridadAlerta;
  tipo: "entrega" | "formulario" | "accion" | "revision" | "otro";
}

export interface RevisionAgendada {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteAvatar?: string;
  fecha: string;
  hora: string;
  tipoRevision: TipoRevision;
  notas?: string;
  completada: boolean;
  recordatorioEnviado: boolean;
}

export interface AlertaCumplimiento {
  id: string;
  clienteId?: string;
  clienteNombre?: string;
  tipo: TipoAlerta;
  titulo: string;
  descripcion: string;
  fecha: string;
  prioridad: PrioridadAlerta;
  leida: boolean;
  accionRequerida?: string;
  urlAccion?: string;
}

export interface TareaDietista {
  id: string;
  titulo: string;
  descripcion?: string;
  clienteId?: string;
  clienteNombre?: string;
  fechaEntrega: string;
  estado: EstadoTarea;
  prioridad: PrioridadAlerta;
  tipo: "dieta" | "pauta" | "revision" | "informe" | "otro";
}

// ============================================
// ESTADÍSTICAS DE SEGUIMIENTO
// ============================================

export interface SeguimientoStats {
  totalClientes: number;
  clientesActivos: number;
  clientesPendientePago: number;
  revisionesHoy: number;
  revisionesSemana: number;
  alertasSinLeer: number;
  alertasAltas: number;
  tareasVencidas: number;
  tareasHoy: number;
  cumplimientoPromedio: number;
}

// ============================================
// OPCIONES DE FILTROS
// ============================================

export interface FiltroClientes {
  busqueda?: string;
  estadoPago?: EstadoPago | "todos";
  tieneAlertas?: boolean;
  ordenarPor?: "nombre" | "proximaRevision" | "estadoPago" | "cumplimiento";
}

export interface FiltroRevisiones {
  fecha?: Date;
  tipoRevision?: TipoRevision | "todas";
  completadas?: boolean;
}

export interface FiltroAlertas {
  tipo?: TipoAlerta | "todas";
  prioridad?: PrioridadAlerta | "todas";
  leidas?: boolean;
}
