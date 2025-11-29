import z from "zod";

// ============================================
// TIPOS BASE Y ENUMS
// ============================================

// Estados de asesoría
export type EstadoAsesoria = "activa" | "pausa" | "finalizada" | "cancelada";

// Tipos de producto
export type TipoProducto = "libro" | "curso" | "asesoria" | "premium";

// Estados de cliente
export type EstadoCliente = "activo" | "pausa" | "inactivo" | "falta_pago" | "renovacion_proxima";

// Tipos de notificación
export type TipoNotificacion =
  | "tarea_asignada"
  | "tarea_vencida"
  | "mensaje_pendiente"
  | "cambio_estado"
  | "actividad_inusual"
  | "reembolso"
  | "bloque_terminado";

// Prioridad de notificación
export type PrioridadNotificacion = "alta" | "media" | "baja";

// Categorías XP
export type CategoriaXP = "cursos" | "clientes_activos" | "clientes_nuevos" | "clientes_todos";

// Frecuencia de XP
export type FrecuenciaXP =
  | "por_capitulo"
  | "mensual"
  | "una_vez"
  | "semanal"
  | "diario"
  | "por_referido"
  | "por_producto"
  | "por_resena";

// Áreas de tareas
export type AreaTarea = "nutricion" | "entreno" | "soporte";

// ============================================
// SCHEMAS ZOD
// ============================================

export const ingresoDataSchema = z.object({
  periodo: z.string(),
  ingresos: z.number(),
  meta: z.number().optional(),
  variacion: z.number().optional(),
});

export const ventaProductoSchema = z.object({
  tipo: z.enum(["libro", "curso", "asesoria", "premium"]),
  cantidad: z.number(),
  ingresos: z.number(),
  porcentaje: z.number(),
  fill: z.string().optional(),
});

export const clienteRenovacionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  email: z.string(),
  plan: z.string(),
  fechaRenovacion: z.string(),
  diasRestantes: z.number(),
  avatar: z.string().optional(),
});

export const clienteFaltaPagoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  email: z.string(),
  plan: z.string(),
  montoAdeudado: z.number(),
  diasDeuda: z.number(),
  ultimoContacto: z.string().optional(),
  avatar: z.string().optional(),
});

export const clienteInactivoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  email: z.string(),
  diasSinContacto: z.number(),
  ultimaActividad: z.string(),
  coachAsignado: z.string().optional(),
  avatar: z.string().optional(),
});

export const tareasPorAreaSchema = z.object({
  nutricion: z.number(),
  entreno: z.number(),
  soporte: z.number(),
  total: z.number(),
});

export const causaTicketSchema = z.object({
  id: z.string(),
  causa: z.string(),
  cantidad: z.number(),
  porcentaje: z.number(),
  tendencia: z.enum(["subiendo", "bajando", "estable"]),
});

export const notificacionSchema = z.object({
  id: z.string(),
  tipo: z.enum([
    "tarea_asignada",
    "tarea_vencida",
    "mensaje_pendiente",
    "cambio_estado",
    "actividad_inusual",
    "reembolso",
    "bloque_terminado",
  ]),
  titulo: z.string(),
  descripcion: z.string(),
  fecha: z.string(),
  prioridad: z.enum(["alta", "media", "baja"]),
  leida: z.boolean(),
  clienteId: z.string().optional(),
  clienteNombre: z.string().optional(),
  urlAccion: z.string().optional(),
});

export const accionXPSchema = z.object({
  id: z.string(),
  categoria: z.enum(["cursos", "clientes_activos", "clientes_nuevos", "clientes_todos"]),
  accion: z.string(),
  xp: z.number(),
  frecuencia: z.enum([
    "por_capitulo",
    "mensual",
    "una_vez",
    "semanal",
    "diario",
    "por_referido",
    "por_producto",
    "por_resena",
  ]),
});

export const creditoMensualSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  accion: z.string(),
  xp: z.number(),
  descripcion: z.string().optional(),
});

export const filtrosMarketingSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  tipoProducto: z.enum(["libro", "curso", "asesoria", "premium", "todos"]).optional(),
  coachId: z.string().optional(),
  estadoCliente: z.enum(["activo", "pausa", "inactivo", "falta_pago", "renovacion_proxima", "todos"]).optional(),
});

export const marketingKPIsSchema = z.object({
  ingresosMensual: z.number(),
  ingresosAnual: z.number(),
  variacionMensual: z.number(),
  variacionAnual: z.number(),
  asesoriasActivas: z.number(),
  asesoriasPausa: z.number(),
  asesoriasFinalizadas: z.number(),
  totalVentas: z.number(),
  clientesRenovacionProxima: z.number(),
  clientesFaltaPago: z.number(),
  clientesSinContacto: z.number(),
  tareasPendientesTotal: z.number(),
  ticketsRecibidos: z.number(),
});

export const alertaCriticaSchema = z.object({
  id: z.string(),
  tipo: z.enum(["ingresos_bajos", "tareas_acumuladas", "clientes_riesgo", "pagos_pendientes"]),
  titulo: z.string(),
  descripcion: z.string(),
  valor: z.number(),
  umbral: z.number(),
  severidad: z.enum(["critica", "advertencia", "info"]),
  urlAccion: z.string().optional(),
});

// ============================================
// TIPOS INFERIDOS DE ZOD
// ============================================

export type IngresoData = z.infer<typeof ingresoDataSchema>;
export type VentaProducto = z.infer<typeof ventaProductoSchema>;
export type ClienteRenovacion = z.infer<typeof clienteRenovacionSchema>;
export type ClienteFaltaPago = z.infer<typeof clienteFaltaPagoSchema>;
export type ClienteInactivo = z.infer<typeof clienteInactivoSchema>;
export type TareasPorArea = z.infer<typeof tareasPorAreaSchema>;
export type CausaTicket = z.infer<typeof causaTicketSchema>;
export type Notificacion = z.infer<typeof notificacionSchema>;
export type AccionXP = z.infer<typeof accionXPSchema>;
export type CreditoMensual = z.infer<typeof creditoMensualSchema>;
export type FiltrosMarketing = z.infer<typeof filtrosMarketingSchema>;
export type MarketingKPIs = z.infer<typeof marketingKPIsSchema>;
export type AlertaCritica = z.infer<typeof alertaCriticaSchema>;

// ============================================
// INTERFACES ADICIONALES
// ============================================

export interface CoachOption {
  id: string;
  nombre: string;
  avatar?: string;
}

export interface ExportOptions {
  tipo: "kpis" | "clientes" | "ventas" | "notificaciones" | "xp";
  formato: "csv" | "excel" | "clipboard";
  filtros?: FiltrosMarketing;
}

export interface AsesoriasStats {
  activas: number;
  pausa: number;
  finalizadas: number;
  total: number;
}

export interface IngresoStats {
  mensual: number;
  anual: number;
  variacionMensual: number;
  variacionAnual: number;
  metaMensual?: number;
  metaAnual?: number;
}

export interface ClienteStats {
  renovacionProxima: number;
  faltaPago: number;
  sinContacto: number;
  activos: number;
  total: number;
}

// ============================================
// CONSTANTES
// ============================================

export const TIPOS_PRODUCTO: { value: TipoProducto | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los productos" },
  { value: "libro", label: "Libros" },
  { value: "curso", label: "Cursos" },
  { value: "asesoria", label: "Asesorías" },
  { value: "premium", label: "Premium" },
];

export const ESTADOS_CLIENTE: { value: EstadoCliente | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los estados" },
  { value: "activo", label: "Activo" },
  { value: "pausa", label: "En pausa" },
  { value: "inactivo", label: "Inactivo" },
  { value: "falta_pago", label: "Falta pago" },
  { value: "renovacion_proxima", label: "Renovación próxima" },
];

export const CATEGORIAS_XP: { value: CategoriaXP; label: string }[] = [
  { value: "cursos", label: "Cursos" },
  { value: "clientes_activos", label: "Clientes Activos" },
  { value: "clientes_nuevos", label: "Clientes Nuevos" },
  { value: "clientes_todos", label: "Todos los Clientes" },
];

export const FRECUENCIAS_XP: { value: FrecuenciaXP; label: string }[] = [
  { value: "por_capitulo", label: "Por capítulo" },
  { value: "mensual", label: "Mensual" },
  { value: "semanal", label: "Semanal" },
  { value: "diario", label: "Diario" },
  { value: "una_vez", label: "Una vez" },
  { value: "por_referido", label: "Por referido" },
  { value: "por_producto", label: "Por producto" },
  { value: "por_resena", label: "Por reseña" },
];
