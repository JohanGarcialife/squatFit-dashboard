/* eslint-disable max-lines */
import type {
  MarketingKPIs,
  IngresoData,
  VentaProducto,
  ClienteRenovacion,
  ClienteFaltaPago,
  ClienteInactivo,
  TareasPorArea,
  CausaTicket,
  Notificacion,
  AccionXP,
  CreditoMensual,
  CoachOption,
  AlertaCritica,
} from "./schema";

// ============================================
// MOCK DATA - KPIs
// ============================================

export const mockKPIs: MarketingKPIs = {
  ingresosMensual: 24580,
  ingresosAnual: 287450,
  variacionMensual: 12.5,
  variacionAnual: 23.8,
  asesoriasActivas: 156,
  asesoriasPausa: 23,
  asesoriasFinalizadas: 89,
  totalVentas: 342,
  clientesRenovacionProxima: 18,
  clientesFaltaPago: 7,
  clientesSinContacto: 12,
  tareasPendientesTotal: 45,
  ticketsRecibidos: 67,
};

// ============================================
// MOCK DATA - INGRESOS
// ============================================

export const mockIngresosMensual: IngresoData[] = [
  { periodo: "Ene", ingresos: 18500, meta: 20000, variacion: -7.5 },
  { periodo: "Feb", ingresos: 21200, meta: 20000, variacion: 6.0 },
  { periodo: "Mar", ingresos: 19800, meta: 22000, variacion: -10.0 },
  { periodo: "Abr", ingresos: 23400, meta: 22000, variacion: 6.4 },
  { periodo: "May", ingresos: 22100, meta: 23000, variacion: -3.9 },
  { periodo: "Jun", ingresos: 24580, meta: 24000, variacion: 2.4 },
];

export const mockIngresosAnual: IngresoData[] = [
  { periodo: "2020", ingresos: 156000, variacion: 0 },
  { periodo: "2021", ingresos: 198500, variacion: 27.2 },
  { periodo: "2022", ingresos: 234200, variacion: 18.0 },
  { periodo: "2023", ingresos: 267800, variacion: 14.3 },
  { periodo: "2024", ingresos: 287450, variacion: 7.3 },
];

// ============================================
// MOCK DATA - VENTAS POR PRODUCTO
// ============================================

export const mockVentasProducto: VentaProducto[] = [
  { tipo: "libro", cantidad: 89, ingresos: 2670, porcentaje: 26.0, fill: "hsl(var(--primary))" },
  { tipo: "curso", cantidad: 67, ingresos: 13400, porcentaje: 19.6, fill: "hsl(var(--chart-2))" },
  { tipo: "asesoria", cantidad: 134, ingresos: 40200, porcentaje: 39.2, fill: "hsl(var(--chart-3))" },
  { tipo: "premium", cantidad: 52, ingresos: 31200, porcentaje: 15.2, fill: "hsl(var(--chart-4))" },
];

// ============================================
// MOCK DATA - CLIENTES
// ============================================

export const mockClientesRenovacion: ClienteRenovacion[] = [
  {
    id: "1",
    nombre: "María García López",
    email: "maria.garcia@email.com",
    plan: "Plan Transfórmate",
    fechaRenovacion: "2024-12-01",
    diasRestantes: 3,
  },
  {
    id: "2",
    nombre: "Carlos Rodríguez",
    email: "carlos.rod@email.com",
    plan: "Tu Mejor Versión",
    fechaRenovacion: "2024-12-02",
    diasRestantes: 4,
  },
  {
    id: "3",
    nombre: "Ana Martínez",
    email: "ana.martinez@email.com",
    plan: "Asesoría Premium",
    fechaRenovacion: "2024-12-03",
    diasRestantes: 5,
  },
  {
    id: "4",
    nombre: "Pedro Sánchez",
    email: "pedro.s@email.com",
    plan: "Plan Transfórmate",
    fechaRenovacion: "2024-12-04",
    diasRestantes: 6,
  },
  {
    id: "5",
    nombre: "Laura Fernández",
    email: "laura.f@email.com",
    plan: "Tu Mejor Versión",
    fechaRenovacion: "2024-12-05",
    diasRestantes: 7,
  },
];

export const mockClientesFaltaPago: ClienteFaltaPago[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    email: "juan.perez@email.com",
    plan: "Plan Transfórmate",
    montoAdeudado: 150,
    diasDeuda: 15,
    ultimoContacto: "2024-11-15",
  },
  {
    id: "2",
    nombre: "Sofía López",
    email: "sofia.lopez@email.com",
    plan: "Tu Mejor Versión",
    montoAdeudado: 200,
    diasDeuda: 8,
    ultimoContacto: "2024-11-20",
  },
  {
    id: "3",
    nombre: "Miguel Torres",
    email: "miguel.t@email.com",
    plan: "Asesoría Premium",
    montoAdeudado: 350,
    diasDeuda: 22,
  },
];

export const mockClientesSinContacto: ClienteInactivo[] = [
  {
    id: "1",
    nombre: "Elena Ruiz",
    email: "elena.ruiz@email.com",
    diasSinContacto: 12,
    ultimaActividad: "2024-11-16",
    coachAsignado: "Coach María",
  },
  {
    id: "2",
    nombre: "David Moreno",
    email: "david.m@email.com",
    diasSinContacto: 9,
    ultimaActividad: "2024-11-19",
    coachAsignado: "Coach Carlos",
  },
  {
    id: "3",
    nombre: "Carmen Gil",
    email: "carmen.g@email.com",
    diasSinContacto: 8,
    ultimaActividad: "2024-11-20",
    coachAsignado: "Coach María",
  },
];

// ============================================
// MOCK DATA - TAREAS Y TICKETS
// ============================================

export const mockTareasPorArea: TareasPorArea = {
  nutricion: 18,
  entreno: 15,
  soporte: 12,
  total: 45,
};

export const mockCausasTickets: CausaTicket[] = [
  { id: "1", causa: "Dudas sobre dieta", cantidad: 23, porcentaje: 34.3, tendencia: "estable" },
  { id: "2", causa: "Problemas con la app", cantidad: 15, porcentaje: 22.4, tendencia: "bajando" },
  { id: "3", causa: "Cambios de horario", cantidad: 12, porcentaje: 17.9, tendencia: "subiendo" },
  { id: "4", causa: "Consultas de pago", cantidad: 9, porcentaje: 13.4, tendencia: "estable" },
  { id: "5", causa: "Solicitud de reembolso", cantidad: 8, porcentaje: 11.9, tendencia: "bajando" },
];

// ============================================
// MOCK DATA - NOTIFICACIONES
// ============================================

export const mockNotificaciones: Notificacion[] = [
  {
    id: "1",
    tipo: "mensaje_pendiente",
    titulo: "Mensajes sin responder >48h",
    descripcion: "Hay 5 mensajes de clientes esperando respuesta desde hace más de 48 horas",
    fecha: "2024-11-28T10:30:00",
    prioridad: "alta",
    leida: false,
    urlAccion: "/dashboard/chat",
  },
  {
    id: "2",
    tipo: "tarea_vencida",
    titulo: "Tareas vencidas en Nutrición",
    descripcion: "3 revisiones de dieta están vencidas y pendientes de entrega",
    fecha: "2024-11-28T09:15:00",
    prioridad: "alta",
    leida: false,
    urlAccion: "/dashboard/seguimiento",
  },
  {
    id: "3",
    tipo: "cambio_estado",
    titulo: "Cliente pasó a pausa",
    descripcion: "María García ha solicitado pausar su asesoría",
    fecha: "2024-11-27T16:45:00",
    prioridad: "media",
    leida: false,
    clienteId: "123",
    clienteNombre: "María García",
  },
  {
    id: "4",
    tipo: "actividad_inusual",
    titulo: "Actividad inusual detectada",
    descripcion: "Carlos Rodríguez ha subido 4 formularios en las últimas 24 horas",
    fecha: "2024-11-27T14:20:00",
    prioridad: "media",
    leida: true,
    clienteId: "456",
    clienteNombre: "Carlos Rodríguez",
  },
  {
    id: "5",
    tipo: "reembolso",
    titulo: "Solicitud de reembolso",
    descripcion: "Pedro Sánchez ha solicitado reembolso del curso de nutrición",
    fecha: "2024-11-26T11:00:00",
    prioridad: "alta",
    leida: true,
    clienteId: "789",
    clienteNombre: "Pedro Sánchez",
  },
  {
    id: "6",
    tipo: "bloque_terminado",
    titulo: "Bloque de asesoría finalizado",
    descripcion: "Ana Martínez ha completado su bloque de 12 semanas",
    fecha: "2024-11-25T18:30:00",
    prioridad: "baja",
    leida: true,
    clienteId: "321",
    clienteNombre: "Ana Martínez",
  },
  {
    id: "7",
    tipo: "tarea_asignada",
    titulo: "Nueva tarea asignada",
    descripcion: "Se te ha asignado la revisión mensual de 8 clientes",
    fecha: "2024-11-25T09:00:00",
    prioridad: "media",
    leida: true,
  },
];

// ============================================
// MOCK DATA - SISTEMA XP
// ============================================

export const mockTablaXP: AccionXP[] = [
  // Cursos
  {
    id: "1",
    categoria: "cursos",
    accion: "Superar 90% en el test del capítulo anterior",
    xp: 5,
    frecuencia: "por_capitulo",
  },
  { id: "2", categoria: "cursos", accion: "Ver más del 90% del vídeo del capítulo", xp: 5, frecuencia: "por_capitulo" },
  { id: "3", categoria: "cursos", accion: "3 semanas seguidas sin retrasos", xp: 10, frecuencia: "mensual" },
  {
    id: "4",
    categoria: "cursos",
    accion: "Dejar reseña del curso (con mínimo de caracteres)",
    xp: 100,
    frecuencia: "por_resena",
  },

  // Clientes activos
  {
    id: "5",
    categoria: "clientes_activos",
    accion: "Referir a un nuevo cliente a que se registre",
    xp: 25,
    frecuencia: "por_referido",
  },

  // Clientes nuevos
  { id: "6", categoria: "clientes_nuevos", accion: "Rellenar formulario semanal", xp: 10, frecuencia: "semanal" },
  {
    id: "7",
    categoria: "clientes_nuevos",
    accion: "Rellenar formulario mensual completo",
    xp: 25,
    frecuencia: "mensual",
  },
  { id: "8", categoria: "clientes_nuevos", accion: "Referir a un nuevo cliente", xp: 75, frecuencia: "por_referido" },
  {
    id: "9",
    categoria: "clientes_nuevos",
    accion: "Dejar reseña en tienda sobre un producto",
    xp: 20,
    frecuencia: "por_producto",
  },
  {
    id: "10",
    categoria: "clientes_nuevos",
    accion: "Completar vídeo de bienvenida y orientación",
    xp: 15,
    frecuencia: "una_vez",
  },

  // Todos los clientes
  { id: "11", categoria: "clientes_todos", accion: "Completar 10.000 pasos en un día", xp: 10, frecuencia: "diario" },
  {
    id: "12",
    categoria: "clientes_todos",
    accion: "Entrar a la app con racha de 2-3 días",
    xp: 1,
    frecuencia: "diario",
  },
  {
    id: "13",
    categoria: "clientes_todos",
    accion: "Entrar a la app con racha de 4-5 días",
    xp: 3,
    frecuencia: "diario",
  },
  {
    id: "14",
    categoria: "clientes_todos",
    accion: "Entrar a la app con racha de 6-9 días",
    xp: 5,
    frecuencia: "diario",
  },
  {
    id: "15",
    categoria: "clientes_todos",
    accion: "Entrar a la app con racha de 10+ días",
    xp: 6,
    frecuencia: "diario",
  },
];

export const mockCreditosMensuales: CreditoMensual[] = [
  {
    id: "1",
    nombre: "Cliente activo",
    accion: "Participar en el chat grupal 2-3 veces x semana",
    xp: 5,
    descripcion: "Se otorga semanalmente por participación activa en el grupo",
  },
  {
    id: "2",
    nombre: "Omnipresente",
    accion: "No faltar a las videollamadas/reuniones del mes",
    xp: 12,
    descripcion: "Asistencia perfecta a todas las sesiones programadas",
  },
  {
    id: "3",
    nombre: "El trotamundos",
    accion: "Quien haya cumplido sus pasos más veces del mes en curso",
    xp: 25,
    descripcion: "Premio al cliente más constante con sus objetivos de pasos",
  },
  {
    id: "4",
    nombre: "El mayor progreso",
    accion: "Quien haya perdido más kg y cm del mes en curso",
    xp: 25,
    descripcion: "Reconocimiento al mejor resultado de transformación física",
  },
  {
    id: "5",
    nombre: "Líder del Grupo",
    accion: "Quien haya escrito/ayudado más en grupo (votación grupal)",
    xp: 35,
    descripcion: "Elegido por los compañeros por su apoyo y liderazgo",
  },
  {
    id: "6",
    nombre: "Novato del mes",
    accion: "Quien sea su primer mes y haya cambiado más",
    xp: 35,
    descripcion: "Premio especial para nuevos miembros con mayor impacto",
  },
  {
    id: "7",
    nombre: "Cambio silencioso",
    accion: "Mejor cambio de quien lleve 3+ meses (votan empleados)",
    xp: 35,
    descripcion: "Reconocimiento a la constancia y progreso sostenido",
  },
];

// ============================================
// MOCK DATA - COACHES
// ============================================

export const mockCoaches: CoachOption[] = [
  { id: "1", nombre: "Coach María" },
  { id: "2", nombre: "Coach Carlos" },
  { id: "3", nombre: "Coach Ana" },
  { id: "4", nombre: "Coach Pedro" },
];

// ============================================
// MOCK DATA - ALERTAS CRÍTICAS
// ============================================

export const mockAlertasCriticas: AlertaCritica[] = [
  {
    id: "1",
    tipo: "pagos_pendientes",
    titulo: "Pagos pendientes acumulados",
    descripcion: "Hay 7 clientes con pagos pendientes por un total de €700",
    valor: 700,
    umbral: 500,
    severidad: "critica",
    urlAccion: "/dashboard/marketing?tab=pagos",
  },
  {
    id: "2",
    tipo: "tareas_acumuladas",
    titulo: "Tareas vencidas en Nutrición",
    descripcion: "18 tareas pendientes en el área de nutrición superan el límite",
    valor: 18,
    umbral: 10,
    severidad: "advertencia",
    urlAccion: "/dashboard/seguimiento",
  },
  {
    id: "3",
    tipo: "clientes_riesgo",
    titulo: "Clientes sin contacto",
    descripcion: "12 clientes no han tenido contacto en más de 7 días",
    valor: 12,
    umbral: 5,
    severidad: "advertencia",
    urlAccion: "/dashboard/chat",
  },
];

// ============================================
// FUNCIONES HELPER PARA OBTENER DATOS MOCK
// ============================================

export function getMockKPIs(): MarketingKPIs {
  return mockKPIs;
}

export function getMockIngresos(periodo: "mensual" | "anual"): IngresoData[] {
  return periodo === "mensual" ? mockIngresosMensual : mockIngresosAnual;
}

export function getMockVentasProducto(): VentaProducto[] {
  return mockVentasProducto;
}

export function getMockClientesRenovacion(): ClienteRenovacion[] {
  return mockClientesRenovacion;
}

export function getMockClientesFaltaPago(): ClienteFaltaPago[] {
  return mockClientesFaltaPago;
}

export function getMockClientesSinContacto(): ClienteInactivo[] {
  return mockClientesSinContacto;
}

export function getMockTareasPorArea(): TareasPorArea {
  return mockTareasPorArea;
}

export function getMockCausasTickets(): CausaTicket[] {
  return mockCausasTickets;
}

export function getMockNotificaciones(): Notificacion[] {
  return mockNotificaciones;
}

export function getMockTablaXP(): AccionXP[] {
  return mockTablaXP;
}

export function getMockCreditosMensuales(): CreditoMensual[] {
  return mockCreditosMensuales;
}

export function getMockCoaches(): CoachOption[] {
  return mockCoaches;
}

export function getMockAlertasCriticas(): AlertaCritica[] {
  return mockAlertasCriticas;
}

// ============================================
// CONFIGURACIÓN DE GRÁFICOS
// ============================================

export const ingresosChartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "hsl(var(--chart-1))",
  },
  meta: {
    label: "Meta",
    color: "hsl(var(--chart-2))",
  },
};

export const ventasChartConfig = {
  libro: {
    label: "Libros",
    color: "hsl(var(--primary))", // Color naranja de SquatFit
  },
  curso: {
    label: "Cursos",
    color: "hsl(var(--chart-2))", // Naranja claro/amarillo
  },
  asesoria: {
    label: "Asesorías",
    color: "hsl(var(--chart-3))", // Azul complementario
  },
  premium: {
    label: "Premium",
    color: "hsl(var(--chart-4))", // Morado
  },
};

export const tareasChartConfig = {
  nutricion: {
    label: "Nutrición",
    color: "hsl(var(--primary))", // Color naranja de SquatFit
  },
  entreno: {
    label: "Entreno",
    color: "hsl(var(--chart-2))", // Naranja claro/amarillo
  },
  soporte: {
    label: "Soporte",
    color: "hsl(var(--chart-3))", // Azul complementario
  },
};
