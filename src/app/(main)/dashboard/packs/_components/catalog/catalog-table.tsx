"use client";

import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, ExternalLink, MoreHorizontal, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useDeleteProducto, useProductos, useToggleProductoStatus, useUpdateProducto } from "@/hooks/use-productos";
import type { Pack } from "@/lib/services/packs-service";
import type { Producto } from "@/lib/services/products-service";

import { CreatePackModal } from "../create-pack-modal";
import { DeletePackDialog } from "../delete-pack-dialog";
import { EditPackModal } from "../edit-pack-modal";

import { AREA_OPTIONS, AreaBadge, nameColumn, priceColumn, StatusBadge, TypeBadge } from "./catalog-columns";
import { ProductFormModal } from "./product-form-modal";

const TYPE_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "curso", label: "Cursos" },
  { key: "pack", label: "Packs" },
  { key: "producto", label: "Productos" },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]["key"];

const isSuelto = (p: CatalogProduct) => p.type === "producto" || p.type === "suscripcion";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function ProductosCatalogTable() {
  const { productos, isLoading, isError, error } = useCatalogProductos();
  const { data: rawPacks = [] } = usePacks();
  const { data: rawProductos = [] } = useProductos();
  const deleteProducto = useDeleteProducto();
  const toggleProducto = useToggleProductoStatus();
  const updateProducto = useUpdateProducto();

  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // Packs
  const [isCreatePackOpen, setIsCreatePackOpen] = useState(false);
  const [isEditPackOpen, setIsEditPackOpen] = useState(false);
  const [isDeletePackOpen, setIsDeletePackOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  // Productos sueltos
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const openEditPack = useCallback(
    (id: string) => {
      setSelectedPack(rawPacks.find((p) => p.id === id) ?? null);
      setIsEditPackOpen(true);
    },
    [rawPacks],
  );

  const openDeletePack = useCallback(
    (id: string) => {
      setSelectedPack(rawPacks.find((p) => p.id === id) ?? null);
      setIsDeletePackOpen(true);
    },
    [rawPacks],
  );

  const openEditProducto = useCallback(
    (id: string) => {
      setSelectedProducto(rawProductos.find((p) => p.id === id) ?? null);
      setIsProductFormOpen(true);
    },
    [rawProductos],
  );

  const openNewProducto = useCallback(() => {
    setSelectedProducto(null);
    setIsProductFormOpen(true);
  }, []);

  const data = useMemo(() => {
    if (typeFilter === "all") return productos;
    if (typeFilter === "producto") return productos.filter((p) => p.type === "producto" || p.type === "suscripcion");
    return productos.filter((p) => p.type === typeFilter);
  }, [productos, typeFilter]);

  const columns = useMemo<ColumnDef<CatalogProduct>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Seleccionar todo"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Seleccionar fila"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      nameColumn,
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {
          const p = row.original;
          if (!isSuelto(p)) return <TypeBadge type={p.type} />;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer" title="Cambiar tipo">
                <TypeBadge type={p.type} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() =>
                    updateProducto.mutate({ id: p.id, data: { type: "product", billing_period: "one_time" } })
                  }
                >
                  Producto
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateProducto.mutate({ id: p.id, data: { type: "subscription", billing_period: "monthly" } })
                  }
                >
                  Suscripción
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "area",
        header: "Área",
        cell: ({ row }) => {
          const p = row.original;
          if (!isSuelto(p)) return <AreaBadge area={p.area} />;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer" title="Cambiar área">
                <AreaBadge area={p.area} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {AREA_OPTIONS.map((a) => (
                  <DropdownMenuItem
                    key={a.value}
                    onClick={() => updateProducto.mutate({ id: p.id, data: { area: a.value } })}
                  >
                    {a.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      priceColumn,
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const p = row.original;
          if (!isSuelto(p)) return <StatusBadge status={p.status} />;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer" title="Cambiar estado">
                <StatusBadge status={p.status} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => toggleProducto.mutate({ id: p.id, active: true })}>
                  Activo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleProducto.mutate({ id: p.id, active: false })}>
                  Inactivo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        id: "createdAt",
        accessorFn: (row) => row.createdAt ?? "",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha
            <span className="text-xs">
              {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
            </span>
          </button>
        ),
        cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.createdAt)}</span>,
      },
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

          const suelto = isSuelto(product);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => (suelto ? openEditProducto(product.id) : openEditPack(product.id))}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[#9f4e63]"
                  onClick={() =>
                    suelto
                      ? setProductoToDelete(rawProductos.find((p) => p.id === product.id) ?? null)
                      : openDeletePack(product.id)
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [openEditPack, openDeletePack, openEditProducto, rawProductos, toggleProducto, updateProducto],
  );

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.key,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  // Filas seleccionadas que son productos sueltos (las únicas con acciones en lote)
  const selectedSueltos = table
    .getSelectedRowModel()
    .rows.map((r) => r.original)
    .filter(isSuelto);

  const bulkSetActive = (active: boolean) => {
    selectedSueltos.forEach((p) => toggleProducto.mutate({ id: p.id, active }));
    table.resetRowSelection();
  };

  const bulkDelete = () => {
    selectedSueltos.forEach((p) => deleteProducto.mutate(p.id));
    table.resetRowSelection();
    setBulkDeleteOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Catálogo de productos</CardTitle>
            <CardDescription>Cursos, packs y productos sueltos en un solo lugar</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openNewProducto}>Producto / Suscripción</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCreatePackOpen(true)}>Pack de libros</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

          {/* Barra de acciones en lote */}
          {selectedSueltos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-[#EBEAF2] px-3 py-2">
              <span className="text-sm font-medium text-[#363C98]">{selectedSueltos.length} seleccionado(s)</span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => bulkSetActive(true)}>
                  <CheckCircle2 className="h-4 w-4" /> Activar
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => bulkSetActive(false)}>
                  <XCircle className="h-4 w-4" /> Desactivar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-[#9f4e63] text-[#9f4e63]"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </div>
            </div>
          )}

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

          <div className="sqf-table overflow-hidden rounded-lg border">
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
                  <p className="text-muted-foreground text-xs">Prueba con otro filtro o crea un producto nuevo</p>
                </div>
              </div>
            ) : (
              <DataTable table={table} columns={columns} />
            )}
          </div>

          {!isLoading && !isError && data.length > 0 && <DataTablePagination table={table} />}
        </CardContent>
      </Card>

      {/* Packs */}
      <CreatePackModal open={isCreatePackOpen} onOpenChange={setIsCreatePackOpen} />
      <EditPackModal pack={selectedPack} open={isEditPackOpen} onOpenChange={setIsEditPackOpen} />
      <DeletePackDialog pack={selectedPack} open={isDeletePackOpen} onOpenChange={setIsDeletePackOpen} />

      {/* Productos sueltos */}
      <ProductFormModal open={isProductFormOpen} onOpenChange={setIsProductFormOpen} producto={selectedProducto} />
      <AlertDialog open={!!productoToDelete} onOpenChange={(o) => !o && setProductoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &quot;{productoToDelete?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto se eliminará del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#9f4e63] hover:bg-[#8a4256]"
              onClick={() => {
                if (productoToDelete) deleteProducto.mutate(productoToDelete.id);
                setProductoToDelete(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Eliminar en lote */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedSueltos.length} producto(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Solo se eliminan los productos sueltos seleccionados (los cursos y packs
              no se ven afectados).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-[#9f4e63] hover:bg-[#8a4256]" onClick={bulkDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
