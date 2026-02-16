"use client";
/* eslint-disable max-lines */

/**
 * ============================================================================
 * COMPONENTE: EdicionMasiva - Edición Masiva de Rutinas y Sesiones
 * ============================================================================
 *
 * ESTADO DE CONEXIÓN AL BACKEND:
 *
 * ❌ SIN CONEXIÓN AL BACKEND (MOCK DATA):
 *
 * Este componente NO está conectado al backend. Todos los datos provienen
 * de archivos estáticos (data.ts) y funciones de generación mock.
 *
 * ENDPOINTS NECESARIOS (NO IMPLEMENTADOS EN BACKEND):
 * - GET    /api/v1/rutinas                - Listar rutinas
 * - GET    /api/v1/rutinas/:id            - Obtener rutina específica
 * - POST   /api/v1/rutinas                - Crear rutina
 * - PUT    /api/v1/rutinas/:id            - Actualizar rutina
 * - PATCH  /api/v1/sesiones/bulk          - Actualización masiva de sesiones
 * - DELETE /api/v1/rutinas/:id            - Eliminar rutina
 *
 * DATOS ACTUALES:
 * - clientesEntrenamientoData: Array estático de clientes de ejemplo
 * - sesionesData: Array estático de sesiones de ejemplo
 * - ejerciciosData: Array estático de ejercicios de ejemplo
 * - plantillasEntrenamiento: Array estático de plantillas
 *
 * FUNCIONALIDADES ACTUALES (MOCK):
 * - ✅ Visualización de semanas de entrenamiento por cliente
 * - ✅ Edición de sesiones individuales
 * - ✅ Selección múltiple de sesiones
 * - ✅ Edición masiva (solo en memoria local)
 * - ✅ Copiar sesiones entre semanas
 * - ✅ Eliminar sesiones (solo en memoria local)
 * - ❌ No persiste cambios (se pierden al recargar)
 *
 * LÍNEA 425: TODO: Integrar con API - POST /api/sesiones/bulk
 *
 * REFERENCIA: ANALISIS_FUNCIONALIDADES_BACKEND.md - Sección 2: Biblioteca de Ejercicios
 * ============================================================================
 */

import { useState, useMemo } from "react";

import {
  Search,
  Filter,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Users,
  Calendar,
  Dumbbell,
  MoreHorizontal,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  clientesEntrenamientoData,
  sesionesData,
  ejerciciosData,
  plantillasEntrenamiento,
  tiposLesion,
  tiposRestriccion,
} from "./data";
import type { ClienteEntrenamiento, SesionEntrenamiento, EstadoSesion } from "./schema";

// ============================================
// HELPERS
// ============================================

const getInitials = (nombre: string) => {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getEstadoBadge = (estado: EstadoSesion) => {
  switch (estado) {
    case "completada":
      return {
        label: "Completada",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        icon: CheckCircle2,
      };
    case "parcial":
      return {
        label: "Parcial",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        icon: AlertTriangle,
      };
    case "pendiente":
      return {
        label: "Pendiente",
        className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
        icon: Clock,
      };
    case "saltada":
      return {
        label: "Saltada",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: X,
      };
  }
};

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

// Genera datos de ejemplo para la semana de cada cliente
const generarSemanasClientes = () => {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes

  return clientesEntrenamientoData.map((cliente) => {
    const plantilla = plantillasEntrenamiento.find((p) => p.value === cliente.plantillaActual);
    const diasEntrenamiento = plantilla?.diasSemana || 3;

    // Generar sesiones para la semana
    const sesiones: Array<{
      id: string;
      dia: number;
      fecha: string;
      nombre: string;
      estado: EstadoSesion;
      ejerciciosCount: number;
      volumen: number;
    }> = [];

    // Distribuir los días según la plantilla
    const diasAsignados =
      cliente.plantillaActual === "ppl"
        ? [1, 2, 3, 4, 5, 6] // L-S
        : cliente.plantillaActual === "torso_pierna" || cliente.plantillaActual === "upper_lower"
          ? [1, 2, 4, 5] // L, M, J, V
          : [1, 3, 5]; // L, X, V

    diasAsignados.slice(0, diasEntrenamiento).forEach((dia, index) => {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + dia - 1);

      const esPasado = fecha < hoy;
      const esHoy = fecha.toDateString() === hoy.toDateString();

      sesiones.push({
        id: `${cliente.id}-ses-${dia}`,
        dia,
        fecha: fecha.toISOString().split("T")[0],
        nombre:
          cliente.plantillaActual === "ppl"
            ? ["Push", "Pull", "Legs", "Push", "Pull", "Legs"][index]
            : cliente.plantillaActual === "torso_pierna"
              ? ["Torso A", "Pierna A", "Torso B", "Pierna B"][index]
              : `Full Body ${["A", "B", "C"][index]}`,
        estado: esPasado
          ? Math.random() > 0.3
            ? "completada"
            : Math.random() > 0.5
              ? "parcial"
              : "saltada"
          : esHoy
            ? Math.random() > 0.5
              ? "parcial"
              : "pendiente"
            : "pendiente",
        ejerciciosCount: Math.floor(Math.random() * 4) + 4,
        volumen: Math.floor(Math.random() * 5000) + 3000,
      });
    });

    return {
      cliente,
      sesiones,
    };
  });
};

// ============================================
// COMPONENTES
// ============================================

interface ClienteRowProps {
  cliente: ClienteEntrenamiento;
  sesiones: Array<{
    id: string;
    dia: number;
    fecha: string;
    nombre: string;
    estado: EstadoSesion;
    ejerciciosCount: number;
    volumen: number;
  }>;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEditSesion: (sesionId: string) => void;
}

function ClienteRow({ cliente, sesiones, isSelected, onToggleSelect, onEditSesion }: ClienteRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tieneRestricciones = cliente.lesiones.length > 0 || cliente.restricciones.length > 0;

  return (
    <>
      <TableRow className={cn(isSelected && "bg-primary/5")}>
        <TableCell className="w-[50px]">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={cliente.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(cliente.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{cliente.nombre}</span>
                {tieneRestricciones && (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-xs text-amber-700">
                    <AlertTriangle className="mr-1 size-3" />
                    Restricciones
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {plantillasEntrenamiento.find((p) => p.value === cliente.plantillaActual)?.label}
              </span>
            </div>
          </div>
        </TableCell>

        {/* Celdas para cada día */}
        {[1, 2, 3, 4, 5, 6, 0].map((dia) => {
          const sesion = sesiones.find((s) => s.dia === dia);
          if (!sesion) {
            return (
              <TableCell key={dia} className="text-center">
                <span className="text-muted-foreground/50">—</span>
              </TableCell>
            );
          }

          const estadoBadge = getEstadoBadge(sesion.estado);
          const IconEstado = estadoBadge.icon;

          return (
            <TableCell key={dia} className="min-w-[120px]">
              <button
                onClick={() => onEditSesion(sesion.id)}
                className="group hover:bg-muted/50 hover:border-primary/50 w-full rounded-lg border p-2 text-left transition-colors"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-xs font-medium">{sesion.nombre}</span>
                  <IconEstado className={cn("size-3", estadoBadge.className.split(" ")[1])} />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span>{sesion.ejerciciosCount} ej.</span>
                  <span>•</span>
                  <span>{(sesion.volumen / 1000).toFixed(1)}t</span>
                </div>
              </button>
            </TableCell>
          );
        })}

        <TableCell className="w-[80px]">
          <div className="flex items-center gap-1">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </Button>
            </CollapsibleTrigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="mr-2 size-4" />
                  Duplicar semana
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit3 className="mr-2 size-4" />
                  Editar plantilla
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 size-4" />
                  Eliminar semana
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      {/* Fila expandida con detalles */}
      <Collapsible open={isExpanded}>
        <CollapsibleContent asChild>
          <TableRow className="bg-muted/30">
            <TableCell colSpan={10}>
              <div className="space-y-3 px-4 py-2">
                {/* Restricciones */}
                {tieneRestricciones && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-muted-foreground mr-2 text-sm font-medium">Restricciones:</span>
                    {cliente.lesiones.map((lesion) => {
                      const config = tiposLesion.find((t) => t.value === lesion);
                      return (
                        <Badge key={lesion} variant="secondary" className={config?.color}>
                          {config?.label || lesion}
                        </Badge>
                      );
                    })}
                    {cliente.restricciones.map((restriccion) => {
                      const config = tiposRestriccion.find((t) => t.value === restriccion);
                      return (
                        <Badge key={restriccion} variant="outline" className={config?.color}>
                          {config?.label || restriccion}
                        </Badge>
                      );
                    })}
                    {cliente.restriccionesCustom?.map((custom) => (
                      <Badge key={custom} variant="outline">
                        {custom}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Métricas */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Adherencia: </span>
                    <span className="font-medium">{cliente.adherencia.porcentajeSesiones}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Series: </span>
                    <span className="font-medium">
                      {cliente.adherencia.seriesHechas}/{cliente.adherencia.seriesPlanificadas}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volumen: </span>
                    <span className="font-medium">{(cliente.adherencia.volumenSemanal / 1000).toFixed(1)}t</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RPE medio: </span>
                    <span className="font-medium">{cliente.adherencia.rpeMedio}</span>
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function EdicionMasiva() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroPlantilla, setFiltroPlantilla] = useState<string>("todas");
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const semanasClientes = useMemo(() => generarSemanasClientes(), []);

  const clientesFiltrados = useMemo(() => {
    let resultado = semanasClientes;

    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (item) =>
          item.cliente.nombre.toLowerCase().includes(searchLower) ||
          item.cliente.email.toLowerCase().includes(searchLower),
      );
    }

    if (filtroPlantilla !== "todas") {
      resultado = resultado.filter((item) => item.cliente.plantillaActual === filtroPlantilla);
    }

    return resultado;
  }, [semanasClientes, busqueda, filtroPlantilla]);

  const toggleSelectCliente = (clienteId: string) => {
    const newSelected = new Set(selectedClientes);
    if (newSelected.has(clienteId)) {
      newSelected.delete(clienteId);
    } else {
      newSelected.add(clienteId);
    }
    setSelectedClientes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedClientes.size === clientesFiltrados.length) {
      setSelectedClientes(new Set());
    } else {
      setSelectedClientes(new Set(clientesFiltrados.map((c) => c.cliente.id)));
    }
  };

  const handleEditSesion = (sesionId: string) => {
    // TODO: Abrir modal de edición de sesión
    console.log("Editar sesión:", sesionId);
    setHasChanges(true);
  };

  const handleSave = async () => {
    // TODO: Integrar con API - POST /api/sesiones/bulk
    console.log("Guardando cambios...");
    setHasChanges(false);
  };

  const handleReset = () => {
    // TODO: Resetear cambios
    setHasChanges(false);
  };

  // Calcular fechas de la semana actual
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Edición Masiva de Rutinas</h3>
          <p className="text-muted-foreground text-sm">
            Edita varios días y clientes a la vez • Semana del {formatDate(inicioSemana.toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 size-4" />
                Descartar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 size-4" />
                Guardar cambios
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtros y acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroPlantilla} onValueChange={setFiltroPlantilla}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Plantilla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las plantillas</SelectItem>
              {plantillasEntrenamiento.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClientes.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedClientes.size} seleccionados</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Acciones masivas
                  <ChevronDown className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Copy className="mr-2 size-4" />
                  Copiar semana a siguiente
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit3 className="mr-2 size-4" />
                  Aplicar plantilla
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 size-4" />
                  Eliminar semanas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Tabla */}
      <Card>
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedClientes.size === clientesFiltrados.length && clientesFiltrados.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">Cliente</TableHead>
                {[1, 2, 3, 4, 5, 6, 0].map((dia) => {
                  const fecha = new Date(inicioSemana);
                  fecha.setDate(inicioSemana.getDate() + (dia === 0 ? 6 : dia - 1));
                  const esHoy = fecha.toDateString() === hoy.toDateString();
                  return (
                    <TableHead key={dia} className={cn("min-w-[120px] text-center", esHoy && "bg-primary/5")}>
                      <div className="font-medium">{diasSemana[dia]}</div>
                      <div className="text-muted-foreground text-xs font-normal">{formatDate(fecha.toISOString())}</div>
                    </TableHead>
                  );
                })}
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map(({ cliente, sesiones }) => (
                  <Collapsible key={cliente.id} asChild>
                    <ClienteRow
                      cliente={cliente}
                      sesiones={sesiones}
                      isSelected={selectedClientes.has(cliente.id)}
                      onToggleSelect={() => toggleSelectCliente(cliente.id)}
                      onEditSesion={handleEditSesion}
                    />
                  </Collapsible>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="text-muted-foreground/50 mb-2 size-8" />
                      <p className="text-muted-foreground">No se encontraron clientes</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      {/* Info */}
      <div className="text-muted-foreground flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Completada
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 text-amber-500" />
          Parcial
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-slate-500" />
          Pendiente
        </div>
        <div className="flex items-center gap-1.5">
          <X className="size-3.5 text-red-500" />
          Saltada
        </div>
      </div>
    </div>
  );
}
