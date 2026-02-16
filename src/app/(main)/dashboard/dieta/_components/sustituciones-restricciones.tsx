"use client";
/* eslint-disable max-lines */

import { useState, useMemo } from "react";

import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeftRight,
  AlertTriangle,
  MoreHorizontal,
  Info,
  ShieldAlert,
  Check,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { sustitucionesData, restriccionesData, alimentosData, categoriasAlimentos } from "./data";
import { Sustitucion, Restriccion } from "./schema";

// Colores disponibles para restricciones
const coloresDisponibles = [
  { value: "bg-green-500", label: "Verde" },
  { value: "bg-emerald-500", label: "Esmeralda" },
  { value: "bg-amber-500", label: "Ámbar" },
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-orange-500", label: "Naranja" },
  { value: "bg-red-500", label: "Rojo" },
  { value: "bg-purple-500", label: "Púrpura" },
  { value: "bg-cyan-500", label: "Cian" },
  { value: "bg-pink-500", label: "Rosa" },
];

export function SustitucionesRestricciones() {
  const [activeTab, setActiveTab] = useState("sustituciones");
  const [busquedaSust, setBusquedaSust] = useState("");
  const [busquedaRest, setBusquedaRest] = useState("");
  const [filtroRestriccion, setFiltroRestriccion] = useState<string>("todas");

  // Estados para modales
  const [isAddSustDialogOpen, setIsAddSustDialogOpen] = useState(false);
  const [isAddRestDialogOpen, setIsAddRestDialogOpen] = useState(false);
  const [editingSustitucion, setEditingSustitucion] = useState<Sustitucion | null>(null);
  const [editingRestriccion, setEditingRestriccion] = useState<Restriccion | null>(null);

  // Formulario de sustitución
  const [sustForm, setSustForm] = useState({
    alimentoOriginalId: "",
    alimentoSustitutoId: "",
    factorConversion: 1,
    restriccion: "",
    notas: "",
  });

  // Formulario de restricción
  const [restForm, setRestForm] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    color: "bg-green-500",
    icono: "",
    alimentosExcluidos: [] as string[],
  });

  // Filtrar sustituciones
  const sustitucionesFiltradas = useMemo(() => {
    return sustitucionesData.filter((sust) => {
      const matchBusqueda =
        sust.alimentoOriginalNombre.toLowerCase().includes(busquedaSust.toLowerCase()) ||
        sust.alimentoSustitutoNombre.toLowerCase().includes(busquedaSust.toLowerCase());
      const matchRestriccion = filtroRestriccion === "todas" || sust.restriccion === filtroRestriccion;
      return matchBusqueda && matchRestriccion;
    });
  }, [busquedaSust, filtroRestriccion]);

  // Filtrar restricciones
  const restriccionesFiltradas = useMemo(() => {
    return restriccionesData.filter(
      (rest) =>
        rest.nombre.toLowerCase().includes(busquedaRest.toLowerCase()) ||
        rest.descripcion.toLowerCase().includes(busquedaRest.toLowerCase()),
    );
  }, [busquedaRest]);

  // Opciones únicas de restricciones para el filtro
  const restriccionesUnicas = useMemo(() => {
    const unique = new Set(sustitucionesData.map((s) => s.restriccion));
    return Array.from(unique);
  }, []);

  const handleCrearSustitucion = () => {
    // TODO: Integrar con backend
    console.log("Creando sustitución:", sustForm);
    setIsAddSustDialogOpen(false);
    setSustForm({
      alimentoOriginalId: "",
      alimentoSustitutoId: "",
      factorConversion: 1,
      restriccion: "",
      notas: "",
    });
  };

  const handleCrearRestriccion = () => {
    // TODO: Integrar con backend
    console.log("Creando restricción:", restForm);
    setIsAddRestDialogOpen(false);
    setRestForm({
      nombre: "",
      codigo: "",
      descripcion: "",
      color: "bg-green-500",
      icono: "",
      alimentosExcluidos: [],
    });
  };

  const handleToggleCategoria = (categoria: string) => {
    setRestForm((prev) => ({
      ...prev,
      alimentosExcluidos: prev.alimentosExcluidos.includes(categoria)
        ? prev.alimentosExcluidos.filter((c) => c !== categoria)
        : [...prev.alimentosExcluidos, categoria],
    }));
  };

  const getAlimentoNombre = (id: string) => {
    return alimentosData.find((a) => a.id === id)?.nombre || id;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sustituciones y Restricciones</h2>
            <p className="text-muted-foreground text-sm">
              Configura las reglas de sustitución automática y restricciones dietéticas
            </p>
          </div>
        </div>

        {/* Info card */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="flex items-start gap-3 pt-4">
            <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-400">¿Cómo funcionan las sustituciones?</p>
              <p className="mt-1 text-blue-700 dark:text-blue-300">
                Las sustituciones permiten reemplazar automáticamente ingredientes en el Generador de Menús según las
                restricciones del cliente. Por ejemplo, si un cliente es vegano, el pollo se sustituirá automáticamente
                por lentejas usando el factor de conversión configurado.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sustituciones">
              <ArrowLeftRight className="mr-2 size-4" />
              Sustituciones ({sustitucionesData.length})
            </TabsTrigger>
            <TabsTrigger value="restricciones">
              <ShieldAlert className="mr-2 size-4" />
              Restricciones ({restriccionesData.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Sustituciones */}
          <TabsContent value="sustituciones" className="space-y-4">
            {/* Barra de herramientas */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                    <Input
                      placeholder="Buscar sustituciones..."
                      value={busquedaSust}
                      onChange={(e) => setBusquedaSust(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filtroRestriccion} onValueChange={setFiltroRestriccion}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Restricción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        {restriccionesUnicas.map((rest) => (
                          <SelectItem key={rest} value={rest}>
                            {restriccionesData.find((r) => r.codigo === rest)?.nombre || rest}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isAddSustDialogOpen} onOpenChange={setIsAddSustDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 size-4" />
                          Nueva Sustitución
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Sustitución</DialogTitle>
                          <DialogDescription>Define una regla de sustitución entre dos alimentos</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Alimento original</Label>
                            <Select
                              value={sustForm.alimentoOriginalId}
                              onValueChange={(v) => setSustForm({ ...sustForm, alimentoOriginalId: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar alimento..." />
                              </SelectTrigger>
                              <SelectContent>
                                {alimentosData.map((alimento) => (
                                  <SelectItem key={alimento.id} value={alimento.id}>
                                    {alimento.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-center">
                            <ArrowLeftRight className="text-muted-foreground size-5" />
                          </div>
                          <div className="space-y-2">
                            <Label>Alimento sustituto</Label>
                            <Select
                              value={sustForm.alimentoSustitutoId}
                              onValueChange={(v) => setSustForm({ ...sustForm, alimentoSustitutoId: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar alimento..." />
                              </SelectTrigger>
                              <SelectContent>
                                {alimentosData.map((alimento) => (
                                  <SelectItem key={alimento.id} value={alimento.id}>
                                    {alimento.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Factor de conversión</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={sustForm.factorConversion}
                                  onChange={(e) =>
                                    setSustForm({ ...sustForm, factorConversion: parseFloat(e.target.value) || 1 })
                                  }
                                />
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="text-muted-foreground size-4" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-xs">
                                      Factor para calcular la cantidad de sustituto necesaria. Ej: 2.0 significa usar el
                                      doble de cantidad del sustituto.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Aplicar para</Label>
                              <Select
                                value={sustForm.restriccion}
                                onValueChange={(v) => setSustForm({ ...sustForm, restriccion: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Restricción..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="variedad">Variedad (siempre)</SelectItem>
                                  {restriccionesData.map((rest) => (
                                    <SelectItem key={rest.id} value={rest.codigo}>
                                      {rest.icono} {rest.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Notas (opcional)</Label>
                            <Textarea
                              placeholder="Notas adicionales..."
                              value={sustForm.notas}
                              onChange={(e) => setSustForm({ ...sustForm, notas: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddSustDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCrearSustitucion}>Crear Sustitución</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de sustituciones */}
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alimento Original</TableHead>
                      <TableHead className="text-center">→</TableHead>
                      <TableHead>Alimento Sustituto</TableHead>
                      <TableHead className="text-center">Factor</TableHead>
                      <TableHead>Aplicar para</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sustitucionesFiltradas.map((sust) => (
                      <TableRow key={sust.id}>
                        <TableCell className="font-medium">{sust.alimentoOriginalNombre}</TableCell>
                        <TableCell className="text-center">
                          <ArrowLeftRight className="text-muted-foreground mx-auto size-4" />
                        </TableCell>
                        <TableCell className="font-medium">{sust.alimentoSustitutoNombre}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">×{sust.factorConversion}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {restriccionesData.find((r) => r.codigo === sust.restriccion)?.icono}{" "}
                            {restriccionesData.find((r) => r.codigo === sust.restriccion)?.nombre || sust.restriccion}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sust.activo ? (
                            <Badge variant="default" className="bg-green-500">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit2 className="mr-2 size-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {sust.activo ? (
                                  <>
                                    <X className="mr-2 size-4" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 size-4" />
                                    Activar
                                  </>
                                )}
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
                    ))}
                  </TableBody>
                </Table>
                {sustitucionesFiltradas.length === 0 && (
                  <div className="text-muted-foreground py-8 text-center">No se encontraron sustituciones</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Restricciones */}
          <TabsContent value="restricciones" className="space-y-4">
            {/* Barra de herramientas */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                    <Input
                      placeholder="Buscar restricciones..."
                      value={busquedaRest}
                      onChange={(e) => setBusquedaRest(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Dialog open={isAddRestDialogOpen} onOpenChange={setIsAddRestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 size-4" />
                        Nueva Restricción
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Crear Restricción</DialogTitle>
                        <DialogDescription>Define una nueva restricción dietética</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                              placeholder="Ej: Sin Frutos Secos"
                              value={restForm.nombre}
                              onChange={(e) => setRestForm({ ...restForm, nombre: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Código</Label>
                            <Input
                              placeholder="Ej: sin_frutos_secos"
                              value={restForm.codigo}
                              onChange={(e) =>
                                setRestForm({ ...restForm, codigo: e.target.value.toLowerCase().replace(/\s+/g, "_") })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Descripción</Label>
                          <Textarea
                            placeholder="Describe la restricción..."
                            value={restForm.descripcion}
                            onChange={(e) => setRestForm({ ...restForm, descripcion: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select
                              value={restForm.color}
                              onValueChange={(v) => setRestForm({ ...restForm, color: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {coloresDisponibles.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`size-4 rounded-full ${color.value}`} />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Icono (emoji)</Label>
                            <Input
                              placeholder="Ej: 🥜"
                              value={restForm.icono}
                              onChange={(e) => setRestForm({ ...restForm, icono: e.target.value })}
                              maxLength={2}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Categorías excluidas</Label>
                          <div className="flex flex-wrap gap-2">
                            {categoriasAlimentos.map((cat) => (
                              <Badge
                                key={cat.value}
                                variant={restForm.alimentosExcluidos.includes(cat.value) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleToggleCategoria(cat.value)}
                              >
                                {cat.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddRestDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCrearRestriccion}>Crear Restricción</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Grid de restricciones */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restriccionesFiltradas.map((rest) => (
                <Card key={rest.id} className="overflow-hidden">
                  <div className={`h-2 ${rest.color}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{rest.icono}</span>
                        <div>
                          <CardTitle className="text-base">{rest.nombre}</CardTitle>
                          <code className="text-muted-foreground text-xs">{rest.codigo}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch checked={rest.activo} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground text-sm">{rest.descripcion}</p>

                    {rest.alimentosExcluidos.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium">Excluye:</p>
                        <div className="flex flex-wrap gap-1">
                          {rest.alimentosExcluidos.map((cat) => (
                            <Badge key={cat} variant="destructive" className="text-xs">
                              {categoriasAlimentos.find((c) => c.value === cat)?.label || cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>{sustitucionesData.filter((s) => s.restriccion === rest.codigo).length} sustituciones</span>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        Ver sustituciones
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {restriccionesFiltradas.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShieldAlert className="text-muted-foreground mb-2 size-12" />
                  <p className="mb-2 text-lg font-medium">No se encontraron restricciones</p>
                  <p className="text-muted-foreground mb-4 text-sm">Crea tu primera restricción para empezar</p>
                  <Button onClick={() => setIsAddRestDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Nueva Restricción
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
