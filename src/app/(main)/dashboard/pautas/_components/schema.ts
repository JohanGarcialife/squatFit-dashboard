import { z } from "zod";

// =============================================
// TIPOS PARA MACROS Y EVALUACIÓN
// =============================================

export const MacrosSchema = z.object({
  calorias: z.number().min(0),
  proteinas: z.number().min(0),
  carbohidratos: z.number().min(0),
  grasas: z.number().min(0),
  fibra: z.number().min(0).optional(),
  agua: z.number().min(0).optional(), // en litros
});

export type Macros = z.infer<typeof MacrosSchema>;

export const FichaRapidaSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  clienteNombre: z.string(),
  clienteAvatar: z.string().optional(),
  edad: z.number(),
  sexo: z.enum(["masculino", "femenino", "otro"]),
  altura: z.number(), // en cm
  pesoActual: z.number(), // en kg
  pesoObjetivo: z.number().optional(),
  nivelActividad: z.enum(["sedentario", "ligero", "moderado", "activo", "muy_activo"]),
  objetivo: z.enum(["perdida_peso", "mantenimiento", "ganancia_muscular", "rendimiento", "salud_general"]),
  tmb: z.number(), // Tasa metabólica basal
  tdee: z.number(), // Gasto energético diario total
});

export type FichaRapida = z.infer<typeof FichaRapidaSchema>;

export const EvaluacionGeneralSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  fechaEvaluacion: z.string(),
  porcentajeGrasa: z.number().optional(),
  masaMuscular: z.number().optional(),
  imc: z.number().optional(),
  circunferenciaCintura: z.number().optional(),
  circunferenciaCadera: z.number().optional(),
  presionArterial: z.string().optional(),
  frecuenciaCardiacaReposo: z.number().optional(),
  nivelEnergia: z.number().min(1).max(10).optional(),
  calidadSueno: z.number().min(1).max(10).optional(),
  nivelEstres: z.number().min(1).max(10).optional(),
  observaciones: z.string().optional(),
});

export type EvaluacionGeneral = z.infer<typeof EvaluacionGeneralSchema>;

// =============================================
// TIPOS PARA HISTORIAL MÉDICO
// =============================================

export const CondicionMedicaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: z.enum(["cronica", "aguda", "genetica", "otra"]),
  descripcion: z.string().optional(),
  fechaDiagnostico: z.string().optional(),
  estado: z.enum(["activa", "controlada", "resuelta"]),
  medicacion: z.string().optional(),
  impactoNutricional: z.string().optional(),
  impactoDeportivo: z.string().optional(),
});

export type CondicionMedica = z.infer<typeof CondicionMedicaSchema>;

export const AlergiaSchema = z.object({
  id: z.string(),
  tipo: z.enum(["alimentaria", "medicamento", "ambiental", "otra"]),
  alergeno: z.string(),
  severidad: z.enum(["leve", "moderada", "severa"]),
  reaccion: z.string().optional(),
  alimentosEvitar: z.array(z.string()).optional(),
});

export type Alergia = z.infer<typeof AlergiaSchema>;

export const HistorialMedicoSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  condicionesMedicas: z.array(CondicionMedicaSchema),
  alergias: z.array(AlergiaSchema),
  medicamentosActuales: z.array(
    z.object({
      nombre: z.string(),
      dosis: z.string(),
      frecuencia: z.string(),
      motivo: z.string().optional(),
    }),
  ),
  lesionesAnteriores: z.array(
    z.object({
      tipo: z.string(),
      zona: z.string(),
      fecha: z.string().optional(),
      estado: z.enum(["recuperada", "en_tratamiento", "cronica"]),
      limitaciones: z.string().optional(),
    }),
  ),
  cirugias: z.array(
    z.object({
      tipo: z.string(),
      fecha: z.string(),
      recuperado: z.boolean(),
    }),
  ),
  antecedentesCardiovasculares: z.boolean(),
  antecedentesMetabolicos: z.boolean(),
  observacionesGenerales: z.string().optional(),
  ultimaActualizacion: z.string(),
});

export type HistorialMedico = z.infer<typeof HistorialMedicoSchema>;

// =============================================
// TIPOS PARA BEBIDAS Y COMIDAS
// =============================================

export const PreferenciaAlimentariaSchema = z.object({
  tipoAlimento: z.string(),
  preferencia: z.enum(["me_gusta", "neutral", "no_me_gusta", "alergia", "intolerancia"]),
  notas: z.string().optional(),
});

export type PreferenciaAlimentaria = z.infer<typeof PreferenciaAlimentariaSchema>;

export const ComidaPreferenciaSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  tipoAlimentacion: z.enum(["omnivoro", "vegetariano", "vegano", "pescetariano", "flexitariano", "otro"]),
  restriccionesDieteticas: z.array(z.string()), // sin gluten, sin lactosa, etc.
  alimentosProhibidos: z.array(z.string()),
  alimentosPreferidos: z.array(z.string()),
  horarioComidas: z.array(
    z.object({
      tipo: z.string(), // desayuno, almuerzo, cena, etc.
      horaPreferida: z.string(),
      duracionMinutos: z.number().optional(),
    }),
  ),
  comidasPorDia: z.number().min(1).max(8),
  cocinaDomicilio: z.boolean(),
  tiempoCocinaDiario: z.number().optional(), // en minutos
  presupuestoSemanal: z.number().optional(),
  preferenciasEspecificas: z.array(PreferenciaAlimentariaSchema).optional(),
});

export type ComidaPreferencia = z.infer<typeof ComidaPreferenciaSchema>;

export const BebidaSchema = z.object({
  id: z.string(),
  tipo: z.enum(["agua", "cafe", "te", "bebida_energetica", "alcohol", "refresco", "zumo", "batido", "otra"]),
  nombre: z.string(),
  cantidadDiaria: z.number(), // en ml
  frecuencia: z.enum(["diario", "semanal", "ocasional", "nunca"]),
  notas: z.string().optional(),
  recomendacionModificar: z.boolean().optional(),
});

export type Bebida = z.infer<typeof BebidaSchema>;

export const BebidasComidasSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  preferenciasComida: ComidaPreferenciaSchema,
  consumoBebidas: z.array(BebidaSchema),
  consumoAguaDiario: z.number(), // en litros
  consumoCafeinaDiario: z.number().optional(), // en mg
  consumoAlcoholSemanal: z.number().optional(), // unidades
  habitosNegativos: z.array(z.string()).optional(), // comida rápida, picar, etc.
  habitosPositivos: z.array(z.string()).optional(),
});

export type BebidasComidas = z.infer<typeof BebidasComidasSchema>;

// =============================================
// TIPOS PARA SUPLEMENTACIÓN
// =============================================

export const SuplementoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: z.enum([
    "proteina",
    "aminoacidos",
    "creatina",
    "vitaminas",
    "minerales",
    "omega3",
    "probioticos",
    "preentrenamiento",
    "recuperacion",
    "otro",
  ]),
  marca: z.string().optional(),
  dosis: z.string(),
  frecuencia: z.enum(["diario", "pre_entreno", "post_entreno", "semanal", "segun_necesidad"]),
  momentoToma: z.string().optional(), // mañana, noche, con comidas, etc.
  beneficios: z.array(z.string()),
  contraindicaciones: z.array(z.string()).optional(),
  interacciones: z.array(z.string()).optional(),
  activo: z.boolean(),
  fechaInicio: z.string().optional(),
  duracionRecomendada: z.string().optional(),
  notas: z.string().optional(),
});

export type Suplemento = z.infer<typeof SuplementoSchema>;

export const SuplementacionSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  suplementosActivos: z.array(SuplementoSchema),
  suplementosRecomendados: z.array(SuplementoSchema),
  suplementosEvitar: z.array(
    z.object({
      nombre: z.string(),
      motivo: z.string(),
    }),
  ),
  presupuestoMensual: z.number().optional(),
  objetivosSuplementacion: z.array(z.string()),
  ultimaRevision: z.string(),
});

export type Suplementacion = z.infer<typeof SuplementacionSchema>;

// =============================================
// TIPOS PARA PAUTAS COMPLETAS
// =============================================

export const PautaNutricionalSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  clienteNombre: z.string(),
  fechaCreacion: z.string(),
  fechaActualizacion: z.string(),
  estado: z.enum(["borrador", "activa", "pausada", "completada", "archivada"]),
  tipo: z.enum(["nutricional", "deportiva", "mixta"]),
  macros: MacrosSchema,
  fichaRapida: FichaRapidaSchema,
  evaluacionGeneral: EvaluacionGeneralSchema.optional(),
  historialMedico: HistorialMedicoSchema.optional(),
  bebidasComidas: BebidasComidasSchema.optional(),
  suplementacion: SuplementacionSchema.optional(),
  notas: z.string().optional(),
  entrenadorId: z.string().optional(),
  entrenadorNombre: z.string().optional(),
});

export type PautaNutricional = z.infer<typeof PautaNutricionalSchema>;

// =============================================
// TIPOS PARA EDICIÓN MASIVA
// =============================================

export const EdicionMasivaFiltrosSchema = z.object({
  busqueda: z.string().optional(),
  objetivo: z.array(z.string()).optional(),
  nivelActividad: z.array(z.string()).optional(),
  estado: z.array(z.string()).optional(),
  entrenador: z.string().optional(),
  rangoEdad: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  rangoPeso: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

export type EdicionMasivaFiltros = z.infer<typeof EdicionMasivaFiltrosSchema>;

export const CambioMasivoSchema = z.object({
  tipo: z.enum([
    "macros",
    "suplemento_agregar",
    "suplemento_quitar",
    "restriccion_agregar",
    "restriccion_quitar",
    "estado",
  ]),
  campo: z.string(),
  valorAnterior: z.unknown().optional(),
  valorNuevo: z.unknown(),
  aplicarA: z.enum(["todos", "seleccionados", "filtrados"]),
  clientesIds: z.array(z.string()).optional(),
});

export type CambioMasivo = z.infer<typeof CambioMasivoSchema>;

// =============================================
// ESTADÍSTICAS
// =============================================

export interface PautasStats {
  totalPautas: number;
  pautasActivas: number;
  pautasBorrador: number;
  pautasCompletadas: number;
  clientesSinPauta: number;
  promedioMacros: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
  distribucionObjetivos: {
    objetivo: string;
    cantidad: number;
  }[];
  ultimasActualizaciones: number; // pautas actualizadas en últimos 7 días
}
