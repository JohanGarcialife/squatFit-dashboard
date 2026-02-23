"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import type { Pack } from "./schema";

export const packsColumns: ColumnDef<Pack>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.description && (
          <span className="text-muted-foreground line-clamp-1 text-xs">{row.original.description}</span>
        )}
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
    accessorKey: "versionsCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Versiones" />,
    cell: ({ row }) => {
      const count = row.original.versionsCount ?? row.original.versions?.length ?? 0;
      return <Badge variant="outline">{count}</Badge>;
    },
  },
  {
    id: "actions",
    cell: () => null,
  },
];
