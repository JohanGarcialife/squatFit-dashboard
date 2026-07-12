"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { CatalogProduct } from "@/hooks/use-catalog";

const TYPE_BADGE: Record<CatalogProduct["type"], { label: string; cls: string }> = {
  curso: { label: "Curso", cls: "sqf-badge-indigo" },
  pack: { label: "Pack", cls: "sqf-badge-wine" },
};

const STATUS_BADGE: Record<CatalogProduct["status"], string> = {
  Activo: "sqf-badge-green",
  Inactivo: "sqf-badge-wine",
  "En Desarrollo": "sqf-badge-orange",
};

export const catalogColumns: ColumnDef<CatalogProduct>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Producto" />,
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
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ row }) => {
      const t = TYPE_BADGE[row.original.type];
      return (
        <Badge variant="outline" className={t.cls}>
          {t.label}
        </Badge>
      );
    },
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
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => (
      <Badge variant="outline" className={STATUS_BADGE[row.original.status] ?? "sqf-badge-green"}>
        {row.original.status}
      </Badge>
    ),
  },
];
