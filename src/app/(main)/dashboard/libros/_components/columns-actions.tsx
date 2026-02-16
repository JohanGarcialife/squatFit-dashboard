"use client";

import { MoreHorizontal, Pencil, Trash2, Eye, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Libro } from "./schema";

interface LibroActionsProps {
  libro: Libro;
  onEdit: (libro: Libro) => void;
  onDelete: (libro: Libro) => void;
  onView?: (libro: Libro) => void;
}

export function LibroActions({ libro, onEdit, onDelete, onView }: LibroActionsProps) {
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(libro.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onView && (
          <DropdownMenuItem onClick={() => onView(libro)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(libro)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar libro
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(libro)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar libro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
