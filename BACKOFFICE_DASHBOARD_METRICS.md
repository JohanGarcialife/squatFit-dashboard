# Backoffice Dashboard — Métricas desde la API

Guía para el equipo de frontend del backoffice sobre los endpoints disponibles para construir el dashboard de métricas.

---

## Endpoints Disponibles

### 1. Totales Generales

```
GET /api/v1/admin-panel/total-sales
Authorization: Bearer <token_admin>
```

Retorna conteos globales de ventas y usuarios:

```json
{
  "courses": 45,
  "advices": 128,
  "books": 67,
  "users": 892
}
```

| Campo     | Descripción                              |
|-----------|------------------------------------------|
| `courses` | Total de cursos vendidos                 |
| `advices` | Total de asesorías contratadas           |
| `books`   | Total de libros/versiones comprados      |
| `users`   | Total de usuarios registrados            |

**Uso en dashboard:** Tarjetas de resumen ("KPIs") en la parte superior.

---

### 2. Ventas Detalladas (Paginado)

```
GET /api/v1/admin-panel/sales?page=1&limit=20
GET /api/v1/admin-panel/sales?page=1&limit=20&month=6
GET /api/v1/admin-panel/sales?page=1&limit=20&search=Juan
Authorization: Bearer <token_admin>
```

#### Parámetros

| Parámetro | Tipo   | Obligatorio | Descripción                              |
|-----------|--------|-------------|------------------------------------------|
| `page`    | number | sí          | Número de página (1-based)               |
| `limit`   | number | sí          | Items por página                         |
| `month`   | number | no          | Filtrar por mes (1-12)                   |
| `search`  | string | no          | Búsqueda por nombre de cliente           |

#### Respuesta

```json
{
  "sales": [
    {
      "id": "uuid",
      "title": "Curso de Nutrición Avanzada",
      "type": "Asesoría",
      "date": "2025-06-15T10:30:00.000Z",
      "firstName": "Juan",
      "price": "29.99",
      "status": "completed",
      "amount_value": "29.99",
      "amount_currency": "EUR",
      "purchase_from": "stripe",
      "image": "https://storage.googleapis.com/..."
    }
  ],
  "page": 1,
  "totalPages": 10,
  "length": 200
}
```

| Campo             | Descripción                                   |
|-------------------|-----------------------------------------------|
| `sales[].type`    | Tipo de venta: `"Curso"`, `"Asesoría"`, `"Libro"` |
| `sales[].status`  | Estado del pago                               |
| `sales[].amount_currency` | Moneda (EUR)                          |
| `sales[].purchase_from`   | Plataforma: `"stripe"`, `"paypal"`    |
| `sales[].image`   | URL de imagen del producto                    |

**Uso en dashboard:** Tabla de ventas recientes, detalle de transacciones por mes.

---

### 3. Progreso de Usuario

```
GET /api/v1/admin-panel/progress-user?user_id=<uuid>
Authorization: Bearer <token_admin>
```

Retorna el progreso de asesorías y metas de un usuario específico.

**Uso en dashboard:** Panel de detalle al seleccionar un usuario desde la lista de ventas.

---

### 4. Lista de Usuarios

```
GET /api/v1/admin-panel/users?page=1&limit=20
GET /api/v1/admin-panel/users?type=adviser
Authorization: Bearer <token_admin>
```

Lista paginada de usuarios con filtro opcional por rol.

**Uso en dashboard:** Selector de usuario para ver detalle de progreso, o tabla de gestión.

---

### 5. Información del Admin

```
GET /api/v1/admin-panel/me
Authorization: Bearer <token_admin>
```

Datos del administrador autenticado.

**Uso en dashboard:** Avatar, nombre, rol en la barra superior.

---

### 6. Roles del Sistema

```
GET /api/v1/admin-panel/roles
Authorization: Bearer <token_admin>
```

Lista de roles disponibles con sus permisos.

---

## Flujo Recomendado para el Dashboard

```
Al cargar el dashboard:

1. GET /admin-panel/total-sales
   → Tarjetas KPI: cursos, asesorías, libros, usuarios

2. GET /admin-panel/sales?page=1&limit=20&month=<mes_actual>
   → Tabla de ventas del mes

3. [Opcional] GET /admin-panel/sales?page=1&limit=5
   → Últimas 5 ventas para sección "Actividad Reciente"

4. Al seleccionar un usuario de la tabla:
   GET /admin-panel/progress-user?user_id=<id>
   → Progreso detallado del usuario
```

---

## Notas Técnicas

- Autenticación: `Authorization: Bearer <token>` (JWT obtenido de `POST /api/v1/admin-panel/login`)
- Paginación: `page` y `limit` son obligatorios, incluso para consultas sin filtro
- Filtro por mes: usar número del 1 al 12. Filtra ventas del mes actual del año en curso
- Búsqueda: `search` busca por nombre del cliente (firstName)
- Moneda: Todos los montos están en EUR
- Formatos de fecha: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- Rate limit (admin): 5 requests/minuto — considerar caching en el frontend
