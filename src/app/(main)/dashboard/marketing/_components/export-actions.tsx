"use client";

import { useState } from "react";

import { Download, Copy, FileSpreadsheet, CheckCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { FiltrosMarketing } from "./schema";

interface ExportActionsProps {
  filtros?: FiltrosMarketing;
}

type ExportType = "kpis" | "clientes" | "ventas" | "notificaciones" | "xp";

const exportOptions: { value: ExportType; label: string; description: string }[] = [
  { value: "kpis", label: "KPIs", description: "Indicadores clave de rendimiento" },
  { value: "clientes", label: "Clientes", description: "Datos de clientes y renovaciones" },
  { value: "ventas", label: "Ventas", description: "Ventas por producto" },
  { value: "notificaciones", label: "Notificaciones", description: "Historial de notificaciones" },
  { value: "xp", label: "Sistema XP", description: "Tabla de puntos y créditos" },
];

export function ExportActions({ filtros }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleExportCSV = async (tipo: ExportType) => {
    setIsExporting(true);
    try {
      // Simular exportación - aquí se conectaría con MarketingService.exportCSV()
      console.log(`Exportando ${tipo} a CSV con filtros:`, filtros);

      // Simulación de delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Aquí iría la lógica real de descarga
      // const blob = await MarketingService.exportCSV(tipo, filtros);
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `squatfit_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
      // a.click();
      // URL.revokeObjectURL(url);

      console.log(`✅ Exportación de ${tipo} completada`);
    } catch (error) {
      console.error("Error exportando:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsCopying(true);
    setCopiedSuccess(false);
    try {
      // Simular copia - aquí se conectaría con MarketingService.copyToClipboard()
      console.log("Copiando KPIs al portapapeles con filtros:", filtros);

      // Simulación de datos para copiar
      const mockData = `Ingresos Mensual: €24,580
Ingresos Anual: €287,450
Asesorías Activas: 156
Asesorías en Pausa: 23
Clientes Renovación Próxima: 18
Clientes Falta Pago: 7
Clientes Sin Contacto: 12
Tareas Pendientes: 45`;

      await navigator.clipboard.writeText(mockData);
      setCopiedSuccess(true);

      // Reset success state after 2 seconds
      setTimeout(() => setCopiedSuccess(false), 2000);

      console.log("✅ Datos copiados al portapapeles");
    } catch (error) {
      console.error("Error copiando al portapapeles:", error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Copia rápida */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleCopyToClipboard} disabled={isCopying}>
              {isCopying ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : copiedSuccess ? (
                <CheckCircle className="mr-2 size-4 text-green-500" />
              ) : (
                <Copy className="mr-2 size-4" />
              )}
              {copiedSuccess ? "Copiado" : "Copiar KPIs"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copia los KPIs actuales al portapapeles</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dropdown de exportación */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Exportar a CSV</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {exportOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleExportCSV(option.value)}
              className="flex flex-col items-start"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4" />
                <span className="font-medium">{option.label}</span>
              </div>
              <span className="text-muted-foreground ml-6 text-xs">{option.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
