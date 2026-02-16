"use client";

import { useState, useMemo, useCallback } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useLibros } from "@/hooks/use-libros";

import { LibroActions } from "./columns-actions";
import { librosColumns } from "./columns.libros";
import { CreateLibroModal } from "./create-libro-modal";
import { DeleteLibroDialog } from "./delete-libro-dialog";
import { EditLibroModal } from "./edit-libro-modal";
import { Libro } from "./schema";

export function LibrosTable() {
  // Obtener libros de la API
  const { data: librosData, isLoading, isError, error } = useLibros();
  const libros = librosData || [];

  const [globalFilter, setGlobalFilter] = useState("");

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLibro, setSelectedLibro] = useState<Libro | null>(null);

  // Handlers de acciones con useCallback para evitar re-renders innecesarios
  const handleEdit = useCallback((libro: Libro) => {
    setSelectedLibro(libro);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((libro: Libro) => {
    setSelectedLibro(libro);
    setIsDeleteDialogOpen(true);
  }, []);

  // Columnas con acciones inyectadas
  const columns = useMemo<ColumnDef<Libro>[]>(() => {
    return [
      ...librosColumns.slice(0, -1), // Todas las columnas excepto la última (actions)
      {
        id: "actions",
        cell: ({ row }) => <LibroActions libro={row.original} onEdit={handleEdit} onDelete={handleDelete} />,
      },
    ];
  }, [handleEdit, handleDelete]);

  const table = useDataTableInstance({
    data: libros,
    columns,
    getRowId: (row) => row.id,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Gestión de Libros</CardTitle>
            <CardDescription>Administra todos los libros disponibles en la plataforma</CardDescription>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Libro
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda y controles */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Buscar libros..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
            <DataTableViewOptions table={table} />
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-lg border">
            {isLoading ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                  <p className="text-muted-foreground text-sm">Cargando libros...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium text-red-600">Error al cargar los libros</p>
                  <p className="text-muted-foreground text-xs">
                    {error instanceof Error ? error.message : "Error desconocido"}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : libros.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium">No hay libros disponibles</p>
                  <p className="text-muted-foreground text-xs">
                    Crea tu primer libro usando el botón &quot;Nuevo Libro&quot;
                  </p>
                </div>
              </div>
            ) : (
              <DataTable table={table} columns={columns} />
            )}
          </div>

          {/* Paginación - Solo mostrar si hay datos */}
          {!isLoading && !isError && libros.length > 0 && <DataTablePagination table={table} />}
        </CardContent>
      </Card>

      {/* Modales */}
      <CreateLibroModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

      <EditLibroModal libro={selectedLibro} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />

      <DeleteLibroDialog libro={selectedLibro} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />
    </>
  );
}
