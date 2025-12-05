import { alimentosData } from "./alimentos-data";
import { recetasData } from "./recetas-data";
import { MenuSemanal, Sustitucion, Restriccion, DietaStats } from "./schema";

// ============================================
// MENÚS ESTÁTICOS
// ============================================

export const menusData: MenuSemanal[] = [
  {
    id: "menu-001",
    nombre: "Plan de definición - Semana 1",
    clienteId: "cliente-001",
    clienteNombre: "María García",
    objetivo: "definicion",
    restricciones: ["sin_gluten"],
    dias: [
      {
        dia: "lunes",
        comidas: [
          {
            id: "com-001",
            tipoComida: "desayuno",
            hora: "08:00",
            usaReceta: true,
            recetaId: "rec-002",
            recetaNombre: "Tortilla de claras con espinacas",
            porciones: 1,
            calorias: 299.7,
            proteinas: 22.4,
            carbohidratos: 5.25,
            grasas: 21.9,
            activo: true,
          },
          {
            id: "com-002",
            tipoComida: "comida",
            hora: "14:00",
            usaReceta: true,
            recetaId: "rec-001",
            recetaNombre: "Bowl de pollo con arroz integral",
            porciones: 1,
            calorias: 619.3,
            proteinas: 54.93,
            carbohidratos: 64,
            grasas: 15.33,
            activo: true,
          },
          {
            id: "com-003",
            tipoComida: "merienda",
            hora: "17:00",
            usaReceta: true,
            recetaId: "rec-006",
            recetaNombre: "Smoothie proteico de plátano",
            porciones: 1,
            calorias: 494.4,
            proteinas: 26.9,
            carbohidratos: 52.4,
            grasas: 21.54,
            activo: true,
          },
          {
            id: "com-004",
            tipoComida: "cena",
            hora: "21:00",
            usaReceta: true,
            recetaId: "rec-004",
            recetaNombre: "Salmón al horno con boniato",
            porciones: 1,
            calorias: 644.9,
            proteinas: 43.85,
            carbohidratos: 31.8,
            grasas: 36.35,
            activo: true,
          },
        ],
        caloriasTotal: 2058.3,
        proteinasTotal: 148.08,
        carbohidratosTotal: 153.45,
        grasasTotal: 95.12,
      },
    ],
    caloriasDiarias: 2058.3,
    proteinasDiarias: 148.08,
    carbohidratosDiarios: 153.45,
    grasasDiarias: 95.12,
    estado: "activo",
    fechaInicio: "2024-02-12",
    fechaFin: "2024-02-18",
    createdAt: "2024-02-11",
  },
  {
    id: "menu-002",
    nombre: "Plan vegano - Ganancia muscular",
    clienteId: "cliente-002",
    clienteNombre: "Carlos López",
    objetivo: "ganancia_muscular",
    restricciones: ["vegano", "sin_gluten"],
    dias: [
      {
        dia: "lunes",
        comidas: [
          {
            id: "com-005",
            tipoComida: "desayuno",
            hora: "07:30",
            usaReceta: true,
            recetaId: "rec-003",
            recetaNombre: "Overnight oats con plátano y almendras",
            porciones: 1.5,
            calorias: 773.78,
            proteinas: 39.3,
            carbohidratos: 97.05,
            grasas: 27.9,
            activo: true,
          },
          {
            id: "com-006",
            tipoComida: "comida",
            hora: "13:00",
            usaReceta: true,
            recetaId: "rec-008",
            recetaNombre: "Buddha bowl vegano",
            porciones: 1.5,
            calorias: 680.85,
            proteinas: 27.3,
            carbohidratos: 89.63,
            grasas: 27.75,
            activo: true,
          },
          {
            id: "com-007",
            tipoComida: "cena",
            hora: "20:00",
            usaReceta: true,
            recetaId: "rec-005",
            recetaNombre: "Ensalada de lentejas mediterránea",
            porciones: 2,
            calorias: 661.47,
            proteinas: 27.93,
            carbohidratos: 64.73,
            grasas: 36.33,
            activo: true,
          },
        ],
        caloriasTotal: 2116.1,
        proteinasTotal: 94.53,
        carbohidratosTotal: 251.41,
        grasasTotal: 91.98,
      },
    ],
    caloriasDiarias: 2116.1,
    proteinasDiarias: 94.53,
    carbohidratosDiarios: 251.41,
    grasasDiarias: 91.98,
    estado: "activo",
    fechaInicio: "2024-02-19",
    fechaFin: "2024-02-25",
    createdAt: "2024-02-18",
  },
  {
    id: "menu-003",
    nombre: "Plan de pérdida de peso",
    clienteId: "cliente-003",
    clienteNombre: "Ana Martínez",
    objetivo: "perdida_peso",
    restricciones: [],
    dias: [],
    caloriasDiarias: 1500,
    proteinasDiarias: 120,
    carbohidratosDiarios: 100,
    grasasDiarias: 50,
    estado: "borrador",
    createdAt: "2024-02-20",
  },
];

// ============================================
// SUSTITUCIONES ESTÁTICAS
// ============================================

export const sustitucionesData: Sustitucion[] = [
  {
    id: "sust-001",
    alimentoOriginalId: "alim-001",
    alimentoOriginalNombre: "Pechuga de pollo",
    alimentoSustitutoId: "alim-014",
    alimentoSustitutoNombre: "Atún en conserva al natural",
    factorConversion: 1.0,
    restriccion: "variedad",
    notas: "Misma cantidad de proteína, menos grasa",
    activo: true,
  },
  {
    id: "sust-002",
    alimentoOriginalId: "alim-001",
    alimentoOriginalNombre: "Pechuga de pollo",
    alimentoSustitutoId: "alim-011",
    alimentoSustitutoNombre: "Lentejas cocidas",
    factorConversion: 3.0,
    restriccion: "vegano",
    notas: "Necesitas 3x más lentejas para igualar proteínas",
    activo: true,
  },
  {
    id: "sust-003",
    alimentoOriginalId: "alim-009",
    alimentoOriginalNombre: "Yogur griego natural",
    alimentoSustitutoId: "alim-007",
    alimentoSustitutoNombre: "Aguacate",
    factorConversion: 1.5,
    restriccion: "vegano",
    notas: "Para bowls y smoothies veganos",
    activo: true,
  },
  {
    id: "sust-004",
    alimentoOriginalId: "alim-002",
    alimentoOriginalNombre: "Arroz integral",
    alimentoSustitutoId: "alim-013",
    alimentoSustitutoNombre: "Boniato/Batata",
    factorConversion: 2.5,
    restriccion: "variedad",
    notas: "Alternativa con más fibra y menos calorías",
    activo: true,
  },
  {
    id: "sust-005",
    alimentoOriginalId: "alim-005",
    alimentoOriginalNombre: "Huevo entero",
    alimentoSustitutoId: "alim-011",
    alimentoSustitutoNombre: "Lentejas cocidas",
    factorConversion: 2.0,
    restriccion: "vegano",
    notas: "Sustitución para tortillas y revueltos veganos",
    activo: true,
  },
  {
    id: "sust-006",
    alimentoOriginalId: "alim-006",
    alimentoOriginalNombre: "Avena en copos",
    alimentoSustitutoId: "alim-002",
    alimentoSustitutoNombre: "Arroz integral",
    factorConversion: 1.0,
    restriccion: "sin_gluten",
    notas: "Para personas con intolerancia al gluten (verificar avena certificada)",
    activo: true,
  },
];

// ============================================
// RESTRICCIONES ESTÁTICAS
// ============================================

export const restriccionesData: Restriccion[] = [
  {
    id: "rest-001",
    nombre: "Vegano",
    codigo: "vegano",
    descripcion: "Excluye todos los productos de origen animal",
    color: "bg-green-500",
    icono: "🌱",
    alimentosExcluidos: ["proteinas", "lacteos", "huevos"],
    activo: true,
  },
  {
    id: "rest-002",
    nombre: "Vegetariano",
    codigo: "vegetariano",
    descripcion: "Excluye carne y pescado, permite lácteos y huevos",
    color: "bg-emerald-500",
    icono: "🥬",
    alimentosExcluidos: ["carnes", "pescados"],
    activo: true,
  },
  {
    id: "rest-003",
    nombre: "Sin Gluten",
    codigo: "sin_gluten",
    descripcion: "Excluye alimentos que contienen gluten",
    color: "bg-amber-500",
    icono: "🌾",
    alimentosExcluidos: ["trigo", "cebada", "centeno", "avena"],
    activo: true,
  },
  {
    id: "rest-004",
    nombre: "Sin Lactosa",
    codigo: "sin_lactosa",
    descripcion: "Excluye productos lácteos con lactosa",
    color: "bg-blue-500",
    icono: "🥛",
    alimentosExcluidos: ["lacteos"],
    activo: true,
  },
  {
    id: "rest-005",
    nombre: "Bajo en Carbohidratos",
    codigo: "bajo_carbohidrato",
    descripcion: "Limita el consumo de carbohidratos a menos de 100g diarios",
    color: "bg-orange-500",
    icono: "🍞",
    alimentosExcluidos: [],
    activo: true,
  },
  {
    id: "rest-006",
    nombre: "Alto en Proteína",
    codigo: "alto_proteina",
    descripcion: "Prioriza alimentos ricos en proteínas",
    color: "bg-red-500",
    icono: "💪",
    alimentosExcluidos: [],
    activo: true,
  },
  {
    id: "rest-007",
    nombre: "Sin Frutos Secos",
    codigo: "sin_frutos_secos",
    descripcion: "Excluye todos los frutos secos por alergia",
    color: "bg-purple-500",
    icono: "🥜",
    alimentosExcluidos: ["frutos_secos"],
    activo: true,
  },
  {
    id: "rest-008",
    nombre: "Sin Mariscos",
    codigo: "sin_mariscos",
    descripcion: "Excluye mariscos y crustáceos",
    color: "bg-cyan-500",
    icono: "🦐",
    alimentosExcluidos: ["mariscos"],
    activo: true,
  },
];

// ============================================
// ESTADÍSTICAS CALCULADAS
// ============================================

export const getDietaStats = (): DietaStats => {
  const alimentosManuales = alimentosData.filter((a) => a.origen === "manual").length;
  const alimentosApi = alimentosData.filter((a) => a.origen !== "manual").length;
  const recetasPublicadas = recetasData.filter((r) => r.estado === "publicado").length;
  const recetasBorrador = recetasData.filter((r) => r.estado === "borrador").length;
  const menusActivos = menusData.filter((m) => m.estado === "activo").length;

  return {
    totalAlimentos: alimentosData.length,
    alimentosManuales,
    alimentosApi,
    totalRecetas: recetasData.length,
    recetasPublicadas,
    recetasBorrador,
    totalMenus: menusData.length,
    menusActivos,
    totalSustituciones: sustitucionesData.length,
    totalRestricciones: restriccionesData.filter((r) => r.activo).length,
  };
};

// ============================================
// OPCIONES PARA FILTROS Y SELECT
// ============================================

export const objetivosMenu = [
  { value: "perdida_peso", label: "Pérdida de Peso" },
  { value: "ganancia_muscular", label: "Ganancia Muscular" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "definicion", label: "Definición" },
  { value: "otro", label: "Otro" },
];
