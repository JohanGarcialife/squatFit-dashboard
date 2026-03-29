"use client";

import { useCallback, useRef, useState } from "react";

import { CheckCircle2, FileVideo, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useUploadCursoVideo } from "@/hooks/use-cursos";

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // -------------------------------------------------------------------------
  // Subida
  // -------------------------------------------------------------------------

  const handleUpload = async () => {
    if (!curso || !selectedFile) return;

    try {
      await uploadMutation.mutateAsync({ courseId: curso.id, file: selectedFile });
      setUploadSuccess(true);
    } catch {
      // El error ya es manejado por el hook con toast
    }
  };

  // -------------------------------------------------------------------------
  // Reset y cierre
  // -------------------------------------------------------------------------

  const handleClose = () => {
    if (uploadMutation.isPending) return;
    setSelectedFile(null);
    setFileError(null);
    setUploadSuccess(false);
    if (inputRef.current) inputRef.current.value = "";
    onOpenChange(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setUploadSuccess(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isPending = uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="text-primary h-5 w-5" />
            Subir Video al Curso
          </DialogTitle>
          <DialogDescription>
            Sube el video de presentación del curso. Se reemplazará cualquier video previo.
          </DialogDescription>
        </DialogHeader>

        {/* Info del curso */}
        {curso && (
          <div className="bg-muted rounded-lg px-4 py-3">
            <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">Curso seleccionado</p>
            <p className="text-sm font-semibold">{curso.name}</p>
            <p className="text-muted-foreground font-mono text-xs">ID: {curso.id}</p>
          </div>
        )}

        {/* Zona de carga */}
        <div className="space-y-3">
          {!selectedFile ? (
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
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
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
            <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-4">
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
              <p className="text-muted-foreground text-center text-xs">Subiendo video, esto puede tardar un momento...</p>
            </div>
          )}

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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            {uploadSuccess ? "Cerrar" : "Cancelar"}
          </Button>
          {!uploadSuccess && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isPending || !curso}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir Video
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
