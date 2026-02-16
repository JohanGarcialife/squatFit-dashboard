"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Book } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { Libro } from "./schema";

export const librosColumns: ColumnDef<Libro>[] = [
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
    accessorKey: "image",
    header: "Portada",
    cell: ({ row }) => {
      const libro = row.original;
      return (
        <div className="flex items-center justify-center">
          {libro.image ? (
            <div className="relative h-12 w-12 overflow-hidden rounded border">
              <img src={libro.image} alt={libro.title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded border">
              <Book className="text-muted-foreground size-6" />
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Título del Libro" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.title}</span>
        <span className="text-muted-foreground line-clamp-1 text-xs">{row.original.subtitle}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
    cell: ({ row }) => <span className="font-medium tabular-nums">€{row.original.price.toFixed(2)}</span>,
  },
  {
    accessorKey: "versions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Versiones" />,
    cell: ({ row }) => {
      const versionsCount = row.original.versions?.length || 0;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{versionsCount}</Badge>
          {versionsCount > 0 && <span className="text-muted-foreground text-xs">versiones</span>}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => null, // Será reemplazado por el componente LibroActions en la tabla
  },
];
