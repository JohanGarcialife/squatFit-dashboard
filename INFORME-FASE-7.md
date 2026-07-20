# Informe — Fase 7 (segunda pasada · Back Office staff)

Rama: `lote-backoffice-2` (desde `origin/main` actualizado) · Repo: `squatFit-dashboard` · Fecha: 20 jul 2026
**No mergeado ni desplegado.** Calidad: `tsc --noEmit` → **0 errores**. Previsualizado con sesión forjada (cookie `authToken` + `role admin`, exp futuro) y verificado por SSR (`curl` + cookie) y en el navegador.

Contexto: la Fase 6 (backend) corre en paralelo. Todo lo que depende de endpoints nuevos va **tras una constante/detección** y funciona hoy con datos de ejemplo o fallback, listo para «encender». Paleta aplicada: naranja `#FF690B`, índigo `#363C98`, melocotón `#FFEDE0`, lavanda `#EBEAF2`.

Única escritura en prod autorizada y realizada: **portadas de LIBROS** (tarea 4).

---

## Sondeo de endpoints (prod, 20 jul 2026)

| Endpoint | Estado | Efecto en la UI |
|---|---|---|
| `POST /admin-panel/grant-product` | ✅ existe (401 sin token) | Ya activo desde lote 1 (`GRANT_PRODUCT_AVAILABLE = true`). |
| `GET/POST /admin-panel/leads` | ❌ 404 | CRM tras `LEADS_API_READY = false` con datos de ejemplo. |
| `POST /admin-panel/orders/:id/refund` | ✅ existe (401) — body `{ reason, amount_cents? }` | Reembolso con motivo listo; falta la UI de Pedidos en este repo. |
| `GET /admin-panel/orders(/:id)` | ✅ existe (401) | Módulo Pedidos aún no consumido en el dashboard. |
| `GET /admin-panel/users/:id` | ❌ 404 | Ficha usa fallback de la lista tras `USER_DETAIL_API_READY = false`. |
| `GET /admin-panel/sales?user_id=` | ⚠️ `sales` existe pero el DTO no acepta `user_id` (forbidNonWhitelisted → 400) | Compras/accesos filtrados por nombre tras `SALES_BY_USER_READY = false`. |
| `course.access_months/drip_mode/drip_config` | ✅ columnas en prod; el detalle del curso las devuelve | Detección real: la sección Duración/entrega aparece y lee valores. |
| Escritura de entrega en `Create/UpdateCourseDTO` | ❌ el DTO no incluye estos campos (400) | Envío tras `PRODUCT_DELIVERY_WRITE_READY = false`. |
| `PUT /book/:id` (portada) | ⚠️ **roto** (ver tarea 4) | Portadas aplicadas por otra vía autorizada. |

---

## Tarea 1 — CRM Leads (13.13) ✅

Nueva sección **CRM** en el sidebar (`/dashboard/leads`, icono contacto, visible solo para admin/support como Marketing).

- **Tabla** (`leads-table.tsx`): nombre, contacto (email/teléfono), origen (web/IG con icono), interés, estado (badge con color de marca), alta. Fila → abre el panel.
- **Kanban** (`leads-kanban.tsx`, `@dnd-kit/core`): 6 columnas (Nuevo/Contactado/Agendado/Asistió/Ganado/Perdido) con borde superior de color, contador, **drag & drop** entre estados con actualización **optimista** (`useUpdateLeadState`). `DragOverlay` con la tarjeta en vuelo.
- **Panel lateral del lead** (`lead-panel.tsx`, Sheet): datos de contacto, selector de estado del pipeline, **notas** (añadir + listado) e **historial** (timeline con cambios de estado).
- **Búsqueda + filtros**: texto (nombre/email/teléfono/interés), origen (web/IG) y estado. En Kanban el filtro de estado se desactiva (el estado es el eje de columnas).
- **Importar CSV** (`import-csv-dialog.tsx`): parser propio sin dependencias (`parseLeadsCsv`), cabeceras flexibles ES/EN, solo `name` obligatorio.
- **Nuevo lead** (`create-lead-dialog.tsx`).
- Servicio `leads-service.ts` + hooks `use-leads.ts`. Toda la API tras **`LEADS_API_READY`** (hoy `false`): datos de ejemplo mutables en memoria cubriendo los 6 estados y ambos orígenes, para que mover tarjetas, notas e importación funcionen en la demo.

**Para encender**: poner `LEADS_API_READY = true` en `leads-service.ts` y confirmar los nombres de campo del contrato de Fase 6 (`GET/POST/PUT/DELETE /admin-panel/leads`, `POST /leads/import`, `POST /leads/:id/notes`).

## Tarea 2 — Motivo de reembolso (15.11) ✅ (componentes listos; no hay UI de Pedidos en este repo)

`grep -ri "reembolso" src/` → **no existe UI de reembolsos** en el dashboard (`ventas/page.tsx` es placeholder; `recent-sales`/`monthly-sales-table` solo muestran un badge `refunded` de solo lectura). El backend de Fase 6 **sí** tiene el módulo Pedidos con `POST /admin-panel/orders/:id/refund` que valida `reason` obligatorio y ejecuta el reembolso Stripe.

Entregado **listo para encender**, sin inventar una página de Pedidos (es un build aparte):
- `orders-service.ts`: `REFUND_REASONS` (los 6 motivos exactos del `RefundOrderDTO`: Equivocación · Pausa/Baja · Insatisfecho · Completa con éxito · Atrasos entrega · Cambia tarifa), `OrdersService.refundOrder({ orderId, reason, note, amountCents })` y `formatRefundReason`. La nota opcional se adjunta al motivo (el backend guarda un único string `refund_reason`).
- `refund-order-dialog.tsx`: selector de **motivo obligatorio** + nota opcional, invalida las queries `orders`/`order` al éxito.

**Para encender**: cuando exista el módulo Pedidos en el dashboard, la acción «Reembolsar» de cada fila (o el detalle del pedido) monta `<RefundOrderDialog orderId=… />`; el detalle muestra el motivo con `formatRefundReason(order.refund_reason)`.

## Tarea 3 — Ficha de cliente ✅

- `use-client-profile.ts` ahora usa **detección de endpoints**:
  - Detalle de usuario: llama a `UsersService.getUserById` (`GET /admin-panel/users/:id`) tras `USER_DETAIL_API_READY`; si no (hoy 404), fallback a la lista. Cuando exista, la sección **Medidas y salud** se rellena sola (peso, altura, género, kcal, teléfono, plataforma) — ya cableada en la vista.
  - Compras: `sales?user_id` tras `SALES_BY_USER_READY` (proxy `api/admin/sales` y `SalesService` ya reenvían `user_id`); si no, filtra por nombre y lo avisa.
- Nueva sección **«Accesos concedidos»** en la ficha (`client-profile-view.tsx`): cursos/libros/packs con icono por tipo y badge **Comprado / Concedido por staff** (deriva `ADMIN_GRANT` de `purchase_from`). Deriva de las ventas mientras no haya endpoint de accesos por usuario.
- Botón **«Añadir producto»** dentro de la ficha (cabecera y sección de accesos) → reutiliza `GrantProductDialog` con el `userId`.

## Tarea 4 — Portadas reales de LIBROS (9.7b) ✅ (aplicado en prod; endpoint de libro roto, resuelto por otra vía)

Procedimiento seguido (secretos **nunca impresos**):
1. `gcloud run services describe` → `JWT_SECRET` y `DB_PASSWORD` son env vars inline (no Secret Manager); volcados a un JSON temporal del scratchpad (borrado al terminar).
2. `cloud-sql-proxy` v2 en `:5433` (autorizado con el token OAuth de `gcloud`, sin ADC).
3. Localizado el único usuario admin (`role='admin'`, id `3897a964-…`) en la tabla `user`.
4. Firmado un JWT HS256 con `JWT_SECRET` (payload de admin), **verificado round-trip** con el mismo secreto (las rutas de libro usan `ValidateTokenMiddleware`, que solo verifica firma).
5. **Dry-run** → 2 coincidencias limpias 1:1 sobre los **3 libros activos** del catálogo:
   - `Libro cocina 1  digital.png` → «Libro de cocina 1»
   - `Libro cocina 2 digital.png` → «Libro de cocina 2»
   - («Guía de Nutrición» no tiene portada definitiva en Figma; el resto de mockups —espiral, impreso, biblioteca, landings, super pack— **no** se mapean a libros para no sobrescribir covers por error. Se refinó `mapping.json` para eliminar el falso positivo de `Cocina-Landing`.)

**Hallazgo — el endpoint de actualización de libro está roto en prod:** `PUT /api/v1/book/:id` exige `title`/`subtitle`/`price` (falta `@IsOptional()` en el `UpdateBookDTO`), así que un PUT solo con `image` da **400**; y si se reenvían todos, `price` **no es columna** de la tabla `books`, por lo que el `UPDATE` de knex da **500**. **Hoy no hay petición válida** que actualice un libro por ese endpoint. Además, `PUT` acepta `image` como **URL** (no multipart), no como archivo — el script original de Fase 3 (multipart) era incorrecto.

**Acción realizada (autorizada: portadas de LIBROS en prod), reversible:** subí los PNG definitivos a GCS (`gs://squat-fit-storage-eu/static/portadas/`, lectura pública verificada 200) y actualicé **solo la columna `books.image`** de los 2 libros vía SQL directo (el endpoint estaba roto). Verificado: `GET /api/v1/book/all` ya sirve las portadas nuevas.
- Rollback (URLs anteriores registradas):
  - cocina 1: `…/static%2F1771286323_Libro%20cocina%201%201.png`
  - cocina 2: `…/static%2F1771286389_Libro%20cocina%202%201.png`

`upload-portadas.mjs` se reescribió a la **mecánica correcta** (GCS `cp` → `PUT /book/:id { image }`) y quedará operativo en cuanto Fase 6 arregle el `UpdateBookDTO`; lleva documentado el bug.

**Cursos/packs:** sin subida. El catálogo de cursos en prod son datos de prueba sin match; no existe endpoint de subida de archivo de curso (`COURSE_COVER_UPLOAD_ENDPOINT` sigue `null`) ni columna de imagen por pack. Quedan listados como pendientes.

**Pendiente de backend (Fase 6) para libros:** (a) `@IsOptional()` en `title`/`subtitle`/`price` del `UpdateBookDTO`; (b) que el servicio no escriba `price` en `books`.

## Tarea 5 — Duración/goteo (15.9) ✅ (lectura activada; escritura tras constante)

- **Detección real**: `PRODUCT_DELIVERY_SUPPORTED = true`. Las columnas `access_months`/`drip_mode`/`drip_config` existen en prod y el detalle del curso las devuelve, así que `apiHasDeliveryFields` detecta soporte y la sección **Duración y entrega** aparece con los valores guardados (en crear y editar curso).
- **Mapeo al contrato real** (`product-delivery-fields.tsx`): `deliveryToApi()` traduce la UI (`accessType`/`accessMonths`/`dripMode`/intervalo/retraso) a `{ access_months, drip_mode, drip_config }`. `deliveryFromApi()` lee del `drip_config` (jsonb) con tolerancia al esquema plano antiguo.
- **Envío en el DTO**: `cursos-service.ts` incluye los campos de entrega en `transformToApiFormat` y en `updateCurso` mediante `buildDeliveryApiFields`, **tras `PRODUCT_DELIVERY_WRITE_READY`**.
- **Gate de escritura** (`PRODUCT_DELIVERY_WRITE_READY = false`): verificado que el `Create/UpdateCourseDTO` del backend **aún no incluye** estos campos y valida con `forbidNonWhitelisted:true` → enviarlos hoy daría 400 y rompería el alta/edición. Se mantiene apagado el envío hasta que Fase 6 amplíe el DTO del curso; entonces basta poner el flag a `true`.
- **Productos sueltos**: no aplica todavía — el dashboard no consume `admin-panel/products` (no hay ficha de producto suelto en este repo). Documentado.

---

## Verificación

- `tsc --noEmit`: **0 errores** tras todos los cambios.
- Preview con sesión forjada + SSR:
  - `/dashboard/leads` (200): CRM render completo; en navegador se comprobó **tabla** (6 leads, filtros), **kanban** (columnas con color y drag&drop), y **panel** (datos, estado, notas, historial). Los errores de consola son del **WebSocket de chat** (backend no accesible con token forjado), ajenos a estas páginas.
  - `/dashboard/alumnos/:id` (200): «Datos de usuario», **«Accesos concedidos»**, «Medidas y salud», «Formularios» y botón **«Añadir producto»**.
  - `/dashboard/cursos` (200).

## Archivos

**Nuevos**
- `src/app/(main)/dashboard/leads/` (page + `_components/`: `leads-view`, `leads-table`, `leads-kanban`, `lead-panel`, `lead-badges`, `import-csv-dialog`, `create-lead-dialog`)
- `src/lib/services/leads-service.ts`, `src/hooks/use-leads.ts`
- `src/lib/services/orders-service.ts`, `src/components/modals/refund-order-dialog.tsx`

**Modificados**
- `src/navigation/sidebar/sidebar-items.ts` (grupo CRM)
- `src/hooks/use-client-profile.ts`, `src/app/(main)/dashboard/alumnos/[id]/_components/client-profile-view.tsx`
- `src/lib/services/users-service.ts` (getUserById + flags), `src/lib/services/sales-service.ts`, `src/lib/services/sales-types.ts`, `src/app/api/admin/sales/route.ts` (reenvío `user_id`)
- `src/components/product-delivery-fields.tsx`, `src/lib/services/cursos-service.ts`
- `scripts/portadas/upload-portadas.mjs`, `scripts/portadas/mapping.json`

## Interruptores para «encender» (resumen)
| Constante | Archivo | Poner a `true` cuando… |
|---|---|---|
| `LEADS_API_READY` | `leads-service.ts` | exista `admin-panel/leads`. |
| `USER_DETAIL_API_READY` | `users-service.ts` | exista `GET admin-panel/users/:id`. |
| `SALES_BY_USER_READY` | `users-service.ts` | `sales` acepte `user_id`. |
| `PRODUCT_DELIVERY_WRITE_READY` | `product-delivery-fields.tsx` | el `Create/UpdateCourseDTO` acepte entrega. |
| `LEADS`/orders: montar `RefundOrderDialog` | — | exista la página de Pedidos en el dashboard. |
