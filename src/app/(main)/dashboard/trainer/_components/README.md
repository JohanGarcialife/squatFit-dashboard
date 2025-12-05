# Estado de Integración - Módulo Trainer

## 📋 Resumen

Este documento describe el estado actual de integración del módulo Trainer con el backend de Squat Fit.

**Última actualización:** Diciembre 2025  
**Análisis basado en:** ANALISIS_FUNCIONALIDADES_BACKEND.md

---

## ✅ Conectado con Backend (Datos en Tiempo Real)

### 1. TrainerCards - Métricas de Tareas y Clientes

**Componente:** `trainer-cards.tsx`

**Endpoints utilizados:**
- `GET /api/v1/admin-panel/tasks/assigned-to-me` - Tareas del trainer
- `GET /api/v1/admin-panel/advices` - Clientes activos (a través de asesorías)

**Hooks personalizados:**
- `useTrainerMetrics()` - Métricas agregadas de tareas
- `useClientesStats()` - Estadísticas de clientes

**Métricas conectadas:**
- ✅ **Tareas Completadas**: % de tareas completadas vs planificadas (datos reales)
- ✅ **Clientes Activos**: Número de clientes con asesorías activas (datos reales)

**Indicadores visuales:**
- 🟢 Icono `<Wifi />` verde: Datos en tiempo real del backend
- 🟡 Icono `<WifiOff />` amarillo: Datos de ejemplo (endpoint no disponible)

---

### 2. Lesiones y Restricciones - Historial de IMC

**Componente:** `lesiones-restricciones.tsx`

**Endpoints utilizados:**
- `GET /api/v1/calculator/history` - Historial de IMC del usuario

**Hooks personalizados:**
- `useIMCHistory()` - Historial completo de IMC
- `useIMCTrend()` - Tendencia de IMC (últimos N registros)

**Funcionalidades conectadas:**
- ✅ **Historial de IMC**: Muestra los últimos 3 registros de IMC del cliente
- ✅ **Tendencia de IMC**: Indica si el IMC está subiendo, bajando o estable
- ✅ **Clasificación**: Muestra la clasificación actual (bajo peso, normal, sobrepeso, etc.)

---

## ⚠️ Mock Data (Backend No Disponible)

### 1. Biblioteca de Ejercicios

**Componente:** `biblioteca-ejercicios.tsx`

**Estado:** ❌ **Sin endpoint en backend**

**Endpoints necesarios:**
```http
GET    /api/v1/exercises              - Listar ejercicios
GET    /api/v1/exercises/:id          - Obtener ejercicio específico
POST   /api/v1/exercises              - Crear nuevo ejercicio
PUT    /api/v1/exercises/:id          - Actualizar ejercicio
DELETE /api/v1/exercises/:id          - Eliminar ejercicio
GET    /api/v1/exercises/categories   - Obtener categorías
GET    /api/v1/exercises/search       - Buscar ejercicios
```

**Datos actuales:** Archivo estático `data.ts` con 24 ejercicios de ejemplo

**Prioridad:** 🔴 **ALTA** - Funcionalidad core del módulo

---

### 2. Edición Masiva de Rutinas

**Componente:** `edicion-masiva.tsx`

**Estado:** ❌ **Sin endpoint en backend**

**Endpoints necesarios:**
```http
GET    /api/v1/rutinas                - Listar rutinas
GET    /api/v1/rutinas/:id            - Obtener rutina específica
POST   /api/v1/rutinas                - Crear rutina
PUT    /api/v1/rutinas/:id            - Actualizar rutina
PATCH  /api/v1/sesiones/bulk          - Actualización masiva de sesiones
DELETE /api/v1/rutinas/:id            - Eliminar rutina
```

**Datos actuales:** Generados dinámicamente con función `generarSemanasClientes()`

**Prioridad:** 🟡 **MEDIA**

---

### 3. Renovar Semana

**Componente:** `renovar-semana.tsx`

**Estado:** ❌ **Sin endpoint en backend**

**Endpoints necesarios:**
```http
GET    /api/v1/semanas                - Listar semanas de entrenamiento
GET    /api/v1/semanas/:id            - Obtener semana específica
POST   /api/v1/semanas/renovar        - Renovar semana con progresión
PUT    /api/v1/semanas/:id            - Actualizar semana
DELETE /api/v1/semanas/:id            - Eliminar semana
```

**Request esperado para renovar semana:**
```typescript
{
  clienteIds: string[];
  plantilla: TipoPlantilla;
  fechaInicio: string;
  progresion: {
    tipoProgresion: "porcentaje_1rm" | "incremento_kg" | "incremento_reps" | "autoregulacion";
    valorIncremento: number;
    aplicarA: "todos" | "principales" | "accesorios";
    maxRPE?: number;
    deloadCadaSemanas?: number;
    porcentajeDeload?: number;
  };
  respetarRestricciones: boolean;
  copiarSemanaAnterior: boolean;
}
```

**Datos actuales:** Mock data con plantillas predefinidas

**Prioridad:** 🟡 **MEDIA**

---

### 4. Métricas de Volumen y RPE

**Componente:** `trainer-cards.tsx`

**Estado:** ⚠️ **Usando datos de ejemplo**

**Métricas sin backend:**
- Series Completadas (% series hechas/planificadas)
- Volumen Semanal (kg totales movidos)
- RPE Medio (Rating of Perceived Exertion)

**Endpoints necesarios:**
```http
GET /api/v1/metricas/volumen       - Volumen semanal por cliente
GET /api/v1/metricas/series        - Series completadas por cliente
GET /api/v1/metricas/rpe           - RPE medio por cliente
```

**Prioridad:** 🟢 **BAJA** - Métricas secundarias

---

## 🔧 Servicios y Hooks Creados

### Servicios Backend

**Archivo:** `src/lib/services/trainer-service.ts`

```typescript
class TrainerService {
  // Tareas
  static async getTareasAsignadas(filters?: GetTasksFilters): Promise<TrainerTask[]>
  static async getTareasPorCliente(chatId: string): Promise<TrainerTask[]>
  static async crearTarea(chatId: string, data: CreateTrainerTaskDto): Promise<TrainerTask>
  static async actualizarEstadoTarea(taskId: string, status: TaskStatus): Promise<TrainerTask>
  
  // Clientes
  static async getClientesActivos(params?: GetClientesParams): Promise<TrainerCliente[]>
  
  // Coaches
  static async getCoaches(params?: GetCoachesParams): Promise<Coach[]>
  
  // IMC
  static async getHistorialIMC(date?: string): Promise<IMCHistoryRecord[]>
  static async calcularIMC(data: CalculateIMCDto): Promise<IMCCalculationResponse>
  
  // Utilidades
  static calcularMetricasTareas(tareas: TrainerTask[]): TrainerMetrics
}
```

### Hooks con React Query

**Archivo:** `src/hooks/use-trainer-tasks.ts`

```typescript
// Queries
useTrainerTasks(filters?: GetTasksFilters)
useClientTasks(chatId: string)
useTrainerMetrics(filters?: GetTasksFilters)

// Mutations
useCreateTrainerTask()
useUpdateTaskStatus()

// Utilities
useInvalidateTrainerTasks()
useTasksByStatus(status)
useTasksByPriority(priority)
```

**Archivo:** `src/hooks/use-trainer-clientes.ts`

```typescript
// Queries
useTrainerClientes(params?: GetClientesParams)
useTrainerClientesFiltrados(filters)
useClientesStats()
useTrainerCoaches(params?: GetCoachesParams)
useIMCHistory(date?: string)
useLatestIMC()
useIMCTrend(limit?: number)

// Utilities
useInvalidateTrainerClientes()
useInvalidateIMC()
usePrefetchClientes()
```

---

## 📦 Componentes Reutilizables

**Ubicación:** `src/app/(main)/dashboard/trainer/_components/shared/`

### ClienteAvatar
Avatar con iniciales automáticas y soporte para diferentes tamaños.

```tsx
<ClienteAvatar 
  nombre="Juan Pérez" 
  avatar="/path/to/avatar.jpg" 
  size="md" 
/>
```

### EstadoBadge
Badge con icono y color según el estado (completada, en progreso, pendiente, cancelada).

```tsx
<EstadoBadge estado="completed" showIcon />
```

### MetricCard
Card genérica para mostrar métricas con badge y footer opcionales.

```tsx
<MetricCard
  title="Tareas Completadas"
  value="85%"
  badge={{ text: "Adherencia", icon: CheckCircle2 }}
  footer={<span>20 de 24 tareas</span>}
/>
```

### RestriccionChip
Chip para mostrar lesiones, restricciones o notas personalizadas.

```tsx
<RestriccionChip 
  tipo="lesion" 
  valor="lumbar" 
  editable 
  onRemove={() => {}} 
/>
```

---

## 🎯 Estrategia de Cache (React Query)

### Tiempos de Stale Time

| Tipo de Dato | Stale Time | GC Time | Refetch on Focus |
|--------------|------------|---------|------------------|
| Tareas | 30 segundos | 5 min | ✅ Sí |
| Clientes | 5 minutos | 10 min | ❌ No |
| Coaches | 10 minutos | 15 min | ❌ No |
| IMC | 1 minuto | 5 min | ❌ No |

### Invalidación Automática

- **Al crear tarea**: Invalida `trainerTasksKeys.lists()` y `trainerTasksKeys.metrics()`
- **Al actualizar tarea**: Invalida listas, métricas y tareas del cliente específico
- **Optimistic Updates**: Implementado en `useUpdateTaskStatus()`

---

## 🚀 Próximos Pasos

### Alta Prioridad

1. **Implementar Biblioteca de Ejercicios en Backend**
   - Crear tabla `exercises` en base de datos
   - Implementar CRUD completo
   - Agregar búsqueda y filtrado
   - Soporte para videos e imágenes

2. **Sistema de Rutinas y Sesiones**
   - Crear tabla `routines` y `sessions`
   - Implementar generación de semanas
   - Sistema de progresión automática
   - Adaptación según restricciones

### Media Prioridad

3. **Métricas de Volumen y Series**
   - Tracking de series completadas
   - Cálculo de volumen semanal
   - Registro de RPE por ejercicio

4. **Edición Masiva**
   - Endpoint para actualización bulk
   - Sistema de templates
   - Copiar entre semanas

### Baja Prioridad

5. **Mejoras UX**
   - Drag & drop para reordenar ejercicios
   - Editor visual de rutinas
   - Gráficos de progreso
   - Export/import de rutinas

---

## 📝 Notas Técnicas

### Manejo de Errores

Todos los servicios implementan:
- Try-catch con logging detallado
- Mensajes de error amigables con toast
- Fallback a datos mock cuando es apropiado
- Timeouts de 10 segundos

### Tipos TypeScript

Todos los tipos están definidos en `src/lib/services/trainer-types.ts` y son compartidos entre servicios, hooks y componentes.

### ESLint y Mejores Prácticas

- ✅ Todas las props están tipadas con interfaces
- ✅ Memoización con `useMemo` para cálculos costosos
- ✅ Loading states con Skeletons
- ✅ Error boundaries implementados
- ✅ Accesibilidad con aria-labels y tooltips

---

## 🔗 Enlaces Útiles

- [Análisis Funcionalidades Backend](../../../../ANALISIS_FUNCIONALIDADES_BACKEND.md)
- [Documentación React Query](https://tanstack.com/query/latest)
- [Documentación Shadcn/ui](https://ui.shadcn.com/)

---

**Documento generado:** Diciembre 2025  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo Squat Fit



