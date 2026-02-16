"use client";

import { useMemo, useState } from "react";

import { Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAlumnos } from "@/hooks/use-alumnos";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getAlumnosColumns } from "./columns.alumnos";
import { AlumnoUI } from "./schema";

export function AlumnosTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingUser, setEditingUser] = useState<AlumnoUI | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Obtener alumnos del API
  const { data: alumnosData, isLoading, error } = useAlumnos({ page: 1, limit: 1000 });

  // Handlers del modal
  const handleEditUser = (alumno: AlumnoUI) => {
    setEditingUser(alumno);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Transformar datos del API a formato UI
  const alumnos = useMemo<AlumnoUI[]>(() => {
    // Validar que alumnosData exista y sea un array
    if (!alumnosData || !Array.isArray(alumnosData)) return [];

    return alumnosData.map((alumno) => ({
      ...alumno,
      fullName: `${alumno.firstName} ${alumno.lastName ?? ""}`.trim() || "Sin nombre",
      statusDisplay: alumno.status.toLowerCase() === "active" ? ("Activo" as const) : ("Inactivo" as const),
    }));
  }, [alumnosData]);

  // Generar columnas con handlers
  const columns = useMemo(
    () =>
      getAlumnosColumns({
        onEdit: handleEditUser,
        onViewProfile: (alumno) => {
          console.log("Ver perfil de:", alumno);
          // Aquí puedes implementar la navegación al perfil
        },
        onDelete: (alumno) => {
          console.log("Eliminar alumno:", alumno);
          // Aquí puedes implementar la confirmación de eliminación
        },
      }),
    [],
  );

  const table = useDataTableInstance({
    data: alumnos,
    columns,
    getRowId: (row) => row.id,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Alumnos</CardTitle>
        <CardDescription>Administra la base de alumnos registrados en la plataforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de búsqueda y controles */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Buscar alumnos por nombre, email, usuario..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8"
            />
          </div>
          <DataTableViewOptions table={table} />
        </div>

        {/* Manejo de estados de carga y error */}
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">Cargando alumnos...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-10">
            <p className="text-destructive">Error: {error.message}</p>
          </div>
        )}

        {/* Tabla */}
        {!isLoading && !error && (
          <>
            <div className="overflow-hidden rounded-lg border">
              <DataTable table={table} columns={columns} />
            </div>

            {/* Paginación */}
            <DataTablePagination table={table} />
          </>
        )}
      </CardContent>

      {/* Modal de Edición */}
      {editingUser && (
        <EditUserModal
          open={isEditModalOpen}
          onOpenChange={handleCloseEditModal}
          userId={editingUser.id}
          userType="alumno"
          defaultValues={{
            firstName: editingUser.firstName,
            lastName: editingUser.lastName ?? undefined,
            email: editingUser.email,
            birth: editingUser.birth ?? undefined,
          }}
        />
      )}
    </Card>
  );
}
