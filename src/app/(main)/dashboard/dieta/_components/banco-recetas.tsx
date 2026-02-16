"use client";
/* eslint-disable max-lines */

import { useState, useMemo, useCallback, useEffect } from "react";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import {
  Plus,
  Search,
  Filter,
  Edit2,
  Copy,
  Trash2,
  MoreHorizontal,
  Clock,
  Users,
  Flame,
  Download,
  Upload,
  FileSpreadsheet,
  ChevronDown,
  X,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRecetas, useDuplicarReceta } from "@/hooks/use-recetas";

import { CreateRecipeModal } from "./create-recipe-modal";
import { tiposComida, etiquetasComunes, estadosReceta } from "./data";
import { Receta, FiltrosRecetas } from "./schema";

// Custom hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface RecetaCardProps {
  receta: Receta;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function RecetaCard({ receta, onEdit, onDuplicate, onDelete }: RecetaCardProps) {
  const tipoLabel = tiposComida.find((t) => t.value === receta.tipoComida)?.label ?? receta.tipoComida;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {tipoLabel}
              </Badge>
              <Badge variant={receta.estado === "publicado" ? "default" : "outline"} className="text-xs">
                {estadosReceta.find((e) => e.value === receta.estado)?.label}
              </Badge>
            </div>
            <CardTitle className="line-clamp-1 text-lg">{receta.nombre}</CardTitle>
            {receta.descripcion && (
              <CardDescription className="mt-1 line-clamp-2">{receta.descripcion}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} disabled title="Edición no disponible en el backend actual">
                <Edit2 className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 size-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                disabled
                className="text-muted-foreground"
                title="Eliminación no disponible en el backend actual"
              >
                <Trash2 className="mr-2 size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Métricas principales */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
              <Flame className="size-3" />
              <span>kcal</span>
            </div>
            <p className="text-lg font-semibold">{receta.caloriasPorcion.toFixed(0)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
              <Clock className="size-3" />
              <span>min</span>
            </div>
            <p className="text-lg font-semibold">{receta.tiempoPreparacion}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
              <Users className="size-3" />
              <span>porc.</span>
            </div>
            <p className="text-lg font-semibold">{receta.porciones}</p>
          </div>
        </div>

        {/* Macros por porción */}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-red-500" />
            P: {receta.proteinasPorcion.toFixed(0)}g
          </span>
          <span className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-yellow-500" />
            C: {receta.carbohidratosPorcion.toFixed(0)}g
          </span>
          <span className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-blue-500" />
            G: {receta.grasasPorcion.toFixed(0)}g
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap gap-1 border-t pt-3">
        {receta.etiquetas.slice(0, 4).map((etiqueta) => (
          <Badge key={etiqueta} variant="outline" className="text-xs">
            {etiquetasComunes.find((e) => e.value === etiqueta)?.label ?? etiqueta}
          </Badge>
        ))}
        {receta.etiquetas.length > 4 && (
          <Badge variant="outline" className="text-xs">
            +{receta.etiquetas.length - 4}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

export function BancoRecetas() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado de filtros con URL state
  const [busqueda, setBusqueda] = useState(searchParams.get("q") ?? "");
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>(
    searchParams.get("tipos")?.split(",").filter(Boolean) ?? [],
  );
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>(
    searchParams.get("etiquetas")?.split(",").filter(Boolean) ?? [],
  );
  const [tiempoMax, setTiempoMax] = useState<number | null>(
    searchParams.get("tiempoMax") ? parseInt(searchParams.get("tiempoMax")!) : null,
  );
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<string[]>(
    searchParams.get("estados")?.split(",").filter(Boolean) ?? [],
  );
  const [ordenarPor, setOrdenarPor] = useState<"proteinas" | "calorias" | "tiempo" | "nombre">(
    (searchParams.get("ordenar") as "proteinas" | "calorias" | "tiempo" | "nombre") ?? "proteinas",
  );
  const [ordenDir, setOrdenDir] = useState<"asc" | "desc">((searchParams.get("dir") as "asc" | "desc") ?? "desc");

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCreateRecipeModalOpen, setIsCreateRecipeModalOpen] = useState(false);

  // Hooks de datos reales
  const { data: recetasData, isLoading, isError, refetch } = useRecetas();
  const { duplicarReceta } = useDuplicarReceta();

  // Debounce para búsqueda
  const debouncedBusqueda = useDebounce(busqueda, 300);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedBusqueda) params.set("q", debouncedBusqueda);
    if (tiposSeleccionados.length) params.set("tipos", tiposSeleccionados.join(","));
    if (etiquetasSeleccionadas.length) params.set("etiquetas", etiquetasSeleccionadas.join(","));
    if (tiempoMax) params.set("tiempoMax", tiempoMax.toString());
    if (estadosSeleccionados.length) params.set("estados", estadosSeleccionados.join(","));
    if (ordenarPor !== "proteinas") params.set("ordenar", ordenarPor);
    if (ordenDir !== "desc") params.set("dir", ordenDir);

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [
    debouncedBusqueda,
    tiposSeleccionados,
    etiquetasSeleccionadas,
    tiempoMax,
    estadosSeleccionados,
    ordenarPor,
    ordenDir,
    pathname,
    router,
  ]);

  // Filtrar y ordenar recetas
  const recetasFiltradas = useMemo(() => {
    const resultado = recetasData.filter((receta) => {
      const matchBusqueda =
        !debouncedBusqueda ||
        receta.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
        receta.descripcion?.toLowerCase().includes(debouncedBusqueda.toLowerCase());

      const matchTipo = tiposSeleccionados.length === 0 || tiposSeleccionados.includes(receta.tipoComida);

      const matchEtiquetas =
        etiquetasSeleccionadas.length === 0 || etiquetasSeleccionadas.some((e) => receta.etiquetas.includes(e));

      const matchTiempo = !tiempoMax || receta.tiempoPreparacion <= tiempoMax;

      const matchEstado = estadosSeleccionados.length === 0 || estadosSeleccionados.includes(receta.estado);

      return matchBusqueda && matchTipo && matchEtiquetas && matchTiempo && matchEstado;
    });

    // Ordenar
    resultado.sort((a, b) => {
      let valorA: number;
      let valorB: number;

      switch (ordenarPor) {
        case "proteinas":
          valorA = a.proteinasPorcion;
          valorB = b.proteinasPorcion;
          break;
        case "calorias":
          valorA = a.caloriasPorcion;
          valorB = b.caloriasPorcion;
          break;
        case "tiempo":
          valorA = a.tiempoPreparacion;
          valorB = b.tiempoPreparacion;
          break;
        case "nombre":
          return ordenDir === "asc" ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre);
        default:
          return 0;
      }

      return ordenDir === "asc" ? valorA - valorB : valorB - valorA;
    });

    return resultado;
  }, [
    recetasData,
    debouncedBusqueda,
    tiposSeleccionados,
    etiquetasSeleccionadas,
    tiempoMax,
    estadosSeleccionados,
    ordenarPor,
    ordenDir,
  ]);

  const toggleTipo = (tipo: string) => {
    setTiposSeleccionados((prev) => (prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]));
  };

  const toggleEtiqueta = (etiqueta: string) => {
    setEtiquetasSeleccionadas((prev) =>
      prev.includes(etiqueta) ? prev.filter((e) => e !== etiqueta) : [...prev, etiqueta],
    );
  };

  const toggleEstado = (estado: string) => {
    setEstadosSeleccionados((prev) => (prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado]));
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setTiposSeleccionados([]);
    setEtiquetasSeleccionadas([]);
    setTiempoMax(null);
    setEstadosSeleccionados([]);
    setOrdenarPor("proteinas");
    setOrdenDir("desc");
  };

  const handleEditReceta = useCallback((receta: Receta) => {
    setSelectedReceta(receta);
    setIsSheetOpen(true);
  }, []);

  const handleDuplicarReceta = async (receta: Receta) => {
    try {
      await duplicarReceta(receta);
      refetch();
    } catch (error) {
      console.error("Error al duplicar receta:", error);
    }
  };

  const handleEliminarReceta = (_receta: Receta) => {
    // ❌ NO DISPONIBLE: El backend no tiene endpoint DELETE /api/v1/recipe/:id
    console.warn("La eliminación de recetas no está disponible en el backend actual");
  };

  const hayFiltrosActivos = Boolean(
    debouncedBusqueda ||
      tiposSeleccionados.length > 0 ||
      etiquetasSeleccionadas.length > 0 ||
      (tiempoMax ?? 0) > 0 ||
      estadosSeleccionados.length > 0,
  );

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Banco de Recetas</h2>
          <p className="text-muted-foreground text-sm">
            {recetasFiltradas.length} de {recetasData.length} recetas
          </p>
        </div>
        <div className="flex gap-2">
          {/* Import/Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="mr-2 size-4" />
                CSV
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 size-4" />
                Importar CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 size-4" />
                Exportar filtradas ({recetasFiltradas.length})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 size-4" />
                Descargar plantilla
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => setIsCreateRecipeModalOpen(true)}>
            <Plus className="mr-2 size-4" />
            Nueva Receta
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            {/* Búsqueda y ordenación */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  placeholder="Buscar recetas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={ordenarPor} onValueChange={(v) => setOrdenarPor(v as typeof ordenarPor)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proteinas">Proteínas</SelectItem>
                    <SelectItem value="calorias">Calorías</SelectItem>
                    <SelectItem value="tiempo">Tiempo</SelectItem>
                    <SelectItem value="nombre">Nombre</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOrdenDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                >
                  {ordenDir === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className={hayFiltrosActivos ? "border-primary" : ""}
                >
                  <Filter className="mr-2 size-4" />
                  Filtros
                  {hayFiltrosActivos && (
                    <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                      {tiposSeleccionados.length +
                        etiquetasSeleccionadas.length +
                        estadosSeleccionados.length +
                        (tiempoMax ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Panel de filtros expandible */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent>
                <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                  {/* Tipo de comida */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo de comida</Label>
                    <div className="flex flex-wrap gap-2">
                      {tiposComida.map((tipo) => (
                        <Badge
                          key={tipo.value}
                          variant={tiposSeleccionados.includes(tipo.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTipo(tipo.value)}
                        >
                          {tipo.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Etiquetas */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Etiquetas</Label>
                    <div className="flex flex-wrap gap-2">
                      {etiquetasComunes.map((etiqueta) => (
                        <Badge
                          key={etiqueta.value}
                          variant={etiquetasSeleccionadas.includes(etiqueta.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleEtiqueta(etiqueta.value)}
                        >
                          {etiqueta.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tiempo y Estado */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tiempo máximo (min)</Label>
                      <Input
                        type="number"
                        placeholder="Sin límite"
                        value={tiempoMax || ""}
                        onChange={(e) => setTiempoMax(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Estado</Label>
                      <div className="flex flex-wrap gap-2">
                        {estadosReceta.map((estado) => (
                          <Badge
                            key={estado.value}
                            variant={estadosSeleccionados.includes(estado.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleEstado(estado.value)}
                          >
                            {estado.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botón limpiar */}
                  {hayFiltrosActivos && (
                    <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
                      <X className="mr-2 size-4" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Grid de recetas */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando recetas...</p>
        </div>
      ) : isError ? (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-2 text-lg font-medium">Error al cargar recetas</p>
            <p className="text-muted-foreground mb-4 text-sm">Intenta recargar la página</p>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : recetasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recetasFiltradas.map((receta) => (
            <RecetaCard
              key={receta.id}
              receta={receta}
              onEdit={() => handleEditReceta(receta)}
              onDuplicate={() => handleDuplicarReceta(receta)}
              onDelete={() => handleEliminarReceta(receta)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-2 text-lg font-medium">No se encontraron recetas</p>
            <p className="text-muted-foreground mb-4 text-sm">Intenta ajustar los filtros o crear una nueva receta</p>
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sheet de edición de receta */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Editar Receta</SheetTitle>
            <SheetDescription>Modifica los detalles de {selectedReceta?.nombre}</SheetDescription>
          </SheetHeader>
          {selectedReceta && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input defaultValue={selectedReceta.nombre} />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input defaultValue={selectedReceta.descripcion} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de comida</Label>
                    <Select defaultValue={selectedReceta.tipoComida}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposComida.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select defaultValue={selectedReceta.estado}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estadosReceta.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tiempo (min)</Label>
                    <Input type="number" defaultValue={selectedReceta.tiempoPreparacion} />
                  </div>
                  <div className="space-y-2">
                    <Label>Porciones</Label>
                    <Input type="number" defaultValue={selectedReceta.porciones} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ingredientes */}
              <div className="space-y-3">
                <Label>Ingredientes</Label>
                {selectedReceta.ingredientes.map((ing, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                    <span className="flex-1">{ing.nombre}</span>
                    <Input type="number" defaultValue={ing.cantidad} className="h-8 w-20" />
                    <span className="text-muted-foreground">g</span>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="mr-2 size-4" />
                  Añadir ingrediente
                </Button>
              </div>

              <Separator />

              {/* Instrucciones */}
              <div className="space-y-3">
                <Label>Instrucciones</Label>
                {selectedReceta.instrucciones.map((instruccion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs">
                      {index + 1}
                    </span>
                    <Input defaultValue={instruccion} className="flex-1" />
                    <Button variant="ghost" size="icon" className="size-8">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="mr-2 size-4" />
                  Añadir paso
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Guardar cambios</Button>
                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog de importación */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Recetas desde CSV</DialogTitle>
            <DialogDescription>
              Sube un archivo CSV con las recetas a importar. Descarga la plantilla para ver el formato requerido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border-2 border-dashed p-6 text-center">
              <Upload className="text-muted-foreground mx-auto mb-2 size-8" />
              <p className="text-muted-foreground text-sm">Arrastra un archivo CSV aquí o haz clic para seleccionar</p>
              <Input type="file" accept=".csv" className="mt-4" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button>
              <Upload className="mr-2 size-4" />
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de creación de receta */}
      <CreateRecipeModal open={isCreateRecipeModalOpen} onOpenChange={setIsCreateRecipeModalOpen} />
    </div>
  );
}
