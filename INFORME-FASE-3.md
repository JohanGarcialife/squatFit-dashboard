# Informe — Fase 3 (Back Office staff)

Rama: `lote-backoffice-1` · Repo: `squatFit-dashboard` · Fecha: 19 jul 2026
**No mergeado ni desplegado** (según lo pedido). Todo verificado con `tsc --noEmit` (0 errores) y previsualizado con sesión forjada.

Resumen: 5 tareas implementadas. Varias dependen de trabajo de backend que **aún no existe** (verificado en prod y en todas las ramas). En esos casos la UI queda **lista tras una constante/guarda** y se documenta abajo qué falta.

---

## 1. Submenú de marca unificado (BrandTabs) ✅

- Nuevo componente `src/components/brand-tabs.tsx`, réplica del `BrandTabs` de la web pública: pestañas con indicador inferior, **activa naranja `#FF690B`**, resto **índigo `#3932C0`**, deslizable con arrastre de ratón + scroll táctil, y **fade + flecha gris** cuando desbordan (con fade a la izquierda al deslizar).
- Utilidad `.no-scrollbar` añadida a `globals.css`.
- **Sustituidos** los submenús `TabsList/TabsTrigger` de shadcn por `BrandTabs` en: `dieta`, `pautas`, `seguimiento`, `trainer` (las páginas del back office que tenían submenú de pestañas). El resto de páginas del catálogo (cursos/libros/packs/usuarios) no usan submenú, mantienen su patrón Cards+Tabla.
- Verificado: render SSR de `/dashboard/dieta` con las 3 pestañas, `aria-label="Submenú"` y los colores de marca.

## 2. Portadas de producto ✅ (con dependencia de backend en cursos/packs)

- Nuevo componente reutilizable `src/components/cover-image-upload.tsx`: **subir archivo o pegar URL**, con vista previa, toggle y borrado. Guarda en el mismo campo `image` que **lee el carrito de la web** (`storage.googleapis.com`).
- **Libros**: ya tenían subida real de archivo (multipart `POST/PUT /api/v1/book`, campo `image`) → siguen funcionando end-to-end.
- **Cursos**: integrado el uploader en crear/editar. La subida de **archivo** de portada de curso queda tras la constante `COURSE_COVER_UPLOAD_ENDPOINT` en `cursos-service.ts` (**pendiente de backend**: hoy el admin de cursos solo acepta `image` como URL; no existe endpoint que suba un archivo de curso a Storage). El modo **URL funciona ya**.
- **Packs**: **no integrado**. La tabla `packs` del backend **no tiene columna de imagen** — se documenta como necesidad de backend (el carrito de la web sí espera `pack.image`).

### Subida de las portadas reales (Figma → productos)
- `scripts/portadas/mapping.json` + `scripts/portadas/upload-portadas.mjs`: mapea cada portada de la carpeta de Drive «Portadas productos» (raíz + `Módulos/`: TMV premium/original/entreno/nutrición, Curso La Mujer P1/P2, libros digitales/impresos, packs) al producto por **nombre**, y la sube.
- **No ejecutado**: subir a prod requiere un **token de admin real** (el token forjado de preview lo rechaza con 401, correcto) y no dispongo de credenciales. El script está listo:
  ```bash
  ADMIN_TOKEN="<jwt-admin>" node scripts/portadas/upload-portadas.mjs            # dry-run
  ADMIN_TOKEN="<jwt-admin>" node scripts/portadas/upload-portadas.mjs --commit    # sube
  ```
- Hoy el script sube **libros** de verdad (endpoint existe). **Cursos y packs** quedan listados como «pendiente-backend» por lo dicho arriba (cursos: sin upload de archivo; packs: sin columna imagen).

## 3. Botón «Añadir producto» en Usuarios y Pedidos (13.12.1) ✅ (endpoint pendiente Fase 2)

- Nuevo diálogo reutilizable `src/components/modals/grant-product-dialog.tsx`: **selector de producto** (buscador sobre cursos+libros+packs) + **confirmación**.
- Servicio `src/lib/services/grant-product-service.ts`: agrega el catálogo y llama a **`POST /api/v1/admin-panel/grant-product`** con `{ user_id, product_id, product_type, order_id? }`.
- **`grant-product` NO existe todavía** (verificado: 404 en prod y en todas las ramas del backend; la Fase 2 lo está creando). La llamada queda **tras la constante `GRANT_PRODUCT_AVAILABLE = false`**: cuando exista, poner `true` (y confirmar el cuerpo con Fase 2) y funciona.
- **Usuarios**: acción «Añadir producto» añadida al menú de fila (`columns.alumnos.tsx` + `alumnos-table.tsx`), abre el diálogo con el usuario.
- **Pedidos**: no existe página de Pedidos en este repo (es el build desde cero de Johan; `ventas/page.tsx` era placeholder). Se ha dejado el botón **visible y explicado** en esa página, deshabilitado hasta que exista la lista de pedidos; el diálogo ya acepta `orderId` para el contexto del pedido.

## 4. Duración/entrega en la ficha de producto (15.9) ✅ (tolerante, oculto por defecto)

- Nuevo componente `src/components/product-delivery-fields.tsx`: **tiempo de acceso** (Permanente / Limitado por meses) y **goteo** (Sin goteo / Por intervalo / Programado con retraso inicial).
- Integrado en la ficha de **curso** (crear + editar).
- **Tolerante**: la sección se **oculta** salvo que el backend soporte los campos. Gobernado por `PRODUCT_DELIVERY_SUPPORTED` (hoy `false`) y por detección `apiHasDeliveryFields()` sobre el detalle del curso. **El backend no tiene columnas de acceso/goteo** en `course`/`products` (verificado) → hoy queda oculto; verificado activándolo temporalmente que la UI renderiza correctamente.
- Al activarlo en el futuro hay que además **enviar los campos en el DTO** (`create/updateCurso` + `transformToApiFormat`), hoy no se envían para no romper el alta/edición actuales.

## 5. Ficha del cliente (13.12) + datos de forms (15.7) ✅ (con datos limitados por backend)

- Nueva ruta `/dashboard/alumnos/[id]` (`ClientProfileView`) con **secciones ordenadas** usando el propio `BrandTabs`:
  1. **Datos de usuario** (nombre, email, usuario, nacimiento, rol, estado).
  2. **Compras** (de `sales`).
  3. **Medidas y salud** (onboarding).
  4. **Formularios** (tipos + respuestas por usuario).
- Hook `src/hooks/use-client-profile.ts` que agrega `users`, `sales` y `form-types`/`form-user-answer` con `Promise.allSettled` (cada fuente falla aislada).
- Navegación cableada desde Usuarios: «Ver perfil completo» y router push a la ficha.
- Verificado: SSR de `/dashboard/alumnos/<id>` renderiza las 4 secciones + BrandTabs + botón Volver.

### Necesidades de backend detectadas (bloquean datos completos)
- **GET de detalle de usuario**: no existe. `UserDetailResponse` (peso, altura, género, objetivo, kcal, actividad) **solo lo devuelve el `PUT /users/edit`** (una mutación). La sección «Medidas y salud» muestra un aviso «pendiente de endpoint GET» — en cuanto exista, se rellena sola.
- **Ventas por usuario**: `GET /admin-panel/sales` **no filtra por `user_id`**, solo `search` por nombre. Las compras se filtran por **nombre** (aproximado) y se avisa en la propia ficha. Falta endpoint de ventas por `user_id`.
- **Tipos de formulario**: el backend solo tiene **Nutricional, Deportivo, Completo, Revisión Mensual**. **No existen** como formularios «prellamada» ni «solicitudes de empleo» (15.7). Además la rama `origin/feature/forms-crud` (sin mergear) añade un CRUD de formularios que conviene revisar.

---

## Verificación y notas de entorno

- `tsc --noEmit`: **0 errores** tras todos los cambios. `eslint --fix` aplicado a los archivos nuevos (quedan solo *warnings* de estilo ya presentes en todo el repo: complejidad, `<img>` como en libros, etc.).
- Preview con sesión forjada (cookie `authToken` + `localStorage`): sirve para el **cascarón**; los datos dan «Error al cargar datos» (el backend real rechaza el token). Ojo: el interceptor 401 limpia el token de vez en cuando y salta a login — hay que re-forjar. La navegación por **sub-rutas** del preview a veces cae a `/dashboard/default` (inestabilidad de sesión del cliente, no de las páginas); por eso varias verificaciones se hicieron por **SSR con `curl` + cookie** además del navegador.

## Tarea 6 — Mejoras visuales pendientes (capturas de ~/Desktop)

Las dos capturas del Desktop son del **flujo web** (no del back office), pero anoto lo relevante:
- **`Cuenta Activada` (21.48.37)**: la página «¡Cuenta Activada!» aparece **completamente sin estilar** (fuente serif por defecto, sin CSS de marca). Es un fallo visual real a corregir en la web (falta el layout/estilos en esa ruta de verificación de cuenta).
- **Onboarding «¿Cómo es tu actividad diaria?» (20.13.45)**: correcto, paleta índigo limpia; sirve de referencia de estilo.

Observaciones del back office durante el preview (rediseño ya aplicado): paleta naranja/índigo/melocotón y sidebar flotante correctos. Sin incidencias visuales nuevas en el cascarón; los estados «Error al cargar datos» son esperados sin backend.

## Archivos nuevos
- `src/components/brand-tabs.tsx`, `src/components/cover-image-upload.tsx`, `src/components/product-delivery-fields.tsx`
- `src/components/modals/grant-product-dialog.tsx`
- `src/lib/services/grant-product-service.ts`, `src/hooks/use-client-profile.ts`
- `src/app/(main)/dashboard/alumnos/[id]/page.tsx` + `_components/client-profile-view.tsx`
- `scripts/portadas/mapping.json`, `scripts/portadas/upload-portadas.mjs`
