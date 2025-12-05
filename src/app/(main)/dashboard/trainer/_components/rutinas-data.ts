import { ejerciciosData } from "./ejercicios-data";
import type {
  ClienteEntrenamiento,
  SesionEntrenamiento,
  TrainerStats,
  TipoPlantilla,
  TipoLesion,
  TipoRestriccion,
} from "./schema";

// ============================================
// CLIENTES DE ENTRENAMIENTO
// ============================================

export const clientesEntrenamientoData: ClienteEntrenamiento[] = [
  {
    id: "cli-001",
    nombre: "María García López",
    email: "maria.garcia@email.com",
    avatar: "/avatars/arhamkhnz.png",
    lesiones: [],
    restricciones: [],
    plantillaActual: "torso_pierna",
    adherencia: {
      clienteId: "cli-001",
      periodo: "semana",
      sesionesCompletadas: 4,
      sesionesPlanificadas: 4,
      porcentajeSesiones: 100,
      seriesHechas: 64,
      seriesPlanificadas: 68,
      porcentajeSeries: 94,
      volumenSemanal: 12500,
      rpeMedio: 7.5,
      tendencia: "estable",
    },
  },
  {
    id: "cli-002",
    nombre: "Carlos Rodríguez Pérez",
    email: "carlos.rodriguez@email.com",
    lesiones: ["lumbar"],
    restricciones: ["sin_peso_libre"],
    restriccionesCustom: ["Evitar cargas axiales pesadas"],
    plantillaActual: "full_body",
    adherencia: {
      clienteId: "cli-002",
      periodo: "semana",
      sesionesCompletadas: 2,
      sesionesPlanificadas: 3,
      porcentajeSesiones: 67,
      seriesHechas: 38,
      seriesPlanificadas: 54,
      porcentajeSeries: 70,
      volumenSemanal: 8200,
      rpeMedio: 6.8,
      tendencia: "bajando",
    },
  },
  {
    id: "cli-003",
    nombre: "Ana Martínez Sánchez",
    email: "ana.martinez@email.com",
    lesiones: ["hombro"],
    restricciones: ["sin_press_vertical", "sin_rotacion_externa"],
    plantillaActual: "ppl",
    adherencia: {
      clienteId: "cli-003",
      periodo: "semana",
      sesionesCompletadas: 5,
      sesionesPlanificadas: 6,
      porcentajeSesiones: 83,
      seriesHechas: 72,
      seriesPlanificadas: 80,
      porcentajeSeries: 90,
      volumenSemanal: 15800,
      rpeMedio: 7.2,
      tendencia: "subiendo",
    },
  },
  {
    id: "cli-004",
    nombre: "Pedro López Fernández",
    email: "pedro.lopez@email.com",
    lesiones: ["rodilla"],
    restricciones: ["sin_flexion_rodilla", "sin_impacto"],
    plantillaActual: "upper_lower",
    adherencia: {
      clienteId: "cli-004",
      periodo: "semana",
      sesionesCompletadas: 4,
      sesionesPlanificadas: 4,
      porcentajeSesiones: 100,
      seriesHechas: 56,
      seriesPlanificadas: 60,
      porcentajeSeries: 93,
      volumenSemanal: 11200,
      rpeMedio: 7.8,
      tendencia: "estable",
    },
  },
  {
    id: "cli-005",
    nombre: "Laura Sánchez Gil",
    email: "laura.sanchez@email.com",
    lesiones: [],
    restricciones: ["solo_mancuernas"],
    restriccionesCustom: ["Entrena en casa"],
    plantillaActual: "full_body",
    adherencia: {
      clienteId: "cli-005",
      periodo: "semana",
      sesionesCompletadas: 3,
      sesionesPlanificadas: 3,
      porcentajeSesiones: 100,
      seriesHechas: 45,
      seriesPlanificadas: 45,
      porcentajeSeries: 100,
      volumenSemanal: 9500,
      rpeMedio: 8.1,
      tendencia: "subiendo",
    },
  },
  {
    id: "cli-006",
    nombre: "Javier Ruiz Torres",
    email: "javier.ruiz@email.com",
    lesiones: ["cervical", "hombro"],
    restricciones: ["sin_barra", "rango_limitado"],
    plantillaActual: "torso_pierna",
    adherencia: {
      clienteId: "cli-006",
      periodo: "semana",
      sesionesCompletadas: 3,
      sesionesPlanificadas: 4,
      porcentajeSesiones: 75,
      seriesHechas: 48,
      seriesPlanificadas: 64,
      porcentajeSeries: 75,
      volumenSemanal: 7800,
      rpeMedio: 6.5,
      tendencia: "bajando",
    },
  },
];

// ============================================
// SESIONES DE ENTRENAMIENTO (EJEMPLO)
// ============================================

const hoy = new Date();
const formatDate = (date: Date) => date.toISOString().split("T")[0];

export const sesionesData: SesionEntrenamiento[] = [
  {
    id: "ses-001",
    clienteId: "cli-001",
    clienteNombre: "María García López",
    fecha: formatDate(hoy),
    diaSemana: hoy.getDay(),
    nombre: "Torso A - Empuje",
    ejercicios: [
      {
        id: "ea-001",
        ejercicioId: "ej-001",
        orden: 1,
        series: [
          {
            id: "s1",
            numero: 1,
            repeticiones: 8,
            peso: 40,
            rpe: 7,
            descansoSegundos: 180,
            completada: true,
            repeticionesReales: 8,
            pesoReal: 40,
            rpeReal: 7,
          },
          {
            id: "s2",
            numero: 2,
            repeticiones: 8,
            peso: 40,
            rpe: 7,
            descansoSegundos: 180,
            completada: true,
            repeticionesReales: 8,
            pesoReal: 40,
            rpeReal: 7.5,
          },
          {
            id: "s3",
            numero: 3,
            repeticiones: 8,
            peso: 40,
            rpe: 8,
            descansoSegundos: 180,
            completada: true,
            repeticionesReales: 7,
            pesoReal: 40,
            rpeReal: 8,
          },
          { id: "s4", numero: 4, repeticiones: 8, peso: 40, rpe: 8, descansoSegundos: 180, completada: false },
        ],
        tipoProgresion: "incremento_kg",
        incrementoSemanal: 2.5,
      },
      {
        id: "ea-002",
        ejercicioId: "ej-016",
        orden: 2,
        series: [
          { id: "s5", numero: 1, repeticiones: 10, peso: 25, rpe: 7, descansoSegundos: 120, completada: true },
          { id: "s6", numero: 2, repeticiones: 10, peso: 25, rpe: 7, descansoSegundos: 120, completada: true },
          { id: "s7", numero: 3, repeticiones: 10, peso: 25, rpe: 8, descansoSegundos: 120, completada: true },
        ],
      },
      {
        id: "ea-003",
        ejercicioId: "ej-018",
        orden: 3,
        series: [
          { id: "s8", numero: 1, repeticiones: 15, peso: 8, rpe: 7, descansoSegundos: 60, completada: true },
          { id: "s9", numero: 2, repeticiones: 15, peso: 8, rpe: 8, descansoSegundos: 60, completada: true },
          { id: "s10", numero: 3, repeticiones: 15, peso: 8, rpe: 8, descansoSegundos: 60, completada: true },
        ],
      },
    ],
    estado: "parcial",
    duracionMinutos: 60,
    volumenTotal: 3520,
  },
  {
    id: "ses-002",
    clienteId: "cli-002",
    clienteNombre: "Carlos Rodríguez Pérez",
    fecha: formatDate(hoy),
    diaSemana: hoy.getDay(),
    nombre: "Full Body A",
    ejercicios: [
      {
        id: "ea-004",
        ejercicioId: "ej-012",
        orden: 1,
        series: [
          { id: "s11", numero: 1, repeticiones: 12, peso: 100, descansoSegundos: 120, completada: false },
          { id: "s12", numero: 2, repeticiones: 12, peso: 100, descansoSegundos: 120, completada: false },
          { id: "s13", numero: 3, repeticiones: 12, peso: 100, descansoSegundos: 120, completada: false },
        ],
        notas: "Usar prensa en lugar de sentadilla por lesión lumbar",
      },
    ],
    estado: "pendiente",
    duracionMinutos: 45,
  },
  {
    id: "ses-003",
    clienteId: "cli-003",
    clienteNombre: "Ana Martínez Sánchez",
    fecha: formatDate(new Date(hoy.getTime() - 24 * 60 * 60 * 1000)),
    diaSemana: (hoy.getDay() + 6) % 7,
    nombre: "Push Day",
    ejercicios: [],
    estado: "completada",
    duracionMinutos: 75,
    duracionReal: 80,
    volumenTotal: 5200,
  },
];

// ============================================
// ESTADÍSTICAS
// ============================================

export const getTrainerStats = (): TrainerStats => {
  const ejerciciosConVideo = ejerciciosData.filter((e) => e.videoUrl).length;
  const clientesActivos = clientesEntrenamientoData.filter((c) => c.adherencia.porcentajeSesiones > 50).length;
  const adherenciaPromedio = Math.round(
    clientesEntrenamientoData.reduce((acc, c) => acc + c.adherencia.porcentajeSesiones, 0) /
      clientesEntrenamientoData.length,
  );
  const clientesConLesiones = clientesEntrenamientoData.filter((c) => c.lesiones.length > 0).length;

  return {
    totalEjercicios: ejerciciosData.length,
    ejerciciosConVideo,
    totalClientes: clientesEntrenamientoData.length,
    clientesActivos,
    adherenciaPromedio,
    sesionesEstaSemana: sesionesData.length,
    sesionesCompletadas: sesionesData.filter((s) => s.estado === "completada").length,
    clientesConLesiones,
  };
};

// ============================================
// OPCIONES PARA FILTROS Y SELECTS
// ============================================

export const plantillasEntrenamiento: {
  value: TipoPlantilla;
  label: string;
  descripcion: string;
  diasSemana: number;
}[] = [
  { value: "full_body", label: "Full Body", descripcion: "Entrena todo el cuerpo cada sesión", diasSemana: 3 },
  {
    value: "torso_pierna",
    label: "Torso / Pierna",
    descripcion: "Alterna días de tren superior e inferior",
    diasSemana: 4,
  },
  { value: "ppl", label: "Push / Pull / Legs", descripcion: "Divide por patrones de movimiento", diasSemana: 6 },
  { value: "upper_lower", label: "Upper / Lower", descripcion: "Divide en tren superior e inferior", diasSemana: 4 },
  { value: "personalizado", label: "Personalizado", descripcion: "Rutina completamente personalizada", diasSemana: 0 },
];

export const tiposLesion: { value: TipoLesion; label: string; color: string }[] = [
  { value: "lumbar", label: "Lumbar", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  {
    value: "rodilla",
    label: "Rodilla",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  { value: "hombro", label: "Hombro", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  {
    value: "cervical",
    label: "Cervical",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  { value: "codo", label: "Codo", color: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200" },
  { value: "muneca", label: "Muñeca", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "cadera", label: "Cadera", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
  { value: "tobillo", label: "Tobillo", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
];

export const tiposRestriccion: { value: TipoRestriccion; label: string; color: string }[] = [
  {
    value: "sin_barra",
    label: "Sin barra",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  },
  {
    value: "solo_mancuernas",
    label: "Solo mancuernas",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    value: "sin_impacto",
    label: "Sin impacto",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  {
    value: "sin_flexion_rodilla",
    label: "Sin flexión rodilla",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  },
  {
    value: "sin_press_vertical",
    label: "Sin press vertical",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  },
  {
    value: "sin_peso_libre",
    label: "Sin peso libre",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  },
  {
    value: "sin_rotacion_externa",
    label: "Sin rotación externa",
    color: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  },
  {
    value: "rango_limitado",
    label: "Rango limitado",
    color: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200",
  },
];

export const tiposProgresion: { value: string; label: string; descripcion: string }[] = [
  { value: "porcentaje_1rm", label: "% del 1RM", descripcion: "Incrementa el porcentaje del máximo" },
  { value: "incremento_kg", label: "+kg semanales", descripcion: "Añade peso fijo cada semana" },
  { value: "incremento_reps", label: "+reps semanales", descripcion: "Añade repeticiones manteniendo peso" },
  { value: "autoregulacion", label: "Autorregulación (RPE)", descripcion: "Ajusta según el RPE reportado" },
];
