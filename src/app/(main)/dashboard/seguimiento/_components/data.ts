/* eslint-disable max-lines */
import { ClienteSeguimiento, RevisionAgendada, AlertaCumplimiento, TareaDietista, SeguimientoStats } from "./schema";

// ============================================
// CLIENTES DE SEGUIMIENTO
// ============================================

export const clientesData: ClienteSeguimiento[] = [
  {
    id: "cli-001",
    nombre: "María García López",
    email: "maria.garcia@email.com",
    telefono: "+34 612 345 678",
    avatar: "/avatars/arhamkhnz.png",
    plan: "Plan Definición Premium",
    fechaInicio: "2024-01-15",
    proximaRevision: "2024-12-02",
    estadoPago: "pagado",
    montoMensual: 89,
    diasRestantes: 25,
    ultimaActividad: "2024-11-27",
    cumplimientoSemanal: 92,
    pendientes: [
      {
        id: "pend-001",
        clienteId: "cli-001",
        titulo: "Entregar menú semanal",
        descripcion: "Menú semana 49 con ajustes de macros",
        fechaEntrega: "2024-12-01",
        estado: "pendiente",
        prioridad: "alta",
        tipo: "entrega",
      },
    ],
  },
  {
    id: "cli-002",
    nombre: "Carlos Rodríguez Pérez",
    email: "carlos.rodriguez@email.com",
    telefono: "+34 623 456 789",
    plan: "Plan Ganancia Muscular",
    fechaInicio: "2024-02-20",
    proximaRevision: "2024-11-29",
    estadoPago: "pendiente",
    montoMensual: 75,
    diasRestantes: 5,
    ultimaActividad: "2024-11-25",
    cumplimientoSemanal: 68,
    pendientes: [
      {
        id: "pend-002",
        clienteId: "cli-002",
        titulo: "Formulario semanal sin completar",
        descripcion: "No ha completado el formulario de peso semanal",
        fechaEntrega: "2024-11-27",
        estado: "vencida",
        prioridad: "media",
        tipo: "formulario",
      },
      {
        id: "pend-003",
        clienteId: "cli-002",
        titulo: "Revisión mensual pendiente",
        fechaEntrega: "2024-11-29",
        estado: "pendiente",
        prioridad: "alta",
        tipo: "revision",
      },
    ],
  },
  {
    id: "cli-003",
    nombre: "Ana Martínez Sánchez",
    email: "ana.martinez@email.com",
    telefono: "+34 634 567 890",
    plan: "Plan Pérdida de Peso",
    fechaInicio: "2024-03-10",
    proximaRevision: "2024-12-05",
    estadoPago: "vencido",
    montoMensual: 65,
    diasRestantes: -3,
    ultimaActividad: "2024-11-20",
    cumplimientoSemanal: 45,
    pendientes: [
      {
        id: "pend-004",
        clienteId: "cli-003",
        titulo: "Pago mensual vencido",
        descripcion: "Pago de noviembre sin realizar",
        fechaEntrega: "2024-11-25",
        estado: "vencida",
        prioridad: "alta",
        tipo: "otro",
      },
      {
        id: "pend-005",
        clienteId: "cli-003",
        titulo: "Sin registros de comidas",
        descripcion: "No ha registrado comidas en los últimos 7 días",
        fechaEntrega: "2024-11-27",
        estado: "vencida",
        prioridad: "alta",
        tipo: "accion",
      },
    ],
  },
  {
    id: "cli-004",
    nombre: "Pedro López Fernández",
    email: "pedro.lopez@email.com",
    telefono: "+34 645 678 901",
    plan: "Plan Mantenimiento",
    fechaInicio: "2024-04-05",
    proximaRevision: "2024-12-10",
    estadoPago: "pagado",
    montoMensual: 55,
    diasRestantes: 30,
    ultimaActividad: "2024-11-28",
    cumplimientoSemanal: 88,
    pendientes: [],
  },
  {
    id: "cli-005",
    nombre: "Laura Sánchez Gil",
    email: "laura.sanchez@email.com",
    telefono: "+34 656 789 012",
    plan: "Plan Deportista",
    fechaInicio: "2024-05-12",
    proximaRevision: "2024-11-30",
    estadoPago: "parcial",
    montoMensual: 95,
    diasRestantes: 15,
    ultimaActividad: "2024-11-26",
    cumplimientoSemanal: 76,
    pendientes: [
      {
        id: "pend-006",
        clienteId: "cli-005",
        titulo: "Completar resto del pago",
        descripcion: "Pago parcial de 50€ realizado",
        fechaEntrega: "2024-12-01",
        estado: "pendiente",
        prioridad: "media",
        tipo: "otro",
      },
    ],
  },
  {
    id: "cli-006",
    nombre: "Javier Ruiz Torres",
    email: "javier.ruiz@email.com",
    telefono: "+34 667 890 123",
    plan: "Plan Vegano Plus",
    fechaInicio: "2024-06-20",
    proximaRevision: "2024-12-03",
    estadoPago: "pagado",
    montoMensual: 85,
    diasRestantes: 28,
    ultimaActividad: "2024-11-28",
    cumplimientoSemanal: 95,
    pendientes: [],
  },
  {
    id: "cli-007",
    nombre: "Sofía Herrera Blanco",
    email: "sofia.herrera@email.com",
    telefono: "+34 678 901 234",
    plan: "Plan Definición Premium",
    fechaInicio: "2024-07-01",
    proximaRevision: "2024-12-07",
    estadoPago: "pagado",
    montoMensual: 89,
    diasRestantes: 22,
    ultimaActividad: "2024-11-27",
    cumplimientoSemanal: 83,
    pendientes: [
      {
        id: "pend-007",
        clienteId: "cli-007",
        titulo: "Actualizar objetivos trimestrales",
        fechaEntrega: "2024-12-05",
        estado: "pendiente",
        prioridad: "baja",
        tipo: "formulario",
      },
    ],
  },
  {
    id: "cli-008",
    nombre: "Miguel Ángel Vega",
    email: "miguel.vega@email.com",
    plan: "Plan Ganancia Muscular",
    fechaInicio: "2024-08-15",
    proximaRevision: "2024-12-01",
    estadoPago: "pendiente",
    montoMensual: 75,
    diasRestantes: 8,
    ultimaActividad: "2024-11-24",
    cumplimientoSemanal: 55,
    pendientes: [
      {
        id: "pend-008",
        clienteId: "cli-008",
        titulo: "Enviar fotos de progreso",
        descripcion: "Fotos comparativas mensuales",
        fechaEntrega: "2024-11-30",
        estado: "pendiente",
        prioridad: "media",
        tipo: "formulario",
      },
    ],
  },
];

// ============================================
// REVISIONES AGENDADAS
// ============================================

const hoy = new Date();
const formatDate = (date: Date) => date.toISOString().split("T")[0];

export const revisionesData: RevisionAgendada[] = [
  {
    id: "rev-001",
    clienteId: "cli-002",
    clienteNombre: "Carlos Rodríguez Pérez",
    fecha: formatDate(new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000)), // Mañana
    hora: "10:00",
    tipoRevision: "mensual",
    notas: "Revisión de progreso y ajuste de macros",
    completada: false,
    recordatorioEnviado: true,
  },
  {
    id: "rev-002",
    clienteId: "cli-005",
    clienteNombre: "Laura Sánchez Gil",
    fecha: formatDate(new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000)),
    hora: "11:30",
    tipoRevision: "semanal",
    notas: "Seguimiento de entrenamiento pre-competición",
    completada: false,
    recordatorioEnviado: false,
  },
  {
    id: "rev-003",
    clienteId: "cli-001",
    clienteNombre: "María García López",
    fecha: formatDate(new Date(hoy.getTime() + 4 * 24 * 60 * 60 * 1000)),
    hora: "09:00",
    tipoRevision: "quincenal",
    completada: false,
    recordatorioEnviado: false,
  },
  {
    id: "rev-004",
    clienteId: "cli-006",
    clienteNombre: "Javier Ruiz Torres",
    fecha: formatDate(new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000)),
    hora: "16:00",
    tipoRevision: "mensual",
    notas: "Evaluación de nuevas restricciones alimentarias",
    completada: false,
    recordatorioEnviado: false,
  },
  {
    id: "rev-005",
    clienteId: "cli-008",
    clienteNombre: "Miguel Ángel Vega",
    fecha: formatDate(new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000)),
    hora: "12:00",
    tipoRevision: "semanal",
    completada: false,
    recordatorioEnviado: true,
  },
  {
    id: "rev-006",
    clienteId: "cli-007",
    clienteNombre: "Sofía Herrera Blanco",
    fecha: formatDate(new Date(hoy.getTime() + 9 * 24 * 60 * 60 * 1000)),
    hora: "10:30",
    tipoRevision: "mensual",
    completada: false,
    recordatorioEnviado: false,
  },
  {
    id: "rev-007",
    clienteId: "cli-004",
    clienteNombre: "Pedro López Fernández",
    fecha: formatDate(new Date(hoy.getTime() + 12 * 24 * 60 * 60 * 1000)),
    hora: "17:00",
    tipoRevision: "mensual",
    notas: "Revisión trimestral completa",
    completada: false,
    recordatorioEnviado: false,
  },
  // Revisiones completadas (pasadas)
  {
    id: "rev-008",
    clienteId: "cli-001",
    clienteNombre: "María García López",
    fecha: formatDate(new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)),
    hora: "09:00",
    tipoRevision: "quincenal",
    notas: "Ajuste de calorías realizado",
    completada: true,
    recordatorioEnviado: true,
  },
  {
    id: "rev-009",
    clienteId: "cli-004",
    clienteNombre: "Pedro López Fernández",
    fecha: formatDate(new Date(hoy.getTime() - 14 * 24 * 60 * 60 * 1000)),
    hora: "16:00",
    tipoRevision: "mensual",
    completada: true,
    recordatorioEnviado: true,
  },
];

// ============================================
// ALERTAS DE CUMPLIMIENTO
// ============================================

export const alertasData: AlertaCumplimiento[] = [
  {
    id: "alert-001",
    clienteId: "cli-003",
    clienteNombre: "Ana Martínez Sánchez",
    tipo: "pago_pendiente",
    titulo: "Pago vencido hace 3 días",
    descripcion: "El cliente Ana Martínez tiene un pago vencido de 65€ correspondiente al mes de noviembre.",
    fecha: formatDate(new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000)),
    prioridad: "alta",
    leida: false,
    accionRequerida: "Contactar cliente",
  },
  {
    id: "alert-002",
    clienteId: "cli-003",
    clienteNombre: "Ana Martínez Sánchez",
    tipo: "sin_actividad",
    titulo: "Sin actividad en 8 días",
    descripcion: "El cliente no ha registrado comidas ni ha accedido a la aplicación en los últimos 8 días.",
    fecha: formatDate(new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000)),
    prioridad: "alta",
    leida: false,
    accionRequerida: "Enviar recordatorio",
  },
  {
    id: "alert-003",
    clienteId: "cli-002",
    clienteNombre: "Carlos Rodríguez Pérez",
    tipo: "formulario_pendiente",
    titulo: "Formulario semanal no completado",
    descripcion: "Carlos no ha completado el formulario de peso y medidas de esta semana.",
    fecha: formatDate(hoy),
    prioridad: "media",
    leida: false,
    accionRequerida: "Enviar recordatorio",
  },
  {
    id: "alert-004",
    clienteId: "cli-008",
    clienteNombre: "Miguel Ángel Vega",
    tipo: "accion_diaria_incumplida",
    titulo: "Bajo cumplimiento de acciones diarias",
    descripcion: "Miguel solo ha completado el 55% de sus acciones diarias esta semana. Necesita motivación.",
    fecha: formatDate(hoy),
    prioridad: "media",
    leida: true,
  },
  {
    id: "alert-005",
    clienteId: "cli-005",
    clienteNombre: "Laura Sánchez Gil",
    tipo: "revision_proxima",
    titulo: "Revisión programada en 2 días",
    descripcion: "Laura tiene una revisión semanal programada para pasado mañana a las 11:30.",
    fecha: formatDate(hoy),
    prioridad: "baja",
    leida: true,
  },
  {
    id: "alert-006",
    tipo: "entrega_pendiente",
    titulo: "3 entregas pendientes esta semana",
    descripcion: "Tienes 3 menús y pautas por entregar antes del domingo.",
    fecha: formatDate(hoy),
    prioridad: "alta",
    leida: false,
    accionRequerida: "Revisar tareas",
  },
  {
    id: "alert-007",
    clienteId: "cli-002",
    clienteNombre: "Carlos Rodríguez Pérez",
    tipo: "pago_pendiente",
    titulo: "Pago próximo a vencer",
    descripcion: "El pago de Carlos vence en 5 días.",
    fecha: formatDate(new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000)),
    prioridad: "media",
    leida: true,
  },
];

// ============================================
// TAREAS DEL DIETISTA
// ============================================

export const tareasData: TareaDietista[] = [
  {
    id: "tarea-001",
    titulo: "Crear menú semanal para María García",
    descripcion: "Menú semana 49 con ajustes de macros solicitados",
    clienteId: "cli-001",
    clienteNombre: "María García López",
    fechaEntrega: formatDate(new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000)),
    estado: "en_progreso",
    prioridad: "alta",
    tipo: "dieta",
  },
  {
    id: "tarea-002",
    titulo: "Preparar pauta de entrenamiento",
    descripcion: "Nueva pauta adaptada a lesión de rodilla",
    clienteId: "cli-002",
    clienteNombre: "Carlos Rodríguez Pérez",
    fechaEntrega: formatDate(new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000)),
    estado: "pendiente",
    prioridad: "alta",
    tipo: "pauta",
  },
  {
    id: "tarea-003",
    titulo: "Informe de progreso trimestral",
    clienteId: "cli-004",
    clienteNombre: "Pedro López Fernández",
    fechaEntrega: formatDate(new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)),
    estado: "pendiente",
    prioridad: "media",
    tipo: "informe",
  },
  {
    id: "tarea-004",
    titulo: "Actualizar plan vegano",
    descripcion: "Incluir nuevas recetas sin soja",
    clienteId: "cli-006",
    clienteNombre: "Javier Ruiz Torres",
    fechaEntrega: formatDate(new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000)),
    estado: "pendiente",
    prioridad: "baja",
    tipo: "dieta",
  },
  {
    id: "tarea-005",
    titulo: "Revisar y actualizar suplementación",
    clienteId: "cli-005",
    clienteNombre: "Laura Sánchez Gil",
    fechaEntrega: formatDate(new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000)),
    estado: "pendiente",
    prioridad: "media",
    tipo: "otro",
  },
  // Tarea vencida
  {
    id: "tarea-006",
    titulo: "Enviar recetas alternativas",
    clienteId: "cli-003",
    clienteNombre: "Ana Martínez Sánchez",
    fechaEntrega: formatDate(new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000)),
    estado: "vencida",
    prioridad: "alta",
    tipo: "dieta",
  },
];

// ============================================
// ESTADÍSTICAS CALCULADAS
// ============================================

export const getSeguimientoStats = (): SeguimientoStats => {
  const clientesActivos = clientesData.filter((c) => c.diasRestantes && c.diasRestantes > 0).length;
  const clientesPendientePago = clientesData.filter(
    (c) => c.estadoPago === "pendiente" || c.estadoPago === "vencido",
  ).length;

  const revisionesHoy = revisionesData.filter((r) => {
    const revDate = new Date(r.fecha);
    return revDate.toDateString() === hoy.toDateString() && !r.completada;
  }).length;

  const finSemana = new Date(hoy);
  finSemana.setDate(hoy.getDate() + 7);
  const revisionesSemana = revisionesData.filter((r) => {
    const revDate = new Date(r.fecha);
    return revDate >= hoy && revDate <= finSemana && !r.completada;
  }).length;

  const alertasSinLeer = alertasData.filter((a) => !a.leida).length;
  const alertasAltas = alertasData.filter((a) => a.prioridad === "alta" && !a.leida).length;

  const tareasVencidas = tareasData.filter((t) => t.estado === "vencida").length;
  const tareasHoy = tareasData.filter((t) => {
    const tareaDate = new Date(t.fechaEntrega);
    return tareaDate.toDateString() === hoy.toDateString() && t.estado !== "completada";
  }).length;

  const cumplimientoPromedio = Math.round(
    clientesData.reduce((acc, c) => acc + c.cumplimientoSemanal, 0) / clientesData.length,
  );

  return {
    totalClientes: clientesData.length,
    clientesActivos,
    clientesPendientePago,
    revisionesHoy,
    revisionesSemana,
    alertasSinLeer,
    alertasAltas,
    tareasVencidas,
    tareasHoy,
    cumplimientoPromedio,
  };
};

// ============================================
// OPCIONES PARA FILTROS
// ============================================

export const estadosPago = [
  { value: "todos", label: "Todos" },
  { value: "pagado", label: "Pagado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "vencido", label: "Vencido" },
  { value: "parcial", label: "Parcial" },
];

export const tiposRevision = [
  { value: "todas", label: "Todas" },
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
  { value: "extraordinaria", label: "Extraordinaria" },
];

export const prioridadesAlerta = [
  { value: "todas", label: "Todas" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

export const tiposAlerta = [
  { value: "todas", label: "Todas" },
  { value: "formulario_pendiente", label: "Formulario Pendiente" },
  { value: "accion_diaria_incumplida", label: "Acción Incumplida" },
  { value: "entrega_pendiente", label: "Entrega Pendiente" },
  { value: "revision_proxima", label: "Revisión Próxima" },
  { value: "pago_pendiente", label: "Pago Pendiente" },
  { value: "sin_actividad", label: "Sin Actividad" },
];
