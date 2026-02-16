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
import { useCursos, useToggleCursoStatus } from "@/hooks/use-cursos";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { CursoActions } from "./columns-actions";
import { cursosColumns } from "./columns.cursos";
import { CreateCursoModal } from "./create-curso-modal";
import { DeleteCursoDialog } from "./delete-curso-dialog";
import { EditCursoModal } from "./edit-curso-modal";
import { Curso } from "./schema";

export function CursosTable() {
  // Obtener cursos de la API
  const { data: cursosData, isLoading, isError, error } = useCursos();
  const cursos = cursosData || [];

  const [globalFilter, setGlobalFilter] = useState("");

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

  const toggleStatusMutation = useToggleCursoStatus();

  // Handlers de acciones con useCallback para evitar re-renders innecesarios
  const handleEdit = useCallback((curso: Curso) => {
    setSelectedCurso(curso);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((curso: Curso) => {
    setSelectedCurso(curso);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (curso: Curso) => {
      const newStatus = curso.status === "Activo" ? "Inactivo" : "Activo";
      toggleStatusMutation.mutate({ id: curso.id, status: newStatus });
    },
    [toggleStatusMutation],
  );

  // Columnas con acciones inyectadas
  const columns = useMemo<ColumnDef<Curso>[]>(() => {
    return [
      ...cursosColumns.slice(0, -1), // Todas las columnas excepto la última (actions)
      {
        id: "actions",
        cell: ({ row }) => (
          <CursoActions
            curso={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ),
      },
    ];
  }, [handleEdit, handleDelete, handleToggleStatus]);

  const table = useDataTableInstance({
    data: cursos,
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
            <CardTitle>Gestión de Cursos</CardTitle>
            <CardDescription>Administra todos los cursos disponibles en la plataforma</CardDescription>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Curso
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda y controles */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Buscar cursos..."
                value={globalFilter}
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
                  <p className="text-muted-foreground text-sm">Cargando cursos...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium text-red-600">Error al cargar los cursos</p>
                  <p className="text-muted-foreground text-xs">
                    {error instanceof Error ? error.message : "Error desconocido"}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : cursos.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium">No hay cursos disponibles</p>
                  <p className="text-muted-foreground text-xs">
                    Crea tu primer curso usando el botón &quot;Nuevo Curso&quot;
                  </p>
                </div>
              </div>
            ) : (
              <DataTable table={table} columns={columns} />
            )}
          </div>

          {/* Paginación - Solo mostrar si hay datos */}
          {!isLoading && !isError && cursos.length > 0 && <DataTablePagination table={table} />}
        </CardContent>
      </Card>

      {/* Modales y Dialogs */}
      <CreateCursoModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      <EditCursoModal curso={selectedCurso} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
      <DeleteCursoDialog curso={selectedCurso} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />
    </>
  );
}
