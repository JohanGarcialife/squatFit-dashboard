#!/usr/bin/env node
/**
 * Sube las portadas definitivas (exportadas de Figma) a los productos del
 * catálogo, asociándolas por nombre.
 *
 * ── Uso ────────────────────────────────────────────────────────────────────
 *   ADMIN_TOKEN="<jwt-admin-real>" node scripts/portadas/upload-portadas.mjs            # dry-run
 *   ADMIN_TOKEN="<jwt-admin-real>" node scripts/portadas/upload-portadas.mjs --commit    # sube de verdad
 *
 * Variables opcionales:
 *   API_URL   (por defecto la API de prod)
 *
 * ── Mecánica real del backend (verificado 20 jul 2026) ─────────────────────
 *   El endpoint `PUT /api/v1/book/:id` acepta la portada como **URL** en el
 *   cuerpo JSON (`{ image: "https://…" }`, validada con regex http/https), NO
 *   como archivo multipart (eso solo lo hace el POST de creación). Por tanto,
 *   para poner una portada nueva en un libro EXISTENTE hay que:
 *     1. subir el PNG a GCS (bucket `squat-fit-storage-eu`, prefijo
 *        `static/portadas/`), que queda con lectura pública, y
 *     2. hacer `PUT /book/:id { image: <url pública> }` con un JWT de admin.
 *   Este script hace justo eso (usa `gcloud storage cp` para el paso 1).
 *
 *   ⚠️ BUG DE BACKEND (prod, 20 jul 2026): `UpdateBookDTO` marca title/subtitle/
 *   price como requeridos (les falta `@IsOptional()`), así que un PUT solo con
 *   `image` da 400. Y si se reenvían todos los campos, `price` no existe como
 *   columna en la tabla `books` → el UPDATE de knex da 500. Es decir, HOY NO hay
 *   petición válida que actualice un libro por este endpoint. Fase 6 debe: (a)
 *   poner `@IsOptional()` en title/subtitle/price del UpdateBookDTO y (b) que el
 *   servicio no intente escribir `price` en `books`. Mientras tanto, las portadas
 *   de LIBROS de Fase 7 se aplicaron subiendo el PNG a GCS y actualizando la
 *   columna `books.image` directamente (ver INFORME-FASE-7). Cuando el endpoint
 *   se arregle, este script funcionará tal cual (GCS→PUT).
 *
 *   • LIBROS  → mecánica correcta (GCS→PUT) lista; bloqueada por el bug de arriba. ⚠️
 *   • CURSOS  → el admin de cursos solo acepta `image` como URL y NO hay
 *               endpoint de subida de archivo de curso. Si algún día existe,
 *               poner su ruta en COURSE_COVER_UPLOAD_ENDPOINT. Mientras, se
 *               podría reutilizar el mismo patrón GCS→PUT si el PUT de curso
 *               aceptara la URL (hoy queda listado como pendiente).            ⏳
 *   • PACKS   → la tabla no tiene columna de imagen dedicada por libro-pack.   ⏳
 *
 * IMPORTANTE: solo LIBROS está autorizado a escribir en prod (Fase 7).
 */

import { readFileSync, existsSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes("--commit");
const API_URL = process.env.API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";
const TOKEN = process.env.ADMIN_TOKEN;

if (!TOKEN) {
  console.error("✗ Falta ADMIN_TOKEN (JWT de un admin real). Aborta.");
  process.exit(1);
}

const config = JSON.parse(readFileSync(join(__dirname, "mapping.json"), "utf8"));
const BUCKET = config.gcs_bucket ?? "squat-fit-storage-eu";
const PREFIX = config.gcs_prefix ?? "static/portadas";

const norm = (s) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const authHeaders = { Authorization: `Bearer ${TOKEN}` };

async function getJson(path) {
  const res = await fetch(`${API_URL}${path}`, { headers: authHeaders });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  const body = await res.json();
  return Array.isArray(body) ? body : (body.data ?? []);
}

function findProduct(products, matches) {
  for (const m of matches) {
    const nm = norm(m);
    const hit = products.find((p) => norm(p.title ?? p.name).includes(nm));
    if (hit) return hit;
  }
  return null;
}

/** Sube el PNG a GCS y devuelve su URL pública. */
function uploadToGcs(filePath) {
  // Nombre estable y único por archivo (sin timestamp para ser idempotente).
  const safe = basename(filePath).replace(/\s+/g, "_");
  const object = `${PREFIX}/${safe}`;
  execFileSync("gcloud", ["storage", "cp", filePath, `gs://${BUCKET}/${object}`], { stdio: "pipe" });
  return `https://storage.googleapis.com/${BUCKET}/${encodeURI(object)}`;
}

/** PUT del libro con la URL de la portada. */
async function setBookCover(id, imageUrl) {
  const res = await fetch(`${API_URL}/api/v1/book/${id}`, {
    method: "PUT",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageUrl }),
  });
  if (!res.ok) throw new Error(`PUT /book/${id} → ${res.status} ${await res.text().catch(() => "")}`);
  return true;
}

async function main() {
  console.log(`\n${COMMIT ? "🚀 COMMIT" : "🔍 DRY-RUN"} · API ${API_URL} · bucket ${BUCKET}/${PREFIX}\n`);

  const [books, courses, packs] = await Promise.all([
    getJson("/api/v1/book/all").catch(() => []),
    getJson("/api/v1/admin-panel/courses").catch(() => []),
    getJson("/api/v1/book/packs").catch(() => []),
  ]);
  const byKind = { book: books, course: courses, pack: packs };

  let uploaded = 0;
  let pending = 0;
  let unmatched = 0;

  for (const item of config.items) {
    const filePath = join(config.drive_root, item.file);
    if (!existsSync(filePath)) {
      console.log(`  ⚠️  falta el archivo: ${item.file}`);
      continue;
    }
    const product = findProduct(byKind[item.kind] ?? [], item.match);
    if (!product) {
      unmatched++;
      console.log(`  ✗ sin match [${item.kind}] ${item.file}  (buscaba: ${item.match.join(" | ")})`);
      continue;
    }
    const name = product.title ?? product.name;

    if (item.kind === "book") {
      if (COMMIT) {
        try {
          const url = uploadToGcs(filePath);
          await setBookCover(product.id, url);
          uploaded++;
          console.log(`  ✅ ${item.file}  →  [book] ${name}\n       ${url}`);
        } catch (e) {
          console.log(`  ✗ error subiendo ${item.file}: ${e.message}`);
        }
      } else {
        console.log(`  ▶ subiría ${item.file}  →  [book] ${name} (${product.id})`);
        console.log(`       cover actual: ${product.image ? String(product.image).slice(0, 70) : "∅"}`);
      }
    } else {
      pending++;
      console.log(`  ⏸ pendiente-backend [${item.kind}] ${item.file}  →  ${name} (${product.id})`);
    }
  }

  console.log(
    `\nResumen: ${COMMIT ? `${uploaded} subidas` : "dry-run"} · ${pending} pendientes de backend (cursos/packs) · ${unmatched} sin match\n`,
  );
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
