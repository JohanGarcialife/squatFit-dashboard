// ============================================
// TIPOS PARA EL MÓDULO DE TRAINER
// Preparado para integración con API REST
// ============================================

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type GrupoMuscular =
  | "pecho"
  | "espalda"
  | "hombros"
  | "biceps"
  | "triceps"
  | "cuadriceps"
  | "isquiotibiales"
  | "gluteos"
  | "gemelos"
  | "core"
  | "antebrazos"
  | "trapecio"
  | "full_body";

export type TipoMaterial =
  | "barra"
  | "mancuernas"
  | "kettlebell"
  | "maquina"
  | "poleas"
  | "peso_corporal"
  | "bandas_elasticas"
  | "suspension_trx"
  | "landmine"
  | "sin_material";

export type NivelDificultad = "principiante" | "intermedio" | "avanzado";

export type TipoPlantilla = "full_body" | "torso_pierna" | "ppl" | "upper_lower" | "personalizado";

export type TipoProgresion = "porcentaje_1rm" | "incremento_kg" | "incremento_reps" | "autoregulacion";

export type TipoLesion = "lumbar" | "rodilla" | "hombro" | "cervical" | "codo" | "muneca" | "cadera" | "tobillo";

export type TipoRestriccion =
  | "sin_barra"
  | "solo_mancuernas"
  | "sin_impacto"
  | "sin_flexion_rodilla"
  | "sin_press_vertical"
  | "sin_peso_libre"
  | "sin_rotacion_externa"
  | "rango_limitado";

export type EstadoSesion = "pendiente" | "completada" | "parcial" | "saltada";

// ============================================
// INTERFACES PRINCIPALES
// ============================================

/**
 * Ejercicio en la biblioteca
 * API: GET /api/ejercicios, GET /api/ejercicios/:id
 */
export interface Ejercicio {
  id: string;
  nombre: string;
  nombreIngles?: string;
  descripcion?: string;
  grupoMuscular: GrupoMuscular;
  gruposSecundarios?: GrupoMuscular[];
  material: TipoMaterial[];
  nivel: NivelDificultad;
  videoUrl?: string;
  thumbnailUrl?: string;
  instrucciones?: string[];
  erroresComunes?: string[];
  sustituciones?: string[]; // IDs de ejercicios sustitutos
  etiquetas?: string[];
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Sustitución de ejercicio
 * API: GET /api/ejercicios/:id/sustituciones
 */
export interface SustitucionEjercicio {
  ejercicioOriginalId: string;
  ejercicioSustitutoId: string;
  ejercicioSustitutoNombre: string;
  razon: "lesion" | "material" | "nivel" | "preferencia";
  equivalencia: number; // 0-100, qué tan similar es
  notas?: string;
}

/**
 * Serie de un ejercicio en una rutina
 */
export interface SerieEjercicio {
  id: string;
  numero: number;
  repeticiones?: number;
  repeticionesMin?: number;
  repeticionesMax?: number;
  peso?: number;
  porcentaje1RM?: number;
  rpe?: number; // Rating of Perceived Exertion (1-10)
  rir?: number; // Reps in Reserve
  descansoSegundos?: number;
  completada: boolean;
  repeticionesReales?: number;
  pesoReal?: number;
  rpeReal?: number;
  notas?: string;
}

/**
 * Ejercicio asignado en una sesión
 */
export interface EjercicioAsignado {
  id: string;
  ejercicioId: string;
  ejercicio?: Ejercicio; // Populated en GET
  orden: number;
  series: SerieEjercicio[];
  notas?: string;
  supersetCon?: string; // ID de otro ejercicio asignado
  tipoProgresion?: TipoProgresion;
  incrementoSemanal?: number;
}

/**
 * Sesión de entrenamiento (un día)
 * API: GET /api/sesiones/:id
 */
export interface SesionEntrenamiento {
  id: string;
  clienteId: string;
  clienteNombre?: string;
  fecha: string;
  diaSemana: number; // 0-6 (Domingo-Sábado)
  nombre: string; // Ej: "Día A - Torso", "Push"
  ejercicios: EjercicioAsignado[];
  estado: EstadoSesion;
  duracionMinutos?: number;
  duracionReal?: number;
  volumenTotal?: number; // series * reps * peso
  notas?: string;
  completadaEn?: string;
}

/**
 * Semana de entrenamiento
 * API: GET /api/semanas/:id
 */
export interface SemanaEntrenamiento {
  id: string;
  clienteId: string;
  clienteNombre?: string;
  numeroSemana: number;
  fechaInicio: string;
  fechaFin: string;
  plantilla: TipoPlantilla;
  sesiones: SesionEntrenamiento[];
  estado: "activa" | "completada" | "futura" | "plantilla";
  progresionAplicada?: boolean;
  deloadSemana?: boolean;
}

/**
 * Cliente con datos de entrenamiento
 * API: GET /api/clientes/:id/entrenamiento
 */
export interface ClienteEntrenamiento {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  lesiones: TipoLesion[];
  restricciones: TipoRestriccion[];
  restriccionesCustom?: string[];
  plantillaActual?: TipoPlantilla;
  semanaActual?: SemanaEntrenamiento;
  adherencia: MetricasAdherencia;
  notas?: string;
}

/**
 * Métricas de adherencia del cliente
 * API: GET /api/clientes/:id/adherencia
 */
export interface MetricasAdherencia {
  clienteId: string;
  periodo: "semana" | "mes" | "trimestre";
  sesionesCompletadas: number;
  sesionesPlanificadas: number;
  porcentajeSesiones: number; // %
  seriesHechas: number;
  seriesPlanificadas: number;
  porcentajeSeries: number; // %
  volumenSemanal: number; // kg totales
  volumenObjetivo?: number;
  rpeMedio: number; // Promedio del RPE reportado
  tendencia: "subiendo" | "estable" | "bajando";
}

/**
 * Configuración de progresión para renovar semana
 */
export interface ConfiguracionProgresion {
  tipoProgresion: TipoProgresion;
  valorIncremento: number; // % o kg o reps según tipo
  aplicarA: "todos" | "principales" | "accesorios";
  maxRPE?: number;
  deloadCadaSemanas?: number;
  porcentajeDeload?: number;
}

/**
 * Request para renovar semana
 * API: POST /api/semanas/renovar
 */
export interface RenovarSemanaRequest {
  clienteId: string;
  semanaBaseId?: string; // Si se copia de una semana existente
  plantilla: TipoPlantilla;
  fechaInicio: string;
  progresion: ConfiguracionProgresion;
  respetarRestricciones: boolean;
}

/**
 * Request para edición masiva
 * API: PATCH /api/sesiones/bulk
 */
export interface EdicionMasivaRequest {
  sesiones: {
    sesionId: string;
    cambios: Partial<SesionEntrenamiento>;
  }[];
}

// ============================================
// TIPOS PARA FILTROS Y QUERIES
// ============================================

export interface FiltroEjercicios {
  busqueda?: string;
  grupoMuscular?: GrupoMuscular | "todos";
  material?: TipoMaterial | "todos";
  nivel?: NivelDificultad | "todos";
  conVideo?: boolean;
  activo?: boolean;
}

export interface FiltroClientes {
  busqueda?: string;
  conLesiones?: boolean;
  plantilla?: TipoPlantilla | "todas";
  adherenciaMinima?: number;
}

// ============================================
// TIPOS PARA RESPUESTAS DE API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// ESTADÍSTICAS GLOBALES DE TRAINER
// ============================================

export interface TrainerStats {
  totalEjercicios: number;
  ejerciciosConVideo: number;
  totalClientes: number;
  clientesActivos: number;
  adherenciaPromedio: number;
  sesionesEstaSemana: number;
  sesionesCompletadas: number;
  clientesConLesiones: number;
}
