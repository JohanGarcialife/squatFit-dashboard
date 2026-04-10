"use client";

import { useState, type ReactNode } from "react";

import Image from "next/image";

import { ExternalLink, ImageOff } from "lucide-react";

import type { CourseDetail, CourseVideoItem } from "@/app/(main)/dashboard/cursos/_components/course-detail-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  return <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">{children}</p>;
}

function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border-border/70 bg-muted/20 rounded-xl border p-5 shadow-sm ${className}`}>{children}</section>;
}

function SectionHeader({
  label,
  title,
  description,
  action,
}: {
  label: string;
  title: string;
  description?: string | null;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <FieldLabel>{label}</FieldLabel>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description ? <p className="text-muted-foreground text-sm leading-relaxed">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function DescriptionBlock({ data }: { data: CourseDetail }) {
  const hasText = Boolean(data.subtitle ?? data.description);
  return (
    <SectionCard className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <FieldLabel>Resumen</FieldLabel>
          {data.subtitle ? <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{data.subtitle}</p> : null}
        </div>
      </div>
      <div className="bg-background/80 rounded-lg border px-4 py-4">
        {data.description ? <p className="leading-7">{data.description}</p> : null}
        {!hasText ? <p className="text-muted-foreground">Sin resumen ni descripción disponible.</p> : null}
        {hasText && !data.description ? <p className="text-muted-foreground">Sin descripción extendida.</p> : null}
      </div>
    </SectionCard>
  );
}

function MetaGrid({ data, tutorName, active }: { data: CourseDetail; tutorName: string | null; active: boolean }) {
  const metaItems = [
    { label: "Precio", value: <span className="text-lg font-semibold tabular-nums">€{data.price}</span> },
    {
      label: "Estado",
      value: (
        <Badge
          variant="outline"
          className={
            active
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/60 dark:text-green-300"
              : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
          }
        >
          {active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    { label: "Tutor", value: <span className="font-medium">{tutorName ?? "Sin instructor"}</span> },
    { label: "Creado", value: <span>{formatDate(data.created_at)}</span> },
    { label: "Actualizado", value: <span>{formatDate(data.updated_at)}</span> },
  ];

  return (
    <SectionCard className="space-y-4">
      <SectionHeader label="Detalles" title="Información general" description="Datos clave del curso para una lectura rápida." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metaItems.map((item) => (
          <div key={item.label} className="bg-background/85 flex min-h-24 flex-col justify-between rounded-lg border px-4 py-3">
            <FieldLabel>{item.label}</FieldLabel>
            <div className="mt-3 text-sm">{item.value}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function CourseImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="bg-muted/40 flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
        <div className="bg-background mb-3 rounded-full border p-3">
          <ImageOff className="text-muted-foreground h-5 w-5" />
        </div>
        <p className="font-medium">Imagen no disponible</p>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">
          No se pudo cargar la portada de <span className="font-medium">{title}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background relative aspect-video w-full overflow-hidden rounded-xl border">
      <Image
        src={src}
        alt={`Portada del curso ${title}`}
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        className="object-cover"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function PresentationVideoLink({ url }: { url: string | null | undefined }) {
  const href = url?.trim();

  return (
    <div className="bg-background/85 space-y-3 rounded-xl border px-4 py-4">
      <div>
        <FieldLabel>Video de presentación</FieldLabel>
        {href ? (
          <>
            <p className="mt-2 truncate font-medium">{href}</p>
            <p className="text-muted-foreground mt-1 text-sm">El enlace se abre en una nueva pestaña.</p>
          </>
        ) : (
          <p className="text-muted-foreground mt-2 text-sm">Este curso no tiene video de presentación registrado.</p>
        )}
      </div>
      {href ? (
        <Button variant="outline" className="shrink-0" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer">
            Abrir enlace
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function VideoCurriculum({ videos }: { videos: CourseVideoItem[] }) {
  if (videos.length === 0) {
    return (
      <div className="bg-background/85 rounded-lg border border-dashed px-4 py-6 text-center">
        <p className="text-muted-foreground">No hay videos en el currículo.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {videos.map((v, index) => (
        <li
          key={v.video_id}
          className="bg-background/85 flex flex-col gap-4 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Video {index + 1}</Badge>
              <span className="text-muted-foreground text-xs">Orden: {v.video_priority}</span>
            </div>
            <p className="truncate font-medium">{v.video_title}</p>
            {v.video_description ? (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">{v.video_description}</p>
            ) : null}
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
    <SectionCard className="space-y-3">
      <SectionHeader label="Audio" title="Recursos de audio" description="Elementos de audio asociados al curso." />
      <div className="bg-background/85 rounded-lg border px-4 py-4">
        <p className="text-sm font-medium">{count} elemento(s)</p>
        <p className="text-muted-foreground mt-1 text-sm">La estructura recibida para audios no está tipada en esta vista.</p>
      </div>
    </SectionCard>
  );
}

function CourseImageSection({ image, title }: { image: string | null | undefined; title: string }) {
  const src = image?.trim();
  return (
    <div className="bg-background/85 space-y-3 rounded-xl border px-4 py-4">
      <div>
        <FieldLabel>Portada</FieldLabel>
        <p className="text-muted-foreground mt-2 text-sm">
          {src ? "Vista previa de la imagen principal del curso." : "Este curso no tiene imagen registrada."}
        </p>
      </div>
      {src ? (
        <CourseImage src={src} title={title} />
      ) : (
        <div className="bg-muted/40 flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
          <div className="bg-background mb-3 rounded-full border p-3">
            <ImageOff className="text-muted-foreground h-5 w-5" />
          </div>
          <p className="font-medium">Sin imagen</p>
          <p className="text-muted-foreground mt-1 text-sm">Todavía no se ha configurado una portada para este curso.</p>
        </div>
      )}
    </div>
  );
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
    <div className="space-y-5 pb-1 text-sm">
      <DescriptionBlock data={data} />
      <MetaGrid data={data} tutorName={tutorName} active={active} />
      <SectionCard className="space-y-4">
        <SectionHeader
          label="Multimedia"
          title="Recursos visuales"
          description="Portada y acceso al video de presentación del curso."
        />
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <CourseImageSection image={data.image} title={data.title} />
          <PresentationVideoLink url={data.video_presentation} />
        </div>
      </SectionCard>
      <SectionCard className="space-y-4">
        <SectionHeader
          label="Contenido"
          title="Currículo de videos"
          description="Listado ordenado del material principal del curso."
          action={<Badge variant="outline">{videos.length} video(s)</Badge>}
        />
        <VideoCurriculum videos={videos} />
      </SectionCard>
      <OptionalAudiosSection audios={data.audios} />
    </div>
  );
}
