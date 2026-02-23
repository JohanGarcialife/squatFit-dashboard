"use client";

import { useState } from "react";

import { FileText } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { useUploadVersionPdf } from "@/hooks/use-versions";
import type { VersionApi } from "@/lib/services/libros-service";

interface UpdateVersionPdfModalProps {
  version: VersionApi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateVersionPdfModal({ version, open, onOpenChange, onSuccess }: UpdateVersionPdfModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadVersionPdf(version?.id ?? "", version?.book_id ?? "");

  const handleSubmit = async () => {
    if (!version || !file) return;
    try {
      await uploadMutation.mutateAsync(file);
      onOpenChange(false);
      setFile(null);
      onSuccess?.();
    } catch {
      // Error manejado por el hook
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setFile(null);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reemplazar PDF</DialogTitle>
          <DialogDescription>
            Sube un nuevo archivo PDF para la versión &quot;{version?.title}&quot;. Se actualizará el contenido digital.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Archivo PDF *</Label>
            <Input
              type="file"
              accept="application/pdf"
              className="cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={uploadMutation.isPending}
            />
            {file && (
              <div className="text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <FileText className="size-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={uploadMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!file || uploadMutation.isPending}>
            {uploadMutation.isPending ? "Subiendo..." : "Subir PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
