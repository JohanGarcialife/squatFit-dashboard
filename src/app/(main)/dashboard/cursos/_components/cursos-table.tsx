"use client";

import { useState, useMemo, useCallback } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Download, Plus, Search } from "lucide-react";

import { BulkActionsBar } from "@/components/data-table/bulk-actions-bar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCursos, useDeleteCurso, useToggleCursoStatus } from "@/hooks/use-cursos";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { exportCSV, exportPDF, exportXLSX, type ExportColumn } from "@/lib/export/table-export";

import { CursoActions } from "./columns-actions";
import { cursosColumns } from "./columns.cursos";
import { CreateCursoModal } from "./create-curso-modal";
import { DeleteCursoDialog } from "./delete-curso-dialog";
import { EditCursoModal } from "./edit-curso-modal";
import { Curso } from "./schema";
import { UploadVideoModal } from "./upload-video-modal";

export function CursosTable() {
  const { data: cursosData, isLoading, isError, error } = useCursos();
  const cursos = cursosData || [];

  const [globalFilter, setGlobalFilter] = useState("");

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadVideoModalOpen, setIsUploadVideoModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

  const toggleStatusMutation = useToggleCursoStatus();
  const deleteCursoMutation = useDeleteCurso();

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

  const handleUploadVideo = useCallback((curso: Curso) => {
    setSelectedCurso(curso);
    setIsUploadVideoModalOpen(true);
  }, []);

  // Columnas con acciones inyectadas
  const columns = useMemo<ColumnDef<Curso>[]>(() => {
    return [
      ...cursosColumns.slice(0, -1),
      {
        id: "actions",
        cell: ({ row }) => (
          <CursoActions
            curso={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onUploadVideo={handleUploadVideo}
          />
        ),
      },
    ];
  }, [handleEdit, handleDelete, handleToggleStatus, handleUploadVideo]);

  const table = useDataTableInstance({
    data: cursos,
    columns,
    enableColumnResizing: true,
    getRowId: (row) => row.id,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const selected = table.getSelectedRowModel().rows.map((r) => r.original);

  const EXPORT_COLUMNS: ExportColumn<Curso>[] = [
    { key: "name", label: "Curso" },
    { key: "instructor", label: "Instructor" },
    { key: "status", label: "Estado" },
    { key: "students", label: "Estudiantes" },
    { key: "price", label: "Precio", value: (c) => `${c.currency}${c.price.toFixed(2)}` },
    { key: "createdAt", label: "Fecha", value: (c) => c.createdAt ?? "" },
  ];

  const doExport = (fmt: "csv" | "xlsx" | "pdf") => {
    const rows = selected.length ? selected : cursos;
    const name = `cursos-${rows.length}`;
    if (fmt === "csv") exportCSV(name, EXPORT_COLUMNS, rows);
    else if (fmt === "xlsx") void exportXLSX(name, EXPORT_COLUMNS, rows);
    else void exportPDF(name, EXPORT_COLUMNS, rows, "Cursos");
  };

  const handleBulkAction = (action: string) => {
    if (action === "activar" || action === "desactivar") {
      selected.forEach((c) =>
        toggleStatusMutation.mutate({ id: c.id, status: action === "activar" ? "Activo" : "Inactivo" }),
      );
      table.resetRowSelection();
    } else if (action === "eliminar") {
      selected.forEach((c) => deleteCursoMutation.mutate(c.id));
      table.resetRowSelection();
    } else if (action === "exportar") {
      doExport("csv");
    }
  };

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
          {/* Acciones en lote: siempre visibles */}
          <BulkActionsBar
            selectedCount={selected.length}
            onApply={handleBulkAction}
            actions={[
              { value: "activar", label: "Activar" },
              { value: "desactivar", label: "Desactivar" },
              { value: "eliminar", label: "Eliminar" },
              { value: "exportar", label: "Exportar selección (CSV)" },
            ]}
          />

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => doExport("csv")}>CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => doExport("xlsx")}>Excel (XLSX)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => doExport("pdf")}>PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DataTableViewOptions table={table} />
          </div>

          {/* Tabla */}
          <div className="sqf-table overflow-hidden rounded-lg border">
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
              <DataTable table={table} columns={columns} enableColumnResize enableColumnReorder />
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
      <UploadVideoModal curso={selectedCurso} open={isUploadVideoModalOpen} onOpenChange={setIsUploadVideoModalOpen} />
    </>
  );
}
