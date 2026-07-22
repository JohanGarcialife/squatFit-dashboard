# INFORME — FASE 17 (lote-backoffice-6)

**Rama:** `lote-backoffice-6` (desde `origin/main`, ab80416). **No mergeada ni desplegada.**
Calidad: `npx tsc --noEmit` → **0 errores**; `npm run build` → OK (nueva ruta `/dashboard/recetas` compila);
`eslint` sobre lo tocado → 0 errores (solo warnings del mismo tipo que el resto del repo).

---

## 1) Gestor de contenido completo

### 1.a Editor de cursos: goteo (drip) + metadatos

`dashboard/cursos/[cursoId]/contenido` ampliado:

- **Módulos**: fila de metadatos dentro de cada módulo con **subtítulo** editable y **días de goteo**
  (`drip_days`: días tras la compra para desbloquear el módulo; vacío = disponible desde el día 0).
  El goteo activo se señala con una píldora «día N» en la cabecera del módulo.
- **Clases**: además de título y URL de Bunny, ahora **descripción corta**, **días de goteo** por clase
  (si se deja vacío hereda el del módulo) y **duración en minutos**. El orden (goteo por orden) ya existía
  con las flechas de reordenación (priority).
- El árbol que venga de la API real se normaliza (`normalizeTree`): si el backend aún no devuelve los
  campos nuevos, se rellenan a `null` y la pantalla no revienta.

**Flag:** sigue todo tras `COURSE_CONTENT_API_READY = false` (los endpoints de `features-lote-7` no están
en prod). En modo demo los cambios no persisten y se avisa en pantalla.

**Contrato backend requerido (añadir a los endpoints de contenido de `features-lote-7`):**

| Entidad | Campos nuevos | Endpoints afectados |
|---|---|---|
| `course_modules` | `drip_days INT NULL` | `GET /admin-panel/courses/:id/content`, `PUT /admin-panel/courses/modules/:id` |
| `lessons` | `drip_days INT NULL`, `duration_minutes INT NULL`, `description TEXT NULL` | `GET …/content`, `PUT /admin-panel/courses/lessons/:id` |

Semántica de desbloqueo (la aplica la web cliente): clase visible si
`hoy >= fecha_compra + (lesson.drip_days ?? module.drip_days ?? 0) días`.

### 1.b Editor de RECETAS (nuevo)

- **Nueva página** `/dashboard/recetas` (sidebar → Nutrición → Recetas, visible para todos los roles del
  panel) con banco de recetas: búsqueda por nombre/ingrediente, tarjetas con duración, raciones,
  nº de ingredientes, kcal y macros (HC/P/G), y pasos/materiales en el pie.
- **Editor completo** (crear y editar): nombre, descripción, **duración (min)**, raciones,
  **macros por ración** (kcal, HC, P, G), **ingredientes** (nombre + cantidad, añadir/quitar),
  **preparación** (pasos ordenables con flechas) y **materiales/utensilios**. Borrado con confirmación.
- Servicio nuevo: `src/lib/services/recetas-admin-service.ts`.

**Flag: `RECIPES_API_READY = false`** — sondeado prod el 22-jul-2026:
`GET /api/v1/admin-panel/recipes` → **404** (no existe). El `recipe/*` antiguo existe (401 sin token)
pero solo soporta nombre/descripción/macros, sin ingredientes ni preparación → no sirve para este editor.
Mientras tanto: banco demo en memoria (crear/editar/borrar funcionan en la sesión, no persisten) y aviso.

**Contrato backend propuesto (`admin-panel/recipes/*`):**

```
GET    /api/v1/admin-panel/recipes            → AdminRecipe[]
POST   /api/v1/admin-panel/recipes  {RecipeInput}
PUT    /api/v1/admin-panel/recipes/:id {RecipeInput}
DELETE /api/v1/admin-panel/recipes/:id

RecipeInput = {
  name, description?, duration_minutes?, servings?,
  ingredients: [{ name, quantity }],      // quantity texto libre: «200 g», «1 cda»
  preparation_steps: string[],            // en orden
  materials: string[],
  kcal, carbohydrates, proteins, fats     // por ración
}
```

Al desplegar: `RECIPES_API_READY = true` en `recetas-admin-service.ts` y funciona sin más cambios.

## 2) Ficha técnica del cliente (Doc 0 1.5–1.6)

`dashboard/alumnos/[id]` ampliada con **matriz de visibilidad por rol** y 3 secciones nuevas.

- **Matriz** en `src/lib/ficha-visibility.ts` (fácil de ajustar cuando Hamlet confirme el Doc 0):

| Sección | admin | adviser | dietitian | sales | psychologist | support_agent |
|---|---|---|---|---|---|---|
| Datos de usuario | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Objetivos | ✅ | ✅ | ✅ | — | ✅ | — |
| Medidas y salud | ✅ | ✅ | ✅ | — | — | — |
| Progreso | ✅ | ✅ | ✅ | — | — | — |
| Accesos concedidos | ✅ | ✅ | — | ✅ | — | ✅ |
| Compras | ✅ | — | — | ✅ | — | ✅ |
| Formularios | ✅ | ✅ | ✅ | — | ✅ | — |
| Notas de staff | ✅ | ✅ | ✅ | ✅ | ✅ | — |

  Rol desconocido → solo «Datos». El botón **Añadir producto** (grant) queda solo para `admin`.
  El rol sale del token (hook nuevo `use-staff-role`, sin tocar `jwt-utils`/`middleware`/`server-auth`).
  Con rol ≠ admin se muestra el aviso «Vista limitada por rol …».
  ⚠️ La matriz es defensa de **UI**: el backend debe aplicar el mismo criterio cuando exponga datos sensibles.

- **Secciones nuevas**:
  - **Objetivos**: kcal objetivo + ids de catálogo (objetivo de entrenamiento, actividad diaria, cardio,
    pasos, fuerza) del detalle de usuario. Falta que el backend exponga los **catálogos** para pintar
    etiquetas legibles en vez de ids.
  - **Progreso**: peso/altura/IMC actuales y último acceso a la app. La **serie histórica** necesita
    endpoint nuevo: `GET /admin-panel/users/:id/progress?from&to` → `[{ date, weight, measurements?,
    habits_score? }]` (conectará con el motor de hábitos de Alertas).
  - **Notas de staff**: alta/lectura/borrado de notas internas con autor (rol) y fecha.
    **Flag `CLIENT_NOTES_API_READY = false`** en `client-notes-service.ts`: el backend no tiene notas por
    usuario (las de leads sí existen). Contrato propuesto (espejo del de leads):
    `GET|POST /admin-panel/users/:id/notes`, `DELETE /admin-panel/users/notes/:noteId`.
    Mientras tanto las notas viven en memoria de la sesión y se avisa.

## 3) Leads: paginación >200 + dark mode

- **Paginación server-side** en `LeadsService.getLeads`: acumula páginas de 200 (`page`/`limit` del
  QueryLeadsDTO) hasta agotar la lista, con tope de seguridad de 25 páginas (5.000 leads, avisa por
  consola si se alcanza) y guarda anti-bucle si el backend repitiera página. Los kanbans/tabla siguen
  agrupando en cliente, ahora sobre la lista completa. *(No verificable end-to-end sin token real de
  prod; la lógica es la misma llamada que ya funcionaba con `limit=200`, iterada.)*
- **Dark mode** rematado (variantes `dark:` en colores de marca fijos que quedaban ilegibles):
  cabeceras de tabla y hovers de **Pedidos** y **Catálogo**, avisos demo/import de **Leads**, badges de
  estado de leads (`lead-badges`), badges y avatar de **Alumnos** (lista y ficha), campana de
  notificaciones y modal de grant del catálogo.

## Verificación (build de revisión en :3003, sesión forjada)

- SSR con cookie forjada (curl): `/dashboard/recetas`, `/dashboard/alumnos/:id`,
  `/dashboard/cursos/demo/contenido`, `/dashboard/leads` → **200**.
- Navegador (rol **admin**): **Recetas** renderiza con aviso de modo demo y 3 recetas de ejemplo; crear
  receta desde el diálogo → toast «Receta creada» y tarjeta nueva en el banco. **Contenido de curso**:
  píldora «día 14» en el módulo con goteo, fila de metadatos del módulo (subtítulo + días) y campos
  drip/duración/descripción por clase; guardar clase → «Clase guardada». **Ficha de cliente**: las 8
  pestañas + botón de grant; nota de staff añadida y pintada con badge del rol.
- Navegador (rol **sales** forjado): la ficha muestra exactamente Datos/Accesos/Compras/Notas, sin botón
  de grant y con el aviso de vista limitada. ✔ matriz aplicada.
- **Dark mode**: con `.dark`, el badge «Nuevo» de leads pasa a fondo índigo translúcido y texto `#b9bce8`
  (antes texto índigo sobre lavanda claro, ilegible).
- Nota operativa: con el token forjado la API real devuelve 401 y el interceptor de axios cierra sesión en
  bucle; para poder verificar la UI en navegador, la pasada interactiva se hizo con un build temporal
  apuntando `NEXT_PUBLIC_API_URL` a un puerto muerto (errores de red no disparan el logout). Al terminar
  se reconstruyó el build **limpio** (API de prod) y es el que queda sirviendo en :3003.

## Flags nuevos / cambiados

| Flag | Archivo | Estado | Encender cuando |
|---|---|---|---|
| `RECIPES_API_READY` | `recetas-admin-service.ts` | `false` | exista `admin-panel/recipes/*` en prod |
| `CLIENT_NOTES_API_READY` | `client-notes-service.ts` | `false` | exista `admin-panel/users/:id/notes` |
| `COURSE_CONTENT_API_READY` | `curso-contenido-service.ts` | `false` (sin cambios) | despliegue de `features-lote-7` (+ columnas drip/metadatos) |

## Pendientes que dependen del backend

1. Endpoints `admin-panel/recipes/*` (contrato arriba) → `RECIPES_API_READY = true`.
2. Columnas `drip_days`/`duration_minutes`/`description` en contenido de cursos (features-lote-7).
3. `admin-panel/users/:id/notes` → `CLIENT_NOTES_API_READY = true`.
4. Catálogos de objetivos (training_goals, daily_activities…) para etiquetas legibles en la ficha.
5. `GET /admin-panel/users/:id/progress` (serie histórica) para la pestaña Progreso.
6. Aplicar la matriz de visibilidad también en el backend (hoy es solo defensa de UI).
