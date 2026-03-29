"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Curso } from "./schema";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Activo":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
    case "Inactivo":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    case "En Desarrollo":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export interface BaseCursosColumnsOptions {
  onViewCurso: (curso: Curso) => void;
}

/** Columnas de la tabla de cursos (sin columna de acciones del menú ⋮). */
export function getBaseCursosColumns({ onViewCurso }: BaseCursosColumnsOptions): ColumnDef<Curso>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todo"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del Curso" />,
      cell: ({ row }) => {
        const curso = row.original;
        return (
          <div className="flex max-w-md items-start gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8 shrink-0"
              aria-label={`Ver detalle: ${curso.name}`}
              title="Ver detalle del curso"
              onClick={(event) => {
                event.stopPropagation();
                onViewCurso(curso);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <div className="flex min-w-0 flex-col">
              <span className="font-medium">{curso.name}</span>
              <span className="text-muted-foreground line-clamp-1 text-xs">{curso.description}</span>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "instructor",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Instructor" />,
      cell: ({ row }) => <span className="text-sm">{row.original.instructor}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => getStatusBadge(row.original.status),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "students",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estudiantes" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium tabular-nums">{row.original.students}</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {row.original.currency}
          {row.original.price.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Duración" />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.duration}</span>,
    },
  ];
}
