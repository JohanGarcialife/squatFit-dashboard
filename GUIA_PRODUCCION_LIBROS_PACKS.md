# Guía de Producción: Libros, Versiones, Packs y Canjes

**Documento interno para el desarrollador de producción. No incluir en el repositorio git.**

---

## 1. Modelo de negocio

### Precios

- Cada versión tiene su propio precio en la tabla `versions` (columna `price`).
- Los packs tienen precio en la tabla `packs` (columna `price`).

### Compra física

- **Versión individual:** Se compra una versión concreta.
- **Pack:** Se compran varias versiones en un solo pedido.
- Solo se puede comprar físico por versión o por pack.

### Compra digital

- **Con suscripción activa:** Acceso a toda la biblioteca digital.
- **Sin suscripción:** El usuario debe contratar suscripción (monthly, annual o permanent). No hay compra individual de versión digital.

### Códigos de canje

- `product_type: 'version'` – Da acceso a una versión.
- `product_type: 'pack'` – Da acceso a todas las versiones del pack.
- `product_type: 'course'` – Da acceso a un curso.

---

## 2. Crear un libro

### Endpoint

```
POST /api/v1/book
Authorization: Bearer <token_admin>
Content-Type: multipart/form-data
```

**Body:**

- `title`: string (requerido)
- `subtitle`: string (requerido)
- `image`: archivo o URL de la imagen de portada (requerido)

**Nota:** El precio no va en el libro. Se asigna a cada versión al crearla.

### Resultado

1. Se crea el libro en `books`.
2. El libro **no** aparece en el catálogo hasta que tenga al menos una versión.
3. Crear versiones con `POST /api/v1/book/:bookId/versions` (ver sección 2.1).

### 2.1. Crear versiones de un libro

```
POST /api/v1/book/:bookId/versions
Authorization: Bearer <token_admin>
Content-Type: multipart/form-data
```

**Body (form-data):**

- `title`: string (requerido)
- `price`: string (requerido), precio en EUR
- `image`: string (opcional), URL de la imagen de la versión
- `file`: archivo PDF (obligatorio) – versión digital del libro

El PDF es obligatorio porque cada versión existe en físico y digital. El archivo se sube a GCS y su ruta se guarda en `versions.url`.

### 2.2. Actualizar PDF de una versión ya creada

Para reemplazar el PDF de una versión existente (por ejemplo, correcciones o nueva edición):

```
POST /api/v1/book/upload-private-file?version_id=:versionId
Authorization: Bearer <token_admin>
Content-Type: multipart/form-data
```

**Query:**

- `version_id`: UUID de la versión (requerido)

**Body (form-data):**

- `file`: archivo PDF (obligatorio)

Este endpoint sube el nuevo PDF y actualiza `versions.url`. Útil para versiones creadas antes de exigir PDF en la creación, o para actualizar el contenido digital sin crear una nueva versión.

### 2.3. Listar versiones de un libro

```
GET /api/v1/book/:bookId/versions
Authorization: Bearer <token>
```

### 2.4. Obtener detalle de una versión

```
GET /api/v1/book/versions/:versionId
Authorization: Bearer <token>
```

### 2.5. Actualizar versión

```
PUT /api/v1/book/versions/:versionId
Authorization: Bearer <token_admin>
Content-Type: application/json
```

**Body:** `{ "title"?: string, "price"?: string, "image"?: string }`

### 2.6. Eliminar versión

```
DELETE /api/v1/book/versions/:versionId
Authorization: Bearer <token_admin>
```

Solo se puede eliminar si la versión **no está en uso** (no hay compras ni está en ningún pack).

---

## 3. Crear un pack

### Endpoint

```
POST /api/v1/book/packs
Authorization: Bearer <token_admin>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Pack Combo Libros",
  "description": "Libro Europa + América",
  "price": "40",
  "version_ids": [
    "uuid-version-europa",
    "uuid-version-america"
  ]
}
```

- `name`: string (requerido)
- `description`: string (opcional)
- `price`: string (requerido), precio en EUR
- `version_ids`: array de UUIDs (requerido, al menos uno)

### Obtener version_ids

`GET /api/v1/book/all` devuelve el catálogo con `versions[].version_id`.

### Otros endpoints de packs

- `GET /api/v1/book/packs` – Listar packs
- `GET /api/v1/book/packs/:id` – Detalle con versiones
- `PUT /api/v1/book/packs/:id` – Actualizar (body: `{ name?, description?, price? }`)

---

## 4. Compra

### Versión individual (físico)

```
POST /api/v1/book/create-payment-intent-version
Authorization: Bearer <token_usuario>
Content-Type: application/json

{
  "version_id": "uuid-de-la-version",
  "quantity": 1
}
```

Respuesta: `clientSecret` para el Payment Element de Stripe.

### Pack (físico)

```
POST /api/v1/book/create-payment-intent-pack
Authorization: Bearer <token_usuario>
Content-Type: application/json

{
  "pack_id": "uuid-del-pack",
  "quantity": 1
}
```

### Suscripción digital

```
POST /api/v1/book/create-payment-intent-digital
Authorization: Bearer <token_usuario>
Content-Type: application/json

{
  "subscription_type": "monthly"
}
```

Valores de `subscription_type`: `monthly`, `annual`, `permanent`.

- Usuario con suscripción activa: responde con `hasActiveSubscription: true`, sin pago.
- Usuario sin suscripción: crea suscripción en Stripe.

---

## 5. Códigos de canje

### Estructura en BD

- `code`: Código único
- `product_type`: `'version'` | `'pack'` | `'course'`
- `product_id`: UUID de la versión, pack o curso

### Crear código

```
POST /api/v1/book/redeem-code
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "code": "PROMO2025",
  "product_id": "uuid-version-o-pack-o-curso",
  "product_type": "version"
}
```

- `code`: string (6-20 caracteres, mayúsculas y números)
- `product_id`: UUID
- `product_type`: `"version"` | `"pack"` | `"course"` (default: `"version"` si no se envía)

### Canjear código

```
GET /api/v1/book/redeem-code?code=PROMO2025
Authorization: Bearer <token_usuario>
```

---

## 6. Estructura de base de datos

### Tablas

- **books**: `id`, `title`, `subtitle`, `image`, `is_active`, `created_at`, `updated_at`
- **versions**: `id`, `book_id`, `title`, `image`, `url`, `version`, `price`, `created_at`, `updated_at`
- **user_has_books**: `user_id`, `book_id`, `version_id`, `purchase_id`, `amount_value`, `amount_currency`, `purchase_from`, etc.
- **packs**: `id`, `name`, `description`, `price`, `is_active`, `created_at`, `updated_at`
- **pack_items**: `id`, `pack_id`, `version_id`
- **redeem_codes**: `code`, `product_type`, `product_id`, `is_used`, `user_id`, `used_at`

---

## 7. Webhooks Stripe

`payment_intent.succeeded` procesa según `product_type` en metadata:

- `version`: Registra la versión en `user_has_books`.
- `pack`: Registra todas las versiones del pack en `user_has_books`.
- `book`: Registra la primera versión del libro en `user_has_books`.

---

## 8. Checklist de despliegue

- [ ] Ejecutar migraciones en la base de datos de producción.
- [ ] Configurar webhooks de Stripe para `payment_intent.succeeded`.
- [ ] Probar compra versión, pack y suscripción digital en staging.
- [ ] Probar códigos de canje para versión y pack.
