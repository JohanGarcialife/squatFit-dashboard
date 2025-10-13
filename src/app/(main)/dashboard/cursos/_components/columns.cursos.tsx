"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, Power } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const getLevelBadge = (level: string) => {
  switch (level) {
    case "Principiante":
      return <Badge variant="outline" className="border-blue-300 text-blue-700">{level}</Badge>;
    case "Intermedio":
      return <Badge variant="outline" className="border-orange-300 text-orange-700">{level}</Badge>;
    case "Avanzado":
      return <Badge variant="outline" className="border-red-300 text-red-700">{level}</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
};

export const cursosColumns: ColumnDef<Curso>[] = [
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
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "instructor",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Instructor" />,
    cell: ({ row }) => <span className="text-sm">{row.original.instructor}</span>,
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nivel" />,
    cell: ({ row }) => getLevelBadge(row.original.level),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
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
        {row.original.currency}{row.original.price.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duración" />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.duration}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const curso = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(curso.id)}
            >
              Copiar ID del curso
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar curso
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Power className="mr-2 h-4 w-4" />
              {curso.status === "Activo" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar curso
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

