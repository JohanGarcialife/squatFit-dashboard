"use client";

/**
 * Grid de cursos para el HOME
 * Muestra los últimos 3 cursos disponibles
 */

import Image from "next/image";
import Link from "next/link";

import { ArrowRight, BookOpen, Clock, User } from "lucide-react";

import type { Curso } from "@/app/(main)/dashboard/cursos/_components/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCursos } from "@/hooks/use-cursos";

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatea el precio con el símbolo de moneda
 */
function formatPrice(price: number, currency?: string): string {
  const symbol = currency === "USD" ? "$" : "€";
  return `${symbol}${price.toFixed(2)}`;
}

/**
 * Obtiene el color del badge según el nivel
 */
function getLevelBadgeVariant(level: string): "default" | "secondary" | "outline" {
  switch (level.toLowerCase()) {
    case "principiante":
      return "secondary";
    case "intermedio":
      return "default";
    case "avanzado":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Lista de URLs de imágenes inválidas conocidas que deben ser filtradas
 */
const INVALID_IMAGE_URLS = [
  "image.jpg",
  "/image.jpg",
  "https://storage.googleapis.com/course-images/image.jpg",
  "storage.googleapis.com/course-images/image.jpg",
  "fitness-fundamentals.jpg",
  "/fitness-fundamentals.jpg",
];

/**
 * Valida si una URL de imagen es válida o es un placeholder genérico
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return false;
  }

  const trimmedUrl = url.trim();

  // Filtrar URLs inválidas conocidas
  if (INVALID_IMAGE_URLS.includes(trimmedUrl)) {
    return false;
  }

  // Filtrar URLs que contengan "image.jpg" genérico
  if (trimmedUrl.toLowerCase().includes("/image.jpg") || trimmedUrl.toLowerCase().endsWith("image.jpg")) {
    return false;
  }

  // Filtrar URLs de Google Storage que sean genéricas o inválidas
  if (trimmedUrl.includes("storage.googleapis.com") && trimmedUrl.includes("/image.jpg")) {
    return false;
  }

  return true;
}

/**
 * Normaliza una URL de imagen para que sea compatible con next/image
 * - Filtra URLs inválidas conocidas
 * - Si es una URL absoluta (http:// o https://), la devuelve tal cual (si es válida)
 * - Si es una ruta relativa sin slash inicial, agrega el slash
 * - Si ya tiene slash inicial, la devuelve tal cual
 */
function normalizeImageUrl(url: string | undefined | null): string | undefined {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return undefined;
  }

  const trimmedUrl = url.trim();

  // Validar si la URL es válida antes de procesarla
  if (!isValidImageUrl(trimmedUrl)) {
    return undefined;
  }

  // Si es una URL absoluta (http:// o https://), devolverla tal cual
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // Si es una ruta relativa sin slash inicial, agregarlo
  if (!trimmedUrl.startsWith("/")) {
    return `/${trimmedUrl}`;
  }

  // Si ya tiene slash inicial, devolverla tal cual
  return trimmedUrl;
}

// ============================================================================
// COMPONENTE: CARD DE CURSO
// ============================================================================

function CursoCard({ curso }: { curso: Curso }) {
  const normalizedThumbnail = normalizeImageUrl(curso.thumbnail);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {/* Imagen del curso */}
      <div className="bg-muted relative h-40 w-full overflow-hidden">
        {normalizedThumbnail ? (
          <Image
            src={normalizedThumbnail}
            alt={curso.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={normalizedThumbnail.startsWith("https://storage.googleapis.com")}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="text-muted-foreground h-12 w-12" />
          </div>
        )}

        {/* Badge de nivel */}
        {curso.level && (
          <div className="absolute top-2 right-2">
            <Badge variant={getLevelBadgeVariant(curso.level)}>{curso.level}</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-base">{curso.name}</CardTitle>
        {curso.description && <CardDescription className="line-clamp-2 text-xs">{curso.description}</CardDescription>}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          {/* Instructor */}
          {curso.instructor && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <User className="h-3 w-3" />
              <span className="truncate">{curso.instructor}</span>
            </div>
          )}

          {/* Duración */}
          {curso.duration && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              <span>{curso.duration}</span>
            </div>
          )}

          {/* Precio y Estado */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold">{formatPrice(curso.price, curso.currency)}</span>
            {curso.status && (
              <Badge variant={curso.status === "Activo" ? "default" : "secondary"}>{curso.status}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CursosGrid() {
  const { data, isLoading, error } = useCursos();

  // Obtener solo los primeros 3 cursos
  const cursosArray = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Cursos Disponibles
        </CardTitle>
        <CardDescription>Últimos cursos agregados al catálogo</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">No se obtuvieron datos</p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {cursosArray.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <BookOpen className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">No hay cursos disponibles</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {cursosArray.map((curso) => (
                  <CursoCard key={curso.id} curso={curso} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      {cursosArray.length > 0 && (
        <CardFooter>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/cursos">
              Ver todos los cursos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
