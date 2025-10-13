# Integración API de Entrenadores

## 📋 Resumen

Este documento detalla la integración completa del API de entrenadores en el dashboard.

---

## 🔌 Endpoint Implementado

### GET - Obtener todos los entrenadores

- **URL**: `/api/v1/admin-panel/coaches`
- **Método**: GET
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`

---

## 📊 Estructura de Respuesta del API

```typescript
interface EntrenadorAPI {
  id: string;
  firstName: string;
  lastName: string;
  profile_picture: string | null;
  description: string | null;
  phone: string | null;
  email: string;
  user_id: string;
  user_status: number; // 0 = Inactivo, 1 = Activo
}
```

### Ejemplo de respuesta:

```json
{
  "id": "fb4cd61c-06ed-403d-a7f8-3fa9a5b5b68d",
  "firstName": "Hamlet",
  "lastName": "Mamlet",
  "profile_picture": null,
  "description": null,
  "phone": null,
  "email": "hamlet.sosa@squatfit.com",
  "user_id": "fb4cd61c-06ed-403d-a7f8-3fa9a5b5b68d",
  "user_status": 1
}
```

---

## 🏗️ Archivos Modificados

### 1. Schema (`schema.ts`)

- **Ubicación**: `src/app/(main)/dashboard/entrenadores/_components/schema.ts`
- **Cambios**:
  - Actualizado para coincidir con la estructura del API
  - Agregado tipo `EntrenadorUI` para la interfaz de usuario
  - Mapeo de `user_status` a `status` ("Activo" | "Inactivo")

```typescript
export const entrenadorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profile_picture: z.string().nullable(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email(),
  user_id: z.string(),
  user_status: z.number(),
});

export type EntrenadorUI = Entrenador & {
  status: "Activo" | "Inactivo";
  fullName: string;
  avatar?: string;
};
```

### 2. Servicio (`entrenadores-service.ts`)

- **Ubicación**: `src/lib/services/entrenadores-service.ts`
- **Cambios**:
  - Actualizado endpoint a `/api/v1/admin-panel/coaches`
  - El API devuelve array directamente (no objeto con `data`)

```typescript
static async getEntrenadores(params?: GetEntrenadoresParams): Promise<Entrenador[]> {
  const endpoint = `/api/v1/admin-panel/coaches${queryString ? `?${queryString}` : ""}`;
  const response = await this.makeRequest<Entrenador[]>(endpoint);
  return response;
}
```

### 3. Hook (`use-entrenadores.ts`)

- **Ubicación**: `src/hooks/use-entrenadores.ts`
- **Nuevo archivo creado**
- **Funcionalidad**:
  - `useEntrenadores()`: Obtener lista de entrenadores
  - `useEntrenador(id)`: Obtener un entrenador específico
  - `useCreateEntrenador()`: Crear nuevo entrenador
  - `useUpdateEntrenador()`: Actualizar entrenador
  - `useDeleteEntrenador()`: Eliminar entrenador
  - `useToggleEntrenadorStatus()`: Cambiar estado del entrenador

### 4. Tabla (`entrenadores-table.tsx`)

- **Ubicación**: `src/app/(main)/dashboard/entrenadores/_components/entrenadores-table.tsx`
- **Cambios**:
  - Implementado `useEntrenadores()` para obtener datos del API
  - Transformación de datos de API a formato UI
  - Manejo de estados de carga y error
  - Eliminado uso de `data.json` estático

```typescript
const { data: entrenadoresData, isLoading, error } = useEntrenadores();

const entrenadores = useMemo<EntrenadorUI[]>(() => {
  if (!entrenadoresData) return [];

  return entrenadoresData.map((entrenador) => ({
    ...entrenador,
    status: entrenador.user_status === 1 ? "Activo" : "Inactivo",
    fullName: `${entrenador.firstName} ${entrenador.lastName}`,
    avatar: entrenador.profile_picture || undefined,
  }));
}, [entrenadoresData]);
```

### 5. Columnas (`columns.entrenadores.tsx`)

- **Ubicación**: `src/app/(main)/dashboard/entrenadores/_components/columns.entrenadores.tsx`
- **Cambios**:
  - Actualizado tipo a `EntrenadorUI`
  - Eliminadas columnas que no existen en el API (specialties, experience, rating, clients, hourlyRate, availability)
  - Agregadas columnas: Teléfono, Descripción
  - Actualizado avatar para mostrar `profile_picture`
  - Funcionalidad de email y teléfono con `mailto:` y `tel:`

---

## 🎯 Características Implementadas

### ✅ Integración Completa del API

- [x] Conexión con endpoint `/api/v1/admin-panel/coaches`
- [x] Autenticación con token Bearer
- [x] Manejo de errores y estados de carga
- [x] Transformación de datos del API a formato UI

### ✅ Funcionalidades de UI

- [x] Visualización de entrenadores en tabla
- [x] Búsqueda global
- [x] Avatar con fallback a iniciales
- [x] Estado del entrenador (Activo/Inactivo)
- [x] Acciones: Ver perfil, enviar email, llamar, editar, activar/desactivar, eliminar

### ✅ React Query Integration

- [x] Caché de datos (5 minutos)
- [x] Refetch automático
- [x] Optimistic updates
- [x] Manejo de errores
- [x] Invalidación de queries

---

## 🔄 Mapeo de Datos

### Del API a la UI:

```typescript
API Response          →  UI Display
-------------------------------------------
firstName            →  fullName (combinado con lastName)
lastName             →  fullName (combinado con firstName)
profile_picture      →  avatar (en Avatar component)
description          →  description (truncado en tabla)
phone                →  phone (con fallback "No disponible")
email                →  email (mostrado bajo el nombre)
user_status (0|1)    →  status ("Activo" | "Inactivo")
```

---

## 📝 Próximos Pasos (Pendientes)

### Funcionalidades por implementar:

1. **Crear Entrenador**: Formulario y modal para crear nuevo entrenador
2. **Editar Entrenador**: Formulario y modal para editar información
3. **Eliminar Entrenador**: Confirmación y eliminación
4. **Activar/Desactivar**: Toggle de estado del entrenador
5. **Ver Perfil Completo**: Modal o página con detalles completos
6. **Filtros Avanzados**: Por estado, búsqueda por nombre/email
7. **Tarjetas de Estadísticas**: Actualizar con datos reales del API

---

## 🔍 Verificación

### Para verificar que funciona correctamente:

1. **Verificar que el token de autenticación está presente**
2. **Abrir la página de entrenadores**: `/dashboard/entrenadores`
3. **Verificar en DevTools Network**:
   - Request a `/api/v1/admin-panel/coaches`
   - Header `Authorization: Bearer {token}`
   - Response con array de entrenadores
4. **Verificar en consola**: Logs de EntrenadoresService

### Logs esperados:

```
🔍 EntrenadoresService: Obteniendo entrenadores...
✅ EntrenadoresService: X entrenadores obtenidos
```

---

## ⚠️ Notas Importantes

1. **user_status**: El API devuelve un número (0 o 1), se mapea a "Activo" o "Inactivo"
2. **Campos opcionales**: `phone`, `description`, `profile_picture` pueden ser `null`
3. **Avatar**: Si no hay `profile_picture`, se muestran las iniciales
4. **Array directo**: El API devuelve un array directamente, no un objeto con `data`
5. **Autenticación**: Se requiere token Bearer válido para todas las peticiones

---

## 🛠️ Comandos de Testing

```bash
# Verificar compilación
npm run build

# Verificar tipos
npx tsc --noEmit

# Ejecutar linter
npm run lint
```

---

## 📚 Referencias

- **Servicio**: `src/lib/services/entrenadores-service.ts`
- **Hook**: `src/hooks/use-entrenadores.ts`
- **Schema**: `src/app/(main)/dashboard/entrenadores/_components/schema.ts`
- **Tabla**: `src/app/(main)/dashboard/entrenadores/_components/entrenadores-table.tsx`
- **Columnas**: `src/app/(main)/dashboard/entrenadores/_components/columns.entrenadores.tsx`
