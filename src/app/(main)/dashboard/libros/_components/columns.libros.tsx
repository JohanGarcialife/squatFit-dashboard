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
    accessorKey: "versions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Versiones" />,
    cell: ({ row }) => {
      const versions = row.original.versions ?? [];
      const versionsCount = versions.length;
      const prices = versions
        .map((v) => parseFloat((v as { version_price?: string }).version_price ?? "0"))
        .filter((p) => !Number.isNaN(p) && p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
      const priceRange =
        minPrice !== null && maxPrice !== null
          ? minPrice === maxPrice
            ? `€${minPrice.toFixed(2)}`
            : `€${minPrice.toFixed(2)} - €${maxPrice.toFixed(2)}`
          : null;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{versionsCount}</Badge>
            <span className="text-muted-foreground text-xs">versiones</span>
          </div>
          {priceRange && <span className="text-muted-foreground text-xs">{priceRange}</span>}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => null, // Será reemplazado por el componente LibroActions en la tabla
  },
];
