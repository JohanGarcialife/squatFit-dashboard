#!/usr/bin/env node
/**
 * Sube las portadas reales (exportadas de Figma) a los productos del catálogo,
 * asociándolas por nombre. Lee las imágenes de la carpeta de Drive y las envía
 * al backend de Squad Fit.
 *
 * ── Uso ────────────────────────────────────────────────────────────────────
 *   ADMIN_TOKEN="<jwt-admin-real>" node scripts/portadas/upload-portadas.mjs           # dry-run: solo imprime el plan
 *   ADMIN_TOKEN="<jwt-admin-real>" node scripts/portadas/upload-portadas.mjs --commit   # sube de verdad
 *
 * Variables opcionales:
 *   API_URL   (por defecto la API de prod)
 *
 * ── Estado del backend (19 jul 2026) ───────────────────────────────────────
 *   • LIBROS  → PUT /api/v1/book/{id} multipart `image`  ✅ funciona end-to-end.
 *   • CURSOS  → el admin solo acepta `image` como URL; no hay endpoint que suba
 *               un archivo de curso a Storage. Este script NO puede subir la
 *               portada de curso desde un PNG local hasta que el backend exponga
 *               ese upload (ver COURSE_COVER_UPLOAD_ENDPOINT en cursos-service.ts).
 *               Se listan como "pendiente-backend".
 *   • PACKS   → la tabla `packs` no tiene columna de imagen. Pendiente-backend.
 *
 * Por eso, hoy este script sube realmente las portadas de LIBROS y deja el plan
 * de cursos/packs listado para cuando el backend lo soporte.
 */

import { readFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes("--commit");
const API_URL = process.env.API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const TOKEN = process.env.ADMIN_TOKEN;

if (!TOKEN) {
  console.error("✗ Falta ADMIN_TOKEN (JWT de un admin real). Aborta.");
  process.exit(1);
}

const config = JSON.parse(readFileSync(join(__dirname, "mapping.json"), "utf8"));
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

async function uploadBookCover(id, filePath) {
  const buf = readFileSync(filePath);
  const form = new FormData();
  form.append("image", new Blob([buf]), basename(filePath));
  const res = await fetch(`${API_URL}/api/v1/book/${id}`, { method: "PUT", headers: authHeaders, body: form });
  if (!res.ok) throw new Error(`PUT /book/${id} → ${res.status} ${await res.text().catch(() => "")}`);
  return true;
}

async function main() {
  console.log(`\n${COMMIT ? "🚀 COMMIT" : "🔍 DRY-RUN"} · API ${API_URL}\n`);

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
          await uploadBookCover(product.id, filePath);
          uploaded++;
          console.log(`  ✅ ${item.file}  →  [book] ${name}`);
        } catch (e) {
          console.log(`  ✗ error subiendo ${item.file}: ${e.message}`);
        }
      } else {
        console.log(`  ▶ subiría ${item.file}  →  [book] ${name} (${product.id})`);
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
