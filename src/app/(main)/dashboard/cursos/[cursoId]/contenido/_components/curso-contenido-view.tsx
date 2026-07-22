"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  FileQuestion,
  Video,
  VideoOff,
  Pencil,
  Check,
  X,
  TriangleAlert,
  Clock,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CursoContenidoService,
  COURSE_CONTENT_API_READY,
  type ContentTree,
  type ContentModule,
  type Lesson,
} from "@/lib/services/curso-contenido-service";

import { TestEditorDialog } from "./test-editor-dialog";

export function CursoContenidoView({ cursoId }: { cursoId: string }) {
  const [tree, setTree] = useState<ContentTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testDialog, setTestDialog] = useState<{ open: boolean; testId: string | null }>({ open: false, testId: null });
  const [newModuleName, setNewModuleName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTree(await CursoContenidoService.getContentTree(cursoId));
    } catch (e) {
      toast.error(`No se pudo cargar el contenido: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    void load();
  }, [load]);

  const guard = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // ── módulos ──
  const addModule = () => {
    const name = newModuleName.trim();
    if (!name) return;
    void guard(async () => {
      await CursoContenidoService.createModule(cursoId, { name, priority: (tree?.modules.length ?? 0) + 1 });
      setNewModuleName("");
      toast.success("Módulo creado");
    });
  };
  const renameModule = (m: ContentModule, name: string) =>
    guard(async () => {
      await CursoContenidoService.updateModule(m.id, { name });
      toast.success("Módulo actualizado");
    });
  const deleteModule = (m: ContentModule) => {
    if (!confirm(`¿Eliminar el módulo «${m.name}» y sus clases?`)) return;
    void guard(async () => {
      await CursoContenidoService.deleteModule(m.id);
      toast.success("Módulo eliminado");
    });
  };
  const moveModule = (idx: number, dir: -1 | 1) => {
    if (!tree) return;
    const arr = [...tree.modules];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    void guard(() => CursoContenidoService.reorderModules(arr.map((m, i) => ({ id: m.id, priority: i + 1 }))));
  };

  // ── clases ──
  const addLesson = (m: ContentModule) =>
    guard(async () => {
      await CursoContenidoService.createLesson(m.id, {
        title: "Nueva clase",
        priority: (m.lessons.length ?? 0) + 1,
        lesson_number: (m.lessons.length ?? 0) + 1,
      });
      toast.success("Clase añadida");
    });
  const saveLesson = (l: Lesson, patch: LessonPatch) =>
    guard(async () => {
      await CursoContenidoService.updateLesson(l.id, patch);
      toast.success("Clase guardada");
    });
  const saveModuleMeta = (m: ContentModule, patch: { subtitle?: string | null; drip_days?: number | null }) =>
    guard(async () => {
      await CursoContenidoService.updateModule(m.id, patch);
      toast.success("Módulo actualizado");
    });
  const deleteLesson = (l: Lesson) => {
    if (!confirm(`¿Eliminar la clase «${l.title}»?`)) return;
    void guard(async () => {
      await CursoContenidoService.deleteLesson(l.id);
      toast.success("Clase eliminada");
    });
  };
  const moveLesson = (m: ContentModule, idx: number, dir: -1 | 1) => {
    const arr = [...m.lessons];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    void guard(() => CursoContenidoService.reorderLessons(arr.map((l, i) => ({ id: l.id, priority: i + 1 }))));
  };

  const openTest = (testId: string) => setTestDialog({ open: true, testId });
  const openModuleTest = (m: ContentModule) =>
    guard(async () => {
      const t = await CursoContenidoService.getModuleTest(m.id);
      setTestDialog({ open: true, testId: t.id });
    });

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const totalLessons = tree?.modules.reduce((n, m) => n + m.lessons.length, 0) ?? 0;
  const missingVideos = tree?.modules.reduce((n, m) => n + m.lessons.filter((l) => !l.video_url).length, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/cursos" aria-label="Volver a cursos">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Contenido del curso</h1>
            <p className="text-muted-foreground text-sm">
              {tree?.modules.length ?? 0} módulos · {totalLessons} clases
              {missingVideos > 0 && (
                <>
                  {" "}
                  · <span className="text-amber-600">{missingVideos} sin vídeo</span>
                </>
              )}
            </p>
          </div>
        </div>
        {busy && <Loader2 className="text-muted-foreground size-5 animate-spin" />}
      </div>

      {!COURSE_CONTENT_API_READY && (
        <Alert>
          <TriangleAlert className="size-4" />
          <AlertTitle>Modo demostración</AlertTitle>
          <AlertDescription>
            Los endpoints de contenido (rama <code>features-lote-7</code>) aún no están desplegados. Se muestra un árbol
            de ejemplo; los cambios no se guardan. Al desplegar el backend, poner
            <code> COURSE_CONTENT_API_READY = true</code> en <code>curso-contenido-service.ts</code>. El goteo y los
            metadatos (Fase 17) requieren además las columnas <code>drip_days</code>, <code>duration_minutes</code> y{" "}
            <code>description</code> (ver INFORME-FASE-17).
          </AlertDescription>
        </Alert>
      )}

      {tree?.final_test && (
        <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">Test final del curso</span>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => openTest(tree.final_test!.id)}>
            <FileQuestion className="size-4" /> Editar test final
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="flex flex-col gap-3">
        {tree?.modules.map((m, mi) => (
          <AccordionItem key={m.id} value={m.id} className="rounded-lg border px-4">
            <div className="group flex items-center gap-2 py-2">
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={mi === 0}
                  onClick={() => moveModule(mi, -1)}
                  aria-label="Subir módulo"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={mi === tree.modules.length - 1}
                  onClick={() => moveModule(mi, 1)}
                  aria-label="Bajar módulo"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>
              <Badge variant="secondary" className="shrink-0">
                M{m.priority}
              </Badge>
              <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                <ModuleName module={m} onRename={(name) => renameModule(m, name)} />
              </AccordionTrigger>
              <Badge variant="outline" className="shrink-0">
                {m.lessons.length} clases
              </Badge>
              {m.drip_days != null && m.drip_days > 0 && (
                <Badge variant="secondary" className="shrink-0 gap-1" title="Goteo: días hasta el desbloqueo">
                  <CalendarClock className="size-3" /> día {m.drip_days}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => openModuleTest(m)} disabled={busy}>
                <FileQuestion className="size-4" /> Test módulo
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600"
                onClick={() => deleteModule(m)}
                disabled={busy}
                aria-label="Eliminar módulo"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <AccordionContent className="pb-4">
              <div className="flex flex-col gap-2">
                <ModuleMetaRow module={m} busy={busy} onSave={(patch) => saveModuleMeta(m, patch)} />
                {m.lessons.map((l, li) => (
                  <LessonRow
                    key={l.id}
                    lesson={l}
                    index={li}
                    count={m.lessons.length}
                    busy={busy}
                    onSave={(patch) => saveLesson(l, patch)}
                    onDelete={() => deleteLesson(l)}
                    onMove={(dir) => moveLesson(m, li, dir)}
                    onEditTest={() => l.test && openTest(l.test.id)}
                  />
                ))}
                <Button variant="ghost" size="sm" className="w-fit gap-1" onClick={() => addLesson(m)} disabled={busy}>
                  <Plus className="size-3" /> Añadir clase
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nuevo módulo</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addModule()}
            placeholder="Nombre descriptivo del módulo"
          />
          <Button className="gap-2" onClick={addModule} disabled={!newModuleName.trim() || busy}>
            <Plus className="size-4" /> Crear módulo
          </Button>
        </CardContent>
      </Card>

      <TestEditorDialog
        testId={testDialog.testId}
        open={testDialog.open}
        onOpenChange={(open) => setTestDialog((s) => ({ ...s, open }))}
        onSaved={load}
      />
    </div>
  );
}

// ── nombre de módulo editable inline ──
function ModuleName({ module: m, onRename }: { module: ContentModule; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(m.name);
  if (!editing) {
    return (
      <span className="flex items-center gap-2 text-left font-medium">
        {m.name}
        <Pencil
          className="text-muted-foreground size-3 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditing(true);
          }}
        />
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-8" autoFocus />
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-green-600"
        disabled={!value.trim()}
        onClick={(e) => {
          e.preventDefault();
          const name = value.trim();
          if (!name) return; // no permitir guardar un nombre vacío
          onRename(name);
          setEditing(false);
        }}
      >
        <Check className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={(e) => {
          e.preventDefault();
          setValue(m.name);
          setEditing(false);
        }}
      >
        <X className="size-4" />
      </Button>
    </span>
  );
}

// ── metadatos y goteo del módulo ──
function ModuleMetaRow({
  module: m,
  busy,
  onSave,
}: {
  module: ContentModule;
  busy?: boolean;
  onSave: (patch: { subtitle?: string | null; drip_days?: number | null }) => void;
}) {
  const [subtitle, setSubtitle] = useState(m.subtitle ?? "");
  const [drip, setDrip] = useState(m.drip_days != null ? String(m.drip_days) : "");
  const dirty = subtitle !== (m.subtitle ?? "") || drip !== (m.drip_days != null ? String(m.drip_days) : "");

  useEffect(() => {
    setSubtitle(m.subtitle ?? "");
    setDrip(m.drip_days != null ? String(m.drip_days) : "");
  }, [m.subtitle, m.drip_days]);

  return (
    <div className="bg-muted/30 flex flex-col gap-2 rounded-md border border-dashed p-3 md:flex-row md:items-center">
      <Input
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Subtítulo del módulo (opcional)"
        className="text-sm md:flex-1"
      />
      <div className="flex items-center gap-2">
        <CalendarClock className="text-muted-foreground size-4 shrink-0" />
        <Input
          type="number"
          min={0}
          value={drip}
          onChange={(e) => setDrip(e.target.value)}
          placeholder="0"
          className="w-24 text-sm"
          aria-label="Días de goteo del módulo"
        />
        <span className="text-muted-foreground text-xs whitespace-nowrap">días para desbloquear</span>
        <Button
          size="sm"
          disabled={!dirty || busy}
          onClick={() =>
            onSave({
              subtitle: subtitle.trim() || null,
              drip_days: drip.trim() === "" ? null : Math.max(0, Number(drip)),
            })
          }
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}

// ── fila de clase ──
type LessonPatch = {
  title?: string;
  video_url?: string | null;
  drip_days?: number | null;
  duration_minutes?: number | null;
  description?: string | null;
};

function LessonRow({
  lesson,
  index,
  count,
  busy,
  onSave,
  onDelete,
  onMove,
  onEditTest,
}: {
  lesson: Lesson;
  index: number;
  count: number;
  busy?: boolean;
  onSave: (patch: LessonPatch) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onEditTest: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [url, setUrl] = useState(lesson.video_url ?? "");
  const [description, setDescription] = useState(lesson.description ?? "");
  const [drip, setDrip] = useState(lesson.drip_days != null ? String(lesson.drip_days) : "");
  const [duration, setDuration] = useState(lesson.duration_minutes != null ? String(lesson.duration_minutes) : "");
  const dirty =
    title !== lesson.title ||
    url !== (lesson.video_url ?? "") ||
    description !== (lesson.description ?? "") ||
    drip !== (lesson.drip_days != null ? String(lesson.drip_days) : "") ||
    duration !== (lesson.duration_minutes != null ? String(lesson.duration_minutes) : "");

  useEffect(() => {
    setTitle(lesson.title);
    setUrl(lesson.video_url ?? "");
    setDescription(lesson.description ?? "");
    setDrip(lesson.drip_days != null ? String(lesson.drip_days) : "");
    setDuration(lesson.duration_minutes != null ? String(lesson.duration_minutes) : "");
  }, [lesson.title, lesson.video_url, lesson.description, lesson.drip_days, lesson.duration_minutes]);

  const save = () =>
    onSave({
      title: title.trim(),
      video_url: url.trim() || null,
      description: description.trim() || null,
      drip_days: drip.trim() === "" ? null : Math.max(0, Number(drip)),
      duration_minutes: duration.trim() === "" ? null : Math.max(0, Number(duration)),
    });

  return (
    <div className="bg-background flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center">
      <div className="flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          aria-label="Subir clase"
        >
          <ChevronUp className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          disabled={index === count - 1}
          onClick={() => onMove(1)}
          aria-label="Bajar clase"
        >
          <ChevronDown className="size-3" />
        </Button>
      </div>
      <Badge variant="outline" className="shrink-0" title="Nº de clase">
        {lesson.lesson_number ?? "–"}
      </Badge>
      <div className="flex flex-1 flex-col gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la clase"
          className="font-medium"
        />
        <div className="flex items-center gap-2">
          {url ? (
            <Video className="size-4 shrink-0 text-green-600" />
          ) : (
            <VideoOff className="size-4 shrink-0 text-amber-600" />
          )}
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL de Bunny (embed) — pegar aquí"
            className="text-xs"
          />
        </div>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción corta (opcional, la ve el alumno)"
          className="text-xs"
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5" title="Goteo: días tras la compra para desbloquear la clase">
            <CalendarClock className="text-muted-foreground size-4 shrink-0" />
            <Input
              type="number"
              min={0}
              value={drip}
              onChange={(e) => setDrip(e.target.value)}
              placeholder="—"
              className="h-8 w-20 text-xs"
              aria-label="Días de goteo de la clase"
            />
            <span className="text-muted-foreground text-xs">días goteo</span>
          </span>
          <span className="flex items-center gap-1.5" title="Duración estimada de la clase">
            <Clock className="text-muted-foreground size-4 shrink-0" />
            <Input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="—"
              className="h-8 w-20 text-xs"
              aria-label="Duración en minutos"
            />
            <span className="text-muted-foreground text-xs">min</span>
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="outline" size="sm" className="gap-1" onClick={onEditTest} disabled={!lesson.test || busy}>
          <FileQuestion className="size-4" /> Test
        </Button>
        <Button size="sm" disabled={!dirty || busy} onClick={save}>
          Guardar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600"
          onClick={onDelete}
          disabled={busy}
          aria-label="Eliminar clase"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
