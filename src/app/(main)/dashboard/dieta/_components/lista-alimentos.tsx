"use client";
/* eslint-disable max-lines */

import { useState, useMemo, useCallback } from "react";

import { Plus, Search, Filter, Edit2, Trash2, ExternalLink, Database, Cloud, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { alimentosData, categoriasAlimentos, origenesAlimentos, etiquetasComunes } from "./data";
import { Alimento } from "./schema";

interface NuevoAlimentoForm {
  nombre: string;
  categoria: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  fibra: number;
  etiquetas: string[];
}

const initialFormState: NuevoAlimentoForm = {
  nombre: "",
  categoria: "otros",
  calorias: 0,
  proteinas: 0,
  carbohidratos: 0,
  grasas: 0,
  fibra: 0,
  etiquetas: [],
};

export function ListaAlimentos() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [origenFiltro, setOrigenFiltro] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NuevoAlimentoForm>(initialFormState);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filtrar alimentos
  const alimentosFiltrados = useMemo(() => {
    return alimentosData.filter((alimento) => {
      const matchBusqueda = alimento.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = categoriaFiltro === "todas" || alimento.categoria === categoriaFiltro;
      const matchOrigen = origenFiltro === "todos" || alimento.origen === origenFiltro;
      return matchBusqueda && matchCategoria && matchOrigen;
    });
  }, [busqueda, categoriaFiltro, origenFiltro]);

  // Estadísticas rápidas
  const stats = useMemo(
    () => ({
      total: alimentosData.length,
      manuales: alimentosData.filter((a) => a.origen === "manual").length,
      apiOFF: alimentosData.filter((a) => a.origen === "open_food_facts").length,
      apiBEDCA: alimentosData.filter((a) => a.origen === "bedca").length,
    }),
    [],
  );

  const handleCrearAlimento = () => {
    // TODO: Integrar con backend
    console.log("Creando alimento:", formData);
    setIsDialogOpen(false);
    setFormData(initialFormState);
  };

  const handleVerDetalle = useCallback((alimento: Alimento) => {
    setSelectedAlimento(alimento);
    setIsSheetOpen(true);
  }, []);

  const handleToggleEtiqueta = (etiqueta: string) => {
    setFormData((prev) => ({
      ...prev,
      etiquetas: prev.etiquetas.includes(etiqueta)
        ? prev.etiquetas.filter((e) => e !== etiqueta)
        : [...prev.etiquetas, etiqueta],
    }));
  };

  const getOrigenBadge = (origen: string) => {
    switch (origen) {
      case "manual":
        return (
          <Badge variant="outline" className="text-xs">
            <Database className="mr-1 size-3" />
            Manual
          </Badge>
        );
      case "open_food_facts":
        return (
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-400"
          >
            <Cloud className="mr-1 size-3" />
            OFF
          </Badge>
        );
      case "bedca":
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-400"
          >
            <Cloud className="mr-1 size-3" />
            BEDCA
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {origen}
          </Badge>
        );
    }
  };

  const getCategoriaBadge = (categoria: string) => {
    const cat = categoriasAlimentos.find((c) => c.value === categoria);
    return cat?.label || categoria;
  };

  // Calcular porcentajes de macros para visualización
  const calcMacroPercent = (alimento: Alimento) => {
    const total = alimento.proteinas + alimento.carbohidratos + alimento.grasas;
    if (total === 0) return { p: 0, c: 0, g: 0 };
    return {
      p: (alimento.proteinas / total) * 100,
      c: (alimento.carbohidratos / total) * 100,
      g: (alimento.grasas / total) * 100,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lista de Alimentos</h2>
          <p className="text-muted-foreground text-sm">Base de datos nutricional con {stats.total} alimentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 size-4" />
            Buscar en APIs
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Nuevo Alimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Alimento</DialogTitle>
                <DialogDescription>Añade un nuevo alimento a tu base de datos</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Ej: Pechuga de pollo"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasAlimentos.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Calorías (por 100g)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.calorias || ""}
                      onChange={(e) => setFormData({ ...formData, calorias: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Proteínas (g)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.proteinas || ""}
                      onChange={(e) => setFormData({ ...formData, proteinas: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Carbohidratos (g)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.carbohidratos || ""}
                      onChange={(e) => setFormData({ ...formData, carbohidratos: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Grasas (g)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.grasas || ""}
                      onChange={(e) => setFormData({ ...formData, grasas: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Fibra (g)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.fibra || ""}
                      onChange={(e) => setFormData({ ...formData, fibra: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Etiquetas</Label>
                  <div className="flex flex-wrap gap-1">
                    {etiquetasComunes.slice(0, 8).map((etiqueta) => (
                      <Badge
                        key={etiqueta.value}
                        variant={formData.etiquetas.includes(etiqueta.value) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleToggleEtiqueta(etiqueta.value)}
                      >
                        {etiqueta.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCrearAlimento}>Crear Alimento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Database className="text-primary size-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-muted-foreground text-xs">Total alimentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Database className="size-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.manuales}</p>
              <p className="text-muted-foreground text-xs">Manuales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Cloud className="size-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.apiOFF}</p>
              <p className="text-muted-foreground text-xs">Open Food Facts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Cloud className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.apiBEDCA}</p>
              <p className="text-muted-foreground text-xs">BEDCA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                placeholder="Buscar alimentos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categoriasAlimentos.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={origenFiltro} onValueChange={setOrigenFiltro}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {origenesAlimentos.map((origen) => (
                    <SelectItem key={origen.value} value={origen.value}>
                      {origen.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de alimentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{alimentosFiltrados.length} alimentos encontrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Alimento</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Calorías</TableHead>
                  <TableHead className="text-right">Proteínas</TableHead>
                  <TableHead className="text-right">Carbohidratos</TableHead>
                  <TableHead className="text-right">Grasas</TableHead>
                  <TableHead>Macros</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alimentosFiltrados.map((alimento) => {
                  const macros = calcMacroPercent(alimento);
                  return (
                    <TableRow
                      key={alimento.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleVerDetalle(alimento)}
                    >
                      <TableCell className="font-medium">{alimento.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoriaBadge(alimento.categoria)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{alimento.calorias}</TableCell>
                      <TableCell className="text-right">{alimento.proteinas}g</TableCell>
                      <TableCell className="text-right">{alimento.carbohidratos}g</TableCell>
                      <TableCell className="text-right">{alimento.grasas}g</TableCell>
                      <TableCell>
                        <div className="bg-muted flex h-2 w-20 overflow-hidden rounded-full">
                          <div
                            className="bg-red-500"
                            style={{ width: `${macros.p}%` }}
                            title={`Proteínas: ${macros.p.toFixed(0)}%`}
                          />
                          <div
                            className="bg-yellow-500"
                            style={{ width: `${macros.c}%` }}
                            title={`Carbohidratos: ${macros.c.toFixed(0)}%`}
                          />
                          <div
                            className="bg-blue-500"
                            style={{ width: `${macros.g}%` }}
                            title={`Grasas: ${macros.g.toFixed(0)}%`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{getOrigenBadge(alimento.origen)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleVerDetalle(alimento)}>
                              <Search className="mr-2 size-4" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit2 className="mr-2 size-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 size-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sheet de detalle */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedAlimento?.nombre}</SheetTitle>
            <SheetDescription>Información nutricional por 100g</SheetDescription>
          </SheetHeader>
          {selectedAlimento && (
            <div className="mt-6 space-y-6">
              <div className="flex gap-2">
                {getOrigenBadge(selectedAlimento.origen)}
                <Badge variant="secondary">{getCategoriaBadge(selectedAlimento.categoria)}</Badge>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="mb-2 text-3xl font-bold">
                  {selectedAlimento.calorias} <span className="text-muted-foreground text-lg font-normal">kcal</span>
                </p>
                <p className="text-muted-foreground text-sm">por 100 gramos</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Proteínas</span>
                    <span className="font-medium">{selectedAlimento.proteinas}g</span>
                  </div>
                  <Progress
                    value={(selectedAlimento.proteinas / 50) * 100}
                    className="bg-muted h-2 [&>div]:bg-red-500"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Carbohidratos</span>
                    <span className="font-medium">{selectedAlimento.carbohidratos}g</span>
                  </div>
                  <Progress
                    value={(selectedAlimento.carbohidratos / 100) * 100}
                    className="bg-muted h-2 [&>div]:bg-yellow-500"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Grasas</span>
                    <span className="font-medium">{selectedAlimento.grasas}g</span>
                  </div>
                  <Progress value={(selectedAlimento.grasas / 50) * 100} className="bg-muted h-2 [&>div]:bg-blue-500" />
                </div>
                {selectedAlimento.fibra !== undefined && selectedAlimento.fibra > 0 && (
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Fibra</span>
                      <span className="font-medium">{selectedAlimento.fibra}g</span>
                    </div>
                    <Progress
                      value={(selectedAlimento.fibra / 30) * 100}
                      className="bg-muted h-2 [&>div]:bg-green-500"
                    />
                  </div>
                )}
              </div>

              {selectedAlimento.etiquetas && selectedAlimento.etiquetas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Etiquetas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAlimento.etiquetas.map((etiqueta) => (
                      <Badge key={etiqueta} variant="outline" className="text-xs">
                        {etiquetasComunes.find((e) => e.value === etiqueta)?.label || etiqueta}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Edit2 className="mr-2 size-4" />
                  Editar
                </Button>
                <Button variant="destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
