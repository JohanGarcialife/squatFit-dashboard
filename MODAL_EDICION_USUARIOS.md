# Modal de Edición de Usuarios - Sistema Reutilizable

## 📋 Resumen

Sistema modular y reutilizable para editar información de usuarios (coaches, alumnos, etc.) con componentización óptima (todos los archivos < 300 líneas).

---

## 🔌 Endpoint Implementado

### PUT - Actualizar Usuario
- **URL**: `/api/v1/admin-panel/users/edit`
- **Método**: PUT
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`

---

## 📊 Estructura de Datos

### Request Body:
```typescript
{
  user_id: string;                    // Requerido
  firstName?: string;                 // Opcional
  lastName?: string;                  // Opcional
  email?: string;                     // Opcional
  username?: string;                  // Opcional
  phone_number?: string;              // Opcional
  birth?: string;                     // Opcional (formato: YYYY-MM-DD)
  description?: string;               // Opcional
  profile_picture?: string;           // Opcional (URL)
}
```

### Ejemplo de Request:
```json
{
  "user_id": "32ab1d00-e9b6-49fa-b4e1-c93171cd982c",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@example.com",
  "username": "juanperez",
  "phone_number": "+34612345678",
  "birth": "1990-01-15",
  "description": "Descripción del usuario",
  "profile_picture": "https://storage.googleapis.com/profile-pictures/user.jpg"
}
```

### Response (UserResponse):
```typescript
{
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  birth: string;
  profile_picture: string | null;
  description: string | null;
  phone_number: string | null;
  status: string;
  // ... otros campos
}
```

---

## 🏗️ Arquitectura del Sistema

### Estructura Modular:
```
src/
├── lib/services/
│   └── users-service.ts              (197 líneas) ✅
├── hooks/
│   └── use-update-user.ts            (43 líneas) ✅
├── components/
│   ├── forms/
│   │   └── edit-user-form.tsx        (209 líneas) ✅
│   └── modals/
│       └── edit-user-modal.tsx       (95 líneas) ✅
└── app/(main)/dashboard/
    └── entrenadores/_components/
        ├── entrenadores-table.tsx    (145 líneas) ✅
        └── columns.entrenadores.tsx  (197 líneas) ✅
```

**Total de líneas por archivo**: Todos bajo 300 líneas ✅

---

## 📁 Archivos Creados

### 1. **Servicio de Usuarios** (`users-service.ts`)
- **Ubicación**: `src/lib/services/users-service.ts`
- **Responsabilidad**: Comunicación con el API
- **Características**:
  - Método `updateUser()` para actualizar usuarios
  - Manejo de autenticación con Bearer token
  - Manejo de errores y timeouts
  - Validación de datos
  - Logs detallados

```typescript
export class UsersService {
  static async updateUser(data: UpdateUserDto): Promise<UserResponse>
}
```

### 2. **Hook de Mutación** (`use-update-user.ts`)
- **Ubicación**: `src/hooks/use-update-user.ts`
- **Responsabilidad**: Lógica de React Query para mutación
- **Características**:
  - Integración con React Query
  - Invalidación automática de queries
  - Toast notifications
  - Manejo de estados (loading, success, error)

```typescript
export function useUpdateUser()
```

### 3. **Formulario de Edición** (`edit-user-form.tsx`)
- **Ubicación**: `src/components/forms/edit-user-form.tsx`
- **Responsabilidad**: Renderizado y validación del formulario
- **Características**:
  - React Hook Form + Zod validation
  - 8 campos editables
  - Validación en tiempo real
  - Filtrado de campos vacíos
  - Grid responsive (2 columnas en desktop)

```typescript
export function EditUserForm({
  userId,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading
})
```

### 4. **Modal Reutilizable** (`edit-user-modal.tsx`)
- **Ubicación**: `src/components/modals/edit-user-modal.tsx`
- **Responsabilidad**: Wrapper del modal y lógica de UI
- **Características**:
  - Componente reutilizable
  - Títulos dinámicos por tipo de usuario
  - Gestión de estado del modal
  - Integración con EditUserForm
  - Scroll automático para contenido largo

```typescript
export function EditUserModal({
  open,
  onOpenChange,
  userId,
  userType, // "coach" | "alumno" | "usuario"
  defaultValues
})
```

---

## 🎯 Integración en Entrenadores

### Cambios en `entrenadores-table.tsx`:
1. **Estado del modal**:
```typescript
const [editingUser, setEditingUser] = useState<EntrenadorUI | null>(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
```

2. **Handlers**:
```typescript
const handleEditUser = (entrenador: EntrenadorUI) => {
  setEditingUser(entrenador);
  setIsEditModalOpen(true);
};
```

3. **Renderizado del modal**:
```typescript
{editingUser && (
  <EditUserModal
    open={isEditModalOpen}
    onOpenChange={handleCloseEditModal}
    userId={editingUser.user_id}
    userType="coach"
    defaultValues={{...}}
  />
)}
```

### Cambios en `columns.entrenadores.tsx`:
1. **Función generadora de columnas**:
```typescript
export const getEntrenadoresColumns = (
  handlers: ColumnHandlers = {}
): ColumnDef<EntrenadorUI>[]
```

2. **Handler de edición**:
```typescript
<DropdownMenuItem onClick={() => handlers.onEdit?.(entrenador)}>
  <Pencil className="mr-2 h-4 w-4" />
  Editar información
</DropdownMenuItem>
```

---

## 🔄 Flujo de Actualización

```
1. Usuario hace clic en "Editar información"
   ↓
2. Se ejecuta handleEditUser(entrenador)
   ↓
3. Se abre EditUserModal con datos precargados
   ↓
4. Usuario modifica campos y hace clic en "Guardar"
   ↓
5. EditUserForm valida datos con Zod
   ↓
6. Se llama a onSubmit del modal
   ↓
7. useUpdateUser().mutateAsync(data)
   ↓
8. UsersService.updateUser() hace PUT al API
   ↓
9. API responde con usuario actualizado
   ↓
10. React Query invalida queries relacionadas
   ↓
11. Tabla se actualiza automáticamente
   ↓
12. Modal se cierra
   ↓
13. Toast de éxito aparece
```

---

## ✅ Características Implementadas

### Validación de Formulario:
- ✅ Nombre (mínimo 1 carácter)
- ✅ Apellido (mínimo 1 carácter)
- ✅ Email (formato válido)
- ✅ Username (mínimo 3 caracteres)
- ✅ Teléfono (opcional)
- ✅ Fecha de nacimiento (tipo date)
- ✅ Descripción (textarea)
- ✅ URL de foto de perfil (formato URL válido)

### Manejo de Estados:
- ✅ Loading durante envío
- ✅ Deshabilitación de campos durante loading
- ✅ Toast notifications (loading, success, error)
- ✅ Cierre automático del modal al éxito

### Optimizaciones:
- ✅ Filtrado de campos vacíos (solo envía lo modificado)
- ✅ Invalidación de queries (actualización automática)
- ✅ Responsive design
- ✅ Scroll en modal para formularios largos

---

## 🔁 Reutilización del Sistema

### Para usar en Alumnos:
```tsx
<EditUserModal
  open={isOpen}
  onOpenChange={setIsOpen}
  userId={alumno.user_id}
  userType="alumno"  // ← Cambia el título
  defaultValues={{
    firstName: alumno.firstName,
    lastName: alumno.lastName,
    email: alumno.email,
    // ...
  }}
/>
```

### Para usar en cualquier tipo de usuario:
```tsx
<EditUserModal
  open={isOpen}
  onOpenChange={setIsOpen}
  userId={usuario.id}
  userType="usuario"  // ← Título genérico
  defaultValues={{...}}
/>
```

---

## 📝 Campos del Formulario

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| Nombre | text | ❌ | Min 1 carácter |
| Apellido | text | ❌ | Min 1 carácter |
| Email | email | ❌ | Formato email válido |
| Username | text | ❌ | Min 3 caracteres |
| Teléfono | text | ❌ | Ninguna |
| Fecha Nacimiento | date | ❌ | Ninguna |
| Descripción | textarea | ❌ | Ninguna |
| Foto Perfil | url | ❌ | Formato URL válido |

---

## 🎨 UI/UX

### Modal:
- **Tamaño**: Máximo 2xl (max-w-2xl)
- **Altura**: Máximo 90vh con scroll
- **Responsive**: Grid 2 columnas → 1 columna en mobile

### Formulario:
- **Layout**: Grid responsive
- **Botones**: Cancelar (outline) + Guardar (primary)
- **Estados**: Loading muestra "Guardando..."

### Notificaciones:
```typescript
toast.loading("Actualizando usuario...");  // Durante
toast.success("Usuario actualizado");      // Éxito
toast.error("Error al actualizar");        // Error
```

---

## 🧪 Testing

### Para probar:
1. Ir a `/dashboard/entrenadores`
2. Hacer clic en menú de acciones (⋮) de un entrenador
3. Seleccionar "Editar información"
4. Modificar campos
5. Hacer clic en "Guardar Cambios"
6. Verificar en DevTools → Network:
   - PUT a `/api/v1/admin-panel/users/edit`
   - Body con datos modificados
   - Response 200 con usuario actualizado
7. Verificar que la tabla se actualiza automáticamente

---

## 🛠️ Mantenimiento

### Para agregar un nuevo campo:
1. Agregar al schema en `edit-user-form.tsx`
2. Agregar FormField en el JSX
3. Agregar al tipo `UpdateUserDto` en `users-service.ts`
4. ¡Listo! La validación y envío es automático

### Para usar en otro módulo:
1. Importar `<EditUserModal>`
2. Agregar estado de modal
3. Pasar `userId` y `defaultValues`
4. ¡Funciona automáticamente!

---

## 📚 Referencias

### Archivos Principales:
- **Servicio**: `src/lib/services/users-service.ts`
- **Hook**: `src/hooks/use-update-user.ts`
- **Formulario**: `src/components/forms/edit-user-form.tsx`
- **Modal**: `src/components/modals/edit-user-modal.tsx`

### Librerías Utilizadas:
- React Hook Form
- Zod (validación)
- React Query (mutaciones)
- Shadcn/ui (componentes UI)
- Sonner (toast notifications)

---

## ✨ Ventajas del Sistema

1. **Modular**: Cada componente tiene una responsabilidad única
2. **Reutilizable**: Funciona para coaches, alumnos, cualquier usuario
3. **Mantenible**: Código limpio, bajo 300 líneas por archivo
4. **Type-safe**: TypeScript en todo el sistema
5. **Validado**: Zod schema para validación robusta
6. **Optimizado**: React Query para caché y refetch
7. **UX**: Loading states, toasts, validación en tiempo real
8. **Responsive**: Funciona en mobile y desktop

---

## 🚀 Estado del Proyecto

✅ **COMPLETADO**

- [x] Servicio de actualización de usuarios
- [x] Hook de mutación
- [x] Formulario de edición
- [x] Modal reutilizable
- [x] Integración en entrenadores
- [x] Validación de formularios
- [x] Manejo de errores
- [x] Toast notifications
- [x] Actualización automática de tabla
- [x] Componentización < 300 líneas
- [x] Sin errores de linter

**El sistema está listo para producción** 🎉

