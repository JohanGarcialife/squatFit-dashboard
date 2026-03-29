# Plan de refactorización — Arquitectura e infraestructura (Squat Fit Back Office)

**Objetivo:** mejorar límites entre capas, configuración, calidad y mantenibilidad **sin cambiar el comportamiento observable** de la aplicación (mismas respuestas de API, mismos flujos de pantalla, mismos contratos con el backend).

**Alcance:** frontend Next.js (`squatfit-admin` / `Dasboarh-conection`). No incluye cambios en el API remoto salvo que se documente como prerequisito.

**Criterio de éxito por fase:** build OK, smoke manual de login + una pantalla por área tocada, comparación de red (mismas URLs y métodos que antes).

---

## 1. Cómo leer este documento

| Etiqueta        | Significado                                      |
|-----------------|--------------------------------------------------|
| **Impacto**     | Beneficio para el equipo y el producto a largo plazo |
| **Riesgo**      | Probabilidad de regresión si no se prueba bien   |
| **Esfuerzo**    | Tamaño aproximado del cambio (S / M / L)         |

**Orden recomendado:** fases de **menor riesgo y alto impacto local** primero; las fases que tocan **auth o despliegue** van después y con checklist explícito.

---

## 2. Inventario de puntos débiles y propuesta asociada

### 2.1 Configuración duplicada del API (`API_BASE_URL`, timeouts, fallbacks)

**Debilidad observada**

- Múltiples constantes `API_BASE_URL` y `REQUEST_TIMEOUT` repetidas en ~20 archivos bajo `src/lib/services/`, más `src/lib/api-client.ts`, hooks WebSocket y al menos un componente (`CreateProfessionalChatModal.tsx`).
- **Tres familias de fallback** cuando falta `NEXT_PUBLIC_API_URL`:
  1. `https://squatfit-api-cyrc2g3zra-no.a.run.app` (mayoría de servicios “core”: cursos, libros, packs, etc.)
  2. `https://squatfit-api-985835765452.europe-southwest1.run.app` (`api-client`, `auth-service`, `sales-service`, `admin-tasks-service`, `advices-service`, `roles-config.service`)
  3. `http://localhost:10000` (chat, soporte, sugerencias IA, participantes, etc.)
- Uso inconsistente de `??` vs `||` para el env (comportamiento distinto si la variable existe pero está vacía).
- `chat-complete.service.ts` construye `BASE_URL` como `` `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin-panel` ``: si el env falta, la URL queda inválida (`undefined/...`).

**Ventajas de la propuesta**

- **Una sola fuente de verdad** para URL base y timeout por defecto; menos errores al cambiar de entorno o de despliegue.
- Comportamiento **predecible** entre módulos (mismo backend salvo override documentado).
- Facilita **documentar** en `.env.example` qué URL usar en dev/prod.

**Duplicidad verificada (referencia)**

| Patrón | Ubicaciones representativas |
|--------|-----------------------------|
| `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL` | Ver grep en repo: `entrenadores`, `cursos`, `users`, `packs`, `libros`, `marketing-api-client`, `trainer`, `calculator`, `sales`, `admin-tasks`, `advices`, `auth`, `chat*`, `support`, `ai-suggestion`, `saved-responses`, `chat-participants`, `api-client`, componente chat |
| `REQUEST_TIMEOUT = 10000` (u otro) repetido | Misma lista de servicios con `fetch` + `AbortController` |
| Hooks con URL embebida | `useChatWebSocket`, `useNotificationWebSocket`, `useSupportWebSocket` |

---

### 2.2 Patrón HTTP repetido (`fetch` + `AbortController` + headers Bearer)

**Debilidad observada**

- Muchos servicios repiten: obtener token, montar `Authorization`, crear `AbortController`, `setTimeout` para abort, `fetch`, parseo de error.
- Algunos usan **`api-client` (axios)** en partes del proyecto y **`fetch`** en servicios: dos estilos de cliente en paralelo (misma app).

**Ventajas de la propuesta**

- Menos código duplicado y **menos sitios donde olvidar** un header o un timeout.
- Un lugar para **política de reintentos**, 401 unificado (si se decide en el futuro), logging.

**Nota de alcance (sin cambiar funcionalidad)**

- El refactor **no debe** cambiar de axios a fetch o al revés de golpe en todo el repo si eso altera edge cases (ej. serialización). Fase opcional: **unificar gradualmente** manteniendo mismas URLs y cuerpos de petición.

---

### 2.3 Inversión de dependencias: tipos y datos bajo `app/.../_components`

**Debilidad observada**

- `src/lib/services/*` y `src/hooks/*` importan tipos (y en un caso datos) desde rutas como `@/app/(main)/dashboard/.../_components/schema` o `.../data`.

**Archivos verificados con import desde `app/(main)/dashboard` (TypeScript)**

| Área | Ejemplos |
|------|----------|
| Servicios | `cursos-service`, `entrenadores-service`, `libros-service`, `dieta-service`, `marketing-service`, `marketing-api-client`, `marketing-types`, `recipe-types`, `seguimiento-types` |
| Hooks | `use-cursos`, `use-entrenadores`, `use-libros`, `use-recetas`, `use-dieta`, `use-alimentos`, `use-menus`, `use-marketing` |

**Ventajas de la propuesta**

- Cumple **dependencia hacia adentro**: dominio/tipos compartidos no dependen de la carpeta de una página concreta.
- Facilita **reutilizar** los mismos tipos en tests, Storybook o futuras rutas sin arrastrar `app/`.
- Reduce riesgo de **importaciones circulares** al crecer el dashboard.

**Estrategia sin cambiar funcionalidad**

- **Mover solo tipos y datos estáticos** (o re-exportarlos) a algo como `src/domain/<modulo>/` o `src/types/<modulo>.ts`; las páginas importan desde ahí; los servicios también. El contenido de los tipos es el mismo; solo cambia la ruta del import.

---

### 2.4 Autenticación dual: cookie HttpOnly + token en cliente (`localStorage` / contexto)

**Debilidad observada**

- Login API coloca cookie y **también** devuelve el token para el cliente (`auth-context` + almacenamiento vía utilidades de cookie/storage).
- Middleware valida sesión por **cookie**; muchas llamadas al API usan **Bearer desde cliente** (`getAuthToken` / `auth-utils`).

**Ventajas de las opciones (elegir una estrategia en fase tardía; documentar la actual mientras tanto)**

| Estrategia | Ventaja principal |
|------------|-------------------|
| **A) BFF estricto** | Token solo en cookie; el navegador llama a rutas Next que reenvían al API: menos exposición del JWT al JS. |
| **B) Cliente con Bearer explícito** | Modelo simple para SPAs; middleware podría alinearse o documentarse como “solo cookie para SSR/navegación”. |
| **C) Mantener híbrido pero documentado** | Sin cambio de contrato inmediato; se añade runbook: cuándo se usa cada vía y cómo depurar desincronización. |

**Restricción “sin tocar funcionalidad”**

- Una fase inicial solo puede **documentar y añadir comentarios/runbook** o tests de contrato; **unificar en cookie-only o eliminar localStorage** cambia superficie de seguridad y flujos → tratado como **fase de mayor riesgo** y opcional.

---

### 2.5 Calidad en build y ausencia de tests automatizados

**Debilidad observada**

- `next.config.mjs`: `eslint.ignoreDuringBuilds: true` — el build no falla por reglas ESLint.
- No hay archivos `*.test.ts` / `*.spec.ts` detectados en el árbol habitual del proyecto.

**Ventajas de la propuesta**

- **Regresiones** detectadas antes de merge.
- Refactors futuros (este plan) con **red de seguridad**.

**Sin cambiar funcionalidad de producto**

- Añadir tests que **congelen comportamiento actual** (p. ej. helpers de URL, mapeo de un DTO, función pura).
- Rehabilitar ESLint en build **después** de corregir o suprimir de forma local lo que falle (riesgo medio).

---

### 2.6 Navegación vs rutas huérfanas

**Debilidad observada**

- Existen páginas bajo `dashboard` (`crm`, `finance`, `support`, `ventas`, `about`, etc.) que no están en el sidebar principal; mezcla “producción” y “borrador”.

**Ventajas de la propuesta**

- Menos confusión para el equipo: **feature flags**, mover borradores a `_draft/`, o enlazar explícitamente en sidebar con etiqueta “beta”.
- **Sin cambiar funcionalidad:** solo reorganización de archivos o metadata de navegación (mismas URLs pueden conservarse con `redirect`).

---

### 2.7 Carpeta `src/services` vacía

**Debilidad observada**

- Convivencia de `src/lib/services` (real) y `src/services` (vacía): onboarding confuso.

**Ventajas**

- Eliminar o redirigir con un `README` de una línea en `src/services` o borrar carpeta: **cero impacto en runtime**.

---

## 3. Plan por fases (orden: impacto/riesgo)

### Fase 0 — Línea base (riesgo muy bajo, esfuerzo S)

**Qué hacer**

1. Documentar en `.env.example` (o sección en README): `NEXT_PUBLIC_API_URL`, timeouts opcionales, cuándo usar `localhost:10000` si aplica.
2. Añadir al README un párrafo “Arquitectura de red” con la **lista de servicios que hoy asumen otro fallback** (tabla de la sección 2.1).

**Por qué primero:** no toca código ejecutable; desbloquea decisiones informadas.

**Verificación:** revisión en PR.

---

### Fase 1 — Módulo de configuración HTTP central (riesgo bajo, esfuerzo M)

**Qué hacer**

1. Crear `src/lib/http-config.ts` (nombre orientativo) que exporte:
   - `getApiBaseUrl()` — lee `NEXT_PUBLIC_API_URL` con **un único fallback acordado** (el que el equipo valide contra el backend real; hasta entonces puede ser el valor mayoritario **si** se documenta que otros módulos usaban otro).
   - `getDefaultRequestTimeoutMs()` — mismo criterio.
2. Sustituir **solo las lecturas duplicadas** de env en servicios por import de ese módulo, **manteniendo el mismo valor efectivo** en cada sustitución (si hoy dos archivos usan fallbacks distintos, **primero** alinear fallbacks en config con el valor que ya usaba ese archivo — equivalencia 1:1 — y en Fase 1b unificar con acuerdo explícito).

**Impacto:** alto en mantenimiento; **riesgo bajo** si cada reemplazo es mecánico y se prueba la pantalla afectada.

**Verificación**

- Comparar una petición antes/después en DevTools (misma URL completa).
- `npm run build`.

**Rollback:** revert del commit.

---

### Fase 1b — Unificación real de fallbacks (riesgo medio, esfuerzo M) — *condicional*

**Qué hacer**

- Tras Fase 1 mecánica, **decidir** con backend una sola URL de producción y un solo default de desarrollo.
- Actualizar `getApiBaseUrl()` para un solo fallback; ajustar servicios que hoy dependían de `localhost:10000` solo si el backend unificado lo reemplaza **o** introducir `NEXT_PUBLIC_CHAT_API_URL` (segundo env) **sin cambiar comportamiento** si hoy chat y core son APIs distintas.

**Ventaja:** elimina ambigüedad operativa.

**Riesgo:** medio — requiere validación con entorno real.

---

### Fase 2 — Helper HTTP interno (riesgo bajo–medio, esfuerzo L)

**Qué hacer**

1. Extraer función interna tipo `apiFetch(path, init)` que:
   - Resuelve URL base con `getApiBaseUrl()`.
   - Aplica timeout con `AbortController` como hoy.
   - Inyecta `Authorization` con la misma lógica que `getAuthToken` / fallback actual **sin alterar orden de prioridad**.
2. Migrar **2–3 servicios pequeños** primero; luego el resto en commits atómicos por dominio.

**Ventaja:** reduce duplicidad funcional verificada en ~15+ servicios con patrón `AbortController`.

**Verificación:** tests de contrato ligeros o checklist manual por servicio migrado.

---

### Fase 3 — Reubicar tipos compartidos fuera de `app/` (riesgo medio, esfuerzo L)

**Qué hacer**

1. Por módulo (ej. `cursos`): crear `src/domain/cursos/types.ts` (o `src/types/cursos.ts`).
2. Mover o re-exportar desde el `schema.ts` actual para que **el contenido de tipos sea idéntico**.
3. Actualizar imports en `_components`, `*-service.ts` y `use-*.ts`.

**Orden sugerido:** cursos → entrenadores → libros → marketing → dieta → seguimiento (del más acoplado al menos).

**Ventaja:** arquitectura limpia; imports predecibles.

**Riesgo:** medio por volumen de imports; mitigar con PRs por dominio.

---

### Fase 4 — ESLint en build y tests mínimos (riesgo medio, esfuerzo M–L)

**Qué hacer**

1. Corregir o acotar reglas hasta que `next build` pase con ESLint activo **o** sustituir por job CI separado obligatorio.
2. Añadir tests (Vitest/Jest según preferencia del repo) para:
   - `getApiBaseUrl` / normalización de env.
   - Un mapper DTO crítico (ej. curso API → UI).

**Ventaja:** el plan de refactor deja de depender solo de manual QA.

---

### Fase 5 — Auth unificada o documentación operativa (riesgo alto, esfuerzo L) — *opcional / posterior*

**Qué hacer**

- Opción conservadora: runbook + diagrama de flujo cookie vs Bearer; checklist de soporte.
- Opción fuerte: implementar BFF o eliminar token en cliente; **excede “sin cambiar funcionalidad”** en sentido estricto de seguridad observable — debe ser **release aparte** con revisión de seguridad.

---

### Fase 6 — Limpieza de rutas y carpetas (riesgo bajo, esfuerzo S)

**Qué hacer**

- Eliminar o documentar `src/services` vacía.
- Etiquetar en código o sidebar las rutas “draft”.

---

## 4. Matriz resumen (orden de ejecución recomendado)

| Fase | Tema | Impacto | Riesgo | Esfuerzo |
|------|------|---------|--------|----------|
| 0 | Documentación env / red | Medio | Muy bajo | S |
| 1 | Config HTTP central (equivalencia 1:1) | Alto | Bajo | M |
| 1b | Un solo fallback / segundo env si aplica | Alto | Medio | M |
| 2 | Helper `apiFetch` + migración por dominio | Alto | Medio | L |
| 3 | Tipos fuera de `app/` | Alto | Medio | L |
| 4 | ESLint + tests | Alto | Medio | M–L |
| 5 | Auth (doc o rediseño) | Muy alto | Alto | L |
| 6 | Carpetas / rutas huérfanas | Bajo | Bajo | S |

---

## 5. Fuera de alcance explícito (para no “tocar funcionalidad”)

- Cambiar reglas de negocio, textos de UI, diseño o flujos de usuario.
- Modificar contratos del API remoto sin coordinación.
- Big-bang de axios → fetch o al revés sin prueba por módulo.

---

## 6. Bitácora sugerida

Cada fase debería dejar en este archivo (o en CHANGELOG) una línea:

- Fecha, PR, pantallas probadas, captura o nota de “URL de red verificada”.

---

*Documento generado para estudio y planificación. Ajustar nombres de módulos (`src/domain` vs `src/types`) según convención que adopte el equipo.*
