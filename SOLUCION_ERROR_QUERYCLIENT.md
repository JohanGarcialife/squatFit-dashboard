# ✅ SOLUCIÓN: Error "No QueryClient set"

## 🔴 Error Original

```
Error: No QueryClient set, use QueryClientProvider to set one
```

## ✅ SOLUCIÓN APLICADA

He agregado el `QueryClientProvider` de React Query al layout principal de la aplicación.

### Archivos modificados:

#### 1. **Nuevo archivo:** `src/providers/query-provider.tsx`

```typescript
✅ QueryClientProvider configurado
✅ QueryClient con opciones optimizadas
✅ React Query DevTools incluidas
✅ Compatible con Next.js 15 SSR
```

#### 2. **Modificado:** `src/app/layout.tsx`

```typescript
✅ Importado QueryProvider
✅ Agregado al árbol de providers
✅ Orden correcto: ThemeProvider > QueryProvider > AuthProvider
```

---

## 🚀 CÓMO PROBAR LA SOLUCIÓN

### **Paso 1: Detener el servidor**

```bash
Ctrl + C
```

### **Paso 2: Reiniciar el servidor**

```bash
npm run dev
```

### **Paso 3: Abrir la página de cursos**

```
http://localhost:3000/dashboard/cursos
```

### **✅ Resultado esperado:**

- ✅ La página debería cargar sin errores
- ✅ Deberías ver las cards de estadísticas
- ✅ Deberías ver la tabla de cursos (o mensaje de carga)
- ✅ En la esquina inferior derecha verás el ícono de React Query DevTools (🌸)

---

## 🔍 QUÉ SE CONFIGURÓ

### **QueryClient con opciones optimizadas:**

```typescript
{
  queries: {
    staleTime: 60 * 1000,        // 1 minuto
    refetchOnWindowFocus: true,  // Refetch al volver a la ventana
    retry: 1,                     // 1 reintento en caso de error
  },
  mutations: {
    retry: 1,                     // 1 reintento para mutaciones
  }
}
```

### **React Query DevTools:**

- Solo visible en modo desarrollo
- Posición: esquina inferior derecha
- Abre con un click para inspeccionar queries y mutations

---

## 🎯 PRÓXIMOS PASOS

Una vez que reinicies el servidor, deberías poder:

1. ✅ **Ver cursos** - Cargar desde la API
2. ✅ **Crear curso** - Formulario funcionando
3. ✅ **Editar curso** - Modal de edición
4. ✅ **Eliminar curso** - Confirmación y eliminación
5. ✅ **Cambiar estado** - Activar/Desactivar

---

## 🐛 SI AÚN HAY ERRORES

### **Error de conexión con la API:**

```
❌ Network Error
❌ Failed to fetch
```

**Solución:**

1. Verifica que la URL de la API sea correcta
2. Verifica que el backend esté corriendo
3. Verifica que CORS esté habilitado en el backend

### **Error de autenticación:**

```
❌ 401 Unauthorized
```

**Solución:**

1. Asegúrate de haber hecho login
2. Verifica que el token se esté guardando correctamente
3. Revisa la consola para ver si el token se envía en las peticiones

### **Ver logs en la consola:**

```
F12 → Console
```

Busca mensajes como:

```
✅ CursosService: Obteniendo cursos...
❌ CursosService: Error obteniendo cursos: [mensaje]
```

---

## 📊 ÁRBOL DE PROVIDERS ACTUAL

```
html
└── body
    └── ThemeProvider (next-themes)
        └── QueryProvider (React Query) ← NUEVO ✅
            └── AuthProvider (Context API)
                └── {children}
                └── Toaster (sonner)
```

---

## 🎉 ¡LISTO!

El error debería estar resuelto. Solo necesitas:

1. **Reiniciar el servidor** (`Ctrl + C` → `npm run dev`)
2. **Refrescar el navegador** (`F5`)
3. **Navegar a** `/dashboard/cursos`

**¡Ahora React Query debería funcionar correctamente!** 🚀
