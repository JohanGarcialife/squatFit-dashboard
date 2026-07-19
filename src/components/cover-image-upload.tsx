"use client";

import { useEffect, useRef, useState } from "react";

import { X, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CoverImageValue {
  /** Archivo nuevo elegido por el usuario (tiene prioridad sobre `url`). */
  file: File | null;
  /** URL pública de la portada (la que lee el carrito de la web). */
  url: string;
}

interface CoverImageUploadProps {
  value: CoverImageValue;
  onChange: (value: CoverImageValue) => void;
  disabled?: boolean;
  /** URL ya existente (modo edición) para mostrar como preview inicial. */
  initialPreviewUrl?: string | null;
  className?: string;
}

/**
 * Campo de portada de producto — subir archivo o pegar URL, con vista previa.
 *
 * La portada se guarda en el mismo campo `image` que el carrito de la web ya
 * lee (libros/versiones/packs/cursos → `storage.googleapis.com`). Reutilizable
 * en todas las fichas del catálogo del back office.
 */
export function CoverImageUpload({ value, onChange, disabled, initialPreviewUrl, className }: CoverImageUploadProps) {
  const [useUrl, setUseUrl] = useState(!!value.url && !value.file);
  const [preview, setPreview] = useState<string | null>(initialPreviewUrl ?? value.url ?? null);
  const objectUrlRef = useRef<string | null>(null);

  // Libera el object URL del archivo anterior para no fugar memoria.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const setFilePreview = (file: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const handleFile = (file: File | null) => {
    setFilePreview(file);
    onChange({ file, url: "" });
  };

  const handleUrl = (url: string) => {
    setPreview(url || null);
    onChange({ file: null, url });
  };

  const clear = () => {
    setFilePreview(null);
    setPreview(null);
    onChange({ file: null, url: "" });
  };

  return (
    <div className={cn("border-border/70 bg-background space-y-4 rounded-lg border p-4", className)}>
      <p className="text-muted-foreground text-sm font-medium">Imagen de portada</p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={!useUrl ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setUseUrl(false);
            handleUrl("");
          }}
          disabled={disabled}
        >
          Subir archivo
        </Button>
        <Button
          type="button"
          variant={useUrl ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setUseUrl(true);
            handleFile(null);
          }}
          disabled={disabled}
        >
          Usar URL
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          {!useUrl ? (
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={disabled}
              className="cursor-pointer"
            />
          ) : (
            <Input
              type="url"
              placeholder="https://storage.googleapis.com/…/portada.png"
              value={value.url}
              onChange={(e) => handleUrl(e.target.value)}
              disabled={disabled}
            />
          )}
          <p className="text-muted-foreground text-xs">
            {useUrl ? "URL pública de la portada." : "Formatos: JPG, PNG, WEBP (máx. 5 MB)."}
          </p>
        </div>

        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa de la portada"
                className="size-full object-cover"
                onError={() => setPreview(null)}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={clear}
                disabled={disabled}
                className="absolute top-1 right-1 size-6"
                aria-label="Quitar portada"
              >
                <X className="size-3.5" />
              </Button>
            </>
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center">
              <ImageIcon className="size-7" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
