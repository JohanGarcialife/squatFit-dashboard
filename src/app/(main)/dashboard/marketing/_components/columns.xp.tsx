"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Star, Repeat } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

import {
  CATEGORIAS_XP,
  FRECUENCIAS_XP,
  type AccionXP,
  type CreditoMensual,
  type CategoriaXP,
  type FrecuenciaXP,
} from "./schema";

// ============================================
// HELPERS
// ============================================

const getCategoriaLabel = (categoria: CategoriaXP): string => {
  return CATEGORIAS_XP.find((c) => c.value === categoria)?.label ?? categoria;
};

const getFrecuenciaLabel = (frecuencia: FrecuenciaXP): string => {
  return FRECUENCIAS_XP.find((f) => f.value === frecuencia)?.label ?? frecuencia;
};

const categoriaColors: Record<CategoriaXP, string> = {
  cursos: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  clientes_activos: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  clientes_nuevos: "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  clientes_todos: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const frecuenciaColors: Record<FrecuenciaXP, string> = {
  por_capitulo: "border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  mensual: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  semanal: "border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  diario: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  una_vez: "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  por_referido: "border-pink-200 bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  por_producto: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  por_resena: "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
};

// ============================================
// COLUMNAS TABLA XP GENERAL
// ============================================

export const columnsXP: ColumnDef<AccionXP>[] = [
  {
    accessorKey: "categoria",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    cell: ({ row }) => {
      const categoria = row.original.categoria;
      return (
        <Badge variant="outline" className={categoriaColors[categoria]}>
          {getCategoriaLabel(categoria)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "accion",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Acción / Hito" />,
    cell: ({ row }) => <span className="font-medium">{row.original.accion}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "xp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="XP" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Star className="size-4 text-amber-500" />
        <span className="font-semibold text-amber-600 tabular-nums">{row.original.xp}</span>
      </div>
    ),
  },
  {
    accessorKey: "frecuencia",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Frecuencia" />,
    cell: ({ row }) => {
      const frecuencia = row.original.frecuencia;
      return (
        <Badge variant="outline" className={frecuenciaColors[frecuencia]}>
          <Repeat className="mr-1 size-3" />
          {getFrecuenciaLabel(frecuencia)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];

// ============================================
// COLUMNAS TABLA CRÉDITOS MENSUALES
// ============================================

export const columnsCreditosMensuales: ColumnDef<CreditoMensual>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
          <Star className="size-4 text-white" />
        </div>
        <span className="font-semibold">{row.original.nombre}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "accion",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Acción / Hito" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.accion}</span>,
  },
  {
    accessorKey: "xp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="XP" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Star className="size-4 text-amber-500" />
        <span className="text-lg font-bold text-amber-600 tabular-nums">{row.original.xp}</span>
      </div>
    ),
  },
  {
    accessorKey: "descripcion",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground line-clamp-2 text-sm">{row.original.descripcion ?? "-"}</span>
    ),
  },
];
