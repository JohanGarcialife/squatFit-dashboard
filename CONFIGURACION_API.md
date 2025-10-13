# 🔧 CONFIGURACIÓN DE API - SQUATFIT DASHBOARD

## 📋 Variables de Entorno

### 1. Crear archivo de configuración

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local
```

### 2. Configurar URL de la API

Edita `.env.local` y configura la URL de tu API:

```env
# Para desarrollo local
NEXT_PUBLIC_API_URL=https://squatfit-api-cyrc2g3zra-no.a.run.app

# Para producción
# NEXT_PUBLIC_API_URL=https://api-prod.squatfit.com
```

### 3. Reiniciar el servidor

```bash
npm run dev
```

---

## 🧪 PROBAR LA INTEGRACIÓN

### 1. **Verificar que el servidor de desarrollo esté corriendo**

```bash
npm run dev
```

### 2. **Abrir el navegador**

```
http://localhost:3000/dashboard/cursos
```

### 3. **Verificar el funcionamiento:**

#### ✅ Al cargar la página:

- Se deberían ver las cards con estadísticas dinámicas
- La tabla debería mostrar los cursos desde la API
- Si no hay cursos, debería mostrar "No hay cursos disponibles"

#### ✅ Crear un curso:

1. Click en botón "Nuevo Curso"
2. Llenar el formulario
3. Click en "Crear Curso"
4. Debería aparecer un toast de éxito
5. El curso debería aparecer en la tabla
6. Las estadísticas deberían actualizarse

#### ✅ Editar un curso:

1. Click en menú (⋮) de un curso
2. Click en "Editar curso"
3. Modificar campos
4. Click en "Actualizar Curso"
5. Toast de éxito
6. Cambios reflejados en la tabla

#### ✅ Eliminar un curso:

1. Click en menú (⋮) de un curso
2. Click en "Eliminar curso"
3. Confirmar en el dialog
4. Toast de éxito
5. Curso desaparece de la tabla
6. Estadísticas actualizadas

#### ✅ Cambiar estado:

1. Click en menú (⋮) de un curso
2. Click en "Activar" o "Desactivar"
3. Toast de éxito
4. Badge de estado cambia inmediatamente

---

## 🔍 DEBUGGING

### Ver peticiones en la consola del navegador

```javascript
// Abrir DevTools (F12) → Console
// Buscar logs como:
✅ CursosService: Obteniendo cursos...
✅ CursosService: Creando curso...
❌ CursosService: Error obteniendo cursos: [mensaje]
```

### Ver estado de React Query

1. Instalar React Query DevTools (ya incluido en desarrollo)
2. Buscar el icono de React Query en la esquina inferior derecha
3. Inspeccionar el estado de las queries:
   - `["cursos"]` - Lista de cursos
   - `["curso", id]` - Curso individual

### Errores comunes:

#### ❌ Error: "Network Error" o "Failed to fetch"

**Causa:** La API no está disponible o la URL es incorrecta  
**Solución:**

1. Verificar que `NEXT_PUBLIC_API_URL` esté configurada correctamente
2. Verificar que la API esté corriendo
3. Verificar CORS en el backend

#### ❌ Error: "Unauthorized" o 401

**Causa:** Token de autenticación no válido  
**Solución:**

1. Verificar que estés autenticado (login)
2. Verificar que el token se esté enviando correctamente
3. Ver `src/lib/services/cursos-service.ts` → `getDefaultHeaders`

#### ❌ Error: "La petición tardó demasiado tiempo"

**Causa:** Timeout de 10 segundos excedido  
**Solución:**

1. Verificar la velocidad de la conexión
2. Aumentar `REQUEST_TIMEOUT` en `cursos-service.ts`
3. Verificar que el backend no esté lento

---

## 📊 ARQUITECTURA DE LA INTEGRACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │ cursos/      │        │ use-cursos.ts│                 │
│  │ page.tsx     │───────▶│ (Hooks)      │                 │
│  └──────────────┘        └──────────────┘                 │
│                                 │                           │
│                                 ▼                           │
│                    ┌─────────────────────┐                 │
│                    │ cursos-service.ts   │                 │
│                    │ (API Client)        │                 │
│                    └─────────────────────┘                 │
│                                 │                           │
└─────────────────────────────────┼───────────────────────────┘
                                  │
                                  │ HTTP/HTTPS
                                  │ Bearer Token
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GET    /api/v1/courses          → Obtener todos           │
│  GET    /api/v1/courses/:id      → Obtener uno             │
│  POST   /api/v1/courses          → Crear                   │
│  PUT    /api/v1/courses/:id      → Actualizar              │
│  PATCH  /api/v1/courses/:id/status → Cambiar estado        │
│  DELETE /api/v1/courses/:id      → Eliminar                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 AUTENTICACIÓN

### Flujo de autenticación:

1. **Usuario hace login** → `AuthService.login()`
2. **Backend retorna token JWT**
3. **Token se guarda en:**
   - `HttpOnly Cookie` (servidor)
   - `localStorage` (cliente, fallback)
4. **En cada petición:**
   - `CursosService` obtiene el token → `getAuthToken()`
   - Token se incluye en header: `Authorization: Bearer <token>`
5. **Backend valida token**
6. **Respuesta retornada al frontend**

### Headers enviados:

```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🚀 OPTIMIZACIONES IMPLEMENTADAS

### 1. **React Query Cache**

- Los datos se guardan en caché por 1 minuto
- Refetch automático cada 5 minutos
- Refetch al volver a la ventana

### 2. **Optimistic Updates**

- Al crear/editar/eliminar, la UI se actualiza inmediatamente
- Si falla, se revierte automáticamente (rollback)

### 3. **Loading States**

- Skeleton loaders en las cards
- Spinner en la tabla
- Botones deshabilitados durante peticiones

### 4. **Error Handling**

- Toast notifications para errores
- Mensajes de error descriptivos
- Retry automático en algunos casos

### 5. **TypeScript**

- 100% tipado
- Validación con Zod
- Autocompletado completo

---

## 📦 ARCHIVOS INVOLUCRADOS

| Archivo                                        | Propósito                   |
| ---------------------------------------------- | --------------------------- |
| `src/lib/services/cursos-service.ts`           | Cliente de API              |
| `src/hooks/use-cursos.ts`                      | React Query hooks           |
| `src/app/(main)/dashboard/cursos/_components/` | Componentes UI              |
| `.env.local`                                   | Variables de entorno        |
| `src/lib/auth/auth-utils.ts`                   | Utilidades de autenticación |

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Configurar `.env.local`**
2. ✅ **Reiniciar servidor**
3. ✅ **Probar CRUD completo**
4. ⏳ **Replicar para Entrenadores**
5. ⏳ **Implementar Analíticas**
6. ⏳ **Implementar Roles**

---

## 💡 TIPS

- Usa React Query DevTools para debugging
- Revisa la consola del navegador para logs
- Usa Thunder Client / Postman para probar la API directamente
- Verifica que el backend tenga CORS habilitado para tu dominio

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [React Query Docs](https://tanstack.com/query/latest)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [SquatFit API Swagger](https://squatfit-api-cyrc2g3zra-no.a.run.app/api/docs)

---

**¡La integración está completa! 🎉**  
**Ahora puedes empezar a probar el CRUD de cursos conectado a la API real.**
