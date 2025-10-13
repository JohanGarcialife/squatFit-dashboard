# 🔄 MAPEO DE ESTRUCTURA DE LA API

## ✅ PROBLEMA RESUELTO

La API devolvía una estructura **completamente diferente** a la esperada. He implementado un sistema de transformación automática de datos.

---

## 📊 ESTRUCTURA REAL DE LA API

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

---

## 🔄 MAPEO DE CAMPOS

He creado un transformador que convierte automáticamente los datos de la API al formato esperado por la UI:

| Campo API                    | Tipo API   | Campo UI            | Tipo UI    | Transformación               |
| ---------------------------- | ---------- | ------------------- | ---------- | ---------------------------- |
| `id`                         | string     | `id`                | string     | Directo                      |
| `title`                      | string     | `name`              | string     | Directo                      |
| `subtitle`                   | string     | `description`       | string     | Default: "Sin descripción"   |
| `price`                      | **string** | `price`             | **number** | `parseFloat(price)`          |
| `tutor.firstName + lastName` | string     | `instructor`        | string     | `"${firstName} ${lastName}"` |
| `students`                   | number     | `students`          | number     | Directo                      |
| `image`                      | string     | `thumbnail`         | string     | Directo                      |
| `video_presentation`         | string     | `videoPresentation` | string     | Directo                      |
| -                            | -          | `currency`          | string     | Default: "€"                 |
| -                            | -          | `status`            | enum       | Default: "Activo"            |
| -                            | -          | `duration`          | string     | Default: "8 semanas"         |
| -                            | -          | `level`             | enum       | Default: "Principiante"      |
| -                            | -          | `category`          | string     | Default: "General"           |

---

## 🎯 CAMPOS ADICIONALES PRESERVADOS

Para referencia futura, también se guardan los datos originales del tutor:

```typescript
{
  tutorId: string,
  tutorFirstName: string,
  tutorLastName: string,
  tutorProfilePicture: string,
  videoPresentation: string
}
```

---

## 🔧 IMPLEMENTACIÓN

### **1. Schema actualizado** (`schema.ts`)

Ahora hay 3 schemas:

```typescript
// 1. Schema de la API (datos crudos)
export const cursoApiSchema = z.object({ ... });

// 2. Schema del Tutor
export const tutorSchema = z.object({ ... });

// 3. Schema de la UI (datos transformados)
export const cursoSchema = z.object({ ... });
```

### **2. Transformador** (`cursos-service.ts`)

```typescript
private static transformCursoFromApi(apiCurso: CursoApi): Curso {
  // Transforma de estructura API → estructura UI
}
```

### **3. Uso automático**

```typescript
static async getCursos(): Promise<Curso[]> {
  const response = await this.makeRequest<any>(endpoint);
  const cursosApi: CursoApi[] = response;

  // Transformación automática
  const cursos: Curso[] = cursosApi.map(
    (apiCurso) => this.transformCursoFromApi(apiCurso)
  );

  return cursos;
}
```

---

## 🧪 CÓMO PROBAR

### **Paso 1: Refresca el navegador**

```
F5 o Ctrl + R
```

### **Paso 2: Ve a la página de cursos**

```
http://localhost:3000/dashboard/cursos
```

### **Paso 3: Verifica en la consola**

```
F12 → Console
```

Deberías ver:

```
🔍 CursosService: Obteniendo cursos...
🌐 CursosService: Haciendo petición a: https://...
📦 CursosService: Respuesta de la API: [...]
✅ CursosService: X cursos obtenidos y transformados
```

---

## ✅ RESULTADO ESPERADO

Ahora deberías ver:

1. ✅ **Cursos cargados en la tabla** con los datos correctos
2. ✅ **Cards de estadísticas** con números reales
3. ✅ **Nombres de instructores** formateados correctamente
4. ✅ **Precios** convertidos a números
5. ✅ **NO más errores** en la consola

---

## 📋 DATOS QUE SE MUESTRAN

### **En la tabla:**

- **Nombre:** `title` de la API
- **Instructor:** `tutor.firstName + tutor.lastName`
- **Estudiantes:** `students`
- **Precio:** `price` convertido a número
- **Estado:** "Activo" (por defecto)
- **Nivel:** "Principiante" (por defecto)
- **Duración:** "8 semanas" (por defecto)

### **En las cards:**

- **Cursos Totales:** Cantidad de cursos
- **Cursos Activos:** Todos (ya que todos son "Activo" por defecto)
- **Total Estudiantes:** Suma de todos los `students`
- **Ingresos Potenciales:** Suma de `price * students`

---

## 🔮 FUTURAS MEJORAS

Si la API agrega más campos en el futuro, solo necesitas:

1. Actualizar `cursoApiSchema` con los nuevos campos
2. Actualizar el transformador `transformCursoFromApi`
3. Mapear los nuevos campos a la estructura UI

**¡Todo lo demás seguirá funcionando!** 🎉

---

## 🎯 VENTAJAS DEL SISTEMA ACTUAL

✅ **Desacoplamiento:** La UI no depende de la estructura de la API  
✅ **Mantenibilidad:** Cambios en la API solo requieren actualizar el transformador  
✅ **Validación:** Zod valida automáticamente ambas estructuras  
✅ **Flexibilidad:** Fácil agregar valores por defecto o conversiones  
✅ **Debugging:** Logs claros en cada paso de la transformación

---

**¡La integración ahora debería funcionar perfectamente!** 🚀
