"use client";

import { useState, useMemo } from "react";

import {
  Search,
  Filter,
  Users,
  CheckSquare,
  Square,
  ChevronDown,
  Save,
  Download,
  Trash2,
  Plus,
  Minus,
  RefreshCcw,
  AlertCircle,
  Settings2,
  Wand2,
  Copy,
  ArrowRight,
  Percent,
  Flame,
  Dumbbell,
  Pill,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { pautasData, suplementosDisponibles, objetivosPauta, nivelesActividad, estadosPauta } from "./data";
import type { PautaNutricional, CambioMasivo } from "./schema";

// =============================================
// COMPONENTE: FILTROS AVANZADOS
// =============================================

interface FiltrosAvanzadosProps {
  filtros: {
    busqueda: string;
    objetivo: string[];
    nivelActividad: string[];
    estado: string[];
    entrenador: string;
  };
  onFiltrosChange: (filtros: FiltrosAvanzadosProps["filtros"]) => void;
}

function FiltrosAvanzados({ filtros, onFiltrosChange }: FiltrosAvanzadosProps) {
  const toggleArrayFilter = (key: keyof typeof filtros, value: string) => {
    const currentArray = filtros[key] as string[];
    const newArray = currentArray.includes(value) ? currentArray.filter((v) => v !== value) : [...currentArray, value];
    onFiltrosChange({ ...filtros, [key]: newArray });
  };

  const clearFiltros = () => {
    onFiltrosChange({
      busqueda: "",
      objetivo: [],
      nivelActividad: [],
      estado: [],
      entrenador: "",
    });
  };

  const filtrosActivos =
    filtros.objetivo.length + filtros.nivelActividad.length + filtros.estado.length + (filtros.entrenador ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Búsqueda */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
          <Input
            placeholder="Buscar por nombre de cliente..."
            value={filtros.busqueda}
            onChange={(e) => onFiltrosChange({ ...filtros, busqueda: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filtro Objetivo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="size-4" />
              Objetivo
              {filtros.objetivo.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5">
                  {filtros.objetivo.length}
                </Badge>
              )}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filtrar por objetivo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {objetivosPauta.map((obj) => (
              <DropdownMenuItem
                key={obj.value}
                onClick={() => toggleArrayFilter("objetivo", obj.value)}
                className="gap-2"
              >
                <Checkbox checked={filtros.objetivo.includes(obj.value)} />
                {obj.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtro Nivel Actividad */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Dumbbell className="size-4" />
              Actividad
              {filtros.nivelActividad.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5">
                  {filtros.nivelActividad.length}
                </Badge>
              )}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filtrar por nivel de actividad</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {nivelesActividad.map((nivel) => (
              <DropdownMenuItem
                key={nivel.value}
                onClick={() => toggleArrayFilter("nivelActividad", nivel.value)}
                className="gap-2"
              >
                <Checkbox checked={filtros.nivelActividad.includes(nivel.value)} />
                {nivel.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtro Estado */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Estado
              {filtros.estado.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5">
                  {filtros.estado.length}
                </Badge>
              )}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {estadosPauta.map((estado) => (
              <DropdownMenuItem
                key={estado.value}
                onClick={() => toggleArrayFilter("estado", estado.value)}
                className="gap-2"
              >
                <Checkbox checked={filtros.estado.includes(estado.value)} />
                {estado.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Limpiar filtros */}
        {filtrosActivos > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFiltros}>
            <X className="mr-2 size-4" />
            Limpiar ({filtrosActivos})
          </Button>
        )}
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE: PANEL DE ACCIONES MASIVAS
// =============================================

interface AccionesMasivasProps {
  seleccionados: string[];
  totalClientes: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAplicarCambio: (cambio: CambioMasivo) => void;
}

function AccionesMasivas({
  seleccionados,
  totalClientes,
  onSelectAll,
  onClearSelection,
  onAplicarCambio,
}: AccionesMasivasProps) {
  const [cambioMacros, setCambioMacros] = useState({
    tipo: "porcentaje" as "porcentaje" | "absoluto",
    campo: "calorias" as "calorias" | "proteinas" | "carbohidratos" | "grasas",
    valor: 0,
    operacion: "sumar" as "sumar" | "restar" | "establecer",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"macros" | "suplemento" | "estado">("macros");

  const handleAplicarMacros = () => {
    onAplicarCambio({
      tipo: "macros",
      campo: cambioMacros.campo,
      valorNuevo: {
        tipo: cambioMacros.tipo,
        operacion: cambioMacros.operacion,
        valor: cambioMacros.valor,
      },
      aplicarA: "seleccionados",
      clientesIds: seleccionados,
    });
    setIsDialogOpen(false);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={seleccionados.length === totalClientes && totalClientes > 0}
                onCheckedChange={(checked) => {
                  if (checked) onSelectAll();
                  else onClearSelection();
                }}
              />
              <span className="text-sm font-medium">
                {seleccionados.length} de {totalClientes} seleccionados
              </span>
            </div>
            {seleccionados.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearSelection}>
                Deseleccionar todo
              </Button>
            )}
          </div>

          {seleccionados.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {/* Modificar Macros */}
              <Dialog
                open={isDialogOpen && dialogType === "macros"}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (open) setDialogType("macros");
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Flame className="mr-2 size-4" />
                    Ajustar Macros
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajuste Masivo de Macros</DialogTitle>
                    <DialogDescription>
                      Modificar macros para {seleccionados.length} cliente(s) seleccionado(s)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Macro a modificar</Label>
                        <Select
                          value={cambioMacros.campo}
                          onValueChange={(value) =>
                            setCambioMacros({ ...cambioMacros, campo: value as typeof cambioMacros.campo })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="calorias">Calorías</SelectItem>
                            <SelectItem value="proteinas">Proteínas</SelectItem>
                            <SelectItem value="carbohidratos">Carbohidratos</SelectItem>
                            <SelectItem value="grasas">Grasas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de ajuste</Label>
                        <Select
                          value={cambioMacros.tipo}
                          onValueChange={(value) =>
                            setCambioMacros({ ...cambioMacros, tipo: value as typeof cambioMacros.tipo })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                            <SelectItem value="absoluto">Valor absoluto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Operación</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={cambioMacros.operacion === "sumar" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCambioMacros({ ...cambioMacros, operacion: "sumar" })}
                        >
                          <Plus className="mr-2 size-4" />
                          Sumar
                        </Button>
                        <Button
                          variant={cambioMacros.operacion === "restar" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCambioMacros({ ...cambioMacros, operacion: "restar" })}
                        >
                          <Minus className="mr-2 size-4" />
                          Restar
                        </Button>
                        <Button
                          variant={cambioMacros.operacion === "establecer" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCambioMacros({ ...cambioMacros, operacion: "establecer" })}
                        >
                          <ArrowRight className="mr-2 size-4" />
                          Establecer
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={cambioMacros.valor}
                          onChange={(e) => setCambioMacros({ ...cambioMacros, valor: parseFloat(e.target.value) || 0 })}
                          className="text-lg"
                        />
                        <span className="text-muted-foreground">
                          {cambioMacros.tipo === "porcentaje" ? "%" : cambioMacros.campo === "calorias" ? "kcal" : "g"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-muted-foreground text-sm">
                        <strong>Ejemplo:</strong> Si tienes un cliente con{" "}
                        {cambioMacros.campo === "calorias" ? "2000 kcal" : `100g de ${cambioMacros.campo}`},
                        {cambioMacros.operacion === "sumar" &&
                          ` se le sumarán ${cambioMacros.valor}${cambioMacros.tipo === "porcentaje" ? "%" : ""}`}
                        {cambioMacros.operacion === "restar" &&
                          ` se le restarán ${cambioMacros.valor}${cambioMacros.tipo === "porcentaje" ? "%" : ""}`}
                        {cambioMacros.operacion === "establecer" &&
                          ` se establecerá en ${cambioMacros.valor}${cambioMacros.tipo === "porcentaje" ? "% del TDEE" : ""}`}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAplicarMacros}>
                      <Wand2 className="mr-2 size-4" />
                      Aplicar a {seleccionados.length} cliente(s)
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Añadir Suplemento */}
              <Dialog
                open={isDialogOpen && dialogType === "suplemento"}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (open) setDialogType("suplemento");
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pill className="mr-2 size-4" />
                    Añadir Suplemento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir Suplemento Masivo</DialogTitle>
                    <DialogDescription>Añadir suplemento a {seleccionados.length} cliente(s)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Seleccionar suplemento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Elegir suplemento..." />
                        </SelectTrigger>
                        <SelectContent>
                          {suplementosDisponibles.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.nombre} - {sup.marca}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button>
                      <Plus className="mr-2 size-4" />
                      Añadir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Cambiar Estado */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 size-4" />
                    Cambiar Estado
                    <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Nuevo estado</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {estadosPauta.map((estado) => (
                    <DropdownMenuItem key={estado.value}>
                      <Badge variant="outline" className={`mr-2 ${estado.color}`}>
                        {estado.label}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Más acciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Más acciones
                    <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Copy className="mr-2 size-4" />
                    Duplicar pautas
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 size-4" />
                    Exportar seleccionados
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    Eliminar seleccionados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// COMPONENTE: TABLA DE PAUTAS
// =============================================

interface TablaPautasProps {
  pautas: PautaNutricional[];
  seleccionados: string[];
  onToggleSeleccion: (id: string) => void;
}

function TablaPautas({ pautas, seleccionados, onToggleSeleccion }: TablaPautasProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="bg-card sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead className="text-center">Calorías</TableHead>
                <TableHead className="text-center">P / C / G</TableHead>
                <TableHead className="text-center">Actividad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Entrenador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pautas.map((pauta) => {
                const isSelected = seleccionados.includes(pauta.id);
                const objetivo = objetivosPauta.find((o) => o.value === pauta.fichaRapida.objetivo);
                const nivel = nivelesActividad.find((n) => n.value === pauta.fichaRapida.nivelActividad);
                const estado = estadosPauta.find((e) => e.value === pauta.estado);

                return (
                  <TableRow
                    key={pauta.id}
                    className={isSelected ? "bg-primary/5" : ""}
                    onClick={() => onToggleSeleccion(pauta.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSeleccion(pauta.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={pauta.fichaRapida.clienteAvatar} />
                          <AvatarFallback className="text-xs">
                            {pauta.clienteNombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{pauta.clienteNombre}</p>
                          <p className="text-muted-foreground text-xs">
                            {pauta.fichaRapida.edad} años • {pauta.fichaRapida.pesoActual}kg
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={objetivo?.color}>
                        {objetivo?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold">{pauta.macros.calorias}</span>
                      <span className="text-muted-foreground ml-1 text-xs">kcal</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <span className="font-medium text-blue-600">{pauta.macros.proteinas}g</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium text-amber-600">{pauta.macros.carbohidratos}g</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium text-red-600">{pauta.macros.grasas}g</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {nivel?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={estado?.color}>
                        {estado?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">{pauta.entrenadorNombre || "Sin asignar"}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// =============================================
// COMPONENTE: RESUMEN DE CAMBIOS
// =============================================

interface ResumenCambiosProps {
  cambiosPendientes: CambioMasivo[];
  onAplicar: () => void;
  onDescartar: () => void;
}

function ResumenCambios({ cambiosPendientes, onAplicar, onDescartar }: ResumenCambiosProps) {
  if (cambiosPendientes.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-600" />
            <CardTitle className="text-base">Cambios Pendientes</CardTitle>
          </div>
          <Badge variant="outline" className="border-amber-300">
            {cambiosPendientes.length} cambio(s)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {cambiosPendientes.map((cambio, i) => (
          <div key={i} className="dark:bg-card flex items-center justify-between rounded-lg border bg-white p-2">
            <div className="flex items-center gap-2">
              {cambio.tipo === "macros" && <Flame className="size-4 text-orange-500" />}
              {cambio.tipo === "suplemento_agregar" && <Pill className="size-4 text-green-500" />}
              <span className="text-sm">{cambio.campo}</span>
            </div>
            <span className="text-sm font-medium">{String(cambio.valorNuevo)}</span>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onDescartar}>
            Descartar
          </Button>
          <Button size="sm" className="flex-1" onClick={onAplicar}>
            <Save className="mr-2 size-4" />
            Aplicar cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// COMPONENTE PRINCIPAL: EDICIÓN MASIVA
// =============================================

export function EdicionMasiva() {
  const [filtros, setFiltros] = useState({
    busqueda: "",
    objetivo: [] as string[],
    nivelActividad: [] as string[],
    estado: [] as string[],
    entrenador: "",
  });
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [cambiosPendientes, setCambiosPendientes] = useState<CambioMasivo[]>([]);

  // Filtrar pautas
  const pautasFiltradas = useMemo(() => {
    return pautasData.filter((pauta) => {
      if (filtros.busqueda && !pauta.clienteNombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) {
        return false;
      }
      if (filtros.objetivo.length > 0 && !filtros.objetivo.includes(pauta.fichaRapida.objetivo)) {
        return false;
      }
      if (filtros.nivelActividad.length > 0 && !filtros.nivelActividad.includes(pauta.fichaRapida.nivelActividad)) {
        return false;
      }
      if (filtros.estado.length > 0 && !filtros.estado.includes(pauta.estado)) {
        return false;
      }
      return true;
    });
  }, [filtros]);

  const handleToggleSeleccion = (id: string) => {
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSeleccionados(pautasFiltradas.map((p) => p.id));
  };

  const handleClearSelection = () => {
    setSeleccionados([]);
  };

  const handleAplicarCambio = (cambio: CambioMasivo) => {
    setCambiosPendientes((prev) => [...prev, cambio]);
  };

  const handleAplicarTodosCambios = () => {
    // TODO: Integrar con API
    console.log("Aplicando cambios:", cambiosPendientes);
    setCambiosPendientes([]);
  };

  const handleDescartarCambios = () => {
    setCambiosPendientes([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Edición Masiva de Pautas</h2>
          <p className="text-muted-foreground text-sm">
            Modifica las pautas nutricionales y deportivas de múltiples clientes a la vez
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Exportar Todo
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCcw className="mr-2 size-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosAvanzados filtros={filtros} onFiltrosChange={setFiltros} />

      {/* Panel de acciones masivas */}
      <AccionesMasivas
        seleccionados={seleccionados}
        totalClientes={pautasFiltradas.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onAplicarCambio={handleAplicarCambio}
      />

      {/* Resumen de cambios pendientes */}
      <ResumenCambios
        cambiosPendientes={cambiosPendientes}
        onAplicar={handleAplicarTodosCambios}
        onDescartar={handleDescartarCambios}
      />

      {/* Tabla de pautas */}
      <TablaPautas pautas={pautasFiltradas} seleccionados={seleccionados} onToggleSeleccion={handleToggleSeleccion} />

      {/* Info de resultados */}
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          Mostrando {pautasFiltradas.length} de {pautasData.length} pautas
        </span>
        <span>{seleccionados.length > 0 && `${seleccionados.length} seleccionado(s)`}</span>
      </div>
    </div>
  );
}
