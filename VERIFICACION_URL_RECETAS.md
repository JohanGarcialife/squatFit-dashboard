# ✅ Verificación de URL para Creación de Recetas

**Fecha:** Diciembre 2024  
**Problema reportado:** Error 400 Bad Request al crear receta

---

## 🔍 Verificación de la URL

### URL según el Análisis del Backend

Según `ANALISIS_FUNCIONALIDADES_BACKEND.md`:

**Endpoint:** `POST /api/v1/recipe/create`

**Ubicación en Backend:**
- Archivo: `src/squat-fit/recipe/controller/recipe.controller.ts`
- Método: POST
- Ruta: `/api/v1/recipe/create`

### URL en el Código Frontend

**Archivo:** `src/lib/services/recipe-service.ts`

```typescript
const response = await apiClient.post<CreateRecipeResponse>("/api/v1/recipe/create", data);
```

**Cliente API:** `src/lib/api-client.ts`

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### ✅ Conclusión: La URL es CORRECTA

**URL Completa Construida:**
```
{baseURL}/api/v1/recipe/create
```

Ejemplo:
```
https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/recipe/create
```

**Verificación:**
- ✅ El path `/api/v1/recipe/create` coincide exactamente con el análisis
- ✅ El método `POST` es correcto
- ✅ La estructura de la URL es correcta (baseURL + path)

---

## 🐛 Análisis del Error 400 Bad Request

### Error Observado

```
AxiosError: Request failed with status code 400
Status: 400 Bad Request
Response data: {} (vacío)
```

### Posibles Causas del Error 400

1. **Validación del Backend**
   - El backend puede tener validaciones adicionales no documentadas
   - Campos requeridos que no están en la documentación
   - Validación de rangos de valores

2. **Formato de Datos**
   - El campo `description` como cadena vacía `""` vs `undefined`
   - Tipos de datos incorrectos (números como strings)
   - Valores fuera de rango

3. **Autenticación**
   - Token expirado o inválido
   - Permisos insuficientes

4. **Headers**
   - Content-Type incorrecto
   - Headers faltantes requeridos por el backend

---

## 🔧 Mejoras Implementadas

### 1. Mejora en la Transformación de Datos

**Archivo:** `src/lib/services/recipe-types.ts`

**Cambio:**
- Ahora solo envía `description` si tiene contenido
- Si `description` está vacío, no se incluye en el payload
- Evita enviar cadenas vacías que el backend podría rechazar

**Antes:**
```typescript
description: uiRecipe.descripcion, // Podía ser ""
```

**Después:**
```typescript
// Solo agregar description si tiene contenido
if (description && description.length > 0) {
  payload.description = description;
}
```

### 2. Validación Pre-envío

**Archivo:** `src/lib/services/recipe-service.ts`

**Agregado:**
- Validación de campos requeridos antes de enviar
- Validación de valores no negativos
- Mejor manejo de errores con mensajes descriptivos

**Validaciones agregadas:**
```typescript
if (!data.name || data.name.trim().length === 0) {
  throw new Error("El nombre de la receta es requerido");
}

if (data.kcal < 0 || data.carbohydrates < 0 || data.proteins < 0 || data.fats < 0) {
  throw new Error("Los valores nutricionales no pueden ser negativos");
}
```

### 3. Mejor Manejo de Errores

**Mejoras:**
- Extrae mensajes de error del backend cuando están disponibles
- Muestra información detallada en consola para debugging
- Mensajes de error más descriptivos para el usuario

---

## 📋 Payload Esperado vs Enviado

### Payload según Análisis del Backend

```json
{
  "name": "Nombre de la receta",
  "description": "Descripción",  // Opcional
  "kcal": 350,
  "carbohydrates": 45,
  "proteins": 25,
  "fats": 10
}
```

### Payload Enviado (del error)

```json
{
  "name": "Proteina",
  "description": "pasos para adelgazar en dos dias ",
  "kcal": 10,
  "carbohydrates": 29,
  "proteins": 15,
  "fats": 1
}
```

**Análisis:**
- ✅ Todos los campos requeridos están presentes
- ✅ Los tipos de datos son correctos (números, strings)
- ✅ Los valores están dentro de rangos razonables
- ⚠️ El backend podría tener validaciones adicionales no documentadas

---

## 🎯 Recomendaciones

### Para Debugging

1. **Verificar la respuesta completa del error:**
   ```typescript
   console.error("Error completo:", error.response);
   ```

2. **Verificar el payload antes de enviar:**
   ```typescript
   console.log("Payload a enviar:", JSON.stringify(data, null, 2));
   ```

3. **Verificar headers:**
   ```typescript
   console.log("Headers:", config.headers);
   ```

### Para Resolver el Error 400

1. **Contactar al equipo de backend** para:
   - Verificar validaciones adicionales
   - Obtener mensajes de error más descriptivos
   - Confirmar el formato exacto esperado

2. **Probar con diferentes valores:**
   - Valores más altos para macros
   - Sin description
   - Con description null vs undefined

3. **Verificar logs del backend** para ver qué validación está fallando

---

## ✅ Checklist de Verificación

- [x] URL del endpoint correcta (`/api/v1/recipe/create`)
- [x] Método HTTP correcto (`POST`)
- [x] Base URL configurada correctamente
- [x] Headers correctos (`Content-Type: application/json`)
- [x] Token de autenticación incluido
- [x] Payload con estructura correcta
- [x] Campos requeridos presentes
- [x] Tipos de datos correctos
- [ ] Validaciones del backend verificadas
- [ ] Mensajes de error del backend obtenidos

---

## 📝 Notas Técnicas

### Estructura de la URL

```
{baseURL} + {path} = URL completa
```

**Ejemplo:**
```
https://squatfit-api-cyrc2g3zra-no.a.run.app + /api/v1/recipe/create
= https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/recipe/create
```

### Configuración del Cliente API

El `apiClient` está configurado con:
- `baseURL`: Variable de entorno `NEXT_PUBLIC_API_URL` o valor por defecto
- `timeout`: 10000ms (10 segundos)
- `headers`: `Content-Type: application/json`
- Interceptor para agregar token de autenticación automáticamente

---

**Conclusión:** La URL es correcta según el análisis del backend. El error 400 probablemente se debe a validaciones del backend que no están documentadas o a un formato específico de datos esperado. Las mejoras implementadas ayudarán a identificar mejor el problema y a manejar mejor los errores.

