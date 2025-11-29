import { z } from "zod";

// ============================================
// ALIMENTOS
// ============================================

export const alimentoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.enum([
    "proteinas",
    "carbohidratos",
    "grasas",
    "verduras",
    "frutas",
    "lacteos",
    "legumbres",
    "frutos_secos",
    "otros",
  ]),
  calorias: z.number(), // por 100g
  proteinas: z.number(), // gramos por 100g
  carbohidratos: z.number(), // gramos por 100g
  grasas: z.number(), // gramos por 100g
  fibra: z.number().optional(), // gramos por 100g
  origen: z.enum(["manual", "open_food_facts", "bedca"]),
  imagen: z.string().optional(),
  etiquetas: z.array(z.string()).optional(), // vegano, sin_gluten, etc.
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Alimento = z.infer<typeof alimentoSchema>;

// ============================================
// RECETAS
// ============================================

export const ingredienteRecetaSchema = z.object({
  alimentoId: z.string(),
  nombre: z.string(),
  cantidad: z.number(), // en gramos
  calorias: z.number(),
  proteinas: z.number(),
  carbohidratos: z.number(),
  grasas: z.number(),
});

export type IngredienteReceta = z.infer<typeof ingredienteRecetaSchema>;

export const recetaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
  tipoComida: z.enum(["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"]),
  tiempoPreparacion: z.number(), // minutos
  porciones: z.number(),
  dificultad: z.enum(["facil", "media", "dificil"]),
  ingredientes: z.array(ingredienteRecetaSchema),
  instrucciones: z.array(z.string()),
  // Totales calculados
  caloriasTotal: z.number(),
  proteinasTotal: z.number(),
  carbohidratosTotal: z.number(),
  grasasTotal: z.number(),
  // Por porción
  caloriasPorcion: z.number(),
  proteinasPorcion: z.number(),
  carbohidratosPorcion: z.number(),
  grasasPorcion: z.number(),
  // Etiquetas y categorías
  etiquetas: z.array(z.string()), // vegano, sin_gluten, alto_proteina, etc.
  estado: z.enum(["borrador", "publicado", "archivado"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Receta = z.infer<typeof recetaSchema>;

// ============================================
// MENÚS / DIETAS
// ============================================

export const comidaMenuSchema = z.object({
  id: z.string(),
  tipoComida: z.enum(["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"]),
  hora: z.string().optional(), // "08:00"
  usaReceta: z.boolean(), // true = receta guardada, false = ingredientes manuales
  recetaId: z.string().optional(),
  recetaNombre: z.string().optional(),
  ingredientes: z.array(ingredienteRecetaSchema).optional(), // solo si usaReceta = false
  porciones: z.number().default(1),
  notas: z.string().optional(),
  // Macros calculados
  calorias: z.number(),
  proteinas: z.number(),
  carbohidratos: z.number(),
  grasas: z.number(),
  activo: z.boolean().default(true), // si false, no se muestra al cliente
});

export type ComidaMenu = z.infer<typeof comidaMenuSchema>;

export const diaMenuSchema = z.object({
  dia: z.enum(["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]),
  comidas: z.array(comidaMenuSchema),
  caloriasTotal: z.number(),
  proteinasTotal: z.number(),
  carbohidratosTotal: z.number(),
  grasasTotal: z.number(),
});

export type DiaMenu = z.infer<typeof diaMenuSchema>;

export const menuSemanalSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  clienteId: z.string().optional(),
  clienteNombre: z.string().optional(),
  objetivo: z.enum(["perdida_peso", "ganancia_muscular", "mantenimiento", "definicion", "otro"]),
  restricciones: z.array(z.string()), // vegano, sin_gluten, etc.
  dias: z.array(diaMenuSchema),
  // Promedios semanales
  caloriasDiarias: z.number(),
  proteinasDiarias: z.number(),
  carbohidratosDiarios: z.number(),
  grasasDiarias: z.number(),
  estado: z.enum(["borrador", "activo", "completado", "archivado"]),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MenuSemanal = z.infer<typeof menuSemanalSchema>;

// ============================================
// SUSTITUCIONES Y RESTRICCIONES
// ============================================

export const sustitucionSchema = z.object({
  id: z.string(),
  alimentoOriginalId: z.string(),
  alimentoOriginalNombre: z.string(),
  alimentoSustitutoId: z.string(),
  alimentoSustitutoNombre: z.string(),
  factorConversion: z.number(), // ej: 1.2 = necesitas 20% más del sustituto
  restriccion: z.string(), // ej: "vegano", "sin_gluten", "sin_lactosa"
  notas: z.string().optional(),
  activo: z.boolean().default(true),
});

export type Sustitucion = z.infer<typeof sustitucionSchema>;

export const restriccionSchema = z.object({
  id: z.string(),
  nombre: z.string(), // "Vegano", "Sin Gluten", etc.
  codigo: z.string(), // "vegano", "sin_gluten"
  descripcion: z.string(),
  color: z.string(), // para badges
  icono: z.string().optional(),
  alimentosExcluidos: z.array(z.string()), // categorías o alimentos específicos
  activo: z.boolean().default(true),
});

export type Restriccion = z.infer<typeof restriccionSchema>;

// ============================================
// FILTROS Y CONFIGURACIÓN
// ============================================

export const filtrosRecetasSchema = z.object({
  busqueda: z.string().optional(),
  tipoComida: z.array(z.string()).optional(),
  etiquetas: z.array(z.string()).optional(),
  tiempoMax: z.number().optional(),
  estado: z.array(z.string()).optional(),
  ordenarPor: z.enum(["nombre", "proteinas", "calorias", "tiempo", "fecha"]).optional(),
  ordenDireccion: z.enum(["asc", "desc"]).optional(),
});

export type FiltrosRecetas = z.infer<typeof filtrosRecetasSchema>;

export const filtrosAlimentosSchema = z.object({
  busqueda: z.string().optional(),
  categoria: z.array(z.string()).optional(),
  origen: z.array(z.string()).optional(),
  etiquetas: z.array(z.string()).optional(),
});

export type FiltrosAlimentos = z.infer<typeof filtrosAlimentosSchema>;

// ============================================
// ESTADÍSTICAS
// ============================================

export interface DietaStats {
  totalAlimentos: number;
  alimentosManuales: number;
  alimentosApi: number;
  totalRecetas: number;
  recetasPublicadas: number;
  recetasBorrador: number;
  totalMenus: number;
  menusActivos: number;
  totalSustituciones: number;
  totalRestricciones: number;
}
