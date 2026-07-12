"use client";

import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Download,
  Eye,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/data-table/bulk-actions-bar";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCatalogProductos, type CatalogProduct } from "@/hooks/use-catalog";
import { useCursos, useToggleCursoStatus } from "@/hooks/use-cursos";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useDeletePack, usePacks, useUpdatePack } from "@/hooks/use-packs";
import { useDeleteProducto, useProductos, useToggleProductoStatus, useUpdateProducto } from "@/hooks/use-productos";
import { exportCSV, exportPDF, exportXLSX, type ExportColumn } from "@/lib/export/table-export";
import type { Pack } from "@/lib/services/packs-service";
import type { Producto } from "@/lib/services/products-service";

import { EditCursoModal } from "../../../cursos/_components/edit-curso-modal";
import type { Curso } from "../../../cursos/_components/schema";
import { CreatePackModal } from "../create-pack-modal";
import { DeletePackDialog } from "../delete-pack-dialog";
import { EditPackModal } from "../edit-pack-modal";

import {
  AREA_OPTIONS,
  AreaBadge,
  EditablePill,
  nameColumn,
  priceColumn,
  StatusBadge,
  TypeBadge,
} from "./catalog-columns";
import { ProductFormModal } from "./product-form-modal";

const TYPE_LABEL: Record<CatalogProduct["type"], string> = {
  curso: "Curso",
  pack: "Pack",
  producto: "Producto",
  suscripcion: "Suscripción",
};

const EXPORT_COLUMNS: ExportColumn<CatalogProduct>[] = [
  { key: "name", label: "Producto" },
  { key: "type", label: "Tipo", value: (r) => TYPE_LABEL[r.type] },
  { key: "area", label: "Categoría" },
  { key: "price", label: "Precio", value: (r) => `${r.currency}${r.price.toFixed(2)}` },
  { key: "status", label: "Estado" },
  { key: "createdAt", label: "Fecha", value: (r) => r.createdAt ?? "" },
];

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
  const toggleCurso = useToggleCursoStatus();
  const deletePack = useDeletePack();
  const updatePack = useUpdatePack();
  const { data: rawCursos = [] } = useCursos();
  const updateProducto = useUpdateProducto();

  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // Packs
  const [isCreatePackOpen, setIsCreatePackOpen] = useState(false);
  const [isEditPackOpen, setIsEditPackOpen] = useState(false);
  const [isDeletePackOpen, setIsDeletePackOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [isEditCursoOpen, setIsEditCursoOpen] = useState(false);
  const [quickView, setQuickView] = useState<CatalogProduct | null>(null);

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

  /** Abre el editor correspondiente al tipo de la fila (ver/editar unificado). */
  const openEditor = useCallback(
    (p: CatalogProduct) => {
      if (p.type === "curso") {
        setSelectedCurso(rawCursos.find((c) => c.id === p.id) ?? null);
        setIsEditCursoOpen(true);
      } else if (p.type === "pack") {
        openEditPack(p.id);
      } else {
        openEditProducto(p.id);
      }
    },
    [rawCursos, openEditPack, openEditProducto],
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
        size: 44,
      },
      nameColumn,
      {
        // Categoría única (fusiona las antiguas Tipo y Área): a qué parte del
        // negocio pertenece el producto. En packs es fija (Pack de libros) y en
        // cursos también (Cursos); en productos sueltos es editable. Si es
        // suscripción, el periodo se ve en el precio ("/mes", "/año"...).
        accessorKey: "area",
        header: "Categoría",
        meta: { label: "Categoría" },
        size: 150,
        cell: ({ row }) => {
          const p = row.original;
          if (p.type === "pack") {
            return (
              <EditablePill options={[]} disabledNote="Los packs de libros pertenecen siempre a la categoría Libros">
                <TypeBadge type="pack" />
              </EditablePill>
            );
          }
          if (p.type === "curso") {
            return (
              <EditablePill
                options={[]}
                disabledNote="La categoría de un curso es fija (Cursos); edítalo desde la pestaña Cursos"
              >
                <AreaBadge area="cursos" />
              </EditablePill>
            );
          }
          return (
            <EditablePill
              options={AREA_OPTIONS.map((a) => ({ value: a.value, label: a.label }))}
              onSelect={(v) => updateProducto.mutate({ id: p.id, data: { area: v } })}
            >
              <AreaBadge area={p.area} />
            </EditablePill>
          );
        },
      },
      priceColumn,
      {
        accessorKey: "status",
        header: "Estado",
        size: 130,
        meta: { label: "Estado" },
        cell: ({ row }) => {
          const p = row.original;
          // Cursos: el backend soporta activar/desactivar → píldora editable.
          if (p.type === "curso") {
            return (
              <EditablePill
                options={[
                  { value: "Activo", label: "Activo" },
                  { value: "Inactivo", label: "Inactivo" },
                ]}
                onSelect={(v) => toggleCurso.mutate({ id: p.id, status: v as "Activo" | "Inactivo" })}
              >
                <StatusBadge status={p.status} />
              </EditablePill>
            );
          }
          // Packs: activar/desactivar vía PUT book/packs/:id (is_active)
          if (p.type === "pack") {
            return (
              <EditablePill
                options={[
                  { value: "true", label: "Activo" },
                  { value: "false", label: "Inactivo" },
                ]}
                onSelect={(v) => updatePack.mutate({ id: p.id, data: { is_active: v === "true" } })}
              >
                <StatusBadge status={p.status} />
              </EditablePill>
            );
          }
          if (!isSuelto(p)) return <StatusBadge status={p.status} />;
          return (
            <EditablePill
              options={[
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
              ]}
              onSelect={(v) => toggleProducto.mutate({ id: p.id, active: v === "true" })}
            >
              <StatusBadge status={p.status} />
            </EditablePill>
          );
        },
      },
      {
        id: "createdAt",
        size: 120,
        meta: { label: "Fecha" },
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
        size: 130,
        meta: { label: "Acciones" },
        cell: ({ row }) => {
          const product = row.original;
          // Ojo = vista rápida con todos los datos; lápiz = editar (mismo editor)
          const quickButtons = (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 hover:bg-[#EBEAF2]"
                title="Vista rápida"
                onClick={() => setQuickView(product)}
              >
                <Eye className="h-4 w-4 text-[#363C98]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 hover:bg-[#EBEAF2]"
                title="Editar"
                onClick={() => openEditor(product)}
              >
                <Pencil className="h-4 w-4 text-[#363C98]" />
              </Button>
            </>
          );

          if (product.type === "curso") {
            return (
              <div className="flex items-center gap-0.5">
                {quickButtons}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/cursos">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver en Cursos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        toggleCurso.mutate({
                          id: product.id,
                          status: product.status === "Activo" ? "Inactivo" : "Activo",
                        })
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {product.status === "Activo" ? "Desactivar" : "Activar"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          }

          const suelto = isSuelto(product);

          return (
            <div className="flex items-center gap-0.5">
              {quickButtons}
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
            </div>
          );
        },
      },
    ],
    [
      openEditPack,
      openDeletePack,
      openEditProducto,
      openEditor,
      rawProductos,
      toggleProducto,
      toggleCurso,
      updateProducto,
      updatePack,
    ],
  );

  const table = useDataTableInstance({
    data,
    columns,
    enableColumnResizing: true,
    getRowId: (row) => row.key,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedSueltos = selectedRows.filter(isSuelto);

  /** Activar/desactivar en lote: productos sueltos + cursos (packs no tienen estado en el backend). */
  const bulkSetActive = (active: boolean) => {
    let skipped = 0;
    selectedRows.forEach((p) => {
      if (isSuelto(p)) toggleProducto.mutate({ id: p.id, active });
      else if (p.type === "curso") toggleCurso.mutate({ id: p.id, status: active ? "Activo" : "Inactivo" });
      else skipped += 1;
    });
    if (skipped) toast.info(`${skipped} pack(s) omitido(s): no tienen estado activable`);
    table.resetRowSelection();
  };

  /** Cambiar categoría en lote: solo aplica a productos sueltos. */
  const bulkSetArea = (area: string) => {
    const skipped = selectedRows.length - selectedSueltos.length;
    selectedSueltos.forEach((p) => updateProducto.mutate({ id: p.id, data: { area } }));
    if (skipped) toast.info(`${skipped} curso(s)/pack(s) omitido(s): su categoría es fija`);
    table.resetRowSelection();
  };

  /** Eliminar en lote: productos sueltos y packs (los cursos se gestionan en su pestaña). */
  const bulkDelete = () => {
    let skipped = 0;
    selectedRows.forEach((p) => {
      if (isSuelto(p)) deleteProducto.mutate(p.id);
      else if (p.type === "pack") deletePack.mutate(p.id);
      else skipped += 1;
    });
    if (skipped) toast.info(`${skipped} curso(s) omitido(s): elimínalos desde la pestaña Cursos`);
    table.resetRowSelection();
    setBulkDeleteOpen(false);
  };

  const handleBulkAction = (action: string) => {
    if (action === "activar") bulkSetActive(true);
    else if (action === "desactivar") bulkSetActive(false);
    else if (action === "eliminar") setBulkDeleteOpen(true);
    else if (action.startsWith("categoria:")) bulkSetArea(action.split(":")[1]);
  };

  // Exporta la selección (o todo lo visible si no hay selección)
  const doExport = (fmt: "csv" | "xlsx" | "pdf") => {
    const selected = table.getSelectedRowModel().rows.map((r) => r.original);
    const rows = selected.length ? selected : data;
    const name = `catalogo-productos-${rows.length}`;
    if (fmt === "csv") exportCSV(name, EXPORT_COLUMNS, rows);
    else if (fmt === "xlsx") void exportXLSX(name, EXPORT_COLUMNS, rows);
    else void exportPDF(name, EXPORT_COLUMNS, rows, "Catálogo de productos");
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

          {/* Acciones en lote: siempre visibles (diseño), Aplicar se activa al seleccionar */}
          <BulkActionsBar
            selectedCount={selectedRows.length}
            onApply={handleBulkAction}
            actions={[
              { value: "activar", label: "Activar" },
              { value: "desactivar", label: "Desactivar" },
              { value: "eliminar", label: "Eliminar" },
              ...AREA_OPTIONS.map((a) => ({ value: `categoria:${a.value}`, label: `Categoría → ${a.label}` })),
            ]}
          />

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => doExport("csv")}>
                  <FileText className="mr-2 h-4 w-4" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => doExport("xlsx")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (XLSX)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => doExport("pdf")}>
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <DataTable table={table} columns={columns} enableColumnResize enableColumnReorder />
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

      {/* Cursos: editor completo reutilizado de la pestaña Cursos */}
      <EditCursoModal curso={selectedCurso} open={isEditCursoOpen} onOpenChange={setIsEditCursoOpen} />

      {/* Vista rápida: todos los datos de la fila + acceso directo a editar */}
      <Dialog open={!!quickView} onOpenChange={(o) => !o && setQuickView(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {quickView?.name}
              {quickView && <StatusBadge status={quickView.status} />}
            </DialogTitle>
            <DialogDescription>{quickView?.description || "Sin descripción"}</DialogDescription>
          </DialogHeader>
          {quickView && (
            <div className="grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Categoría:</span>{" "}
                {quickView.type === "pack" ? "Pack de libros" : quickView.type === "curso" ? "Cursos" : quickView.area}
              </p>
              <p>
                <span className="text-muted-foreground">Tipo de venta:</span>{" "}
                {quickView.type === "suscripcion" ? "Suscripción" : "Pago único"}
                {quickView.billingPeriod ? ` (${quickView.billingPeriod})` : ""}
              </p>
              <p>
                <span className="text-muted-foreground">Precio:</span> {quickView.currency}
                {quickView.price.toFixed(2)}
              </p>
              <p>
                <span className="text-muted-foreground">Creado:</span>{" "}
                {quickView.createdAt ? new Date(quickView.createdAt).toLocaleDateString("es-ES") : "—"}
              </p>
              <p className="text-muted-foreground text-xs">ID: {quickView.id}</p>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    const p = quickView;
                    setQuickView(null);
                    openEditor(p);
                  }}
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
