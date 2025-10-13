# ✅ ACTUALIZACIÓN: Endpoint POST - Crear Curso

## 🔄 CAMBIO REALIZADO

### **ANTES:**

```
POST /api/v1/courses
```

### **AHORA:**

```
POST /api/v1/admin-panel/courses
```

---

## 📋 CAMBIOS EN LA ESTRUCTURA

### **Body ANTES (Formulario UI):**

```json
{
  "name": "string",
  "description": "string",
  "instructor": "string",
  "price": 0,
  "duration": "string",
  "level": "string",
  "category": "string"
}
```

### **Body AHORA (Formato API Real):**

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

---

## 🔄 TRANSFORMACIÓN AUTOMÁTICA

He implementado un transformador que convierte automáticamente los datos del formulario al formato esperado por la API:

| Campo UI      | Tipo       | →   | Campo API            | Tipo       | Nota         |
| ------------- | ---------- | --- | -------------------- | ---------- | ------------ |
| `name`        | string     | →   | `title`              | string     | Directo      |
| `description` | string     | →   | `subtitle`           | string     | Directo      |
| `price`       | **number** | →   | `price`              | **string** | `toString()` |
| `instructor`  | string     | →   | `tutor_id`           | string     | ⚠️ Ver nota  |
| -             | -          | →   | `image`              | string     | Default: ""  |
| -             | -          | →   | `video_presentation` | string     | Default: ""  |
| -             | -          | →   | `id`                 | string     | Opcional     |

---

## ⚠️ NOTA IMPORTANTE: tutor_id

### **Solución Temporal:**

Actualmente, el campo `instructor` del formulario se usa directamente como `tutor_id`:

```typescript
tutor_id: data.instructor;
```

### **Problema:**

- El formulario pide el nombre del instructor (string)
- La API espera el ID del tutor (string)
- No hay validación de que el ID existe

### **Solución Recomendada (TODO):**

1. **Crear un selector de tutores:**

```typescript
<Select>
  <SelectItem value="tutor-id-1">Ana García</SelectItem>
  <SelectItem value="tutor-id-2">Carlos Ruiz</SelectItem>
</Select>
```

2. **Obtener lista de tutores:**

```typescript
const { data: tutores } = useTutores();
```

3. **Actualizar el formulario:**
   - Cambiar `instructor` (input) por un `Select`
   - Guardar el `tutor_id` en lugar del nombre
   - Mostrar el nombre pero enviar el ID

---

## 📊 ARCHIVOS MODIFICADOS

### **1. Servicio de API** ✅

**Archivo:** `src/lib/services/cursos-service.ts`

**Cambios:**

- ✅ Creado `CreateCursoApiDto` - Estructura que espera la API
- ✅ Creado método `transformToApiFormat()` - Transforma datos UI → API
- ✅ Actualizado endpoint: `/api/v1/admin-panel/courses`
- ✅ Agregados logs detallados para debugging

### **2. Documentación** ✅

**Archivos:**

- `ENDPOINTS_CURSOS_COMPLETOS.md`
- `ACTUALIZACION_CREATE_CURSO.md` (este archivo)

---

## 🧪 CÓMO PROBAR

### **Paso 1: Refresca el navegador**

```
F5 o Ctrl + R
```

### **Paso 2: Abre la consola**

```
F12 → Console
```

### **Paso 3: Intenta crear un curso**

1. Ve a `/dashboard/cursos`
2. Click en "Nuevo Curso"
3. Llena el formulario:
   - Nombre: "Yoga para Principiantes"
   - Descripción: "Curso completo de yoga"
   - Instructor: "Ana García" (o el ID del tutor si lo conoces)
   - Precio: 49.99
   - Duración: "8 semanas"
   - Nivel: "Principiante"
   - Categoría: "Yoga"
4. Click en "Crear Curso"

### **Paso 4: Verifica en la consola**

Deberías ver:

```
📝 CursosService: Creando nuevo curso: Yoga para Principiantes
📤 CursosService: Datos enviados a la API: {
  title: "Yoga para Principiantes",
  subtitle: "Curso completo de yoga",
  price: "49.99",
  tutor_id: "Ana García",
  image: "",
  video_presentation: ""
}
🌐 CursosService: Haciendo petición a: https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/courses
```

---

## 🎯 RESPUESTAS POSIBLES

### **✅ Éxito (200/201):**

```json
{
  "id": "curso-nuevo-id",
  "title": "Yoga para Principiantes",
  "subtitle": "Curso completo de yoga",
  "price": "49.99",
  "tutor": {
    "id": "tutor-id",
    "firstName": "Ana",
    "lastName": "García"
  },
  "students": 0
}
```

### **❌ Error Posible - tutor_id inválido:**

```json
{
  "error": "Tutor not found",
  "message": "El tutor con ID 'Ana García' no existe"
}
```

**Solución:** Necesitas usar el ID real del tutor, no el nombre.

### **❌ Error Posible - Campos requeridos:**

```json
{
  "error": "Validation failed",
  "message": "Los campos title, subtitle, price y tutor_id son requeridos"
}
```

---

## 🔧 CÓDIGO IMPLEMENTADO

### **Transformador:**

```typescript
private static transformToApiFormat(data: CreateCursoDto): CreateCursoApiDto {
  return {
    title: data.name,
    subtitle: data.description,
    price: data.price.toString(),
    tutor_id: data.instructor, // ⚠️ TEMPORAL
    image: "",
    video_presentation: "",
  };
}
```

### **Método createCurso:**

```typescript
static async createCurso(data: CreateCursoDto): Promise<Curso> {
  // Validaciones
  if (!data.name || !data.description) {
    throw new Error("Nombre y descripción son requeridos");
  }

  // Transformar datos
  const apiData = this.transformToApiFormat(data);

  // Hacer petición
  const response = await this.makeRequest<any>("/api/v1/admin-panel/courses", {
    method: "POST",
    body: JSON.stringify(apiData),
  });

  // Transformar respuesta
  const cursoData = Array.isArray(response) ? response[0] : response.data || response;
  return this.transformCursoFromApi(cursoData);
}
```

---

## 📝 PRÓXIMOS PASOS

### **1. Implementar selector de tutores** (RECOMENDADO)

**Prioridad:** 🔴 Alta

**Razón:** La API espera un ID válido de tutor, no un nombre.

**Tareas:**

- [ ] Crear endpoint para obtener lista de tutores
- [ ] Crear hook `useTutores()`
- [ ] Actualizar formulario con `Select` de tutores
- [ ] Guardar `tutor_id` en lugar del nombre

### **2. Agregar campos de imagen y video** (OPCIONAL)

**Prioridad:** 🟡 Media

**Tareas:**

- [ ] Agregar campo `image` al formulario (URL o upload)
- [ ] Agregar campo `video_presentation` al formulario
- [ ] Implementar preview de imagen
- [ ] Implementar preview de video

### **3. Validar respuesta de la API** (RECOMENDADO)

**Prioridad:** 🟡 Media

**Tareas:**

- [ ] Probar crear curso con datos reales
- [ ] Verificar estructura de respuesta
- [ ] Ajustar transformación si es necesario

---

## 🎯 EJEMPLO DE USO COMPLETO

```typescript
// En el componente
const createMutation = useCreateCurso();

const handleSubmit = async (values) => {
  try {
    await createMutation.mutateAsync({
      name: "Yoga para Principiantes",
      description: "Curso completo de yoga desde cero",
      instructor: "tutor-id-123", // ⚠️ Usar ID real
      price: 49.99,
      duration: "8 semanas",
      level: "Principiante",
      category: "Yoga",
    });

    toast.success("Curso creado exitosamente");
  } catch (error) {
    toast.error("Error al crear curso");
  }
};
```

---

## ⚠️ ADVERTENCIAS

### **1. tutor_id Temporal:**

El uso del nombre del instructor como `tutor_id` es **TEMPORAL** y puede causar errores. Necesitas implementar un selector de tutores real.

### **2. Campos Vacíos:**

Los campos `image` y `video_presentation` se envían vacíos. Si la API los requiere, deberás agregarlos al formulario.

### **3. Validación del Backend:**

El backend puede rechazar la petición si:

- El `tutor_id` no existe
- Faltan campos requeridos
- El formato es incorrecto

---

## ✅ RESULTADO ESPERADO

Después de implementar estos cambios:

1. ✅ **El formulario funciona** (mismos campos que antes)
2. ✅ **Los datos se transforman automáticamente** (UI → API)
3. ✅ **La petición se hace a la URL correcta** (`/api/v1/admin-panel/courses`)
4. ✅ **Se muestran logs detallados** para debugging
5. ⚠️ **Puede fallar si el tutor_id es inválido** (temporal hasta implementar selector)

---

**¡El endpoint POST ha sido actualizado exitosamente!** 🎉

**Refresca el navegador y prueba crear un curso. Revisa los logs en la consola para ver la transformación de datos.**
