"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, Power, Mail, Phone } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import { EntrenadorUI } from "./schema";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Activo":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
    case "Inactivo":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return `${first}${last}`.toUpperCase() || "??";
};

// ============================================================================
// TIPOS PARA HANDLERS
// ============================================================================

interface ColumnHandlers {
  onEdit?: (entrenador: EntrenadorUI) => void;
  onDelete?: (entrenador: EntrenadorUI) => void;
  onToggleStatus?: (entrenador: EntrenadorUI) => void;
}

// ============================================================================
// FUNCIÓN PARA GENERAR COLUMNAS CON HANDLERS
// ============================================================================

export const getEntrenadoresColumns = (handlers: ColumnHandlers = {}): ColumnDef<EntrenadorUI>[] => [
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
    accessorKey: "fullName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Entrenador" />,
    cell: ({ row }) => {
      const initials = getInitials(row.original.firstName, row.original.lastName);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {row.original.avatar && <AvatarImage src={row.original.avatar} />}
            <AvatarFallback className="bg-orange-100 font-semibold text-orange-700">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.fullName}</span>
            <span className="text-muted-foreground text-xs">{row.original.email}</span>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => <span className="text-sm">{row.original.phone || "No disponible"}</span>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        <span className="text-muted-foreground text-sm">{row.original.description || "Sin descripción"}</span>
      </div>
    ),
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
    id: "actions",
    cell: ({ row }) => {
      const entrenador = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(entrenador.id)}>
              Copiar ID del entrenador
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver perfil completo
            </DropdownMenuItem>
            {entrenador.email && (
              <DropdownMenuItem onClick={() => window.open(`mailto:${entrenador.email}`, "_blank")}>
                <Mail className="mr-2 h-4 w-4" />
                Enviar email
              </DropdownMenuItem>
            )}
            {entrenador.phone && (
              <DropdownMenuItem onClick={() => window.open(`tel:${entrenador.phone}`, "_blank")}>
                <Phone className="mr-2 h-4 w-4" />
                Llamar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handlers.onEdit?.(entrenador)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar información
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlers.onToggleStatus?.(entrenador)}>
              <Power className="mr-2 h-4 w-4" />
              {entrenador.status === "Activo" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handlers.onDelete?.(entrenador)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar entrenador
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
