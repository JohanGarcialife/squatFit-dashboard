"use client";

import { useState, useMemo } from "react";

import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  CalendarDays,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  TrendingUp,
  Eye,
  MessageSquare,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { clientesData, estadosPago } from "./data";
import type { ClienteSeguimiento, EstadoPago, PendienteCliente } from "./schema";

const getInitials = (nombre: string) => {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getEstadoPagoBadge = (estado: EstadoPago) => {
  const config = {
    pagado: {
      label: "Pagado",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    pendiente: {
      label: "Pendiente",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400",
      icon: Clock,
    },
    vencido: {
      label: "Vencido",
      className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
      icon: AlertCircle,
    },
    parcial: {
      label: "Parcial",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
      icon: CreditCard,
    },
  };
  return config[estado];
};

const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case "alta":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "media":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "baja":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

const getDiasRestantesText = (dias?: number) => {
  if (!dias) return "—";
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} días`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `${dias} días restantes`;
};

interface ClienteCardProps {
  cliente: ClienteSeguimiento;
}

function ClienteCard({ cliente }: ClienteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const estadoBadge = getEstadoPagoBadge(cliente.estadoPago);
  const IconEstado = estadoBadge.icon;

  const pendientesActivos = cliente.pendientes.filter((p) => p.estado !== "completada" && p.estado !== "cancelada");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="border-muted size-12 border-2">
                <AvatarImage src={cliente.avatar} alt={cliente.nombre} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(cliente.nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">{cliente.nombre}</CardTitle>
                <CardDescription className="text-xs">{cliente.plan}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("gap-1", estadoBadge.className)}>
                <IconEstado className="size-3" />
                {estadoBadge.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 size-4" />
                    Ver perfil completo
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 size-4" />
                    Enviar mensaje
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CalendarDays className="mr-2 size-4" />
                    Programar revisión
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 size-4" />
                    Registrar pago
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info rápida */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Próxima revisión</p>
              <div className="flex items-center gap-1.5 font-medium">
                <CalendarDays className="text-muted-foreground size-3.5" />
                {cliente.proximaRevision ? formatDate(cliente.proximaRevision) : "Sin programar"}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Pago mensual</p>
              <div className="flex items-center gap-1.5 font-medium">
                <CreditCard className="text-muted-foreground size-3.5" />
                {cliente.montoMensual}€/mes
              </div>
            </div>
          </div>

          {/* Días restantes */}
          <div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
            <span className="text-muted-foreground text-xs">Suscripción</span>
            <span
              className={cn(
                "text-xs font-medium",
                cliente.diasRestantes && cliente.diasRestantes < 0
                  ? "text-red-600"
                  : cliente.diasRestantes && cliente.diasRestantes <= 7
                    ? "text-amber-600"
                    : "text-emerald-600",
              )}
            >
              {getDiasRestantesText(cliente.diasRestantes)}
            </span>
          </div>

          {/* Cumplimiento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cumplimiento semanal</span>
              <span className="font-medium">{cliente.cumplimientoSemanal}%</span>
            </div>
            <Progress
              value={cliente.cumplimientoSemanal}
              className={cn(
                "h-2",
                cliente.cumplimientoSemanal >= 80
                  ? "[&>div]:bg-emerald-500"
                  : cliente.cumplimientoSemanal >= 60
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-red-500",
              )}
            />
          </div>

          {/* Pendientes count y expand */}
          {pendientesActivos.length > 0 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="hover:bg-muted/50 h-auto w-full justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" />
                  <span className="text-sm font-medium">{pendientesActivos.length} pendiente(s)</span>
                </div>
                {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </CollapsibleTrigger>
          )}

          <CollapsibleContent className="space-y-2">
            {pendientesActivos.map((pendiente) => (
              <PendienteItem key={pendiente.id} pendiente={pendiente} />
            ))}
          </CollapsibleContent>

          {/* Contacto */}
          <div className="flex gap-2 border-t pt-2">
            {cliente.email && (
              <Button variant="outline" size="sm" className="h-8 flex-1 text-xs">
                <Mail className="mr-1.5 size-3" />
                Email
              </Button>
            )}
            {cliente.telefono && (
              <Button variant="outline" size="sm" className="h-8 flex-1 text-xs">
                <Phone className="mr-1.5 size-3" />
                Llamar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

function PendienteItem({ pendiente }: { pendiente: PendienteCliente }) {
  const isVencido = pendiente.estado === "vencida";

  return (
    <div
      className={cn(
        "rounded-md border p-3 text-sm",
        isVencido ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30" : "bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <p className="leading-none font-medium">{pendiente.titulo}</p>
          {pendiente.descripcion && (
            <p className="text-muted-foreground line-clamp-2 text-xs">{pendiente.descripcion}</p>
          )}
        </div>
        <Badge variant="secondary" className={cn("shrink-0 text-xs", getPrioridadColor(pendiente.prioridad))}>
          {pendiente.prioridad}
        </Badge>
      </div>
      <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <CalendarDays className="size-3" />
          {formatDate(pendiente.fechaEntrega)}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            isVencido ? "border-red-300 text-red-700 dark:text-red-400" : "border-muted-foreground/30",
          )}
        >
          {pendiente.estado}
        </Badge>
      </div>
    </div>
  );
}

export function PanelClientes() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<string>("todos");
  const [ordenarPor, setOrdenarPor] = useState<string>("nombre");

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientesData];

    // Filtrar por búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.nombre.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.plan.toLowerCase().includes(searchLower),
      );
    }

    // Filtrar por estado de pago
    if (filtroEstadoPago !== "todos") {
      resultado = resultado.filter((c) => c.estadoPago === filtroEstadoPago);
    }

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenarPor) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        case "proximaRevision":
          if (!a.proximaRevision) return 1;
          if (!b.proximaRevision) return -1;
          return new Date(a.proximaRevision).getTime() - new Date(b.proximaRevision).getTime();
        case "estadoPago": {
          const orden = { vencido: 0, pendiente: 1, parcial: 2, pagado: 3 };
          return orden[a.estadoPago] - orden[b.estadoPago];
        }
        case "cumplimiento":
          return a.cumplimientoSemanal - b.cumplimientoSemanal;
        default:
          return 0;
      }
    });

    return resultado;
  }, [busqueda, filtroEstadoPago, ordenarPor]);

  // Conteo por estado
  const conteoEstados = useMemo(() => {
    return {
      total: clientesData.length,
      pagado: clientesData.filter((c) => c.estadoPago === "pagado").length,
      pendiente: clientesData.filter((c) => c.estadoPago === "pendiente").length,
      vencido: clientesData.filter((c) => c.estadoPago === "vencido").length,
      parcial: clientesData.filter((c) => c.estadoPago === "parcial").length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Panel de Clientes</h3>
          <p className="text-muted-foreground text-sm">
            {clientesFiltrados.length} de {conteoEstados.total} clientes
          </p>
        </div>

        {/* Resumen rápido de estados */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="mr-1 size-3" />
            {conteoEstados.pagado} Pagados
          </Badge>
          {conteoEstados.pendiente > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="mr-1 size-3" />
              {conteoEstados.pendiente} Pendientes
            </Badge>
          )}
          {conteoEstados.vencido > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="mr-1 size-3" />
              {conteoEstados.vencido} Vencidos
            </Badge>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar cliente por nombre, email o plan..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroEstadoPago} onValueChange={setFiltroEstadoPago}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 size-4" />
            <SelectValue placeholder="Estado de pago" />
          </SelectTrigger>
          <SelectContent>
            {estadosPago.map((estado) => (
              <SelectItem key={estado.value} value={estado.value}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ordenarPor} onValueChange={setOrdenarPor}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <TrendingUp className="mr-2 size-4" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="proximaRevision">Próxima revisión</SelectItem>
            <SelectItem value="estadoPago">Estado de pago</SelectItem>
            <SelectItem value="cumplimiento">Cumplimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de clientes */}
      {clientesFiltrados.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clientesFiltrados.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <User className="text-muted-foreground/50 mb-4 size-12" />
            <h3 className="font-semibold">No se encontraron clientes</h3>
            <p className="text-muted-foreground mt-1 text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </Card>
      )}
    </div>
  );
}
