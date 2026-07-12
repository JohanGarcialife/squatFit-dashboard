"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CatalogArea, CatalogProduct } from "@/hooks/use-catalog";

/**
 * Píldora editable: muestra el badge y, al hacer clic, un desplegable para
 * cambiar el valor. Chevron para dejar claro que es editable.
 */
export function EditablePill({
  children,
  options,
  onSelect,
}: {
  children: React.ReactNode;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Editar"
          className="inline-flex items-center gap-1 rounded-md outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#363C98]"
        >
          {children}
          <ChevronDown className="text-muted-foreground h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => onSelect(o.value)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const AREA_OPTIONS: { value: CatalogArea; label: string; cls: string }[] = [
  { value: "cursos", label: "Cursos", cls: "sqf-badge-indigo" },
  { value: "cocina", label: "Cocina", cls: "sqf-badge-orange" },
  { value: "planes", label: "Planes", cls: "sqf-badge-green" },
  { value: "libros", label: "Libros", cls: "sqf-badge-wine" },
  { value: "otros", label: "Otros", cls: "sqf-badge-muted" },
];

const AREA_MAP = Object.fromEntries(AREA_OPTIONS.map((a) => [a.value, a]));

export function AreaBadge({ area }: { area: CatalogArea }) {
  const a = AREA_MAP[area] ?? AREA_OPTIONS[4];
  return (
    <Badge variant="outline" className={a.cls}>
      {a.label}
    </Badge>
  );
}

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
