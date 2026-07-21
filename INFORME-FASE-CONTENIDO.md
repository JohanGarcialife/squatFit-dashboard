# INFORME — FASE Contenido de formaciones (back office)

Rama: `lote-backoffice-5` (desde `origin/main`). **Sin mergear, sin desplegar.**
Commit: ver `git log lote-backoffice-5`.

## Qué se hizo
Pantalla para **gestionar el contenido de un curso**: módulos → clases → tests.

- **Ruta**: `/dashboard/cursos/[cursoId]/contenido` (acción **«Gestionar contenido»** en el
  menú de fila del curso, en Cursos).
- **Módulos**: crear (nombre descriptivo), renombrar inline, eliminar, reordenar
  (subir/bajar). Contador de clases por módulo.
- **Clases**: dentro de cada módulo — título editable, **campo para pegar la URL de Bunny**
  (icono verde con vídeo / ámbar sin vídeo), reordenar, eliminar, y botón **Test** de la
  clase. Botón **«Añadir clase»**. Cabecera con «N sin vídeo» para localizar huecos.
- **Tests**: editor en diálogo — preguntas de **opción única** (marca la correcta, resaltada
  en verde), **explicación** por pregunta, añadir/eliminar preguntas y opciones, validación
  (≥2 opciones y 1 correcta por pregunta). Test por **clase**, por **módulo** y **final**
  del curso.

## Contrato con el backend
Servicio `src/lib/services/curso-contenido-service.ts` contra
`admin-panel/courses/*` (los crea la rama backend `features-lote-7`).

- **Flag `COURSE_CONTENT_API_READY`** (hoy `false`, porque el backend aún **no está
  desplegado**): la pantalla se muestra con un **árbol de ejemplo** y un aviso «Modo
  demostración»; los cambios no se guardan. **Al desplegar el backend, poner el flag a
  `true`** y funciona contra la API sin más cambios (mismo patrón que `LEADS_API_READY`,
  `USER_DETAIL_API_READY`).
- Endpoints usados: `GET courses/:id/content`, `POST/PUT/DELETE .../modules` y `.../lessons`,
  `.../modules-order`, `.../lessons-order`, `GET .../lessons/:id/test`,
  `GET .../modules/:id/test`, `GET/PUT courses/tests/:id`.

## Cómo se verificó
- `npx tsc --noEmit`: **0 errores**. `eslint`: **0 errores** (warnings de estilo/complejidad
  del mismo tenor que el resto del repo).
- Preview en `:3001` con **sesión forjada** (cookie/localStorage `authToken`, rol admin, exp
  futuro): render correcto del árbol (2 módulos demo, 4 clases, «2 sin vídeo»), expansión de
  módulo con campos de URL de Bunny y estados con/sin vídeo, y **editor de test** (opción
  correcta en verde, explicación, añadir pregunta/opción, guardar). Los errores de consola
  son del **WebSocket de chat** (backend no accesible con token forjado), ajenos a esta
  pantalla.

## Pendiente
- Encender `COURSE_CONTENT_API_READY = true` cuando `features-lote-7` esté en prod.
- Las clases 11 y 24 de Perder Grasa que faltaban ya están (subidas 21-jul); queda solo la
  **clase 23** marcada para confirmar en el backend (rótulo de Bunny dudoso). Si hay que
  corregir su URL, se hace pegando la URL de Bunny correcta en el propio editor.
