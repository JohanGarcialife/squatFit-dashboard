"use client";

import { useState, useMemo } from "react";

import {
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  Bell,
  BellOff,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Video,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Send,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { revisionesData, tiposRevision } from "./data";
import type { RevisionAgendada, TipoRevision } from "./schema";

const getInitials = (nombre: string) => {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getTipoRevisionBadge = (tipo: TipoRevision) => {
  const config = {
    semanal: {
      label: "Semanal",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
    },
    quincenal: {
      label: "Quincenal",
      className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
    },
    mensual: {
      label: "Mensual",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400",
    },
    extraordinaria: {
      label: "Extraordinaria",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400",
    },
  };
  return config[tipo];
};

const formatDateLong = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

const isToday = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isTomorrow = (dateString: string) => {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

interface RevisionItemProps {
  revision: RevisionAgendada;
}

function RevisionItem({ revision }: RevisionItemProps) {
  const tipoBadge = getTipoRevisionBadge(revision.tipoRevision);
  const esHoy = isToday(revision.fecha);
  const esManana = isTomorrow(revision.fecha);

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 relative flex gap-4 rounded-lg border p-4 transition-colors",
        revision.completada && "opacity-60",
        esHoy && "border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30",
      )}
    >
      {/* Línea de tiempo vertical */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full border-2",
            revision.completada
              ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
              : esHoy
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950"
                : "border-muted-foreground/30 bg-muted",
          )}
        >
          {revision.completada ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm font-semibold tabular-nums">{revision.hora}</p>
          {esHoy && (
            <Badge variant="default" className="mt-1 text-xs">
              Hoy
            </Badge>
          )}
          {esManana && (
            <Badge variant="secondary" className="mt-1 text-xs">
              Mañana
            </Badge>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border">
              <AvatarImage src={revision.clienteAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(revision.clienteNombre)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{revision.clienteNombre}</h4>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CalendarDays className="size-3.5" />
                {formatDateShort(revision.fecha)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(tipoBadge.className)}>
              {tipoBadge.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Video className="mr-2 size-4" />
                  Iniciar videollamada
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="mr-2 size-4" />
                  Llamar cliente
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="mr-2 size-4" />
                  Editar revisión
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Send className="mr-2 size-4" />
                  Enviar recordatorio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 size-4" />
                  Cancelar revisión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {revision.notas && <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-sm">{revision.notas}</p>}

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            {revision.recordatorioEnviado ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Bell className="size-3" />
                Recordatorio enviado
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <BellOff className="size-3" />
                Sin recordatorio
              </span>
            )}
          </div>
          {!revision.completada && (
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <CheckCircle2 className="mr-1 size-3" />
              Marcar completada
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AgendaRevisiones() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filtroTipo, setFiltroTipo] = useState<string>("todas");
  const [mostrarCompletadas, setMostrarCompletadas] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fechas con revisiones para marcar en el calendario
  const fechasConRevisiones = useMemo(() => {
    return revisionesData.filter((r) => !r.completada || mostrarCompletadas).map((r) => new Date(r.fecha));
  }, [mostrarCompletadas]);

  // Revisiones filtradas y ordenadas
  const revisionesFiltradas = useMemo(() => {
    let resultado = [...revisionesData];

    // Filtrar completadas
    if (!mostrarCompletadas) {
      resultado = resultado.filter((r) => !r.completada);
    }

    // Filtrar por tipo
    if (filtroTipo !== "todas") {
      resultado = resultado.filter((r) => r.tipoRevision === filtroTipo);
    }

    // Filtrar por fecha seleccionada
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      resultado = resultado.filter((r) => r.fecha === selectedDateStr);
    }

    // Ordenar por fecha y hora
    resultado.sort((a, b) => {
      const dateCompare = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.hora.localeCompare(b.hora);
    });

    return resultado;
  }, [filtroTipo, mostrarCompletadas, selectedDate]);

  // Próximas revisiones (sin filtro de fecha)
  const proximasRevisiones = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return revisionesData
      .filter((r) => !r.completada && new Date(r.fecha) >= hoy)
      .sort((a, b) => {
        const dateCompare = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.hora.localeCompare(b.hora);
      })
      .slice(0, 5);
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const clearDateFilter = () => {
    setSelectedDate(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agenda de Revisiones</h3>
          <p className="text-muted-foreground text-sm">Gestiona las revisiones con tus clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Nueva revisión
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Calendario */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Calendario</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-7" onClick={handlePreviousMonth}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={handleNextMonth}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasRevision: fechasConRevisiones,
              }}
              modifiersClassNames={{
                hasRevision: "bg-primary/20 font-semibold",
              }}
              className="w-full"
            />
            {selectedDate && (
              <Button variant="ghost" size="sm" onClick={clearDateFilter} className="mt-2 w-full text-xs">
                Mostrar todas las revisiones
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Lista de revisiones */}
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo de revisión" />
              </SelectTrigger>
              <SelectContent>
                {tiposRevision.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={mostrarCompletadas ? "secondary" : "outline"}
              size="sm"
              onClick={() => setMostrarCompletadas(!mostrarCompletadas)}
              className="gap-2"
            >
              <CheckCircle2 className="size-4" />
              {mostrarCompletadas ? "Ocultar completadas" : "Mostrar completadas"}
            </Button>
          </div>

          {/* Fecha seleccionada */}
          {selectedDate && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="text-muted-foreground size-4" />
              <span className="font-medium capitalize">{formatDateLong(selectedDate.toISOString())}</span>
              <Badge variant="secondary">{revisionesFiltradas.length} revisión(es)</Badge>
            </div>
          )}

          {/* Lista */}
          <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px]">
            {revisionesFiltradas.length > 0 ? (
              <div className="space-y-3 pr-4">
                {revisionesFiltradas.map((revision) => (
                  <RevisionItem key={revision.id} revision={revision} />
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <CalendarDays className="text-muted-foreground/50 mb-4 size-12" />
                  <h4 className="font-semibold">Sin revisiones</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {selectedDate
                      ? "No hay revisiones programadas para esta fecha"
                      : "No hay revisiones próximas programadas"}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Programar revisión
                  </Button>
                </div>
              </Card>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Próximas revisiones (resumen rápido) */}
      {!selectedDate && proximasRevisiones.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" />
              Próximas 5 revisiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {proximasRevisiones.map((revision) => {
                const esHoy = isToday(revision.fecha);
                return (
                  <div
                    key={revision.id}
                    className={cn(
                      "hover:bg-muted/50 rounded-lg border p-3 text-center transition-colors",
                      esHoy && "border-blue-300 bg-blue-50/50 dark:border-blue-800",
                    )}
                  >
                    <p className="text-muted-foreground text-xs">{formatDateShort(revision.fecha)}</p>
                    <p className="mt-1 text-sm font-semibold">{revision.hora}</p>
                    <p className="mt-1 truncate text-xs">{revision.clienteNombre}</p>
                    {esHoy && (
                      <Badge variant="default" className="mt-2 text-xs">
                        Hoy
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
