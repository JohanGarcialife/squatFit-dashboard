# 🔧 Solución al Error de Creación de Recetas

**Fecha:** Diciembre 2024  
**Error:** "property name should not exist, property kcal should not exist... recipe should not be empty"

---

## 🐛 Análisis del Error

### Mensaje de Error Completo

```
Error: property name should not exist,
property kcal should not exist,
property carbohydrates should not exist,
property proteins should not exist,
property fats should not exist,
property description should not exist,
recipe should not be empty
```

### Interpretación

El mensaje de error sugiere que:
1. El backend **SÍ espera** un objeto llamado `recipe`
2. Pero las propiedades dentro de `recipe` tienen nombres diferentes o el formato es incorrecto
3. El objeto `recipe` está llegando vacío o con formato incorrecto

---

## 🔍 Posibles Causas

### 1. Formato del Body Incorrecto

El backend podría esperar:
```json
{
  "recipe": {
    // propiedades aquí
  }
}
```

Pero tal vez las propiedades tienen nombres diferentes en el backend.

### 2. DTO de NestJS

En NestJS, los DTOs pueden tener validaciones estrictas. El backend podría estar usando un DTO que espera:
- Nombres de propiedades diferentes
- Un formato específico de validación
- Campos adicionales requeridos

### 3. Transformación de Datos

El backend podría estar esperando que los datos lleguen en un formato diferente al que estamos enviando.

---

## ✅ Solución Implementada

### Cambio Realizado

**Archivo:** `src/lib/services/recipe-service.ts`

**Antes:**
```typescript
const response = await apiClient.post<CreateRecipeResponse>("/api/v1/recipe/create", data);
```

**Después:**
```typescript
// El backend espera los datos dentro de un objeto "recipe"
const response = await apiClient.post<CreateRecipeResponse>("/api/v1/recipe/create", { recipe: data });
```

### Mejora en Manejo de Errores

También se mejoró el manejo de errores para extraer mejor los mensajes del backend:

```typescript
// Ahora maneja arrays de errores y diferentes formatos de respuesta
if (Array.isArray(errorData)) {
  errorMessage = errorData.map((e) => (typeof e === "string" ? e : JSON.stringify(e))).join(", ");
}
```

---

## 🧪 Pruebas Necesarias

### Prueba 1: Con objeto "recipe"
```json
{
  "recipe": {
    "name": "Test",
    "kcal": 100,
    "carbohydrates": 20,
    "proteins": 15,
    "fats": 5
  }
}
```

### Prueba 2: Si el error persiste, verificar:
1. ¿Los nombres de las propiedades son correctos?
2. ¿Faltan campos requeridos?
3. ¿El formato de los datos es correcto?

---

## 📋 Próximos Pasos si el Error Persiste

### 1. Verificar el Código del Backend

Revisar el DTO en el backend:
- Archivo: `src/squat-fit/recipe/controller/recipe.controller.ts`
- Buscar el DTO usado en el endpoint `POST /api/v1/recipe/create`

### 2. Verificar Swagger/OpenAPI

Si hay documentación Swagger disponible, verificar:
- El formato exacto esperado
- Los nombres de las propiedades
- Los campos requeridos

### 3. Probar con Postman/Insomnia

Crear una petición manual para verificar:
- Qué formato acepta el backend
- Qué mensajes de error devuelve
- Qué estructura de datos espera

### 4. Contactar al Equipo de Backend

Si nada funciona, contactar al equipo de backend para:
- Obtener el DTO exacto esperado
- Verificar la documentación del endpoint
- Confirmar el formato de datos correcto

---

## 🔄 Alternativas a Probar

### Alternativa 1: Enviar datos directamente (sin objeto recipe)

Si el objeto `recipe` no funciona, probar:
```typescript
const response = await apiClient.post<CreateRecipeResponse>("/api/v1/recipe/create", data);
```

### Alternativa 2: Verificar nombres de propiedades

Tal vez el backend espera nombres diferentes:
- `name` → `nombre`
- `kcal` → `calories` o `calorias`
- `carbohydrates` → `carbs` o `carbohidratos`
- `proteins` → `protein` o `proteinas`
- `fats` → `fat` o `grasas`

### Alternativa 3: Agregar campos adicionales

El backend podría requerir campos adicionales:
- `user_id`
- `created_at`
- Otros campos del modelo

---

## 📝 Notas Técnicas

### Payload Actual Enviado

```typescript
{
  recipe: {
    name: string,
    description?: string,
    kcal: number,
    carbohydrates: number,
    proteins: number,
    fats: number
  }
}
```

### Payload Según Documentación

Según `ANALISIS_FUNCIONALIDADES_BACKEND.md`:
```json
{
  "name": "Nombre de la receta",
  "description": "Descripción",
  "kcal": 350,
  "carbohydrates": 45,
  "proteins": 25,
  "fats": 10
}
```

**Nota:** La documentación muestra los datos directamente, no dentro de un objeto `recipe`. Esto sugiere que el cambio podría no ser correcto, pero el mensaje de error indica lo contrario.

---

## ✅ Checklist de Verificación

- [x] Cambiar formato a objeto `recipe`
- [x] Mejorar manejo de errores
- [ ] Probar con el nuevo formato
- [ ] Verificar si funciona
- [ ] Si no funciona, probar alternativas
- [ ] Contactar equipo de backend si es necesario

---

**Estado:** Cambio implementado, pendiente de prueba

