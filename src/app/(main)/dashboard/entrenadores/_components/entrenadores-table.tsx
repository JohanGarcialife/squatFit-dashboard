"use client";

import { useMemo, useState } from "react";

import { Plus, Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useEntrenadores } from "@/hooks/use-entrenadores";

import { getEntrenadoresColumns } from "./columns.entrenadores";
import { EntrenadorUI } from "./schema";

export function EntrenadoresTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingUser, setEditingUser] = useState<EntrenadorUI | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Obtener entrenadores del API
  const { data: entrenadoresData, isLoading, error } = useEntrenadores();

  // Handlers del modal
  const handleEditUser = (entrenador: EntrenadorUI) => {
    setEditingUser(entrenador);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Transformar datos del API a formato UI
  const entrenadores = useMemo<EntrenadorUI[]>(() => {
    if (!entrenadoresData) return [];

    return entrenadoresData.map((entrenador) => ({
      ...entrenador,
      // Asegurar que firstName y lastName nunca sean null
      firstName: entrenador.firstName || "",
      lastName: entrenador.lastName || "",
      status: entrenador.user_status === 1 ? ("Activo" as const) : ("Inactivo" as const),
      fullName: `${entrenador.firstName || ""} ${entrenador.lastName || ""}`.trim() || "Sin nombre",
      avatar: entrenador.profile_picture || undefined,
    }));
  }, [entrenadoresData]);

  // Generar columnas con handlers
  const columns = useMemo(() => getEntrenadoresColumns({ onEdit: handleEditUser }), [handleEditUser]);

  const table = useDataTableInstance({
    data: entrenadores,
    columns,
    getRowId: (row) => row.id,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Gestión de Entrenadores</CardTitle>
          <CardDescription>Administra el equipo de entrenadores y profesionales</CardDescription>
        </div>
        {/* <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Entrenador
        </Button> */}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de búsqueda y controles */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Buscar entrenadores..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8"
            />
          </div>
          <DataTableViewOptions table={table} />
        </div>

        {/* Manejo de estados de carga y error */}
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">Cargando entrenadores...</p>
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
          userId={editingUser.user_id}
          userType="coach"
          defaultValues={{
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            email: editingUser.email,
            phone_number: editingUser.phone || undefined,
            description: editingUser.description || undefined,
            profile_picture: editingUser.profile_picture || undefined,
          }}
        />
      )}
    </Card>
  );
}
