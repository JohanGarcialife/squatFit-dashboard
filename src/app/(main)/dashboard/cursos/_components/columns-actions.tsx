"use client";

import { MoreHorizontal, Pencil, Trash2, Eye, Power } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Curso } from "./schema";

interface CursoActionsProps {
  curso: Curso;
  onEdit: (curso: Curso) => void;
  onDelete: (curso: Curso) => void;
  onToggleStatus: (curso: Curso) => void;
  onView?: (curso: Curso) => void;
}

export function CursoActions({ curso, onEdit, onDelete, onToggleStatus, onView }: CursoActionsProps) {
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(curso.id)}>Copiar ID del curso</DropdownMenuItem>
        <DropdownMenuSeparator />
        {onView && (
          <DropdownMenuItem onClick={() => onView(curso)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(curso)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar curso
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(curso)}>
          <Power className="mr-2 h-4 w-4" />
          {curso.status === "Activo" ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(curso)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar curso
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
