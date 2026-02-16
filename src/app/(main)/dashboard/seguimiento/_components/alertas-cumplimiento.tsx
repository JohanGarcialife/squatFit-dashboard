"use client";
/* eslint-disable max-lines */

import { useState, useMemo } from "react";

import {
  AlertTriangle,
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  CalendarDays,
  CreditCard,
  UserX,
  ChevronRight,
  Filter,
  MailWarning,
  Eye,
  Check,
  X,
  ClipboardList,
  User,
  ExternalLink,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { alertasData, tareasData, prioridadesAlerta, tiposAlerta } from "./data";
import type { AlertaCumplimiento, TareaDietista, TipoAlerta, PrioridadAlerta } from "./schema";

const getTipoAlertaConfig = (tipo: TipoAlerta) => {
  const config = {
    formulario_pendiente: {
      icon: FileText,
      label: "Formulario Pendiente",
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
    accion_diaria_incumplida: {
      icon: Activity,
      label: "Acción Incumplida",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
    entrega_pendiente: {
      icon: ClipboardList,
      label: "Entrega Pendiente",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    revision_proxima: {
      icon: CalendarDays,
      label: "Revisión Próxima",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    pago_pendiente: {
      icon: CreditCard,
      label: "Pago Pendiente",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/50",
    },
    sin_actividad: {
      icon: UserX,
      label: "Sin Actividad",
      color: "text-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-950/50",
    },
  };
  return config[tipo];
};

const getPrioridadConfig = (prioridad: PrioridadAlerta) => {
  const config = {
    alta: {
      label: "Alta",
      className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200",
      icon: AlertTriangle,
    },
    media: {
      label: "Media",
      className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200",
      icon: AlertCircle,
    },
    baja: {
      label: "Baja",
      className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200",
      icon: Bell,
    },
  };
  return config[prioridad];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

const formatDateFuture = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  if (days < 7) return `En ${days} días`;

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

interface AlertaItemProps {
  alerta: AlertaCumplimiento;
  onMarcarLeida?: () => void;
}

function AlertaItem({ alerta, onMarcarLeida }: AlertaItemProps) {
  const tipoConfig = getTipoAlertaConfig(alerta.tipo);
  const prioridadConfig = getPrioridadConfig(alerta.prioridad);
  const IconTipo = tipoConfig.icon;
  const IconPrioridad = prioridadConfig.icon;

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-all hover:shadow-md",
        !alerta.leida && "border-l-primary bg-primary/5 border-l-4",
        alerta.leida && "opacity-70 hover:opacity-100",
      )}
    >
      <div className="flex gap-4">
        {/* Icono del tipo */}
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", tipoConfig.bgColor)}>
          <IconTipo className={cn("size-5", tipoConfig.color)} />
        </div>

        {/* Contenido */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="leading-tight font-semibold">{alerta.titulo}</h4>
              {alerta.clienteNombre && (
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                  <User className="size-3" />
                  {alerta.clienteNombre}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", prioridadConfig.className)}>
                <IconPrioridad className="mr-1 size-3" />
                {prioridadConfig.label}
              </Badge>
              {!alerta.leida && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={onMarcarLeida}
                  title="Marcar como leída"
                >
                  <Check className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <p className="text-muted-foreground text-sm">{alerta.descripcion}</p>

          <div className="flex items-center justify-between pt-1">
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDate(alerta.fecha)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {tipoConfig.label}
              </Badge>
            </div>

            {alerta.accionRequerida && (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                {alerta.accionRequerida}
                <ChevronRight className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TareaItemProps {
  tarea: TareaDietista;
}

function TareaItem({ tarea }: TareaItemProps) {
  const isVencida = tarea.estado === "vencida";
  const isEnProgreso = tarea.estado === "en_progreso";
  const prioridadConfig = getPrioridadConfig(tarea.prioridad);

  const tipoConfig = {
    dieta: { icon: FileText, label: "Dieta" },
    pauta: { icon: ClipboardList, label: "Pauta" },
    revision: { icon: CalendarDays, label: "Revisión" },
    informe: { icon: Activity, label: "Informe" },
    otro: { icon: AlertCircle, label: "Otro" },
  };

  const tipo = tipoConfig[tarea.tipo];
  const IconTipo = tipo.icon;

  return (
    <div
      className={cn(
        "group rounded-lg border p-4 transition-all hover:shadow-md",
        isVencida && "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30",
        isEnProgreso && "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30",
      )}
    >
      <div className="flex gap-4">
        {/* Checkbox o estado */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border-2",
            isVencida
              ? "border-red-500 bg-red-100 dark:bg-red-950"
              : isEnProgreso
                ? "border-blue-500 bg-blue-100 dark:bg-blue-950"
                : "border-muted-foreground/30 bg-muted",
          )}
        >
          <IconTipo
            className={cn(
              "size-5",
              isVencida ? "text-red-600" : isEnProgreso ? "text-blue-600" : "text-muted-foreground",
            )}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="leading-tight font-semibold">{tarea.titulo}</h4>
              {tarea.clienteNombre && (
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                  <User className="size-3" />
                  {tarea.clienteNombre}
                </p>
              )}
            </div>
            <Badge variant="outline" className={cn("text-xs", prioridadConfig.className)}>
              {prioridadConfig.label}
            </Badge>
          </div>

          {tarea.descripcion && <p className="text-muted-foreground text-sm">{tarea.descripcion}</p>}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs">
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  isVencida ? "text-red-600" : "text-muted-foreground",
                )}
              >
                <Clock className="size-3" />
                {formatDateFuture(tarea.fechaEntrega)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {tipo.label}
              </Badge>
              {isEnProgreso && <Badge className="bg-blue-500 text-xs">En progreso</Badge>}
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <Eye className="mr-1 size-3" />
                Ver
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <CheckCircle2 className="mr-1 size-3" />
                Completar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertasCumplimiento() {
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todas");
  const [mostrarLeidas, setMostrarLeidas] = useState(false);

  // Contadores
  const contadores = useMemo(() => {
    const alertasSinLeer = alertasData.filter((a) => !a.leida);
    const alertasAltas = alertasSinLeer.filter((a) => a.prioridad === "alta");
    const tareasVencidas = tareasData.filter((t) => t.estado === "vencida");
    const tareasHoy = tareasData.filter((t) => {
      const fecha = new Date(t.fechaEntrega);
      const hoy = new Date();
      return fecha.toDateString() === hoy.toDateString() && t.estado !== "completada";
    });

    return {
      alertasSinLeer: alertasSinLeer.length,
      alertasAltas: alertasAltas.length,
      tareasVencidas: tareasVencidas.length,
      tareasHoy: tareasHoy.length,
      totalTareasPendientes: tareasData.filter((t) => t.estado !== "completada" && t.estado !== "cancelada").length,
    };
  }, []);

  // Alertas filtradas
  const alertasFiltradas = useMemo(() => {
    let resultado = [...alertasData];

    if (!mostrarLeidas) {
      resultado = resultado.filter((a) => !a.leida);
    }

    if (filtroPrioridad !== "todas") {
      resultado = resultado.filter((a) => a.prioridad === filtroPrioridad);
    }

    if (filtroTipo !== "todas") {
      resultado = resultado.filter((a) => a.tipo === filtroTipo);
    }

    // Ordenar: sin leer primero, luego por prioridad y fecha
    resultado.sort((a, b) => {
      if (a.leida !== b.leida) return a.leida ? 1 : -1;
      const prioridadOrden = { alta: 0, media: 1, baja: 2 };
      if (prioridadOrden[a.prioridad] !== prioridadOrden[b.prioridad]) {
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      }
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    return resultado;
  }, [filtroPrioridad, filtroTipo, mostrarLeidas]);

  // Tareas filtradas
  const tareasFiltradas = useMemo(() => {
    return tareasData
      .filter((t) => t.estado !== "completada" && t.estado !== "cancelada")
      .sort((a, b) => {
        // Vencidas primero
        if (a.estado === "vencida" && b.estado !== "vencida") return -1;
        if (b.estado === "vencida" && a.estado !== "vencida") return 1;
        // Luego por fecha
        return new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime();
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Alertas y Cumplimiento</h3>
          <p className="text-muted-foreground text-sm">Controla las alertas de clientes y tus tareas pendientes</p>
        </div>

        {/* Resumen rápido */}
        <div className="flex flex-wrap gap-2">
          {contadores.alertasAltas > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600">
              <AlertTriangle className="mr-1 size-3" />
              {contadores.alertasAltas} urgente(s)
            </Badge>
          )}
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <Bell className="mr-1 size-3" />
            {contadores.alertasSinLeer} sin leer
          </Badge>
          {contadores.tareasVencidas > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400">
              <Clock className="mr-1 size-3" />
              {contadores.tareasVencidas} vencida(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="alertas" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="alertas" className="gap-2">
            <Bell className="size-4" />
            Alertas de Clientes
            {contadores.alertasSinLeer > 0 && (
              <Badge variant="secondary" className="ml-1 size-5 rounded-full p-0 text-xs">
                {contadores.alertasSinLeer}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tareas" className="gap-2">
            <ClipboardList className="size-4" />
            Mis Tareas
            {contadores.totalTareasPendientes > 0 && (
              <Badge variant="secondary" className="ml-1 size-5 rounded-full p-0 text-xs">
                {contadores.totalTareasPendientes}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Contenido de Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          {/* Filtros de alertas */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                {prioridadesAlerta.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de alerta" />
              </SelectTrigger>
              <SelectContent>
                {tiposAlerta.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={mostrarLeidas ? "secondary" : "outline"}
              size="sm"
              onClick={() => setMostrarLeidas(!mostrarLeidas)}
              className="gap-2"
            >
              {mostrarLeidas ? <Eye className="size-4" /> : <BellOff className="size-4" />}
              {mostrarLeidas ? "Ocultar leídas" : "Mostrar leídas"}
            </Button>
            {alertasFiltradas.some((a) => !a.leida) && (
              <Button variant="outline" size="sm" className="ml-auto gap-2">
                <Check className="size-4" />
                Marcar todas como leídas
              </Button>
            )}
          </div>

          {/* Lista de alertas */}
          <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
            {alertasFiltradas.length > 0 ? (
              <div className="space-y-3 pr-4">
                {alertasFiltradas.map((alerta) => (
                  <AlertaItem key={alerta.id} alerta={alerta} />
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-4 size-12 text-emerald-500" />
                  <h4 className="font-semibold">¡Todo al día!</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No hay alertas pendientes que requieran tu atención
                  </p>
                </div>
              </Card>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Contenido de Tareas */}
        <TabsContent value="tareas" className="space-y-4">
          {/* Info de tareas */}
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span>
              <strong className="text-foreground">{contadores.totalTareasPendientes}</strong> tareas pendientes
            </span>
            {contadores.tareasHoy > 0 && (
              <span className="text-blue-600">
                <strong>{contadores.tareasHoy}</strong> para hoy
              </span>
            )}
            {contadores.tareasVencidas > 0 && (
              <span className="text-red-600">
                <strong>{contadores.tareasVencidas}</strong> vencida(s)
              </span>
            )}
          </div>

          {/* Lista de tareas */}
          <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
            {tareasFiltradas.length > 0 ? (
              <div className="space-y-3 pr-4">
                {tareasFiltradas.map((tarea) => (
                  <TareaItem key={tarea.id} tarea={tarea} />
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-4 size-12 text-emerald-500" />
                  <h4 className="font-semibold">¡Sin tareas pendientes!</h4>
                  <p className="text-muted-foreground mt-1 text-sm">Has completado todas tus tareas</p>
                </div>
              </Card>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
