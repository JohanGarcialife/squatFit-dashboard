# Informe — Fase 14 (Back office staff)

Rama **`lote-backoffice-4`** (desde `origin/main`, que ya incluía lote-backoffice-3 PR#6 y
lote-backoffice-5 PR#7). **Sin mergear.** `tsc --noEmit` → 0 errores; `npm run build` → OK
(incluye `/dashboard/catalogo` y `/dashboard/pedidos`). Verificado en el navegador con sesión
real forjada (cookie `authToken` = token admin de prod) y contra prod por `curl` con token admin.

## PASO 0 — Verificación contra prod (21-jul-2026)

- **Backend DESPLEGADO hoy**: Cloud Run `squatfit-api-00201-6sq` (100% tráfico, 12:32Z). Fase 9
  (PR#17) y Fase 12 (PR#22) están en `main` → sus rutas están LIVE. El `convert` que en la Fase 10
  daba 404 ahora da 401 sin token / 404 «Lead no encontrado» con token → **existe**.
- `GET /admin-panel/leads` → 200 con token admin; `counts` trae los **8 estados v2**. **`total=0`**:
  el import de ~160 leads (`scripts/import-leads.ts --commit`) **aún no se ha corrido en prod** →
  Pipeline/Repesca salen vacíos con datos reales hasta entonces (usar `?demo=1`).
- Contrato verificado end-to-end (crear→mover→objeción→convertir→borrar) con las cargas EXACTAS
  que ahora manda el front.

## 1) CRM de leads — encendido + arreglos de contrato

`LEAD_CONVERT_READY` y `LEADS_V2_WRITE_READY` → **`true`**. Al verificar contra prod aparecieron
varios desajustes de contrato que **habrían roto todas las escrituras** (el backend valida con
`forbidNonWhitelisted`); corregidos en `leads-service.ts`:

- **`convert` devuelve un envoltorio** `{ lead, linked, converted_user_id, warning? }`, no un lead
  plano. El front lo parsea y, cuando `linked=false`, muestra el **aviso** («…queda ganado pero sin
  enlazar…») como toast + una nota en el panel con botón «Reintentar enlace de cliente».
- **Claves erróneas**: el front mandaba `source`/`state` (nombres de UI) → 400. Ahora manda
  `origin` y `status` con el **enum en minúsculas** (`nuevo|contactado|…|seguimiento`) vía mapas
  `STATE_TO_API`/`SOURCE_TO_API`. En el GET solo se envían params válidos (`search`, `limit=200`).
- **Objeción `presupuesto`**: el backend acepta 5 objeciones; el front solo tenía 4. Añadida
  (`precio|timing|confianza|presupuesto|otros`) con etiqueta, color y alias de import.
- **`origin` vs `source`**: el backend devuelve `origin`; el front leía `source` → los leads de
  Instagram salían como «Web». Corregido; añadidos orígenes `email|youtube|otro`.
- **Filtros setter/closer → «Asignado»**: el backend tiene UN solo `assigned_to`/`assigned_to_name`.
  Se mapea `assigned_to_name` al lead y los dos selectores se unifican en un filtro **«Asignado»**
  que opera sobre ese nombre (en demo también cubre setter/closer).
- **Notas**: NO existe `POST /leads/:id/notes` (notes es una columna de texto única). El composer
  ahora **anexa a la columna `notes`** (línea `[ISO] cuerpo`) vía PUT y las parsea de vuelta a la
  lista, así el botón funciona contra datos reales.

Verificado en prod (crear con `origin=instagram/status=nuevo/objection=precio` → mover a
`realizada` → objeción `presupuesto` → convertir con `linked=false`+warning+`status=ganado` →
borrar; GET tras borrar = 404).

## 2) Catálogo de productos — editor de concesiones (página nueva)

**`main` no tenía página de Productos** (el catálogo de la memoria vive en la rama huérfana
`rediseno-back-office-lote-2`, sin mergear y **sin** editor de grants). Se ha construido nueva:
`/dashboard/catalogo` (`products-service.ts`, `use-products-catalog.ts`, `catalog-view.tsx`,
`product-grant-modal.tsx`) + entrada en el sidebar.

- **Editor `grant_type`/`grant_id`** en la ficha de producto: selector de qué concede
  (`course|program|book|pack|digital_library` o sin concesión) + selector del **curso/libro/pack**
  cargado en vivo de `/admin-panel/courses`, `/book/all`, `/book/packs` según el tipo. `digital_library`
  y «sin concesión» no piden `grant_id`.
- **Badge de tramo/duración** (`access_months`): Permanente / Anual (12 meses) / N meses, editable.
- **Aviso de sin mapeo**: banner + pestaña «Sin mapear · N» + badge por fila. Verificado con datos
  reales: **37/49 productos** tienen precio y sin concesión.
- PUT round-trip verificado contra prod (producto inactivo: `program`+curso+`access_months=6` → 200,
  luego revertido a null/null/null).

## 3) Pedidos — módulo nuevo (5 estados + acciones por fila)

**`main` tampoco tenía página de Pedidos** (`orders-service.ts` solo tenía `refund`; el propio
comentario decía «este repo aún no tiene la página de Pedidos»). Construida: `/dashboard/pedidos`
(`orders-view.tsx`, `order-detail-sheet.tsx`, `order-status-badge.tsx`, `use-orders.ts`) + sidebar.
`orders-service.ts` reescrito al contrato actual (list/detalle/status/payment/email/refund).

- **Columnas** (diseño memoria `squad-fit-pedidos-diseno`): Cliente + email · Pedido (`#id` clicable +
  fecha relativa «12 jul 2026») · **Productos** · **Origen** (UTM/atribución) · **Pago** (instrumento) ·
  Estado (píldora de 5 estados) · Total (tachado si Devuelto/Cancelado) · Acciones.
- **5 estados** con pestañas + contador (Todos/Pendiente/Procesando/Completado/Devuelto/Cancelado)
  y colores del diseño (Completado verde, Procesando índigo, Pendiente naranja, Devuelto/Cancelado gris).
- **Acciones por fila**: ver (ojo/clic en id → sheet de detalle), ficha del cliente, marcar
  completado, enviar email de estado, reembolsar. El detalle muestra items, envío, motivo de
  reembolso y **método de pago editable** solo para pagos manuales (seQura/efectivo).
- **Pedidos de catálogo (Fase 12)**: el checkout de catálogo puebla `orders`/`order_items` con
  `payment_method` y `origin` (ambas columnas ya se pintan). Aún **no hay compras de catálogo reales**
  en prod (solo 2 pedidos de prueba web `pending`); en cuanto entren, aparecen con pago/origen.
- **Arreglo de contrato**: el reembolso ahora manda `reason` como **slug** cerrado
  (`equivocacion|pausa_baja|…`) + `note` aparte (antes concatenaba el texto → habría dado 400).
- Verificado en prod: list `?status=pending` → 200, `?status=foo` → 400, PUT status
  `pending→processing→pending` → 200 (reversible).

## 4) Ficha de cliente — accesos, biblioteca y lead de origen

`getUserDetail` solo devolvía perfil + onboarding + IMC. Para mostrar la **caducidad de cursos**,
las **suscripciones de biblioteca** y el **lead convertido** hacía falta ampliarlo.

- **Backend (rama aparte `features-ficha-cliente-accesos` en `jarruiz/SquatFit`, pusheada SIN
  mergear)**: `getUserDetail` ahora añade, de forma aditiva:
  - `courses`: `user_has_course` ⋈ `course` con `expires_at` (null = permanente), `purchased_at`,
    `purchase_from`.
  - `library_subscriptions`: `digital_library_subscriptions` con `status`, `start_date`, `end_date`.
  - `converted_lead`: la fila de `leads` con `converted_user_id` = este usuario.
  ⚠️ **Requiere deploy manual del backend** antes de que el front lo muestre (queries validadas
  contra la BD real).
- **Front** (`users-service.ts`, `use-client-profile.ts`, `client-profile-view.tsx`): la pestaña
  «Accesos concedidos» pinta los cursos con **píldora de caducidad** (Permanente / Caduca DD/MM /
  Caducó DD/MM) y las **suscripciones de biblioteca** con su fin; «Datos de usuario» muestra
  **«Lead de origen»** enlazado al CRM (`/dashboard/leads?search=<email>`, la vista de leads ya lee
  ese `?search`). Todo **defensivo**: si el backend aún no envía los campos, las secciones se ocultan
  sin romper (siguen los accesos derivados de ventas).

## Pendientes / dependencias (para el coordinador)

1. **Desplegar `features-ficha-cliente-accesos`** (backend) para que la ficha muestre caducidades,
   biblioteca y lead de origen.
2. **Correr `import-leads --commit`** en prod para poblar los ~160 leads (Pipeline/Repesca vacíos
   hasta entonces).
3. **Mapear los 37 productos sin concesión** desde el nuevo Catálogo (o dejar los que se cobran sin
   grant, p. ej. Premium/consultas).
4. La rama huérfana `rediseno-back-office-lote-2` tiene un catálogo de productos distinto (sin editor
   de grants); si algún día se rescata, reconciliar con `/dashboard/catalogo` de esta fase.

## Archivos

Nuevos: `dashboard/catalogo/**`, `dashboard/pedidos/**`, `hooks/use-orders.ts`,
`hooks/use-products-catalog.ts`, `lib/services/products-service.ts`.
Modificados: `leads-service.ts`, `orders-service.ts`, `users-service.ts`, `use-client-profile.ts`,
`leads/_components/{leads-view,lead-panel,leads-repesca}.tsx`,
`alumnos/[id]/_components/client-profile-view.tsx`, `navigation/sidebar/sidebar-items.ts`.
Backend (otra rama): `admin-panel.repository.ts` (`getUserDetail`).
