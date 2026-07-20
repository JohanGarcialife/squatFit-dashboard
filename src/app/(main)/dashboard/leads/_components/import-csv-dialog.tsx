"use client";

import { useRef, useState } from "react";

import { Loader2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useImportLeadsCsv } from "@/hooks/use-leads";
import { LEADS_API_READY } from "@/lib/services/leads-service";

interface ImportCsvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCsvDialog({ open, onOpenChange }: ImportCsvDialogProps) {
  const importCsv = useImportLeadsCsv();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleImport = () => {
    if (!file) return;
    importCsv.mutate(file, {
      onSuccess: (res) => {
        toast.success(`${res.imported} lead(s) importados${res.errors.length ? `, ${res.errors.length} avisos` : ""}`);
        if (res.errors.length) console.warn("Import CSV avisos:", res.errors);
        setFile(null);
        onOpenChange(false);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo importar el CSV"),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setFile(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Importar leads (CSV)
          </DialogTitle>
          <DialogDescription>
            Cabeceras aceptadas: <code>name</code>/nombre, <code>email</code>, <code>phone</code>/teléfono,{" "}
            <code>source</code>/origen (web · instagram), <code>state</code>/estado, <code>interest</code>/interés. Solo{" "}
            <code>name</code> es obligatorio.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="hover:bg-muted/40 flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-sm transition-colors"
          >
            <FileText className="text-muted-foreground size-6" />
            {file ? (
              <span className="font-medium">{file.name}</span>
            ) : (
              <span className="text-muted-foreground">Haz clic para elegir un archivo .csv</span>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {!LEADS_API_READY && (
            <p className="text-muted-foreground mt-3 text-xs">
              El backend de leads aún no está activo: la importación se procesa en el navegador y alimenta los datos de
              ejemplo para revisar la vista.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importCsv.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || importCsv.isPending} className="gap-2">
            {importCsv.isPending && <Loader2 className="size-4 animate-spin" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
