# Informe — Fase 10 (CRM de leads · Pipeline + Repesca)

Rama: `lote-backoffice-3` (desde `origin/main` actualizado, con el PR #5 de Fase 7 ya mergeado) · Repo: `squatFit-dashboard` · Fecha: 20 jul 2026
**No mergeado ni desplegado. Sin escrituras en prod, sin tocar Stripe.** Calidad: `tsc --noEmit` → **0 errores**; `eslint` sobre el módulo → 0 errores (mismos tipos de warnings que el resto del repo). Verificado en navegador con sesión forjada + SSR por `curl` (200).

Contexto: la **Fase 9 (backend)** corre en paralelo. Todo lo que depende de su contrato nuevo va **tras detección de campos o constante**, como ya hace el repo. Paleta aplicada: naranja `#FF690B`, índigo `#363C98`, melocotón `#FFEDE0`, lavanda `#EBEAF2`.

---

## Sondeo de endpoints (prod, 20 jul 2026)

| Endpoint / campo | Estado | Efecto en la UI |
|---|---|---|
| `GET/POST/PUT /admin-panel/leads` | ✅ existe (401 sin token) — v1 del lote 4 | `LEADS_API_READY = true` se mantiene. |
| `POST /admin-panel/leads/:id/convert` | ❌ 404 | Botón «Convertir en cliente» deshabilitado tras `LEAD_CONVERT_READY = false` (con nota explicativa). |
| Campos v2: `objection`, `intake_date`, `is_customer`, `converted_user_id`, status `realizada`/`esperando_pago` | ❌ aún no publicados | **Autodetección** en el GET + constante `LEADS_V2_WRITE_READY = false` de respaldo. |

## Qué se entregó (decisión de Hamlet)

### 1. UN solo listado; origen y setter/closer = filtros
- Se mantiene una única lista de leads. **Origen (Web/Instagram)** sigue siendo filtro; se añaden filtros de **Setter** y **Closer**.
- `setter`/`closer` **no están en el contrato de Fase 9**: la UI los trata como campos opcionales que se filtran en cliente, y los selectores **solo aparecen si algún lead los trae** (detección de campos). No se envían nunca a la API (los DTO validan con `forbidNonWhitelisted`). Si Fase 9 los añade con esos nombres (o `setter_name`/`closer_name`), se pintan solos.

### 2. Dos kanbans seleccionables (pestañas: Tabla · Pipeline comercial · Repesca)
- **Pipeline comercial** (`leads-kanban.tsx`): columnas **Nuevo → Contactado → Agendado → Llamada hecha → Esperando pago → Ganado → Perdido**, tarjetas ordenadas por **fecha de ingreso DESC** (las nuevas arriba; el orden se aplica centralizado en `leads-view.tsx` y vale también para la tabla). Drag & drop con la mecánica ya existente (@dnd-kit + actualización optimista). La tarjeta muestra la fecha de alta y un check verde si ya es cliente.
- **Repesca** (`leads-repesca.tsx`, nuevo): solo leads en **Perdido/Seguimiento**, agrupados por **objeción** (Precio · Timing/Pospone · Confianza · Otros; los sin clasificar caen en «Otros» para que nadie quede fuera). Fecha visible con «hace N días» (en naranja si >30). Extras para campañas:
  - Filtro **«Solo >30 días desde el alta»** (switch).
  - **Selección** por tarjeta y por columna (checkbox) + **Exportar CSV** de la selección (BOM para Excel; columnas nombre/email/teléfono/origen/interés/estado/objeción/alta/setter/closer).
  - Arrastrar una tarjeta entre columnas **cambia la objeción** (misma mutación que el selector del panel).

### 3. Estados y objeción (contrato Fase 9)
- `LEAD_STATES` = pipeline de 7 + **«Seguimiento»** (no es columna del pipeline; es el aparcadero de repesca y se asigna desde el panel). *Decisión documentada:* el contrato solo lista `realizada`/`esperando_pago`; si `seguimiento` no llega a backend, ningún lead tendrá ese estado y la repesca mostrará solo «Perdido», sin romper nada.
- **Normalización tolerante** en `leads-service.ts`: la API puede devolver `Asistió` (v1), `realizada`/`esperando_pago` (v2), snake o etiquetas — todo se mapea al estado de UI. El legado **«Asistió» ≡ «Llamada hecha»**.
- **Escritura**: mientras no haya v2, «Llamada hecha» se escribe como `Asistió` (el v1 lo acepta); «Esperando pago»/«Seguimiento» y la objeción lanzan un **error claro** («se activará cuando Fase 9 publique…») y la tarjeta vuelve a su columna. En el selector del panel esos estados salen deshabilitados con « · Fase 9».
- `intake_date` (fallback `created_at`) se muestra en tabla, tarjetas y panel, y ordena todo el listado.

### 4. Ficha del lead (panel)
- Selector de **objeción** editable (con «Sin clasificar»; deshabilitado + nota si el backend aún no la guarda).
- Botón **«Convertir en cliente»** → `POST /admin-panel/leads/:id/convert`, tras `LEAD_CONVERT_READY` (hoy `false` → deshabilitado con nota). Al convertir: badge **«✅ Ya es cliente»** + botón **«Ver ficha del cliente»** → `/dashboard/alumnos/:converted_user_id`.
- Fila Setter/Closer y fecha de alta añadidas a los datos de contacto.

### 5. Detección/constantes + datos de ejemplo
- **Autodetección v2**: si el `GET` devuelve leads con `objection`/`intake_date`/`is_customer`/`converted_user_id`, `leadsV2WritesEnabled()` se enciende sola (además del interruptor manual `LEADS_V2_WRITE_READY`).
- **`?demo=1`** en `/dashboard/leads`: fuerza los **datos de ejemplo** aunque la API real esté activa, sin tocarla (las mutaciones sobre ids `sample-*` son locales; crear/importar en demo también). Banner naranja lo avisa. Así Hamlet puede revisar ambos kanbans hoy, con la API v1 encendida y sin esperar a Fase 9.
- Los 13 leads de ejemplo cubren: los 7 estados del pipeline + Seguimiento, las 4 objeciones, leads >30 días, un convertido en cliente y setters/closers (María/Laura/Hamlet).
- El **import CSV** acepta además `objection`/`objeción`, `setter`, `closer`, y los alias de estados nuevos (`realizada`, `esperando pago`, `seguimiento`, `llamada hecha`).

## Verificación (sesión forjada + `?demo=1`)

- `tsc --noEmit` 0 errores; SSR `GET /dashboard/leads` → 200 con las tres pestañas.
- **Tabla**: orden por alta DESC, columna Objeción, check «ya es cliente», filtros (origen/setter/closer/estado).
- **Pipeline**: 7 columnas con contador y color, tarjetas con fecha, orden DESC dentro de columna.
- **Repesca**: agrupación por objeción, «hace N días», filtro >30 días (probado: ocultó el lead de 17 días y recalculó la selección), selección por columna (2 seleccionados → botón export habilitado).
- **Panel**: cambio de objeción movió la tarjeta de Timing→Confianza al instante; **convertir** puso Ganado + badge + enlace a la ficha y la tarjeta salió de la repesca.
- Modo real (sin demo): sin crash; con el token forjado la API da 401 y queda el estado vacío (normal); setter/closer ocultos al no venir en los datos.
- **Bug encontrado y corregido durante la verificación**: el store de ejemplo devolvía las mismas referencias mutables y react-query/useMemo no veían los cambios (la tarjeta convertida no salía de la repesca). `getLeads` ahora devuelve copias frescas.
- No probado en navegador: la descarga física del CSV (el panel de preview bloquea descargas); el código es un Blob estándar. El drag&drop sintético no dispara el sensor de @dnd-kit desde la automatización, pero la mecánica es la misma ya existente del pipeline y la mutación subyacente quedó probada vía panel.

## Archivos

**Nuevos**: `src/app/(main)/dashboard/leads/_components/leads-repesca.tsx`
**Modificados**: `leads-service.ts` (estados/objeción/normalización/detección v2/convert/CSV export), `use-leads.ts` (`useUpdateLead` unificado —estado+objeción— con optimista, `useConvertLead`), `leads-view.tsx` (3 pestañas, filtros setter/closer, `?demo=1`, orden central), `leads-kanban.tsx`, `leads-table.tsx`, `lead-panel.tsx`, `lead-badges.tsx`, `create-lead-dialog.tsx`, `import-csv-dialog.tsx`.

## Interruptores para «encender» cuando Fase 9 publique

| Qué | Dónde | Cómo |
|---|---|---|
| Campos v2 (objection, intake_date, is_customer, estados `realizada`/`esperando_pago`) | `leads-service.ts` | **Se autodetecta** con el primer GET que los devuelva. Forzar manualmente: `LEADS_V2_WRITE_READY = true`. |
| Convertir en cliente | `leads-service.ts` | `LEAD_CONVERT_READY = true` cuando `POST /admin-panel/leads/:id/convert` deje de dar 404. |
| Estado `seguimiento` | — | Si Fase 9 no lo añade al enum, no hay que tocar nada (la repesca funciona solo con Perdido). Si lo añade, ya está mapeado. |
| Setter/Closer | `leads-service.ts` | Si Fase 9 añade `setter`/`closer` (o `*_name`) al lead, los filtros aparecen solos. Para **escribirlos** habrá que añadirlos al PUT cuando el DTO los acepte. |

**Sugerencia para el contrato de Fase 9** (ya reflejada en los comentarios del servicio): que el PUT acepte `objection: null` para limpiar la objeción, y que `GET /admin-panel/leads` devuelva `intake_date` siempre (la UI usa `created_at` como fallback).
