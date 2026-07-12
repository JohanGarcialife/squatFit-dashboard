"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { CatalogProduct } from "@/hooks/use-catalog";

export const TYPE_BADGE: Record<CatalogProduct["type"], { label: string; cls: string }> = {
  curso: { label: "Curso", cls: "sqf-badge-indigo" },
  pack: { label: "Pack", cls: "sqf-badge-wine" },
  producto: { label: "Producto", cls: "sqf-badge-orange" },
  suscripcion: { label: "Suscripción", cls: "sqf-badge-green" },
};

export const STATUS_BADGE: Record<CatalogProduct["status"], string> = {
  Activo: "sqf-badge-green",
  Inactivo: "sqf-badge-wine",
  "En Desarrollo": "sqf-badge-orange",
};

export function TypeBadge({ type }: { type: CatalogProduct["type"] }) {
  const t = TYPE_BADGE[type];
  return (
    <Badge variant="outline" className={t.cls}>
      {t.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: CatalogProduct["status"] }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE[status] ?? "sqf-badge-green"}>
      {status}
    </Badge>
  );
}

export const nameColumn: ColumnDef<CatalogProduct> = {
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
};

export const priceColumn: ColumnDef<CatalogProduct> = {
  accessorKey: "price",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
  cell: ({ row }) => (
    <span className="font-medium tabular-nums">
      {row.original.currency}
      {row.original.price.toFixed(2)}
    </span>
  ),
};
