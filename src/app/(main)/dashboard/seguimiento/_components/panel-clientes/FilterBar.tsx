"use client";

import { Search, Filter, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { estadosPago } from "../data";

import type { FilterBarProps, EstadosResumenProps } from "./types";

export function FilterBar({
  busqueda,
  setBusqueda,
  filtroEstadoPago,
  setFiltroEstadoPago,
  ordenarPor,
  setOrdenarPor,
}: FilterBarProps) {
  return (
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
  );
}

export function EstadosResumen({ conteoEstados, clientesFiltrados }: EstadosResumenProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold">Panel de Clientes</h3>
        <p className="text-muted-foreground text-sm">
          {clientesFiltrados} de {conteoEstados.total} clientes
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
  );
}
