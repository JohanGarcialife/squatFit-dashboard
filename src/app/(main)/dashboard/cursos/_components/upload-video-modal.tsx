"use client";

import { useCallback, useRef, useState } from "react";

import { CheckCircle2, FileVideo, Link2, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLinkCursoVideo, useUploadCursoVideo } from "@/hooks/use-cursos";

import { Curso } from "./schema";

// ============================================================================
// CONSTANTES
// ============================================================================

const ACCEPTED_FORMATS = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];
const ACCEPTED_EXTENSIONS = ".mp4, .mov, .avi, .mkv, .webm";
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ============================================================================
// HELPERS
// ============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidVideoFile(file: File): string | null {
  if (!ACCEPTED_FORMATS.includes(file.type)) {
    return `Formato no permitido. Acepta: ${ACCEPTED_EXTENSIONS}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB`;
  }
  return null;
}

// ============================================================================
// TIPOS
// ============================================================================

interface UploadVideoModalProps {
  curso: Curso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function UploadVideoModal({ curso, open, onOpenChange }: UploadVideoModalProps) {
  const uploadMutation = useUploadCursoVideo();
  const linkMutation = useLinkCursoVideo();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isExternalVideo, setIsExternalVideo] = useState(false);
  const [externalVideoTitle, setExternalVideoTitle] = useState("");
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoPriority, setVideoPriority] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Manejo de archivo seleccionado
  // -------------------------------------------------------------------------

  const handleFileSelect = useCallback((file: File) => {
    const validationError = isValidVideoFile(file);
    if (validationError) {
      setFileError(validationError);
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
    setUploadSuccess(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // -------------------------------------------------------------------------
  // Drag & drop
  // -------------------------------------------------------------------------

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // -------------------------------------------------------------------------
  // Subida
  // -------------------------------------------------------------------------

  const resetVideoForm = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
    setUploadSuccess(false);
    setExternalVideoTitle("");
    setExternalVideoUrl("");
    setVideoDescription("");
    setVideoPriority("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleModeChange = (checked: boolean) => {
    setIsExternalVideo(checked);
    resetVideoForm();
  };

  const handleUpload = async () => {
    if (!curso) return;

    try {
      const parsedPriority =
        videoPriority.trim() === "" || Number.isNaN(Number(videoPriority)) ? undefined : Number(videoPriority);

      if (isExternalVideo) {
        await linkMutation.mutateAsync({
          courseId: curso.id,
          title: externalVideoTitle.trim(),
          url: externalVideoUrl.trim(),
          description: videoDescription.trim() || undefined,
          priority: parsedPriority,
        });
      } else {
        if (!selectedFile) return;

        await uploadMutation.mutateAsync({
          courseId: curso.id,
          file: selectedFile,
          description: videoDescription.trim() || undefined,
          priority: parsedPriority,
        });
      }

      setUploadSuccess(true);
    } catch {
      // El error ya es manejado por el hook con toast
    }
  };

  // -------------------------------------------------------------------------
  // Reset y cierre
  // -------------------------------------------------------------------------

  const handleClose = () => {
    if (uploadMutation.isPending || linkMutation.isPending) return;
    resetVideoForm();
    setIsExternalVideo(false);
    onOpenChange(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setUploadSuccess(false);
    setVideoDescription("");
    setVideoPriority("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isPending = uploadMutation.isPending || linkMutation.isPending;
  const canSubmit = isExternalVideo
    ? Boolean(curso && externalVideoTitle.trim() && externalVideoUrl.trim())
    : Boolean(curso && selectedFile);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="bg-background/95 shrink-0 border-b px-6 py-5 text-left backdrop-blur">
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="text-primary h-5 w-5" />
            Subir Video al Curso
          </DialogTitle>
          <DialogDescription>Sube un nuevo video para el curso.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {/* Info del curso */}
          {curso && (
            <div className="bg-muted/30 border-border/70 space-y-4 rounded-xl border px-4 py-4">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
                Curso seleccionado
              </p>
              <p className="text-sm font-semibold">{curso.name}</p>
              <p className="text-muted-foreground font-mono text-xs">ID: {curso.id}</p>
              <div className="bg-background/85 flex items-center justify-between rounded-lg border px-4 py-4">
                <div className="space-y-1 pr-4">
                  <p className="text-sm font-medium">Video externo</p>
                  <p className="text-muted-foreground text-xs">
                    Activalo para vincular una URL externa en vez de subir un archivo.
                  </p>
                </div>
                <Switch checked={isExternalVideo} onCheckedChange={handleModeChange} disabled={isPending} />
              </div>
            </div>
          )}

          {/* Zona de carga */}
          <div className="space-y-3">
            {!isExternalVideo ? (
              !selectedFile ? (
                <div
                  role="button"
                  aria-label="Zona para arrastrar o seleccionar video"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                  className={[
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/60 hover:bg-muted/40",
                  ].join(" ")}
                >
                  <div className="bg-primary/10 rounded-full p-3">
                    <Upload className="text-primary h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Arrastra un video aquí o{" "}
                      <span className="text-primary underline underline-offset-2">haz clic para seleccionar</span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">{ACCEPTED_EXTENSIONS}</p>
                    <p className="text-muted-foreground text-xs">Máximo {MAX_FILE_SIZE_MB} MB</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 flex items-center gap-3 rounded-xl border p-4">
                  <div className="bg-primary/10 flex-shrink-0 rounded-md p-2">
                    <FileVideo className="text-primary h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedFile.type.split("/")[1]?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {!isPending && !uploadSuccess && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                      onClick={handleRemoveFile}
                      aria-label="Eliminar archivo seleccionado"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {uploadSuccess && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />}
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="bg-background/85 space-y-2 rounded-xl border px-4 py-4">
                  <label className="text-sm font-medium" htmlFor="external-video-title">
                    Titulo del video *
                  </label>
                  <Input
                    id="external-video-title"
                    value={externalVideoTitle}
                    onChange={(event) => setExternalVideoTitle(event.target.value)}
                    disabled={isPending}
                    placeholder="Ej: Introduccion al curso"
                  />
                </div>

                <div className="bg-background/85 space-y-2 rounded-xl border px-4 py-4">
                  <label className="text-sm font-medium" htmlFor="external-video-url">
                    URL externa *
                  </label>
                  <Input
                    id="external-video-url"
                    type="url"
                    value={externalVideoUrl}
                    onChange={(event) => setExternalVideoUrl(event.target.value)}
                    disabled={isPending}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-muted-foreground text-xs">Se usará el endpoint de video externo del curso.</p>
                </div>
              </div>
            )}

            {/* Error de validación */}
            {fileError && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <X className="h-3.5 w-3.5" />
                {fileError}
              </p>
            )}

            {/* Barra de progreso durante la subida */}
            {isPending && (
              <div className="space-y-1.5">
                <Progress value={undefined} className="h-1.5 w-full animate-pulse" />
                <p className="text-muted-foreground text-center text-xs">
                  Subiendo video, esto puede tardar un momento...
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-background/85 space-y-2 rounded-xl border px-4 py-4 md:col-span-2">
                <label className="text-sm font-medium" htmlFor="upload-video-description">
                  Descripcion del video
                </label>
                <Textarea
                  id="upload-video-description"
                  value={videoDescription}
                  onChange={(event) => setVideoDescription(event.target.value)}
                  disabled={isPending}
                  className="min-h-[100px] resize-none"
                  placeholder="Sinopsis o resumen textual sobre el contenido del video"
                />
                <p className="text-muted-foreground text-xs">Opcional.</p>
              </div>

              <div className="bg-background/85 space-y-2 rounded-xl border px-4 py-4">
                <label className="text-sm font-medium" htmlFor="upload-video-priority">
                  Prioridad
                </label>
                <Input
                  id="upload-video-priority"
                  type="number"
                  min="0"
                  step="1"
                  value={videoPriority}
                  onChange={(event) => setVideoPriority(event.target.value)}
                  disabled={isPending}
                  placeholder="0"
                />
                <p className="text-muted-foreground text-xs">Opcional. Si se omite, se coloca al final.</p>
              </div>
            </div>

            {/* Input oculto */}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={handleInputChange}
              aria-label="Seleccionar archivo de video"
            />
          </div>
        </div>

        <DialogFooter className="bg-background/95 shrink-0 border-t px-6 py-4 backdrop-blur">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            {uploadSuccess ? "Cerrar" : "Cancelar"}
          </Button>
          {!uploadSuccess && (
            <Button type="button" onClick={handleUpload} disabled={!canSubmit || isPending} className="gap-2">
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isExternalVideo ? "Vinculando..." : "Subiendo..."}
                </>
              ) : (
                <>
                  {isExternalVideo ? <Link2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  {isExternalVideo ? "Vincular Video" : "Subir Video"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
