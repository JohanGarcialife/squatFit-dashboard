# Guía de Uso Rápido - Modal de Edición de Usuarios

## 🚀 Inicio Rápido

### Paso 1: Importar el Modal
```tsx
import { EditUserModal } from "@/components/modals/edit-user-modal";
```

### Paso 2: Agregar Estado
```tsx
const [editingUser, setEditingUser] = useState<YourUserType | null>(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
```

### Paso 3: Crear Handlers
```tsx
const handleEditUser = (user: YourUserType) => {
  setEditingUser(user);
  setIsEditModalOpen(true);
};

const handleCloseEditModal = () => {
  setIsEditModalOpen(false);
  setEditingUser(null);
};
```

### Paso 4: Renderizar el Modal
```tsx
{editingUser && (
  <EditUserModal
    open={isEditModalOpen}
    onOpenChange={handleCloseEditModal}
    userId={editingUser.user_id}
    userType="coach" // o "alumno" o "usuario"
    defaultValues={{
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      email: editingUser.email,
      phone_number: editingUser.phone,
      description: editingUser.description,
      profile_picture: editingUser.profile_picture,
    }}
  />
)}
```

### Paso 5: Conectar con Botón/Acción
```tsx
<Button onClick={() => handleEditUser(usuario)}>
  Editar Usuario
</Button>
```

---

## 📋 Ejemplo Completo - Coach

```tsx
"use client";

import { useState } from "react";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { Button } from "@/components/ui/button";

export function CoachesPage() {
  const [editingCoach, setEditingCoach] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Obtener coaches del API
  const { data: coaches } = useCoaches();

  const handleEditCoach = (coach) => {
    setEditingCoach(coach);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingCoach(null);
  };

  return (
    <div>
      {/* Lista de coaches */}
      {coaches?.map((coach) => (
        <div key={coach.id}>
          <span>{coach.firstName} {coach.lastName}</span>
          <Button onClick={() => handleEditCoach(coach)}>
            Editar
          </Button>
        </div>
      ))}

      {/* Modal de edición */}
      {editingCoach && (
        <EditUserModal
          open={isEditModalOpen}
          onOpenChange={handleCloseModal}
          userId={editingCoach.user_id}
          userType="coach"
          defaultValues={{
            firstName: editingCoach.firstName,
            lastName: editingCoach.lastName,
            email: editingCoach.email,
            phone_number: editingCoach.phone,
            description: editingCoach.description,
            profile_picture: editingCoach.profile_picture,
          }}
        />
      )}
    </div>
  );
}
```

---

## 📋 Ejemplo Completo - Alumnos

```tsx
"use client";

import { useState } from "react";
import { EditUserModal } from "@/components/modals/edit-user-modal";

export function AlumnosPage() {
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: alumnos } = useAlumnos();

  const handleEditAlumno = (alumno) => {
    setEditingAlumno(alumno);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      {/* Tu tabla o lista de alumnos */}
      
      {/* Modal de edición */}
      {editingAlumno && (
        <EditUserModal
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setEditingAlumno(null);
          }}
          userId={editingAlumno.user_id}
          userType="alumno"
          defaultValues={{
            firstName: editingAlumno.firstName,
            lastName: editingAlumno.lastName,
            email: editingAlumno.email,
            username: alumno.username,
            birth: alumno.birth,
          }}
        />
      )}
    </div>
  );
}
```

---

## 📋 Ejemplo con DataTable

```tsx
// En tu archivo de columnas (columns.tsx)

export const getColumns = (handlers) => [
  // ... otras columnas
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Acciones</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handlers.onEdit?.(user)}>
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// En tu componente de tabla

export function UserTable() {
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const columns = useMemo(
    () => getColumns({ onEdit: handleEditUser }),
    [handleEditUser]
  );

  return (
    <>
      <DataTable columns={columns} data={users} />
      
      {editingUser && (
        <EditUserModal
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setEditingUser(null);
          }}
          userId={editingUser.user_id}
          userType="usuario"
          defaultValues={{
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            email: editingUser.email,
          }}
        />
      )}
    </>
  );
}
```

---

## 🎨 Props del EditUserModal

```typescript
interface EditUserModalProps {
  open: boolean;                    // Estado del modal
  onOpenChange: (open: boolean) => void;  // Callback para cerrar
  userId: string;                   // ID del usuario a editar (REQUERIDO)
  userType?: "coach" | "alumno" | "usuario";  // Tipo (afecta título)
  defaultValues?: {                 // Valores iniciales del formulario
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    phone_number?: string;
    birth?: string;                 // Formato: YYYY-MM-DD
    description?: string;
    profile_picture?: string;       // URL
  };
}
```

---

## 🔄 Actualización Automática

El modal automáticamente:
1. ✅ Invalida las queries de entrenadores
2. ✅ Invalida las queries de alumnos
3. ✅ Invalida las queries de usuarios
4. ✅ Cierra el modal al éxito
5. ✅ Muestra toast de éxito/error

**No necesitas hacer nada extra**, la tabla se actualiza sola.

---

## 📝 Valores por Defecto

### Solo campos que quieras editar:
```tsx
defaultValues={{
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
}}
```

### Todos los campos:
```tsx
defaultValues={{
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  username: user.username,
  phone_number: user.phone,
  birth: user.birthDate,
  description: user.description,
  profile_picture: user.avatar,
}}
```

---

## ⚠️ Notas Importantes

1. **userId es requerido**: Siempre debe tener el `user_id` del usuario a editar
2. **Formato de fecha**: `birth` debe estar en formato `YYYY-MM-DD`
3. **URL de imagen**: `profile_picture` debe ser una URL válida o cadena vacía
4. **Campos opcionales**: Todos los campos del formulario son opcionales
5. **Envío inteligente**: Solo se envían los campos que tienen valor

---

## 🎯 Tipos de Usuario

### Coach:
```tsx
userType="coach"
// Título: "Editar Entrenador"
```

### Alumno:
```tsx
userType="alumno"
// Título: "Editar Alumno"
```

### Usuario Genérico:
```tsx
userType="usuario"
// Título: "Editar Usuario"
```

---

## 🐛 Troubleshooting

### El modal no se abre:
- Verifica que `open={isEditModalOpen}` esté en `true`
- Verifica que `editingUser` no sea `null`

### La tabla no se actualiza:
- El modal invalida automáticamente las queries
- Verifica que uses React Query para obtener los datos

### Los valores no se cargan:
- Verifica que `defaultValues` tenga los campos correctos
- Verifica que `userId` sea el correcto

### Error de validación:
- Email debe ser formato válido
- URL de foto debe ser formato válido
- Username debe tener mínimo 3 caracteres

---

## 📚 Recursos

- **Documentación completa**: Ver `MODAL_EDICION_USUARIOS.md`
- **Componente**: `src/components/modals/edit-user-modal.tsx`
- **Formulario**: `src/components/forms/edit-user-form.tsx`
- **Servicio**: `src/lib/services/users-service.ts`
- **Hook**: `src/hooks/use-update-user.ts`

---

## ✨ Ejemplo Mínimo

```tsx
import { EditUserModal } from "@/components/modals/edit-user-modal";

export function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Editar</Button>
      
      <EditUserModal
        open={open}
        onOpenChange={setOpen}
        userId="user-id-here"
        userType="usuario"
        defaultValues={{
          firstName: "Juan",
          lastName: "Pérez",
        }}
      />
    </>
  );
}
```

¡Eso es todo! El modal se encarga del resto. 🎉

