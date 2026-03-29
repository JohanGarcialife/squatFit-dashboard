"use client";

import type { ReactNode } from "react";

import Image from "next/image";

import { ExternalLink } from "lucide-react";

import type { CourseDetail, CourseVideoItem } from "@/app/(main)/dashboard/cursos/_components/course-detail-schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sortedVideos(videos: CourseDetail["videos"]): CourseVideoItem[] {
  if (!videos?.length) return [];
  return [...videos].sort((a, b) => a.video_priority - b.video_priority);
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{children}</p>;
}

function DescriptionBlock({ data }: { data: CourseDetail }) {
  const hasText = Boolean(data.subtitle ?? data.description);
  return (
    <div className="space-y-1">
      {data.subtitle ? <p className="text-muted-foreground">{data.subtitle}</p> : null}
      {data.description ? <p className="leading-relaxed">{data.description}</p> : null}
      {!hasText ? <p className="text-muted-foreground">Sin descripción.</p> : null}
    </div>
  );
}

function MetaGrid({ data, tutorName, active }: { data: CourseDetail; tutorName: string | null; active: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <FieldLabel>Precio</FieldLabel>
        <p className="font-medium tabular-nums">€{data.price}</p>
      </div>
      <div>
        <FieldLabel>Estado</FieldLabel>
        <p className="font-medium">{active ? "Activo" : "Inactivo"}</p>
      </div>
      {tutorName ? (
        <div className="sm:col-span-2">
          <FieldLabel>Tutor</FieldLabel>
          <p className="font-medium">{tutorName}</p>
        </div>
      ) : null}
      <div>
        <FieldLabel>Creado</FieldLabel>
        <p>{formatDate(data.created_at)}</p>
      </div>
      <div>
        <FieldLabel>Actualizado</FieldLabel>
        <p>{formatDate(data.updated_at)}</p>
      </div>
    </div>
  );
}

function CourseImage({ src }: { src: string }) {
  return (
    <div className="relative max-h-48 w-full overflow-hidden rounded-md border">
      <Image src={src} alt="" width={800} height={320} className="max-h-48 w-full object-cover" unoptimized />
    </div>
  );
}

function PresentationVideoLink({ url }: { url: string }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">Video de presentación</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex items-center gap-1 hover:underline"
      >
        Abrir enlace
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function VideoCurriculum({ videos }: { videos: CourseVideoItem[] }) {
  if (videos.length === 0) {
    return <p className="text-muted-foreground">No hay videos en el currículo.</p>;
  }

  return (
    <ul className="space-y-2">
      {videos.map((v) => (
        <li
          key={v.video_id}
          className="bg-muted/40 flex flex-col gap-1 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{v.video_title}</p>
            {v.video_description ? (
              <p className="text-muted-foreground line-clamp-2 text-xs">{v.video_description}</p>
            ) : null}
            <p className="text-muted-foreground text-xs">Orden: {v.video_priority}</p>
          </div>
          {v.video_url ? (
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <a href={v.video_url} target="_blank" rel="noopener noreferrer">
                Ver / descargar
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function AudiosSection({ count }: { count: number }) {
  return (
    <>
      <Separator />
      <div>
        <h3 className="mb-2 font-semibold">Audios</h3>
        <p className="text-muted-foreground text-xs">{count} elemento(s) (estructura no tipada).</p>
      </div>
    </>
  );
}

function OptionalCourseImage({ image }: { image: string | null | undefined }) {
  const src = image?.trim();
  if (!src) return null;
  return <CourseImage src={src} />;
}

function OptionalPresentationVideo({ url }: { url: string | null | undefined }) {
  const href = url?.trim();
  if (!href) return null;
  return <PresentationVideoLink url={href} />;
}

function OptionalAudiosSection({ audios }: { audios: CourseDetail["audios"] }) {
  const count = audios?.length ?? 0;
  if (count <= 0) return null;
  return <AudiosSection count={count} />;
}

export function CursoDetalleContent({ data }: { data: CourseDetail }) {
  const tutorName = data.tutor ? `${data.tutor.firstName} ${data.tutor.lastName}`.trim() : null;
  const active = data.is_active ?? data.active ?? false;
  const videos = sortedVideos(data.videos);

  return (
    <div className="space-y-4 text-sm">
      <DescriptionBlock data={data} />
      <MetaGrid data={data} tutorName={tutorName} active={active} />
      <OptionalCourseImage image={data.image} />
      <OptionalPresentationVideo url={data.video_presentation} />
      <Separator />
      <div>
        <h3 className="mb-2 font-semibold">Currículo de videos</h3>
        <VideoCurriculum videos={videos} />
      </div>
      <OptionalAudiosSection audios={data.audios} />
    </div>
  );
}
