"use client";

import { useState, useCallback } from "react";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { getMockCoaches } from "./data";
import { TIPOS_PRODUCTO, ESTADOS_CLIENTE, type FiltrosMarketing } from "./schema";

interface FiltersBarProps {
  onFilterChange?: (filtros: FiltrosMarketing) => void;
}

export function FiltersBar({ onFilterChange }: FiltersBarProps) {
  const coaches = getMockCoaches();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [tipoProducto, setTipoProducto] = useState<string>("todos");
  const [coachId, setCoachId] = useState<string>("todos");
  const [estadoCliente, setEstadoCliente] = useState<string>("todos");

  const activeFiltersCount = [
    dateRange?.from,
    tipoProducto !== "todos" ? tipoProducto : null,
    coachId !== "todos" ? coachId : null,
    estadoCliente !== "todos" ? estadoCliente : null,
  ].filter(Boolean).length;

  const buildFiltros = useCallback((): FiltrosMarketing => {
    return {
      fechaInicio: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      fechaFin: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      tipoProducto: tipoProducto as FiltrosMarketing["tipoProducto"],
      coachId: coachId !== "todos" ? coachId : undefined,
      estadoCliente: estadoCliente as FiltrosMarketing["estadoCliente"],
    };
  }, [dateRange, tipoProducto, coachId, estadoCliente]);

  const handleApplyFilters = () => {
    const filtros = buildFiltros();
    onFilterChange?.(filtros);
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setTipoProducto("todos");
    setCoachId("todos");
    setEstadoCliente("todos");
    onFilterChange?.({});
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  return (
    <div className="bg-card flex flex-wrap items-center gap-3 rounded-lg border p-4">
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 size-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                  {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                </>
              ) : (
                format(dateRange.from, "dd MMM yyyy", { locale: es })
              )
            ) : (
              "Rango de fechas"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>

      {/* Tipo de Producto */}
      <Select value={tipoProducto} onValueChange={setTipoProducto}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de producto" />
        </SelectTrigger>
        <SelectContent>
          {TIPOS_PRODUCTO.map((tipo) => (
            <SelectItem key={tipo.value} value={tipo.value}>
              {tipo.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Coach Asignado */}
      <Select value={coachId} onValueChange={setCoachId}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Coach asignado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los coaches</SelectItem>
          {coaches.map((coach) => (
            <SelectItem key={coach.id} value={coach.id}>
              {coach.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Estado del Cliente */}
      <Select value={estadoCliente} onValueChange={setEstadoCliente}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado cliente" />
        </SelectTrigger>
        <SelectContent>
          {ESTADOS_CLIENTE.map((estado) => (
            <SelectItem key={estado.value} value={estado.value}>
              {estado.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        {/* Contador de filtros activos */}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="h-8 px-2">
            {activeFiltersCount} filtro{activeFiltersCount !== 1 ? "s" : ""} activo{activeFiltersCount !== 1 ? "s" : ""}
          </Badge>
        )}

        {/* Botón Aplicar */}
        <Button onClick={handleApplyFilters} size="sm">
          Aplicar filtros
        </Button>

        {/* Botón Limpiar */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-muted-foreground">
            <RotateCcw className="mr-1 size-4" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
