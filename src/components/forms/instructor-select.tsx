"use client";

import { Loader2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEntrenadores } from "@/hooks/use-entrenadores";

export interface InstructorSelectProps {
  /** Valor seleccionado (ID del coach) */
  value?: string;
  /** Callback cuando cambia la selección */
  onValueChange: (value: string) => void;
  /** Si el select está deshabilitado */
  disabled?: boolean;
  /** Placeholder cuando no hay selección */
  placeholder?: string;
  /** ID para accesibilidad */
  id?: string;
  /** Clase CSS adicional para el trigger */
  className?: string;
}

/**
 * Select reutilizable que consulta GET /api/v1/admin-panel/coaches
 * y muestra firstName + lastName. El valor enviado es el id del coach.
 */
export function InstructorSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Selecciona un instructor",
  id,
  className,
}: InstructorSelectProps) {
  const { data: coaches = [], isLoading, isError, error } = useEntrenadores({ include_inactive: true });

  const getDisplayName = (firstName?: string, lastName?: string) => {
    const first = firstName ?? "";
    const last = lastName ?? "";
    return `${first} ${last}`.trim() || "Sin nombre";
  };

  if (isLoading) {
    return (
      <div
        className="border-input bg-muted/50 flex h-9 w-full items-center justify-center rounded-md border"
        aria-busy="true"
      >
        <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
        {error instanceof Error ? error.message : "Error al cargar instructores"}
      </div>
    );
  }

  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {coaches.length === 0 ? (
          <div className="text-muted-foreground px-2 py-4 text-center text-sm">No hay instructores disponibles</div>
        ) : (
          coaches.map((coach) => (
            <SelectItem key={coach.id} value={coach.id}>
              {getDisplayName(coach.firstName, coach.lastName)}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
