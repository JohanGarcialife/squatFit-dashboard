# Guía de Integración Frontend: Flujo de Cursos, Videos y Audios

Esta guía detalla el flujo completo de la API del backend (NestJS) para el consumo y administración de Cursos y sus respectivos contenidos multimedia (Videos y Audios) en el sistema.

---

## 1. Ciclo de Vida del Curso (Público y Estudiantes)

### Obtener el Catálogo de Cursos (Público)
*   **Endpoint:** `GET /course/all`
*   **Descripción:** Retorna todos los cursos disponibles en la plataforma.
*   **Uso Frontend:** Ideal para montar la "Tienda" o el Landing Page de los cursos.
*   **Nota:** Este endpoint retorna información general del curso y el número de `students`, pero omite el contenido multimedia detallado.

### Ver Detalles de un Curso (Público / Admin)
*   **Endpoint:** `GET /course/detail/:id`
*   **Respuesta:** Ahora incluye dos listas (Arrays) con el contenido asociado en estricto orden:
    `videos`: Array de objetos `{ video_id, video_title, video_description, video_priority, video_url }` (Ordenados de menor a mayor `priority`).
    `audios`: Array de objetos `{ audio_id, audio_title, audio_description, audio_url }` (Ordenados cronológicamente por su fecha de subida `created_at`).
*   **Uso Frontend:** Para armar la ficha estructurada de presentación del curso y respetar estrictamente la cronología y prioridad que envíe el servidor al consumirlos.

### Cursos del Estudiante Autenticado (Privado)
*   **Endpoint:** `GET /course/by-user`
*   **Auth:** Requiere `Bearer Token`.
*   **Descripción:** Retorna todos los cursos comprados por el usuario, adjuntando la lista de videos, audios y el progreso específico de ese usuario (si ya vio o no cada video).

---

## 2. Flujo de Consumo de Multimedia (Reproductor)

El sistema de Squat Fit protege los archivos audiovisuales. Las URLs guardadas en los objetos devueltos en los endpoints anteriores (ej. `video_url`) no son de acceso público directo; son rutas estáticas internas de Google Cloud Storage.

Para reproducir un video, el Frontend **OBLIGATORIAMENTE** debe solicitar al backend una URL firmada de uso temporal.

### Reproducir Video
*   **Endpoint:** `GET /course/watch-video?video_id={uuid}`
*   **Auth:** Requiere `Bearer Token`.
*   **Flujo Frontend:**
    1. El usuario hace click en reproducir el video X de la lista que obtuviste en `/by-user`.
    2. Tomas su `video_id` y lo pasas mágicamente a la API vía Query parameters.
    3. El backend validará que el usuario realmente haya comprado el `course_id` al que pertenece ese video.
    4. Te devolverá un `string` con una URL pública temporal válida para poner directamente en el `<video src="...">` HTML5 nativo o en tu librería de reproducción favorita.

### Actualizar Progreso (Vistas)
Para registrar que un usuario ya vio un contenido:
*   **Actualización parcial de tiempo:** `PUT /course/update-view?video_id={uuid}` enviando `{ "last_minute": "120" }` en el Body para guardar en qué minuto se quedó el usuario.
*   **Marcar como Completado:** `PUT /course/mark-viewed?video_id={uuid}`.

---

## 3. Administración y Edición de Contenido (Panel Admin/Tutor)

Si desarrollan un panel de administración para gestionar el contenido de cada curso, estos son los flujos principales para el CRUD de los medios.

### Subir Contenido Nuevo (Upload)
*   **Video:** `POST /course/upload-video?course_id={uuid}`
*   **Audio:** `POST /course/upload-audio?course_id={uuid}`
*   **Auth:** Requiere `Bearer Token` (Tutor/Admin).
*   **Formato Frontend:** Deben enviarse los datos como `multipart/form-data` incluyendo el archivo bajo la clave de formulario `file`.
*   **Comportamiento:** El backend sube físicamente el archivo y crea automáticamente un registro en la base de datos asociado al `course_id`.

### Modificar Metadatos (Títulos, Descripción y Ordenación)
Para cuando se quiera cambiar el nombre de un video o su orden en el temario en vez de borrarlo y subirlo de nuevo.
*   **Video:** `PUT /course/videos/:video_id/metadata`
*   **Audio:** `PUT /course/audios/:audio_id/metadata`
*   **Body JSON:**
    ```json
    {
      "title": "Nuevo Titulo Editado",
      "description": "Texto del contenido...",
      "priority": 1 
    }
    ```
    *Nota: Todos los campos son opcionales. El campo `priority` solo tiene soporte y efecto en los **Videos**. Los **Audios** no pueden ser reordenados manualmente por este campo, ya que se sirven estructuradamente en el orden cronológico estricto en el que fueron creados desde el servidor. Si envías `priority` para un audio, la API ignorará el campo de forma segura para evitar inconsistencias.*

### Desvincular vs Eliminar Permanentemente
El Backend ofrece dos alternativas según la necesidad:
*   `PUT /course/videos/:video_id/remove-course` -> Desvincula el video del curso pero lo mantiene "vivo" en la base de datos y Google Cloud (puedes implementarlo si tienes una vista de papelera/medios huérfanos).
*   `DELETE /course/videos/:video_id` -> Destrucción total. Borra instantáneamente el archivo físico de Google Cloud Storage y elimina la referencia de la base de datos para siempre. Optimiza tu cuota mensual.
