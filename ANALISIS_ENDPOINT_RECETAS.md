# 📋 Análisis Detallado: Endpoint de Creación de Recetas

**Fecha de análisis:** Diciembre 2024  
**Versión del sistema:** Backend NestJS + Frontend Next.js (Squat Fit Dashboard)

---

## 📊 Resumen Ejecutivo

### Estado Actual

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Endpoint Backend** | ✅ **Implementado** | `POST /api/v1/recipe/create` |
| **Endpoint Imagen** | ✅ **Implementado** | `PUT /api/v1/recipe/upload-receipe-image` |
| **Servicio Frontend** | ✅ **Implementado** | `createRecipe()` en `recipe-service.ts` |
| **Hook React** | ✅ **Implementado** | `useCrearReceta()` en `use-recetas.ts` |
| **UI Componente** | ❌ **NO Implementado** | Botón "Nueva Receta" sin funcionalidad |

### Conclusión

El backend y la infraestructura del frontend están **completamente implementados** para crear recetas. Sin embargo, **falta conectar la UI** con estos servicios. El botón "Nueva Receta" en el componente `BancoRecetas` no tiene ninguna acción asociada..

---

## 🔍 Análisis Detallado del Backend

### 1. Endpoint de Creación de Recetas

#### `POST /api/v1/recipe/create`

**Ubicación en Backend:**
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts`
- **Método:** POST
- **Ruta:** `/api/v1/recipe/create`

**Autenticación:**
- ✅ Requerida (Bearer Token)
- El usuario debe estar autenticado para crear recetas

**Body Request:**
```json
{
  "name": "Nombre de la receta",
  "description": "Descripción opcional",
  "kcal": 350,
  "carbohydrates": 45,
  "proteins": 25,
  "fats": 10
}
```

**Campos Requeridos:**
- `name` (string): Nombre de la receta
- `kcal` (number): Calorías totales de la receta
- `carbohydrates` (number): Gramos de carbohidratos totales
- `proteins` (number): Gramos de proteínas totales
- `fats` (number): Gramos de grasas totales

**Campos Opcionales:**
- `description` (string): Descripción de la receta

**Respuesta Exitosa:**
```json
{
  "id": "uuid-de-receta",
  "name": "Nombre de la receta",
  "description": "Descripción",
  "kcal": 350,
  "carbohydrates": 45,
  "proteins": 25,
  "fats": 10,
  "image": null,
  "user_id": "uuid-del-usuario",
  "created_at": "2024-12-01T10:00:00.000Z",
  "updated_at": "2024-12-01T10:00:00.000Z"
}
```

**Notas Importantes:**
- La receta se asocia automáticamente al usuario autenticado
- El campo `image` inicialmente es `null` (se puede subir después)
- No se pueden enviar ingredientes o instrucciones en este endpoint
- El backend no almacena información sobre porciones, tiempo de preparación, dificultad, etc.

---

### 2. Endpoint de Subida de Imagen

#### `PUT /api/v1/recipe/upload-receipe-image`

**Ubicación en Backend:**
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts` (líneas 120-140)
- **Método:** PUT
- **Ruta:** `/api/v1/recipe/upload-receipe-image`

**Autenticación:**
- ✅ Requerida (Bearer Token)

**Query Parameters:**
- `recipe_id` (string, requerido): ID de la receta a la que se le subirá la imagen

**Content-Type:**
- `multipart/form-data`

**Body Request:**
- `file` (File): Archivo de imagen

**Respuesta Exitosa:**
```json
{
  "id": "uuid-de-receta",
  "name": "Nombre de la receta",
  "description": "Descripción",
  "kcal": 350,
  "carbohydrates": 45,
  "proteins": 25,
  "fats": 10,
  "image": "https://storage.googleapis.com/bucket/food/{userId}/{id}/{timestamp}_{filename}",
  "user_id": "uuid-del-usuario",
  "created_at": "2024-12-01T10:00:00.000Z",
  "updated_at": "2024-12-01T10:00:00.000Z"
}
```

**Almacenamiento:**
- Las imágenes se almacenan en **Google Cloud Storage**
- Ruta: `food/{userId}/{recipeId}/{timestamp}_{filename}`
- Configuración: Variable de entorno `GCP_BUCKET_NAME`

**Servicio Backend:**
- `CloudStorageService` en `src/core/gcp/cloud-storage.service.ts`
- Método: `uploadFile()` o `uploadPrivateFile()`

---

## 🎨 Análisis Detallado del Frontend

### 1. Servicio de Recetas

#### Archivo: `src/lib/services/recipe-service.ts`

**Función: `createRecipe()`**

```typescript
export async function createRecipe(data: CreateRecipePayload): Promise<CreateRecipeResponse> {
  try {
    const response = await apiClient.post<CreateRecipeResponse>("/api/v1/recipe/create", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear receta:", error);
    throw error;
  }
}
```

**Características:**
- ✅ Implementada correctamente
- ✅ Maneja errores con try/catch
- ✅ Usa el cliente API configurado (`apiClient`)
- ✅ Tipado con TypeScript

**Función: `uploadRecipeImage()`**

```typescript
export async function uploadRecipeImage(recipeId: string, file: File): Promise<BackendRecipe> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.put<BackendRecipe>(
      `/api/v1/recipe/upload-receipe-image?recipe_id=${recipeId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error al subir imagen de receta:", error);
    throw error;
  }
}
```

**Características:**
- ✅ Implementada correctamente
- ✅ Crea FormData para multipart/form-data
- ✅ Configura headers correctamente
- ✅ Pasa `recipe_id` como query parameter

---

### 2. Tipos TypeScript

#### Archivo: `src/lib/services/recipe-types.ts`

**Interfaz: `CreateRecipePayload`**

```typescript
export interface CreateRecipePayload {
  name: string;
  description?: string;
  kcal: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
}
```

**Interfaz: `BackendRecipe`**

```typescript
export interface BackendRecipe {
  id: string;
  name: string;
  description?: string;
  kcal: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  image?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}
```

**Función de Transformación: `transformUIToBackend()`**

```typescript
export function transformUIToBackend(uiRecipe: Partial<Receta>): CreateRecipePayload {
  return {
    name: uiRecipe.nombre || "",
    description: uiRecipe.descripcion,
    kcal: uiRecipe.caloriasTotal || 0,
    carbohydrates: uiRecipe.carbohidratosTotal || 0,
    proteins: uiRecipe.proteinasTotal || 0,
    fats: uiRecipe.grasasTotal || 0,
  };
}
```

**Análisis:**
- ✅ Transforma correctamente del formato UI al formato Backend
- ⚠️ **Limitación:** Solo mapea los campos que el backend acepta
- ⚠️ **Pérdida de datos:** Campos como `ingredientes`, `instrucciones`, `tiempoPreparacion`, `porciones`, `dificultad`, `etiquetas` no se envían al backend

---

### 3. Hook de React Query

#### Archivo: `src/hooks/use-recetas.ts`

**Hook: `useCrearReceta()`**

```typescript
export function useCrearReceta() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (receta: Partial<Receta>) => {
      const payload = transformUIToBackend(receta);
      const backendRecipe = await createRecipe(payload);
      return transformBackendToUI(backendRecipe);
    },
    onSuccess: () => {
      // Invalidar las queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      toast.success("Receta creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear receta: ${error.message}`);
    },
  });

  return {
    crearReceta: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
```

**Características:**
- ✅ Implementado correctamente
- ✅ Usa React Query para manejo de estado
- ✅ Invalida queries después de crear (refresca la lista)
- ✅ Muestra notificaciones de éxito/error con `toast`
- ✅ Transforma datos UI → Backend → UI

**Hook: `useSubirImagenReceta()`**

```typescript
export function useSubirImagenReceta() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ recipeId, file }: { recipeId: string; file: File }) => {
      const backendRecipe = await uploadRecipeImage(recipeId, file);
      return transformBackendToUI(backendRecipe);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      toast.success("Imagen subida exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al subir imagen: ${error.message}`);
    },
  });

  return {
    subirImagen: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
```

**Características:**
- ✅ Implementado correctamente
- ✅ Maneja la subida de imágenes de forma asíncrona
- ✅ Refresca la lista después de subir

---

### 4. Componente UI: Banco de Recetas

#### Archivo: `src/app/(main)/dashboard/dieta/_components/banco-recetas.tsx`

**Estado Actual:**

```typescript
<Button size="sm">
  <Plus className="mr-2 size-4" />
  Nueva Receta
</Button>
```

**Problema Identificado:**
- ❌ El botón **NO tiene** un `onClick` handler
- ❌ **NO está conectado** al hook `useCrearReceta()`
- ❌ **NO abre** ningún modal o formulario
- ❌ **NO tiene** funcionalidad implementada

**Línea del código:**
- **Línea 397-400:** Botón "Nueva Receta" sin funcionalidad

**Hooks Importados:**
```typescript
import { useRecetas, useDuplicarReceta } from "@/hooks/use-recetas";
```

**Observación:**
- ✅ Se importa `useRecetas` (para listar)
- ✅ Se importa `useDuplicarReceta` (para duplicar)
- ❌ **NO se importa** `useCrearReceta` (para crear)

---

## 🔄 Flujo de Datos Actual vs Esperado

### Flujo Actual (Incompleto)

```
Usuario → Click "Nueva Receta" → ❌ NADA (sin acción)
```

### Flujo Esperado (Debería ser)

```
Usuario → Click "Nueva Receta" 
  → Abre Modal/Dialog con Formulario
  → Usuario completa formulario
  → Click "Crear"
  → useCrearReceta() 
  → transformUIToBackend()
  → createRecipe() (service)
  → POST /api/v1/recipe/create (backend)
  → Respuesta exitosa
  → invalidateQueries() (refresca lista)
  → toast.success()
  → Cierra modal
```

---

## 📝 Limitaciones y Consideraciones

### 1. Limitaciones del Backend

**Campos que NO se pueden enviar:**
- ❌ `ingredientes` (array de ingredientes)
- ❌ `instrucciones` (array de pasos)
- ❌ `tiempoPreparacion` (minutos)
- ❌ `porciones` (número de porciones)
- ❌ `dificultad` (fácil, media, difícil)
- ❌ `etiquetas` (vegano, sin gluten, etc.)
- ❌ `tipoComida` (desayuno, almuerzo, etc.)
- ❌ `estado` (borrador, publicado, archivado)

**Solo se pueden enviar:**
- ✅ `name` (nombre)
- ✅ `description` (descripción)
- ✅ `kcal` (calorías totales)
- ✅ `carbohydrates` (carbohidratos totales)
- ✅ `proteins` (proteínas totales)
- ✅ `fats` (grasas totales)

### 2. Limitaciones del Frontend

**Esquema UI vs Backend:**

El frontend tiene un esquema más completo (`Receta` en `schema.ts`):
```typescript
{
  id, nombre, descripcion, imagen,
  tipoComida, tiempoPreparacion, porciones, dificultad,
  ingredientes[], instrucciones[],
  caloriasTotal, proteinasTotal, carbohidratosTotal, grasasTotal,
  caloriasPorcion, proteinasPorcion, carbohidratosPorcion, grasasPorcion,
  etiquetas[], estado,
  createdAt, updatedAt
}
```

El backend solo acepta:
```typescript
{
  name, description, kcal, carbohydrates, proteins, fats
}
```

**Transformación:**
- La función `transformUIToBackend()` solo mapea los campos compatibles
- Los demás campos se **pierden** al crear la receta
- Al transformar de vuelta (`transformBackendToUI()`), se usan valores por defecto:
  - `porciones: 1` (default)
  - `tiempoPreparacion: 30` (default)
  - `dificultad: "media"` (default)
  - `ingredientes: []` (vacío)
  - `instrucciones: []` (vacío)
  - `etiquetas: []` (vacío)
  - `tipoComida: "comida"` (default)
  - `estado: "publicado"` (default)

---

## 🎯 Recomendaciones

### 1. Implementar UI de Creación (Prioridad Alta)

**Acción Requerida:**
- Crear componente `CreateRecipeModal` o `CreateRecipeDialog`
- Conectar el botón "Nueva Receta" con este componente
- Implementar formulario con campos compatibles con el backend

**Campos del Formulario:**
- ✅ Nombre (requerido)
- ✅ Descripción (opcional)
- ✅ Calorías totales (requerido)
- ✅ Carbohidratos totales (requerido)
- ✅ Proteínas totales (requerido)
- ✅ Grasas totales (requerido)
- ✅ Imagen (opcional, subir después de crear)

**Estructura Sugerida:**
```
CreateRecipeModal
  ├── Form (react-hook-form + zod)
  ├── Campos básicos (nombre, descripción)
  ├── Campos nutricionales (kcal, carbs, proteins, fats)
  ├── Botón "Subir Imagen" (opcional, después de crear)
  └── Botones (Cancelar, Crear)
```

### 2. Mejorar Transformación de Datos (Prioridad Media)

**Consideraciones:**
- Si el backend no soporta más campos, mantener la transformación actual
- Si se planea extender el backend, preparar la transformación para futuros campos
- Documentar qué campos se pierden en la transformación

### 3. Extender Backend (Prioridad Baja - Futuro)

**Endpoints Adicionales Necesarios:**
- `PUT /api/v1/recipe/:id` - Actualizar receta
- `DELETE /api/v1/recipe/:id` - Eliminar receta
- `GET /api/v1/recipe/:id` - Obtener receta por ID

**Campos Adicionales a Agregar:**
- `ingredientes` (array)
- `instrucciones` (array)
- `tiempoPreparacion` (number)
- `porciones` (number)
- `dificultad` (enum)
- `etiquetas` (array)
- `tipoComida` (enum)
- `estado` (enum)

---

## 📂 Archivos Clave

### Backend
- `src/squat-fit/recipe/controller/recipe.controller.ts` - Controlador con endpoints
- `src/squat-fit/recipe/services/recipe.service.ts` - Lógica de negocio
- `src/core/gcp/cloud-storage.service.ts` - Servicio de almacenamiento

### Frontend
- `src/lib/services/recipe-service.ts` - Servicio de API
- `src/lib/services/recipe-types.ts` - Tipos TypeScript
- `src/hooks/use-recetas.ts` - Hooks de React Query
- `src/app/(main)/dashboard/dieta/_components/banco-recetas.tsx` - Componente UI (incompleto)
- `src/app/(main)/dashboard/dieta/_components/schema.ts` - Esquemas Zod

---

## ✅ Checklist de Implementación

### Para Completar la Funcionalidad de Creación

- [ ] Crear componente `CreateRecipeModal` o `CreateRecipeDialog`
- [ ] Implementar formulario con validación (Zod + react-hook-form)
- [ ] Conectar botón "Nueva Receta" con el modal
- [ ] Usar hook `useCrearReceta()` en el componente
- [ ] Manejar estados de carga y error
- [ ] Implementar subida de imagen opcional (después de crear)
- [ ] Probar flujo completo de creación
- [ ] Validar que la lista se refresca después de crear

### Para Mejorar la Experiencia

- [ ] Agregar validación de campos (kcal > 0, etc.)
- [ ] Mostrar preview de imagen antes de subir
- [ ] Agregar calculadora de macros (opcional)
- [ ] Permitir guardar como borrador (si backend lo soporta)
- [ ] Agregar confirmación antes de crear

---

## 🔗 Referencias

- **Documento de Análisis Backend:** `ANALISIS_FUNCIONALIDADES_BACKEND.md`
- **Endpoint Backend:** `POST /api/v1/recipe/create`
- **Endpoint Imagen:** `PUT /api/v1/recipe/upload-receipe-image`
- **Servicio Frontend:** `src/lib/services/recipe-service.ts`
- **Hook Frontend:** `src/hooks/use-recetas.ts`

---

**Documento generado el:** Diciembre 2024  
**Última actualización:** Análisis del código actual del repositorio

