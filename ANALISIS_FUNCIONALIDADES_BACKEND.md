# 📊 Análisis Detallado de Funcionalidades del Backend

**Fecha de análisis:** 29 de Noviembre, 2025  
**Versión del sistema:** Backend NestJS - Squat Fit API

---

## 📋 Tabla de Contenidos

1. [Pautas y Seguimientos de Nutrición](#1-pautas-y-seguimientos-de-nutrición)
2. [Biblioteca de Ejercicios](#2-biblioteca-de-ejercicios)
3. [Métricas del Sistema](#3-métricas-del-sistema)
4. [Endpoints de Subida de Archivos Multimedia](#4-endpoints-de-subida-de-archivos-multimedia)
5. [Resumen Ejecutivo](#resumen-ejecutivo)

---

## 1. Pautas y Seguimientos de Nutrición

### ✅ Estado: **Parcialmente Implementado**

### 📦 Funcionalidades Implementadas

#### 1.1. Gestión de Recetas y Comidas

**Endpoints Disponibles:**

##### `GET /api/v1/recipe/all`
- **Descripción:** Obtiene todas las recetas del sistema
- **Autenticación:** Requerida (Bearer Token)
- **Respuesta:** Array de recetas con información nutricional
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts`

##### `GET /api/v1/recipe/by-user`
- **Descripción:** Obtiene las recetas del usuario autenticado
- **Autenticación:** Requerida (Bearer Token)
- **Respuesta:** Array de recetas del usuario
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts`

##### `POST /api/v1/recipe/create`
- **Descripción:** Crea una nueva receta
- **Autenticación:** Requerida (Bearer Token)
- **Body:**
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
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts`

##### `GET /api/v1/recipe/meals`
- **Descripción:** Obtiene las comidas del usuario para una fecha específica
- **Autenticación:** Requerida (Bearer Token)
- **Query Parameters:**
  - `date` (string, formato ISO): Fecha de las comidas
- **Respuesta:** Array de comidas con recetas asociadas
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts`

##### `POST /api/v1/recipe/meal`
- **Descripción:** Crea una nueva comida (registra consumo de receta)
- **Autenticación:** Requerida (Bearer Token)
- **Body:**
  ```json
  {
    "recipe_id": "uuid-de-receta",
    "date": "2025-11-29T00:00:00.000Z",
    "meal_type": "breakfast" // breakfast, lunch, dinner, snack
  }
  ```
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts`

##### `PUT /api/v1/recipe/upload-receipe-image`
- **Descripción:** Sube una imagen para una receta existente
- **Autenticación:** Requerida (Bearer Token)
- **Content-Type:** `multipart/form-data`
- **Query Parameters:**
  - `recipe_id` (string): ID de la receta
- **Body:**
  - `file` (File): Archivo de imagen
- **Respuesta:** Receta actualizada con URL de imagen
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts` (líneas 120-140)

#### 1.2. Valores Nutricionales

**Tabla de Base de Datos:** `nutritional_value`
- Campos: `calories`, `carbohydrates`, `proteins`, `fats`
- Relación: `system_recipe_id` → `recipe.id`
- **Archivo de Migración:** `src/core/db/migrations/20240628114206_nutritional_value.ts`

#### 1.3. Seguimiento Diario de Calorías

**Tabla de Base de Datos:** `daily_total_kcal`
- Calcula automáticamente las calorías consumidas por día
- Se actualiza al crear una comida (`createMeal`)
- **Archivo:** `src/squat-fit/recipe/services/recipe.service.ts` (líneas 779-797)

#### 1.4. Formularios Nutricionales

**Endpoints Disponibles:**

##### `GET /api/v1/admin-panel/form-types`
- **Descripción:** Obtiene todos los tipos de formularios disponibles
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Respuesta:** Array con tipos de formularios (incluye "Nutricional")
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 400-402)

##### `GET /api/v1/admin-panel/form-user-answer`
- **Descripción:** Obtiene las respuestas de un usuario a un formulario
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Query Parameters:**
  - `user_id` (string): ID del usuario
  - `form_id` (string): ID del formulario
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts`

**Lógica de Creación:**
- Al crear una suscripción de tipo "Nutricional" o "Completo", se crea automáticamente un formulario nutricional
- **Archivo:** `src/squat-fit/advice/services/suscriptions.service.ts` (líneas 606-657)

#### 1.5. Historial de IMC

**Endpoints Disponibles:**

##### `GET /api/v1/calculator/history`
- **Descripción:** Obtiene el historial de cálculos de IMC del usuario
- **Autenticación:** Requerida (Bearer Token)
- **Query Parameters:**
  - `date` (string, opcional): Filtrar por fecha específica
- **Respuesta:** Array de registros de IMC con fechas
- **Archivo:** `src/squat-fit/calculator/controller/calculator.controller.ts` (líneas 133-145)

##### `POST /api/v1/calculator/imc`
- **Descripción:** Calcula y guarda el IMC actual del usuario
- **Autenticación:** Requerida (Bearer Token)
- **Respuesta:** Objeto con IMC calculado y tips nutricionales según el resultado
- **Archivo:** `src/squat-fit/calculator/controller/calculator.controller.ts` (líneas 168-177)
- **Lógica:** `src/squat-fit/calculator/service/calculator.service.ts` (líneas 197-252)

### ❌ Funcionalidades Faltantes

1. **Sistema de Pautas Nutricionales Estructuradas**
   - No existe endpoint para crear/editar pautas nutricionales personalizadas
   - No hay sistema de planes nutricionales estructurados

2. **Seguimiento de Objetivos Nutricionales**
   - No hay tracking de objetivos a largo plazo
   - No existe sistema de metas nutricionales

3. **Alertas y Recordatorios**
   - No hay sistema de notificaciones para seguimiento nutricional
   - No existen recordatorios de comidas

4. **Reportes de Progreso Nutricional**
   - No hay endpoints para generar reportes de progreso
   - No existe análisis de tendencias nutricionales

---

## 2. Biblioteca de Ejercicios

### ❌ Estado: **No Implementado**

### 📦 Datos Básicos Existentes

#### 2.1. Frecuencia de Entrenamiento

**Tabla de Base de Datos:** `strength_training`
- **Datos disponibles:**
  - "Ninguno" (value: 1)
  - "1 o 2 días" (value: 1.03)
  - "3 o 4 días" (value: 1.06)
  - "5 o 6 días" (value: 1.11)
- **Archivo:** `src/core/db/data/strength_training.ts`
- **Uso:** Se usa en cálculos de calorías, no como biblioteca de ejercicios

#### 2.2. Objetivos de Entrenamiento

**Tabla de Base de Datos:** `training_goal`
- **Datos disponibles:**
  - "Recomposición" - Reducir grasa y aumentar músculo
  - "Perder Grasa" - Mejorar salud y energía
  - "Ganar músculo" - Aumentar fuerza y masa muscular
  - "Mejorar rendimiento" - Mejorar rendimiento deportivo
- **Archivo:** `src/core/db/data/training_goal.ts`
- **Uso:** Se usa en formularios de usuario, no como biblioteca

#### 2.3. Videos de Cursos

**Endpoints Disponibles:**

##### `GET /api/v1/course/all`
- **Descripción:** Obtiene todos los cursos disponibles
- **Autenticación:** Requerida (Bearer Token)
- **Respuesta:** Array de cursos con videos asociados
- **Nota:** Los videos están asociados a cursos, no son una biblioteca de ejercicios independiente
- **Archivo:** `src/squat-fit/course/controllers/course.controller.ts`

##### `GET /api/v1/course/watch-video`
- **Descripción:** Obtiene información de un video específico
- **Autenticación:** Requerida (Bearer Token)
- **Query Parameters:**
  - `video_id` (string): ID del video
- **Archivo:** `src/squat-fit/course/controllers/course.controller.ts`

### ❌ Funcionalidades Faltantes

1. **CRUD de Ejercicios**
   - No existe tabla `exercises` o similar
   - No hay endpoints para crear/editar/eliminar ejercicios
   - No existe gestión de ejercicios individuales

2. **Categorización de Ejercicios**
   - No hay categorías por grupo muscular
   - No existe clasificación por tipo (cardio, fuerza, flexibilidad)
   - No hay filtrado por equipamiento necesario

3. **Rutinas Predefinidas**
   - No existe sistema de rutinas
   - No hay plantillas de entrenamiento

4. **Búsqueda y Filtrado**
   - No hay endpoints de búsqueda de ejercicios
   - No existe filtrado avanzado

5. **Endpoints Necesarios (No Implementados):**
   ```
   GET    /api/v1/exercises              - Listar ejercicios
   GET    /api/v1/exercises/:id          - Obtener ejercicio
   POST   /api/v1/exercises              - Crear ejercicio
   PUT    /api/v1/exercises/:id          - Actualizar ejercicio
   DELETE /api/v1/exercises/:id          - Eliminar ejercicio
   GET    /api/v1/exercises/categories   - Obtener categorías
   GET    /api/v1/exercises/search       - Buscar ejercicios
   GET    /api/v1/routines               - Listar rutinas
   POST   /api/v1/routines               - Crear rutina
   ```

---

## 3. Métricas del Sistema

### 3.1. Ingresos Mensual/Anual

#### ✅ Estado: **Parcialmente Implementado**

**Endpoints Disponibles:**

##### `GET /api/v1/admin-panel/sales`
- **Descripción:** Obtiene ventas con filtro opcional por mes
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Query Parameters:**
  - `limit` (number): Límite de resultados por página (máx. 20)
  - `page` (number): Número de página
  - `month` (number, opcional): Mes (1-12) para filtrar ventas
  - `search` (string, opcional): Búsqueda por título, nombre de usuario o precio
- **Respuesta:**
  ```json
  {
    "sales": [...],
    "page": 1,
    "totalPages": 10,
    "length": 200
  }
  ```
- **Nota:** Incluye ventas de cursos, asesorías y libros
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 670-680)
- **Lógica:** `src/squat-fit/admin-panel/service/admin-panel.service.ts` (líneas 862-927)

##### `GET /api/v1/admin-panel/total-sales`
- **Descripción:** Obtiene el total de ventas (sin filtros de fecha)
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Respuesta:** Objeto con totales de ventas
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 342-345)

#### ❌ Funcionalidades Faltantes

1. **Ingresos Mensuales Específicos**
   - No existe endpoint dedicado para ingresos mensuales
   - El endpoint `sales` cuenta ventas, pero no suma montos de ingresos

2. **Ingresos Anuales**
   - No existe endpoint para ingresos anuales
   - No hay agregación de ingresos por año

3. **Cálculo de Ingresos Reales**
   - Los endpoints actuales cuentan transacciones, no suman montos
   - Falta lógica para calcular ingresos totales (suma de `amount_value`)

---

### 3.2. Asesorías

#### ✅ Estado: **Implementado**

**Endpoints Disponibles:**

##### `GET /api/v1/admin-panel/advices`
- **Descripción:** Obtiene todos los consejos/asesorías con paginación
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Query Parameters:**
  - `limit` (number): Límite de resultados
  - `page` (number): Número de página
- **Respuesta:**
  ```json
  {
    "advices": [...],
    "page": 1,
    "totalPages": 5,
    "length": 50
  }
  ```
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 359-369)

##### `GET /api/v1/admin-panel/assigned-adviser`
- **Descripción:** Obtiene el coach asignado a un usuario específico
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Query Parameters:**
  - `user_id` (string): ID del usuario
- **Respuesta:** Información de la asesoría asignada
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 383-388)

##### `GET /api/v1/advice/by-user`
- **Descripción:** Obtiene las asesorías del usuario autenticado
- **Autenticación:** Requerida (Bearer Token)
- **Respuesta:** Array de asesorías del usuario
- **Archivo:** `src/squat-fit/advice/controller/advice.controller.ts`

**Ventas de Asesorías:**
- Incluidas en `GET /api/v1/admin-panel/sales`
- Se calculan junto con cursos y libros

---

### 3.3. Ventas Totales

#### ✅ Estado: **Implementado**

**Endpoints Disponibles:**

##### `GET /api/v1/admin-panel/total-sales`
- **Descripción:** Obtiene el total de ventas del sistema
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Respuesta:** Objeto con totales de ventas
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 342-345)

##### `GET /api/v1/admin-panel/sales`
- **Descripción:** Obtiene ventas con paginación y filtros
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Query Parameters:**
  - `limit` (number): Límite por página
  - `page` (number): Número de página
  - `month` (number, opcional): Filtrar por mes
  - `search` (string, opcional): Búsqueda
- **Respuesta:** Ventas paginadas de cursos, asesorías y libros
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 670-680)

---

### 3.4. Tareas Pendientes / Tickets

#### ✅ Estado: **Implementado**

**Endpoints Disponibles:**

##### `GET /api/v1/admin-panel/chat/:chatId/tasks`
- **Descripción:** Obtiene todas las tareas asociadas a un chat o ticket
- **Autenticación:** Requerida (Bearer Token)
- **Path Parameters:**
  - `chatId` (string): ID del chat o ticket
- **Respuesta:** Array de tareas con información completa
- **Nota:** Detecta automáticamente si es un ticket de soporte o chat normal
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 993-1005)

##### `GET /api/v1/admin-panel/tasks/assigned-to-me`
- **Descripción:** Obtiene todas las tareas asignadas al usuario autenticado
- **Autenticación:** Requerida (Bearer Token)
- **Query Parameters:**
  - `status` (string, opcional): Filtrar por estado (pending, in_progress, completed, cancelled)
  - `priority` (string, opcional): Filtrar por prioridad (low, medium, high, urgent)
  - `limit` (number, opcional): Límite de resultados
  - `offset` (number, opcional): Offset para paginación
- **Respuesta:**
  ```json
  {
    "tasks": [...],
    "total": 25
  }
  ```
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 1016-1031)

##### `POST /api/v1/admin-panel/chat/:chatId/tasks`
- **Descripción:** Crea una nueva tarea asociada a un chat o ticket
- **Autenticación:** Requerida (Bearer Token)
- **Path Parameters:**
  - `chatId` (string): ID del chat o ticket
- **Body:**
  ```json
  {
    "title": "Título de la tarea",
    "description": "Descripción opcional",
    "assigned_to": "uuid-del-usuario",
    "priority": "medium",
    "due_date": "2025-12-01T00:00:00.000Z"
  }
  ```
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 965-982)

##### `PUT /api/v1/admin-panel/tasks/:taskId/status`
- **Descripción:** Actualiza el estado de una tarea
- **Autenticación:** Requerida (Bearer Token)
- **Path Parameters:**
  - `taskId` (string): ID de la tarea
- **Body:**
  ```json
  {
    "status": "completed" // pending, in_progress, completed, cancelled
  }
  ```
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 1050-1062)

##### `PUT /api/v1/admin-panel/tasks/:taskId/assign`
- **Descripción:** Reasigna una tarea a otro usuario
- **Autenticación:** Requerida (Bearer Token)
- **Path Parameters:**
  - `taskId` (string): ID de la tarea
- **Body:**
  ```json
  {
    "assigned_to": "uuid-del-nuevo-usuario"
  }
  ```
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 1081-1093)

##### `DELETE /api/v1/admin-panel/tasks/:taskId`
- **Descripción:** Elimina una tarea (soft delete, marca como cancelled)
- **Autenticación:** Requerida (Bearer Token)
- **Path Parameters:**
  - `taskId` (string): ID de la tarea
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 1104-1112)

**Tabla de Base de Datos:** `chat_tasks`
- Campos: `id`, `chat_id`, `support_ticket_id`, `title`, `description`, `assigned_to`, `created_by`, `status`, `priority`, `due_date`, `completed_at`
- **Archivo de Migración:** `src/core/db/migrations/20251128172840_create_chat_tasks_table.ts`
- **Servicio:** `src/squat-fit/admin-panel/service/chat-tasks.service.ts`

**Tickets de Soporte:**

##### `GET /api/v1/support/backoffice/tickets`
- **Descripción:** Obtiene tickets de soporte con filtros
- **Autenticación:** Requerida (Bearer Token, Support)
- **Query Parameters:**
  - `status` (string, opcional): Filtrar por estado
  - `priority` (string, opcional): Filtrar por prioridad
  - `category` (string, opcional): Filtrar por categoría
  - `limit` (number): Límite de resultados
  - `page` (number): Número de página
- **Archivo:** `src/squat-fit/support/support-backoffice.controller.ts` (línea 130)

---

### 3.5. Tareas Pendientes por Área

#### ❌ Estado: **No Implementado**

**Funcionalidad Faltante:**
- No existe endpoint que agrupe tareas por área/canal (coach, dietitian, support)
- No hay query que filtre tareas por tipo de chat

**Endpoint Necesario (No Implementado):**
```
GET /api/v1/admin-panel/tasks/by-area
Query Parameters:
  - area (string): coach, dietitian, support
  - status (string, opcional): pending, in_progress, etc.
```

---

### 3.6. Ventas por Tipo de Producto

#### ⚠️ Estado: **Parcialmente Implementado**

**Endpoints Disponibles:**

##### `GET /api/v1/admin-panel/sales`
- **Descripción:** Obtiene ventas que incluyen separación por tipo
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Nota:** Internamente separa cursos, asesorías y libros, pero no retorna agrupación explícita
- **Lógica Interna:** `src/squat-fit/admin-panel/service/admin-panel.service.ts` (líneas 878-894)
  - Llama a `CourseRepository.getTotalSales()`
  - Llama a `AdviceRepository.getTotalSales()`
  - Llama a `BookRepository.getTotalSales()`

#### ❌ Funcionalidad Faltante

**Endpoint Necesario (No Implementado):**
```
GET /api/v1/admin-panel/sales/by-product-type
Respuesta esperada:
{
  "courses": { "count": 150, "revenue": 7500.00 },
  "advices": { "count": 80, "revenue": 7920.00 },
  "books": { "count": 45, "revenue": 900.00 }
}
```

---

### 3.7. Ingresos por Producto

#### ❌ Estado: **No Implementado**

**Problema Actual:**
- Los endpoints de ventas cuentan transacciones, pero no suman montos de ingresos
- No se calcula el total de ingresos por tipo de producto

**Funcionalidad Faltante:**
- Cálculo de ingresos reales (suma de `amount_value`)
- Agrupación de ingresos por producto
- Endpoint dedicado para ingresos por producto

**Endpoint Necesario (No Implementado):**
```
GET /api/v1/admin-panel/revenue/by-product
Query Parameters:
  - start_date (string, opcional): Fecha inicio
  - end_date (string, opcional): Fecha fin
  - product_type (string, opcional): courses, advices, books
Respuesta esperada:
{
  "courses": 12500.50,
  "advices": 8900.75,
  "books": 1200.00,
  "total": 22601.25
}
```

---

### 3.8. Pagos Pendientes Acumulados

#### ❌ Estado: **No Implementado**

**Funcionalidad Faltante:**
- No existe tracking de pagos pendientes
- No hay integración con Stripe/PayPal para identificar pagos pendientes
- No existe tabla o lógica para pagos en estado "pending"

**Endpoints Necesarios (No Implementados):**
```
GET /api/v1/admin-panel/payments/pending
GET /api/v1/admin-panel/payments/pending/total
GET /api/v1/admin-panel/payments/pending/by-user
```

**Integración Necesaria:**
- Revisar webhooks de Stripe/PayPal para tracking de pagos
- Crear tabla `pending_payments` o similar
- **Archivos de Webhooks:** 
  - `src/core/webhooks/services/stripe-webhook.service.ts`
  - `src/core/webhooks/services/paypal-webhook.service.ts`

---

### 3.9. Tareas Vencidas en Nutrición

#### ❌ Estado: **No Implementado**

**Funcionalidad Faltante:**
- No existe query específica para tareas vencidas filtradas por área de nutrición
- La tabla `chat_tasks` tiene `due_date`, pero no hay endpoint que filtre por área y estado vencido

**Endpoint Necesario (No Implementado):**
```
GET /api/v1/admin-panel/tasks/overdue/nutrition
Query Parameters:
  - assigned_to (string, opcional): Filtrar por usuario asignado
Respuesta esperada:
{
  "tasks": [...],
  "total": 12,
  "overdue_days_avg": 5.3
}
```

**Lógica Necesaria:**
- Filtrar tareas con `due_date < NOW()` y `status != 'completed'`
- Filtrar por chats de tipo nutrición (dietitian)
- **Archivo de Referencia:** `src/squat-fit/admin-panel/service/chat-tasks.service.ts`

---

### 3.10. Clientes sin Contacto

#### ❌ Estado: **No Implementado**

**Funcionalidad Faltante:**
- No existe query para identificar usuarios sin actividad reciente
- No hay endpoint para listar clientes inactivos

**Endpoint Necesario (No Implementado):**
```
GET /api/v1/admin-panel/users/without-contact
Query Parameters:
  - days (number, opcional): Días sin contacto (default: 30)
  - role (string, opcional): Filtrar por rol
Respuesta esperada:
{
  "users": [...],
  "total": 45,
  "avg_days_without_contact": 45.2
}
```

**Lógica Necesaria:**
- Consultar última actividad en `telegram_sessions.last_activity`
- Consultar último mensaje en `chat_messages` o `support_messages`
- Comparar con fecha actual

---

### 3.11. Top 5 Causas de Tickets

#### ❌ Estado: **No Implementado**

**Funcionalidad Faltante:**
- No existe endpoint que retorne el top 5 de categorías/causas de tickets
- El dashboard calcula distribución de categorías, pero no top 5

**Endpoint Necesario (No Implementado):**
```
GET /api/v1/support/backoffice/tickets/top-causes
Query Parameters:
  - period (string, opcional): day, week, month, year
  - limit (number, opcional): Número de causas (default: 5)
Respuesta esperada:
{
  "causes": [
    { "category": "technical", "count": 45, "percentage": 35.2 },
    { "category": "billing", "count": 30, "percentage": 23.4 },
    ...
  ]
}
```

**Lógica Existente (Parcial):**
- `src/squat-fit/support/support-dashboard.service.ts` (líneas 557-564) calcula `categoryDistribution`
- Necesita agregar ordenamiento y límite

**Dashboard de Soporte:**

##### `GET /api/v1/support/backoffice/dashboard/metrics`
- **Descripción:** Obtiene métricas completas del dashboard de soporte
- **Autenticación:** Requerida (Bearer Token, Support)
- **Respuesta:** Objeto con múltiples métricas incluyendo distribución de categorías
- **Archivo:** `src/squat-fit/support/support-backoffice.controller.ts` (línea 69)
- **Lógica:** `src/squat-fit/support/support-dashboard.service.ts` (líneas 444-602)

---

## 4. Endpoints de Subida de Archivos Multimedia

### ✅ Estado: **Implementado y Funcional**

### 📦 Servicio de Almacenamiento

**Servicio Principal:** `CloudStorageService`
- **Archivo:** `src/core/gcp/cloud-storage.service.ts`
- **Métodos Disponibles:**
  - `uploadFile()` - Subir archivo único
  - `uploadMultiFile()` - Subir múltiples archivos
  - `uploadPrivateFile()` - Subir archivo privado
- **Almacenamiento:** Google Cloud Storage
- **Bucket:** Configurado en variable de entorno `GCP_BUCKET_NAME`

### 📤 Endpoints de Subida

#### 4.1. Imágenes de Recetas

##### `PUT /api/v1/recipe/upload-receipe-image`
- **Descripción:** Sube una imagen para una receta existente del usuario
- **Autenticación:** Requerida (Bearer Token)
- **Content-Type:** `multipart/form-data`
- **Query Parameters:**
  - `recipe_id` (string): ID de la receta
- **Body:**
  - `file` (File): Archivo de imagen
- **Respuesta:** Receta actualizada con URL de imagen en Google Cloud Storage
- **Archivo:** `src/squat-fit/recipe/controller/recipe.controller.ts` (líneas 120-140)
- **Servicio:** `src/squat-fit/recipe/services/recipe.service.ts`

#### 4.2. Documentos de Asesoría

##### `POST /api/v1/admin-panel/upload-docs`
- **Descripción:** Sube uno o más archivos relacionados con el consejo de un usuario
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `files` (File[]): Array de archivos (múltiples archivos permitidos)
  - `user_id` (string): ID del usuario
  - `period_id` (string): ID del período de asesoría
  - `file_type_id` (string): ID del tipo de archivo
  - `doc_type_id` (string): ID del tipo de documento
- **Respuesta:** Array de URLs de archivos subidos
- **Archivo:** `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` (líneas 613-628)
- **Servicio:** `src/squat-fit/admin-panel/service/admin-panel.service.ts`

#### 4.3. Videos de Cursos

##### `POST /api/v1/course/upload-video`
- **Descripción:** Sube un video para un curso
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Content-Type:** `multipart/form-data`
- **Query Parameters:**
  - `video_id` (string): ID del video a actualizar
- **Body:**
  - `file` (File): Archivo de video
- **Respuesta:** URL del video subido
- **Archivo:** `src/squat-fit/course/controllers/course.controller.ts` (líneas 374-382)
- **Nota:** Endpoint marcado como `@ApiExcludeEndpoint()` (no aparece en Swagger)

##### `POST /api/v1/course/upload-audio`
- **Descripción:** Sube un audio para un curso
- **Autenticación:** Requerida (Bearer Token, Admin)
- **Content-Type:** `multipart/form-data`
- **Query Parameters:**
  - `video_id` (string): ID del video/audio a actualizar
- **Body:**
  - `file` (File): Archivo de audio
- **Respuesta:** URL del audio subido
- **Archivo:** `src/squat-fit/course/controllers/course.controller.ts`
- **Nota:** Endpoint marcado como `@ApiExcludeEndpoint()`

#### 4.4. Posts Sociales

##### `POST /api/v1/social/createPost`
- **Descripción:** Crea una nueva publicación en el feed social con texto e imagen opcional
- **Autenticación:** Requerida (Bearer Token)
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `postText` (string): Texto de la publicación
  - `file` (File, opcional): Imagen de la publicación
- **Respuesta:** Post creado con URL de imagen si se proporcionó
- **Archivo:** `src/squat-fit/social/controller/social.controller.ts` (líneas 341-354)
- **Servicio:** `src/squat-fit/social/services/social.service.ts`

#### 4.5. Archivos de Soporte (Tickets)

##### `POST /api/v1/support/backoffice/tickets/:id/upload-attachment`
- **Descripción:** Sube un archivo adjunto a un ticket de soporte
- **Autenticación:** Requerida (Bearer Token, Support)
- **Content-Type:** `multipart/form-data`
- **Path Parameters:**
  - `id` (string): ID del ticket
- **Body:**
  - `file` (File): Archivo adjunto
- **Respuesta:** URL del archivo subido
- **Archivo:** `src/squat-fit/support/support-backoffice.controller.ts` (línea 354)

### 📁 Estructura de Almacenamiento

Los archivos se almacenan en Google Cloud Storage con la siguiente estructura:

```
bucket/
├── profile_picture/
│   └── {userId}/
│       └── {timestamp}_{filename}
├── food/
│   └── {userId}/
│       └── {id}/
│           └── {timestamp}_{filename}
├── posts/
│   └── {userId}/
│       └── {id}/
│           └── {timestamp}_{filename}
├── chat_media/
│   └── {userId}/
│       └── {id}/
│           └── {timestamp}_{filename}
└── static/
    └── {filename}
```

**Configuración:**
- **Bucket:** Variable de entorno `GCP_BUCKET_NAME`
- **Credenciales:** Variable de entorno `GOOGLE_APPLICATION_CREDENTIALS`
- **Proyecto:** Variable de entorno `GCP_PROJECT_ID`

---

## Resumen Ejecutivo

### 📊 Tabla de Estado de Funcionalidades

| Funcionalidad | Estado | Endpoints Disponibles | Prioridad de Implementación |
|--------------|--------|----------------------|----------------------------|
| **Pautas y Seguimientos de Nutrición** | ⚠️ Parcial | 8 endpoints | Media |
| **Biblioteca de Ejercicios** | ❌ No implementado | 0 endpoints | **Alta** |
| **Ingresos Mensual/Anual** | ⚠️ Parcial | 2 endpoints (solo conteo) | Media |
| **Asesorías** | ✅ Implementado | 3 endpoints | - |
| **Ventas Totales** | ✅ Implementado | 2 endpoints | - |
| **Tareas Pendientes** | ✅ Implementado | 6 endpoints | - |
| **Tareas por Área** | ❌ No implementado | 0 endpoints | Media |
| **Ventas por Tipo** | ⚠️ Parcial | 1 endpoint (sin agrupación) | Baja |
| **Ingresos por Producto** | ❌ No implementado | 0 endpoints | **Alta** |
| **Pagos Pendientes** | ❌ No implementado | 0 endpoints | **Alta** |
| **Tareas Vencidas Nutrición** | ❌ No implementado | 0 endpoints | Media |
| **Clientes sin Contacto** | ❌ No implementado | 0 endpoints | Media |
| **Top 5 Causas Tickets** | ❌ No implementado | 0 endpoints | Baja |
| **Upload Multimedia** | ✅ Implementado | 5 endpoints | - |

### 🎯 Recomendaciones Prioritarias

#### 🔴 Alta Prioridad

1. **Biblioteca de Ejercicios**
   - Implementar CRUD completo de ejercicios
   - Crear tabla `exercises` con categorías
   - Endpoints para gestión de ejercicios y rutinas

2. **Ingresos por Producto**
   - Modificar lógica de ventas para sumar montos reales
   - Crear endpoint dedicado para ingresos por tipo de producto
   - Agregar cálculos de ingresos mensuales/anuales

3. **Pagos Pendientes Acumulados**
   - Integrar con webhooks de Stripe/PayPal
   - Crear tabla de tracking de pagos
   - Endpoints para consultar pagos pendientes

#### 🟡 Media Prioridad

1. **Pautas Nutricionales Estructuradas**
   - Sistema de planes nutricionales personalizados
   - Seguimiento de objetivos a largo plazo

2. **Tareas Pendientes por Área**
   - Agregar query para agrupar tareas por canal
   - Endpoint para obtener tareas por área

3. **Tareas Vencidas en Nutrición**
   - Query específica para tareas vencidas filtradas por área
   - Endpoint dedicado

4. **Clientes sin Contacto**
   - Query para identificar usuarios inactivos
   - Endpoint para listar clientes sin contacto

#### 🟢 Baja Prioridad

1. **Top 5 Causas de Tickets**
   - Agregar ordenamiento y límite a distribución de categorías existente
   - Endpoint específico

2. **Mejoras en Ventas por Tipo**
   - Agregar agrupación explícita en respuesta de endpoint existente

---

## 📝 Notas Técnicas

### Archivos Clave del Sistema

**Servicios Principales:**
- `src/squat-fit/admin-panel/service/admin-panel.service.ts` - Lógica de métricas y ventas
- `src/squat-fit/admin-panel/service/chat-tasks.service.ts` - Gestión de tareas
- `src/squat-fit/recipe/services/recipe.service.ts` - Gestión de recetas y nutrición
- `src/core/gcp/cloud-storage.service.ts` - Servicio de almacenamiento
- `src/squat-fit/support/support-dashboard.service.ts` - Métricas de soporte

**Controladores:**
- `src/squat-fit/admin-panel/controller/admin-panel.controller.ts` - Endpoints de administración
- `src/squat-fit/recipe/controller/recipe.controller.ts` - Endpoints de recetas
- `src/squat-fit/support/support-backoffice.controller.ts` - Endpoints de soporte

**Base de Datos:**
- Tabla `chat_tasks` - Tareas del sistema
- Tabla `nutritional_value` - Valores nutricionales
- Tabla `daily_total_kcal` - Seguimiento diario de calorías
- Tabla `strength_training` - Frecuencia de entrenamiento (datos básicos)
- Tabla `training_goal` - Objetivos de entrenamiento (datos básicos)

---

**Documento generado el:** 29 de Noviembre, 2025  
**Última actualización del código analizado:** Versión actual del repositorio

