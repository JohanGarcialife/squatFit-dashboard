# 🔗 ENDPOINTS DE CURSOS - CORREGIDOS

## ✅ ENDPOINT ACTUALIZADO

He corregido el endpoint para obtener todos los cursos:

### **ANTES:**
```typescript
GET /api/v1/courses
```

### **AHORA:**
```typescript
GET /api/v1/course/all
```

---

## 📋 ENDPOINTS COMPLETOS DE CURSOS

Por favor confirma si estos endpoints son correctos para tu API:

### **1. Listar todos los cursos** ✅
```
GET /api/v1/course/all
```

### **2. Obtener un curso específico** ❓
```
GET /api/v1/course/{id}
```

### **3. Crear un nuevo curso** ❓
```
POST /api/v1/course
```

### **4. Actualizar un curso** ❓
```
PUT /api/v1/course/{id}
```

### **5. Eliminar un curso** ❓
```
DELETE /api/v1/course/{id}
```

### **6. Cambiar estado de un curso** ❓
```
PATCH /api/v1/course/{id}/status
```

---

## 🔍 ARCHIVOS QUE NECESITO ACTUALIZAR

Si los endpoints son diferentes, necesito actualizar estos métodos en `src/lib/services/cursos-service.ts`:

| Método | Línea actual | Endpoint actual | ¿Es correcto? |
|--------|-------------|----------------|---------------|
| `getCursos()` | ✅ Actualizado | `/api/v1/course/all` | ✅ |
| `getCursoById()` | ~185 | `/api/v1/course/{id}` | ❓ |
| `createCurso()` | ~200 | `/api/v1/course` | ❓ |
| `updateCurso()` | ~220 | `/api/v1/course/{id}` | ❓ |
| `deleteCurso()` | ~240 | `/api/v1/course/{id}` | ❓ |
| `toggleCursoStatus()` | ~260 | `/api/v1/course/{id}/status` | ❓ |

---

## 🚀 CÓMO PROBAR AHORA

### **Paso 1: Verificar que el servidor esté corriendo**
```bash
npm run dev
```

### **Paso 2: Abrir la página de cursos**
```
http://localhost:3000/dashboard/cursos
```

### **Paso 3: Verificar en la consola**
```
F12 → Console
```

Deberías ver logs como:
```
🌐 CursosService: Haciendo petición a: https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/course/all
✅ CursosService: X cursos obtenidos
```

---

## ❓ ¿QUÉ ENDPOINTS SON CORRECTOS?

Por favor confirma si los otros endpoints también son correctos:

1. **Para obtener un curso por ID:** ¿Es `/api/v1/course/{id}`?
2. **Para crear un curso:** ¿Es `POST /api/v1/course`?
3. **Para actualizar:** ¿Es `PUT /api/v1/course/{id}`?
4. **Para eliminar:** ¿Es `DELETE /api/v1/course/{id}`?
5. **Para cambiar estado:** ¿Es `PATCH /api/v1/course/{id}/status`?

Si alguno es diferente, dímelo y lo corrijo inmediatamente.

---

## 🎯 RESULTADO ESPERADO

Después de la corrección, cuando vayas a `/dashboard/cursos`:

- ✅ Debería hacer la petición a `/api/v1/course/all`
- ✅ Debería cargar los cursos desde la API
- ✅ Las cards deberían mostrar estadísticas reales
- ✅ La tabla debería mostrar los cursos reales

---

**¡Dime si los otros endpoints también necesitan corrección!** 🚀
