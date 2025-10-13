# 🔗 ENDPOINTS DE CURSOS - DOCUMENTACIÓN COMPLETA

## 📋 INFORMACIÓN GENERAL

### **URL Base**
```
https://squatfit-api-cyrc2g3zra-no.a.run.app
```

### **Variable de Entorno**
```bash
NEXT_PUBLIC_API_URL=https://squatfit-api-cyrc2g3zra-no.a.run.app
```

### **Timeout de Peticiones**
```
10 segundos (10000ms)
```

### **Autenticación**
Todas las peticiones requieren token JWT en el header:
```
Authorization: Bearer {token}
```

---

## 📊 ENDPOINTS IMPLEMENTADOS

### **1. OBTENER TODOS LOS CURSOS** ✅

**Método:** `GET`  
**Endpoint:** `/api/v1/admin-panel/courses`  
**URL Completa:** `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/courses`

#### **Query Parameters (Opcionales):**
| Parámetro | Tipo | Valores | Descripción |
|-----------|------|---------|-------------|
| `page` | number | ≥ 1 | Número de página para paginación |
| `limit` | number | ≥ 1 | Cantidad de cursos por página |
| `status` | string | Activo, Inactivo, En Desarrollo | Filtrar por estado |
| `category` | string | - | Filtrar por categoría |
| `level` | string | Principiante, Intermedio, Avanzado | Filtrar por nivel |

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

#### **Respuesta Exitosa (200):**
```json
[
  {
    "id": "string",
    "title": "string",
    "subtitle": "string",
    "price": "string",
    "tutor": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "profile_picture": "string"
    },
    "image": "string",
    "video_presentation": "string",
    "students": 0
  }
]
```

#### **Ejemplo de Uso:**
```typescript
// Sin parámetros
const cursos = await CursosService.getCursos();

// Con filtros
const cursosActivos = await CursosService.getCursos({
  status: "Activo",
  level: "Principiante",
  page: 1,
  limit: 10
});
```

#### **Hook de React Query:**
```typescript
const { data: cursos, isLoading } = useCursos();
```

---

### **2. OBTENER CURSO POR ID** ⚠️

**Método:** `GET`  
**Endpoint:** `/api/v1/courses/{id}`  
**URL Completa:** `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/courses/{id}`

#### **Path Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | string | ✅ | ID único del curso |

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

#### **Respuesta Exitosa (200):**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "instructor": "string",
    "price": 0,
    "status": "Activo",
    "students": 0
  }
}
```

#### **Ejemplo de Uso:**
```typescript
const curso = await CursosService.getCursoById("curso-123");
```

#### **Hook de React Query:**
```typescript
const { data: curso } = useCurso("curso-123");
```

---

### **3. CREAR NUEVO CURSO** ✅

**Método:** `POST`  
**Endpoint:** `/api/v1/admin-panel/courses`  
**URL Completa:** `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/courses`

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

#### **Body (JSON) - Formato de la API:**
```json
{
  "id": "string",
  "title": "string",
  "subtitle": "string",
  "price": "string",
  "tutor_id": "string",
  "image": "string",
  "video_presentation": "string"
}
```

#### **Campos Requeridos:**
- ✅ `title` - Nombre del curso
- ✅ `subtitle` - Descripción del curso
- ✅ `price` - Precio como string (ej: "49.99")
- ✅ `tutor_id` - ID del tutor/instructor

#### **Campos Opcionales:**
- `id` - ID del curso (generado por el backend si no se provee)
- `image` - URL de la imagen del curso
- `video_presentation` - URL del video de presentación

#### **Nota sobre la Transformación:**
El formulario de la UI usa campos diferentes que se transforman automáticamente:
- `name` → `title`
- `description` → `subtitle`
- `price` (number) → `price` (string)
- `instructor` → `tutor_id` (⚠️ Ver nota abajo)

> ⚠️ **IMPORTANTE:** Actualmente, el campo `instructor` del formulario se usa directamente como `tutor_id`. En el futuro, deberías implementar un selector de tutores que devuelva el ID real del tutor.

#### **Respuesta Exitosa (201):**
```json
{
  "data": {
    "id": "nuevo-curso-id",
    "name": "string",
    "description": "string",
    "instructor": "string",
    "price": 0,
    "status": "En Desarrollo"
  }
}
```

#### **Ejemplo de Uso:**
```typescript
const nuevoCurso = await CursosService.createCurso({
  name: "Yoga para Principiantes",
  description: "Curso completo de yoga desde cero",
  instructor: "Ana García",
  price: 49.99,
  duration: "8 semanas",
  level: "Principiante",
  category: "Yoga"
});
```

#### **Hook de React Query:**
```typescript
const createMutation = useCreateCurso();
createMutation.mutate({
  name: "Yoga para Principiantes",
  // ...otros campos
});
```

---

### **4. ACTUALIZAR CURSO** ✅

**Método:** `PUT`  
**Endpoint:** `/api/v1/admin-panel/courses?course_id={id}`  
**URL Completa:** `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/courses?course_id={id}`

#### **Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `course_id` | string | ✅ | ID único del curso a actualizar |

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

#### **Body (JSON) - Formato de la API:**
```json
{
  "title": "string",
  "subtitle": "string",
  "price": "string",
  "tutor_id": "string",
  "image": "string",
  "video_presentation": "string"
}
```

> **Nota:** Todos los campos son opcionales. Solo envía los que quieres actualizar.

#### **Transformación Automática:**
Al igual que en CREATE, los datos del formulario se transforman:
- `name` → `title`
- `description` → `subtitle`
- `price` (number) → `price` (string)
- `instructor` → `tutor_id`

#### **Respuesta Exitosa (200):**
```json
{
  "data": {
    "id": "curso-id",
    "name": "string actualizado",
    "description": "string actualizado",
    // ...otros campos actualizados
  }
}
```

#### **Ejemplo de Uso:**
```typescript
const cursoActualizado = await CursosService.updateCurso("curso-123", {
  name: "Nuevo nombre del curso",
  price: 59.99
});
```

#### **Hook de React Query:**
```typescript
const updateMutation = useUpdateCurso();
updateMutation.mutate({
  id: "curso-123",
  data: {
    name: "Nuevo nombre",
    price: 59.99
  }
});
```

---

### **5. ELIMINAR CURSO** ⚠️

**Método:** `DELETE`  
**Endpoint:** `/api/v1/courses/{id}`  
**URL Completa:** `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/courses/{id}`

#### **Path Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | string | ✅ | ID único del curso a eliminar |

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

#### **Respuesta Exitosa (200 o 204):**
```json
{
  "success": true,
  "message": "Curso eliminado exitosamente"
}
```

#### **Ejemplo de Uso:**
```typescript
await CursosService.deleteCurso("curso-123");
```

#### **Hook de React Query:**
```typescript
const deleteMutation = useDeleteCurso();
deleteMutation.mutate("curso-123");
```

---

### **6. CAMBIAR ESTADO DE CURSO** ✅

**Método:** `PUT`  
**Endpoint:** `/api/v1/admin-panel/courses/status`  
**URL Completa:** `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/courses/status`

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

#### **Body (JSON):**
```json
{
  "course_id": "123e4567-e89b-12d3-a456-426614174000",
  "active": true
}
```

> **Nota:** 
> - `course_id`: ID único del curso
> - `active`: `true` para activar, `false` para desactivar

#### **Transformación Automática:**
Los datos del UI se transforman:
- `status: "Activo"` → `active: true`
- `status: "Inactivo"` → `active: false`

#### **Respuesta Exitosa (200):**
```json
{
  "data": {
    "id": "curso-id",
    "status": "Activo",
    // ...otros campos
  }
}
```

#### **Ejemplo de Uso:**
```typescript
const cursoActualizado = await CursosService.toggleCursoStatus("curso-123", "Activo");
```

#### **Hook de React Query:**
```typescript
const toggleMutation = useToggleCursoStatus();
toggleMutation.mutate({
  id: "curso-123",
  status: "Activo"
});
```

---

### **7. HEALTH CHECK** ⚠️

**Método:** `GET`  
**Endpoint:** `/api/v1/health`  
**URL Completa:** `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/health`

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

#### **Respuesta Exitosa (200):**
```json
{
  "status": "ok"
}
```

#### **Ejemplo de Uso:**
```typescript
const isConnected = await CursosService.healthCheck();
console.log("API disponible:", isConnected); // true o false
```

---

## 🔍 ESTADOS DE LOS ENDPOINTS

| Endpoint | Estado | Nota |
|----------|--------|------|
| `GET /api/v1/course/all` | ✅ **CONFIRMADO** | Funciona correctamente |
| `GET /api/v1/courses/{id}` | ⚠️ **NO VERIFICADO** | Pendiente de confirmación |
| `POST /api/v1/courses` | ⚠️ **NO VERIFICADO** | Pendiente de confirmación |
| `PUT /api/v1/courses/{id}` | ⚠️ **NO VERIFICADO** | Pendiente de confirmación |
| `DELETE /api/v1/courses/{id}` | ⚠️ **NO VERIFICADO** | Pendiente de confirmación |
| `PATCH /api/v1/courses/{id}/toggle-status` | ⚠️ **NO VERIFICADO** | Pendiente de confirmación |
| `GET /api/v1/health` | ⚠️ **NO VERIFICADO** | Pendiente de confirmación |

---

## ⚠️ DISCREPANCIAS ENCONTRADAS

### **Endpoint GET /api/v1/admin-panel/courses**

- **Actualmente usando:** `/api/v1/admin-panel/courses` ✅
- **Patrón:** Endpoint específico para panel de administración

**Nota:** Este endpoint está bajo la ruta `/admin-panel/` lo que indica que es específico para el dashboard administrativo.

---

## 🔐 AUTENTICACIÓN

### **Headers Requeridos:**
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

### **Obtención del Token:**
1. **Primero:** Cookie HttpOnly (servidor)
2. **Fallback:** localStorage.getItem("authToken")

### **Manejo de Errores de Autenticación:**
- **401 Unauthorized:** Token inválido o expirado
- **403 Forbidden:** Sin permisos para esta operación

---

## 📊 ESTRUCTURA DE RESPUESTA DE LA API

### **Formato Esperado:**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### **Formato REAL Recibido:**
```json
[
  {
    "id": "string",
    "title": "string",
    "subtitle": "string",
    "price": "string",
    "tutor": { ... },
    "image": "string",
    "video_presentation": "string",
    "students": 0
  }
]
```

**Nota:** La API devuelve directamente un array, no un objeto con `data`.

---

## 🔄 TRANSFORMACIÓN DE DATOS

### **Mapeo API → UI:**

| Campo API | Campo UI | Transformación |
|-----------|----------|----------------|
| `title` | `name` | Directo |
| `subtitle` | `description` | Default: "Sin descripción" |
| `price` (string) | `price` (number) | parseFloat() |
| `tutor.firstName + lastName` | `instructor` | Concatenación |
| `students` | `students` | Directo |
| `image` | `thumbnail` | Directo |
| `video_presentation` | `videoPresentation` | Directo |

### **Campos con Valores por Defecto:**
- `currency` = "€"
- `status` = "Activo"
- `duration` = "8 semanas"
- `level` = "Principiante"
- `category` = "General"

---

## 🧪 TESTING

### **Probar en Thunder Client / Postman:**

#### **1. Obtener todos los cursos:**
```bash
GET https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/courses
Headers:
  Content-Type: application/json
  Authorization: Bearer {tu_token}
```

#### **2. Crear un curso:**
```bash
POST https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/courses
Headers:
  Content-Type: application/json
  Authorization: Bearer {tu_token}
Body:
  {
    "title": "Yoga para Principiantes",
    "subtitle": "Curso completo de yoga desde cero",
    "price": "49.99",
    "tutor_id": "tutor-id-123",
    "image": "https://example.com/image.jpg",
    "video_presentation": "https://example.com/video.mp4"
  }
```

---

## 📝 NOTAS IMPORTANTES

### **1. Timeout:**
- Todas las peticiones tienen timeout de **10 segundos**
- Si la petición excede este tiempo, se aborta automáticamente

### **2. Error Handling:**
- Los errores se manejan automáticamente
- Se muestran toasts con mensajes de error
- Los logs detallados aparecen en la consola

### **3. Optimistic Updates:**
- React Query implementa actualizaciones optimistas
- La UI se actualiza inmediatamente
- Si falla, se revierte automáticamente

### **4. Cache:**
- Los datos se cachean por **1 minuto** (staleTime)
- Refetch automático cada **5 minutos**
- Refetch al volver a la ventana activa

---

## 🔗 ARCHIVOS RELACIONADOS

| Archivo | Descripción |
|---------|-------------|
| `src/lib/services/cursos-service.ts` | Servicio completo de API |
| `src/hooks/use-cursos.ts` | Hooks de React Query |
| `src/app/(main)/dashboard/cursos/_components/schema.ts` | Schemas y tipos |
| `src/app/(main)/dashboard/cursos/_components/cursos-table.tsx` | Tabla de cursos |

---

## ✅ TODO LIST

- [ ] Confirmar URLs correctas de endpoints no verificados
- [ ] Probar endpoint de crear curso
- [ ] Probar endpoint de actualizar curso
- [ ] Probar endpoint de eliminar curso
- [ ] Probar endpoint de cambiar estado
- [ ] Verificar estructura de respuesta esperada vs real
- [ ] Documentar códigos de error posibles
- [ ] Agregar ejemplos de manejo de errores

---

## 📞 CONTACTO / SOPORTE

Si encuentras algún error o discrepancia en los endpoints, por favor:

1. Verifica en Swagger: `https://squatfit-api-cyrc2g3zra-no.a.run.app/api/docs`
2. Revisa los logs en la consola del navegador
3. Usa Thunder Client o Postman para probar directamente
4. Actualiza este documento con los hallazgos

---

**Última Actualización:** Octubre 2024  
**Versión de la API:** v1  
**Estado:** En Desarrollo 🚧

