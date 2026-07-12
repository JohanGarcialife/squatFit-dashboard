"use client";

import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";

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
import { useCatalogProductos, type CatalogProduct } from "@/hooks/use-catalog";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { usePacks } from "@/hooks/use-packs";
import type { Pack } from "@/lib/services/packs-service";

import { CreatePackModal } from "../create-pack-modal";
import { DeletePackDialog } from "../delete-pack-dialog";
import { EditPackModal } from "../edit-pack-modal";

import { catalogColumns } from "./catalog-columns";

const TYPE_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "curso", label: "Cursos" },
  { key: "pack", label: "Packs" },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]["key"];

export function ProductosCatalogTable() {
  const { productos, isLoading, isError, error } = useCatalogProductos();
  const { data: rawPacks = [] } = usePacks();

  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  const openEditPack = useCallback(
    (id: string) => {
      const pack = rawPacks.find((p) => p.id === id) ?? null;
      setSelectedPack(pack);
      setIsEditOpen(true);
    },
    [rawPacks],
  );

  const openDeletePack = useCallback(
    (id: string) => {
      const pack = rawPacks.find((p) => p.id === id) ?? null;
      setSelectedPack(pack);
      setIsDeleteOpen(true);
    },
    [rawPacks],
  );

  const data = useMemo(
    () => (typeFilter === "all" ? productos : productos.filter((p) => p.type === typeFilter)),
    [productos, typeFilter],
  );

  const columns = useMemo<ColumnDef<CatalogProduct>[]>(
    () => [
      ...catalogColumns,
      {
        id: "actions",
        cell: ({ row }) => {
          const product = row.original;
          if (product.type === "curso") {
            return (
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href="/dashboard/cursos">
                  <ExternalLink className="h-4 w-4" />
                  Ver en Cursos
                </Link>
              </Button>
            );
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditPack(product.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#9f4e63]" onClick={() => openDeletePack(product.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [openEditPack, openDeletePack],
  );

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.key,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Catálogo de productos</CardTitle>
            <CardDescription>Cursos, packs y más productos vendibles en un solo lugar</CardDescription>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo pack
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={typeFilter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
            <DataTableViewOptions table={table} />
          </div>

          <div className="overflow-hidden rounded-lg border">
            {isLoading ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                  <p className="text-muted-foreground text-sm">Cargando productos...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium text-[#9f4e63]">Error al cargar los productos</p>
                  <p className="text-muted-foreground text-xs">
                    {error instanceof Error ? error.message : "Error desconocido"}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium">No hay productos en esta vista</p>
                  <p className="text-muted-foreground text-xs">Prueba con otro filtro o crea un nuevo pack</p>
                </div>
              </div>
            ) : (
              <DataTable table={table} columns={columns} />
            )}
          </div>

          {!isLoading && !isError && data.length > 0 && <DataTablePagination table={table} />}
        </CardContent>
      </Card>

      <CreatePackModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditPackModal pack={selectedPack} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <DeletePackDialog pack={selectedPack} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
    </>
  );
}
