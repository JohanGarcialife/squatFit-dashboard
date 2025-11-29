import type { PautaNutricional, PautasStats, Suplemento, CondicionMedica, Alergia, Bebida } from "./schema";

// =============================================
// DATOS DE EJEMPLO - PAUTAS NUTRICIONALES
// =============================================

export const pautasData: PautaNutricional[] = [
  {
    id: "pauta-001",
    clienteId: "cliente-001",
    clienteNombre: "Carlos Martínez",
    fechaCreacion: "2024-01-15",
    fechaActualizacion: "2024-03-10",
    estado: "activa",
    tipo: "mixta",
    macros: {
      calorias: 2400,
      proteinas: 180,
      carbohidratos: 250,
      grasas: 75,
      fibra: 35,
      agua: 3,
    },
    fichaRapida: {
      id: "ficha-001",
      clienteId: "cliente-001",
      clienteNombre: "Carlos Martínez",
      clienteAvatar: "/avatars/arhamkhnz.png",
      edad: 32,
      sexo: "masculino",
      altura: 178,
      pesoActual: 82,
      pesoObjetivo: 78,
      nivelActividad: "activo",
      objetivo: "perdida_peso",
      tmb: 1850,
      tdee: 2850,
    },
    evaluacionGeneral: {
      id: "eval-001",
      clienteId: "cliente-001",
      fechaEvaluacion: "2024-03-01",
      porcentajeGrasa: 22,
      masaMuscular: 38,
      imc: 25.9,
      circunferenciaCintura: 88,
      circunferenciaCadera: 98,
      presionArterial: "120/80",
      frecuenciaCardiacaReposo: 68,
      nivelEnergia: 7,
      calidadSueno: 6,
      nivelEstres: 5,
      observaciones: "Buena condición física general. Mejorar calidad del sueño.",
    },
    entrenadorId: "entrenador-001",
    entrenadorNombre: "Ana García",
  },
  {
    id: "pauta-002",
    clienteId: "cliente-002",
    clienteNombre: "María López",
    fechaCreacion: "2024-02-01",
    fechaActualizacion: "2024-03-15",
    estado: "activa",
    tipo: "nutricional",
    macros: {
      calorias: 1800,
      proteinas: 120,
      carbohidratos: 200,
      grasas: 55,
      fibra: 30,
      agua: 2.5,
    },
    fichaRapida: {
      id: "ficha-002",
      clienteId: "cliente-002",
      clienteNombre: "María López",
      edad: 28,
      sexo: "femenino",
      altura: 165,
      pesoActual: 62,
      pesoObjetivo: 58,
      nivelActividad: "moderado",
      objetivo: "perdida_peso",
      tmb: 1420,
      tdee: 2200,
    },
    entrenadorId: "entrenador-002",
    entrenadorNombre: "Luis Fernández",
  },
  {
    id: "pauta-003",
    clienteId: "cliente-003",
    clienteNombre: "Pedro Sánchez",
    fechaCreacion: "2024-01-20",
    fechaActualizacion: "2024-03-08",
    estado: "activa",
    tipo: "mixta",
    macros: {
      calorias: 3200,
      proteinas: 200,
      carbohidratos: 380,
      grasas: 90,
      fibra: 40,
      agua: 3.5,
    },
    fichaRapida: {
      id: "ficha-003",
      clienteId: "cliente-003",
      clienteNombre: "Pedro Sánchez",
      edad: 25,
      sexo: "masculino",
      altura: 185,
      pesoActual: 88,
      pesoObjetivo: 95,
      nivelActividad: "muy_activo",
      objetivo: "ganancia_muscular",
      tmb: 2050,
      tdee: 3500,
    },
    entrenadorId: "entrenador-001",
    entrenadorNombre: "Ana García",
  },
  {
    id: "pauta-004",
    clienteId: "cliente-004",
    clienteNombre: "Laura Ruiz",
    fechaCreacion: "2024-03-01",
    fechaActualizacion: "2024-03-01",
    estado: "borrador",
    tipo: "nutricional",
    macros: {
      calorias: 2000,
      proteinas: 100,
      carbohidratos: 250,
      grasas: 65,
      fibra: 28,
      agua: 2,
    },
    fichaRapida: {
      id: "ficha-004",
      clienteId: "cliente-004",
      clienteNombre: "Laura Ruiz",
      edad: 45,
      sexo: "femenino",
      altura: 160,
      pesoActual: 70,
      pesoObjetivo: 65,
      nivelActividad: "ligero",
      objetivo: "salud_general",
      tmb: 1380,
      tdee: 1900,
    },
    entrenadorId: "entrenador-002",
    entrenadorNombre: "Luis Fernández",
  },
  {
    id: "pauta-005",
    clienteId: "cliente-005",
    clienteNombre: "Andrés Gómez",
    fechaCreacion: "2023-12-10",
    fechaActualizacion: "2024-02-28",
    estado: "completada",
    tipo: "deportiva",
    macros: {
      calorias: 2800,
      proteinas: 160,
      carbohidratos: 320,
      grasas: 80,
      fibra: 35,
      agua: 3,
    },
    fichaRapida: {
      id: "ficha-005",
      clienteId: "cliente-005",
      clienteNombre: "Andrés Gómez",
      edad: 38,
      sexo: "masculino",
      altura: 175,
      pesoActual: 80,
      nivelActividad: "activo",
      objetivo: "rendimiento",
      tmb: 1780,
      tdee: 2750,
    },
    entrenadorId: "entrenador-001",
    entrenadorNombre: "Ana García",
  },
];

// =============================================
// SUPLEMENTOS DISPONIBLES
// =============================================

export const suplementosDisponibles: Suplemento[] = [
  {
    id: "sup-001",
    nombre: "Proteína Whey",
    tipo: "proteina",
    marca: "Optimum Nutrition",
    dosis: "30g",
    frecuencia: "diario",
    momentoToma: "Post-entrenamiento",
    beneficios: ["Recuperación muscular", "Síntesis proteica", "Saciedad"],
    activo: true,
  },
  {
    id: "sup-002",
    nombre: "Creatina Monohidrato",
    tipo: "creatina",
    marca: "MyProtein",
    dosis: "5g",
    frecuencia: "diario",
    momentoToma: "Cualquier momento",
    beneficios: ["Fuerza", "Potencia", "Rendimiento"],
    contraindicaciones: ["Problemas renales previos"],
    activo: true,
  },
  {
    id: "sup-003",
    nombre: "Omega-3",
    tipo: "omega3",
    marca: "Nordic Naturals",
    dosis: "2000mg EPA/DHA",
    frecuencia: "diario",
    momentoToma: "Con comidas",
    beneficios: ["Salud cardiovascular", "Antiinflamatorio", "Función cerebral"],
    activo: true,
  },
  {
    id: "sup-004",
    nombre: "Vitamina D3",
    tipo: "vitaminas",
    marca: "Now Foods",
    dosis: "2000 UI",
    frecuencia: "diario",
    momentoToma: "Mañana con desayuno",
    beneficios: ["Salud ósea", "Sistema inmune", "Estado de ánimo"],
    activo: true,
  },
  {
    id: "sup-005",
    nombre: "Magnesio Bisglicinato",
    tipo: "minerales",
    marca: "Doctor's Best",
    dosis: "400mg",
    frecuencia: "diario",
    momentoToma: "Antes de dormir",
    beneficios: ["Relajación muscular", "Calidad del sueño", "Recuperación"],
    activo: true,
  },
  {
    id: "sup-006",
    nombre: "BCAA",
    tipo: "aminoacidos",
    marca: "Scivation Xtend",
    dosis: "10g",
    frecuencia: "pre_entreno",
    momentoToma: "Durante entrenamiento",
    beneficios: ["Prevenir catabolismo", "Recuperación", "Rendimiento"],
    activo: true,
  },
  {
    id: "sup-007",
    nombre: "Pre-Workout",
    tipo: "preentrenamiento",
    marca: "C4 Original",
    dosis: "1 scoop",
    frecuencia: "pre_entreno",
    momentoToma: "30 min antes de entrenar",
    beneficios: ["Energía", "Enfoque", "Rendimiento"],
    contraindicaciones: ["Sensibilidad a cafeína", "Problemas cardíacos"],
    activo: true,
  },
  {
    id: "sup-008",
    nombre: "Probióticos",
    tipo: "probioticos",
    marca: "Garden of Life",
    dosis: "50B CFU",
    frecuencia: "diario",
    momentoToma: "En ayunas",
    beneficios: ["Salud digestiva", "Sistema inmune", "Absorción nutrientes"],
    activo: true,
  },
];

// =============================================
// CONDICIONES MÉDICAS COMUNES
// =============================================

export const condicionesMedicasComunes: Partial<CondicionMedica>[] = [
  { nombre: "Diabetes Tipo 2", tipo: "cronica", impactoNutricional: "Control de carbohidratos, índice glucémico" },
  { nombre: "Hipertensión", tipo: "cronica", impactoNutricional: "Reducir sodio, aumentar potasio" },
  { nombre: "Hipotiroidismo", tipo: "cronica", impactoNutricional: "Asegurar yodo y selenio" },
  { nombre: "Hipertiroidismo", tipo: "cronica", impactoNutricional: "Evitar exceso de yodo" },
  { nombre: "Síndrome de ovario poliquístico", tipo: "cronica", impactoNutricional: "Control de insulina, bajo IG" },
  { nombre: "Enfermedad celíaca", tipo: "cronica", impactoNutricional: "Dieta estricta sin gluten" },
  { nombre: "Enfermedad de Crohn", tipo: "cronica", impactoNutricional: "Dieta antiinflamatoria, fibra moderada" },
  { nombre: "Síndrome del intestino irritable", tipo: "cronica", impactoNutricional: "Dieta baja en FODMAP" },
  { nombre: "Anemia ferropénica", tipo: "aguda", impactoNutricional: "Aumentar hierro y vitamina C" },
  { nombre: "Osteoporosis", tipo: "cronica", impactoNutricional: "Calcio, vitamina D, proteína" },
];

// =============================================
// ALERGIAS COMUNES
// =============================================

export const alergiasComunes: Partial<Alergia>[] = [
  { tipo: "alimentaria", alergeno: "Gluten", alimentosEvitar: ["Trigo", "Cebada", "Centeno", "Avena contaminada"] },
  { tipo: "alimentaria", alergeno: "Lactosa", alimentosEvitar: ["Leche", "Queso fresco", "Yogur", "Helado"] },
  { tipo: "alimentaria", alergeno: "Frutos secos", alimentosEvitar: ["Nueces", "Almendras", "Avellanas", "Pistachos"] },
  { tipo: "alimentaria", alergeno: "Mariscos", alimentosEvitar: ["Gambas", "Langostinos", "Cangrejo", "Mejillones"] },
  { tipo: "alimentaria", alergeno: "Huevo", alimentosEvitar: ["Huevos", "Mayonesa", "Bollería", "Pastas"] },
  { tipo: "alimentaria", alergeno: "Soja", alimentosEvitar: ["Tofu", "Salsa de soja", "Edamame", "Leche de soja"] },
  { tipo: "alimentaria", alergeno: "Pescado", alimentosEvitar: ["Todo tipo de pescado"] },
  { tipo: "alimentaria", alergeno: "Cacahuetes", alimentosEvitar: ["Cacahuetes", "Mantequilla de cacahuete"] },
];

// =============================================
// BEBIDAS COMUNES
// =============================================

export const bebidasComunes: Partial<Bebida>[] = [
  { tipo: "agua", nombre: "Agua mineral" },
  { tipo: "cafe", nombre: "Café solo" },
  { tipo: "cafe", nombre: "Café con leche" },
  { tipo: "te", nombre: "Té verde" },
  { tipo: "te", nombre: "Té negro" },
  { tipo: "te", nombre: "Infusiones" },
  { tipo: "bebida_energetica", nombre: "Bebida energética" },
  { tipo: "refresco", nombre: "Refresco con azúcar" },
  { tipo: "refresco", nombre: "Refresco zero" },
  { tipo: "zumo", nombre: "Zumo natural" },
  { tipo: "zumo", nombre: "Zumo envasado" },
  { tipo: "batido", nombre: "Batido de proteínas" },
  { tipo: "alcohol", nombre: "Cerveza" },
  { tipo: "alcohol", nombre: "Vino" },
  { tipo: "alcohol", nombre: "Destilados" },
];

// =============================================
// OBJETIVOS Y NIVELES
// =============================================

export const objetivosPauta = [
  { value: "perdida_peso", label: "Pérdida de peso", color: "text-red-600" },
  { value: "mantenimiento", label: "Mantenimiento", color: "text-blue-600" },
  { value: "ganancia_muscular", label: "Ganancia muscular", color: "text-green-600" },
  { value: "rendimiento", label: "Rendimiento deportivo", color: "text-purple-600" },
  { value: "salud_general", label: "Salud general", color: "text-orange-600" },
];

export const nivelesActividad = [
  { value: "sedentario", label: "Sedentario", factor: 1.2, descripcion: "Poco o ningún ejercicio" },
  { value: "ligero", label: "Ligero", factor: 1.375, descripcion: "Ejercicio 1-3 días/semana" },
  { value: "moderado", label: "Moderado", factor: 1.55, descripcion: "Ejercicio 3-5 días/semana" },
  { value: "activo", label: "Activo", factor: 1.725, descripcion: "Ejercicio 6-7 días/semana" },
  { value: "muy_activo", label: "Muy activo", factor: 1.9, descripcion: "Ejercicio intenso diario" },
];

export const estadosPauta = [
  { value: "borrador", label: "Borrador", color: "bg-gray-100 text-gray-700" },
  { value: "activa", label: "Activa", color: "bg-green-100 text-green-700" },
  { value: "pausada", label: "Pausada", color: "bg-yellow-100 text-yellow-700" },
  { value: "completada", label: "Completada", color: "bg-blue-100 text-blue-700" },
  { value: "archivada", label: "Archivada", color: "bg-red-100 text-red-700" },
];

export const tiposAlimentacion = [
  { value: "omnivoro", label: "Omnívoro" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "vegano", label: "Vegano" },
  { value: "pescetariano", label: "Pescetariano" },
  { value: "flexitariano", label: "Flexitariano" },
  { value: "otro", label: "Otro" },
];

// =============================================
// FUNCIÓN PARA OBTENER ESTADÍSTICAS
// =============================================

export function getPautasStats(): PautasStats {
  const activas = pautasData.filter((p) => p.estado === "activa").length;
  const borrador = pautasData.filter((p) => p.estado === "borrador").length;
  const completadas = pautasData.filter((p) => p.estado === "completada").length;

  const macrosPromedio = pautasData.reduce(
    (acc, p) => ({
      calorias: acc.calorias + p.macros.calorias,
      proteinas: acc.proteinas + p.macros.proteinas,
      carbohidratos: acc.carbohidratos + p.macros.carbohidratos,
      grasas: acc.grasas + p.macros.grasas,
    }),
    { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
  );

  const total = pautasData.length || 1;

  const distribucionObjetivos = objetivosPauta.map((obj) => ({
    objetivo: obj.label,
    cantidad: pautasData.filter((p) => p.fichaRapida.objetivo === obj.value).length,
  }));

  return {
    totalPautas: pautasData.length,
    pautasActivas: activas,
    pautasBorrador: borrador,
    pautasCompletadas: completadas,
    clientesSinPauta: 12, // Dato de ejemplo
    promedioMacros: {
      calorias: Math.round(macrosPromedio.calorias / total),
      proteinas: Math.round(macrosPromedio.proteinas / total),
      carbohidratos: Math.round(macrosPromedio.carbohidratos / total),
      grasas: Math.round(macrosPromedio.grasas / total),
    },
    distribucionObjetivos,
    ultimasActualizaciones: 3,
  };
}

// =============================================
// FUNCIÓN PARA CALCULAR TMB Y TDEE
// =============================================

export function calcularTMB(
  peso: number,
  altura: number,
  edad: number,
  sexo: "masculino" | "femenino" | "otro",
): number {
  // Fórmula de Mifflin-St Jeor
  if (sexo === "masculino") {
    return Math.round(10 * peso + 6.25 * altura - 5 * edad + 5);
  } else {
    return Math.round(10 * peso + 6.25 * altura - 5 * edad - 161);
  }
}

export function calcularTDEE(tmb: number, nivelActividad: string): number {
  const nivel = nivelesActividad.find((n) => n.value === nivelActividad);
  return Math.round(tmb * (nivel?.factor || 1.2));
}

export function calcularMacrosRecomendados(
  tdee: number,
  objetivo: string,
): { calorias: number; proteinas: number; carbohidratos: number; grasas: number } {
  let calorias = tdee;

  switch (objetivo) {
    case "perdida_peso":
      calorias = Math.round(tdee * 0.8); // Déficit del 20%
      break;
    case "ganancia_muscular":
      calorias = Math.round(tdee * 1.1); // Superávit del 10%
      break;
    case "rendimiento":
      calorias = Math.round(tdee * 1.05); // Ligero superávit
      break;
    default:
      calorias = tdee;
  }

  // Distribución estándar: 30% proteínas, 45% carbohidratos, 25% grasas
  const proteinas = Math.round((calorias * 0.3) / 4);
  const carbohidratos = Math.round((calorias * 0.45) / 4);
  const grasas = Math.round((calorias * 0.25) / 9);

  return { calorias, proteinas, carbohidratos, grasas };
}
