"use client";

import { useState, useMemo } from "react";

import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calculator,
  Save,
  Download,
  Users,
  Search,
  RefreshCcw,
  Utensils,
  Copy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { alimentosData, recetasData, restriccionesData, tiposComida, objetivosMenu, etiquetasComunes } from "./data";
import { ComidaMenu, IngredienteReceta } from "./schema";

// Días de la semana
const diasSemana = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

interface ComidaEditorProps {
  comida: ComidaMenu;
  onUpdate: (comida: ComidaMenu) => void;
  onDelete: () => void;
}

function ComidaEditor({ comida, onUpdate, onDelete }: ComidaEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchAlimento, setSearchAlimento] = useState("");

  const alimentosFiltrados = useMemo(() => {
    if (!searchAlimento) return alimentosData.slice(0, 10);
    return alimentosData.filter((a) => a.nombre.toLowerCase().includes(searchAlimento.toLowerCase())).slice(0, 10);
  }, [searchAlimento]);

  const recetaSeleccionada = useMemo(() => {
    if (comida.usaReceta && comida.recetaId) {
      return recetasData.find((r) => r.id === comida.recetaId);
    }
    return null;
  }, [comida.usaReceta, comida.recetaId]);

  const handleToggleReceta = (checked: boolean) => {
    onUpdate({
      ...comida,
      usaReceta: checked,
      recetaId: undefined,
      recetaNombre: undefined,
      ingredientes: checked ? undefined : [],
    });
  };

  const handleSelectReceta = (recetaId: string) => {
    const receta = recetasData.find((r) => r.id === recetaId);
    if (receta) {
      onUpdate({
        ...comida,
        recetaId,
        recetaNombre: receta.nombre,
        calorias: receta.caloriasPorcion * comida.porciones,
        proteinas: receta.proteinasPorcion * comida.porciones,
        carbohidratos: receta.carbohidratosPorcion * comida.porciones,
        grasas: receta.grasasPorcion * comida.porciones,
      });
    }
  };

  const handlePorcionesChange = (porciones: number) => {
    if (recetaSeleccionada) {
      onUpdate({
        ...comida,
        porciones,
        calorias: recetaSeleccionada.caloriasPorcion * porciones,
        proteinas: recetaSeleccionada.proteinasPorcion * porciones,
        carbohidratos: recetaSeleccionada.carbohidratosPorcion * porciones,
        grasas: recetaSeleccionada.grasasPorcion * porciones,
      });
    } else {
      onUpdate({ ...comida, porciones });
    }
  };

  const handleAddIngrediente = (alimento: (typeof alimentosData)[0]) => {
    const nuevoIngrediente: IngredienteReceta = {
      alimentoId: alimento.id,
      nombre: alimento.nombre,
      cantidad: 100,
      calorias: alimento.calorias,
      proteinas: alimento.proteinas,
      carbohidratos: alimento.carbohidratos,
      grasas: alimento.grasas,
    };

    const ingredientes = [...(comida.ingredientes || []), nuevoIngrediente];
    const totales = calcularTotales(ingredientes);

    onUpdate({
      ...comida,
      ingredientes,
      ...totales,
    });
  };

  const handleUpdateIngrediente = (index: number, cantidad: number) => {
    const ingredientes = [...(comida.ingredientes || [])];
    const alimento = alimentosData.find((a) => a.id === ingredientes[index].alimentoId);

    if (alimento) {
      const factor = cantidad / 100;
      ingredientes[index] = {
        ...ingredientes[index],
        cantidad,
        calorias: alimento.calorias * factor,
        proteinas: alimento.proteinas * factor,
        carbohidratos: alimento.carbohidratos * factor,
        grasas: alimento.grasas * factor,
      };

      const totales = calcularTotales(ingredientes);
      onUpdate({ ...comida, ingredientes, ...totales });
    }
  };

  const handleRemoveIngrediente = (index: number) => {
    const ingredientes = (comida.ingredientes || []).filter((_, i) => i !== index);
    const totales = calcularTotales(ingredientes);
    onUpdate({ ...comida, ingredientes, ...totales });
  };

  const calcularTotales = (ingredientes: IngredienteReceta[]) => {
    return {
      calorias: ingredientes.reduce((sum, i) => sum + i.calorias, 0),
      proteinas: ingredientes.reduce((sum, i) => sum + i.proteinas, 0),
      carbohidratos: ingredientes.reduce((sum, i) => sum + i.carbohidratos, 0),
      grasas: ingredientes.reduce((sum, i) => sum + i.grasas, 0),
    };
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-lg border">
        <CollapsibleTrigger asChild>
          <div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Utensils className="text-primary size-5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{comida.tipoComida}</span>
                  {comida.hora && (
                    <Badge variant="outline" className="text-xs">
                      {comida.hora}
                    </Badge>
                  )}
                  {!comida.activo && (
                    <Badge variant="secondary" className="text-xs">
                      Oculto
                    </Badge>
                  )}
                </div>
                {comida.usaReceta && comida.recetaNombre && (
                  <span className="text-muted-foreground text-sm">{comida.recetaNombre}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="font-medium">{comida.calorias.toFixed(0)} kcal</div>
                <div className="text-muted-foreground">
                  P:{comida.proteinas.toFixed(0)}g C:{comida.carbohidratos.toFixed(0)}g G:{comida.grasas.toFixed(0)}g
                </div>
              </div>
              {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <div className="space-y-4 p-4">
            {/* Configuración básica */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo de comida</Label>
                <Select
                  value={comida.tipoComida}
                  onValueChange={(value) => onUpdate({ ...comida, tipoComida: value as ComidaMenu["tipoComida"] })}
                >
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
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={comida.hora || ""}
                  onChange={(e) => onUpdate({ ...comida, hora: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <div className="space-y-0.5">
                  <Label>Visible al cliente</Label>
                  <p className="text-muted-foreground text-xs">Mostrar esta comida</p>
                </div>
                <Switch
                  checked={comida.activo}
                  onCheckedChange={(checked) => onUpdate({ ...comida, activo: checked })}
                />
              </div>
            </div>

            {/* Toggle Receta/Manual */}
            <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-3">
              <span className={!comida.usaReceta ? "font-medium" : "text-muted-foreground"}>Manual</span>
              <Switch checked={comida.usaReceta} onCheckedChange={handleToggleReceta} />
              <span className={comida.usaReceta ? "font-medium" : "text-muted-foreground"}>Receta guardada</span>
            </div>

            {/* Selector de Receta o Ingredientes */}
            {comida.usaReceta ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Seleccionar receta</Label>
                    <Select value={comida.recetaId || ""} onValueChange={handleSelectReceta}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elegir receta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recetasData
                          .filter((r) => r.estado === "publicado")
                          .map((receta) => (
                            <SelectItem key={receta.id} value={receta.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span>{receta.nombre}</span>
                                <span className="text-muted-foreground text-xs">
                                  {receta.caloriasPorcion.toFixed(0)} kcal/porción
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Porciones</Label>
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={comida.porciones}
                      onChange={(e) => handlePorcionesChange(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>

                {recetaSeleccionada && (
                  <div className="bg-muted/30 rounded-lg border p-3">
                    <div className="flex flex-wrap gap-1">
                      {recetaSeleccionada.etiquetas.map((etiqueta) => (
                        <Badge key={etiqueta} variant="secondary" className="text-xs">
                          {etiquetasComunes.find((e) => e.value === etiqueta)?.label || etiqueta}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Buscador de alimentos */}
                <div className="space-y-2">
                  <Label>Añadir ingredientes</Label>
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                    <Input
                      placeholder="Buscar alimento..."
                      value={searchAlimento}
                      onChange={(e) => setSearchAlimento(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alimentosFiltrados.map((alimento) => (
                      <Button
                        key={alimento.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddIngrediente(alimento)}
                        className="h-auto py-1 text-xs"
                      >
                        <Plus className="mr-1 size-3" />
                        {alimento.nombre}
                        <span className="text-muted-foreground ml-1">({alimento.calorias}kcal/100g)</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Lista de ingredientes añadidos */}
                {comida.ingredientes && comida.ingredientes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Ingredientes añadidos</Label>
                    <div className="space-y-2">
                      {comida.ingredientes.map((ing, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-lg border p-2">
                          <div className="flex-1">
                            <span className="font-medium">{ing.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              className="w-20"
                              value={ing.cantidad}
                              onChange={(e) => handleUpdateIngrediente(index, parseInt(e.target.value) || 100)}
                            />
                            <span className="text-muted-foreground text-sm">g</span>
                            <span className="min-w-[60px] text-right text-sm">{ing.calorias.toFixed(0)} kcal</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive size-8"
                              onClick={() => handleRemoveIngrediente(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notas */}
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="Notas adicionales para esta comida..."
                value={comida.notas || ""}
                onChange={(e) => onUpdate({ ...comida, notas: e.target.value })}
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="mr-2 size-4" />
                Eliminar comida
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function GeneradorMenus() {
  const [nombreMenu, setNombreMenu] = useState("");
  const [objetivo, setObjetivo] = useState<string>("mantenimiento");
  const [restriccionesSeleccionadas, setRestriccionesSeleccionadas] = useState<string[]>([]);
  const [diaActivo, setDiaActivo] = useState("lunes");
  const [comidas, setComidas] = useState<Record<string, ComidaMenu[]>>({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
  });
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calcular totales del día actual
  const totalesDia = useMemo(() => {
    const comidasDia = comidas[diaActivo] || [];
    return {
      calorias: comidasDia.reduce((sum, c) => sum + (c.activo ? c.calorias : 0), 0),
      proteinas: comidasDia.reduce((sum, c) => sum + (c.activo ? c.proteinas : 0), 0),
      carbohidratos: comidasDia.reduce((sum, c) => sum + (c.activo ? c.carbohidratos : 0), 0),
      grasas: comidasDia.reduce((sum, c) => sum + (c.activo ? c.grasas : 0), 0),
    };
  }, [comidas, diaActivo]);

  const handleAddComida = () => {
    const nuevaComida: ComidaMenu = {
      id: `comida-${Date.now()}`,
      tipoComida: "comida",
      usaReceta: true,
      porciones: 1,
      calorias: 0,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
      activo: true,
    };

    setComidas((prev) => ({
      ...prev,
      [diaActivo]: [...(prev[diaActivo] || []), nuevaComida],
    }));
  };

  const handleUpdateComida = (index: number, comida: ComidaMenu) => {
    setComidas((prev) => ({
      ...prev,
      [diaActivo]: prev[diaActivo].map((c, i) => (i === index ? comida : c)),
    }));
  };

  const handleDeleteComida = (index: number) => {
    setComidas((prev) => ({
      ...prev,
      [diaActivo]: prev[diaActivo].filter((_, i) => i !== index),
    }));
  };

  const handleCopiarDia = (diaOrigen: string) => {
    setComidas((prev) => ({
      ...prev,
      [diaActivo]: prev[diaOrigen].map((c) => ({ ...c, id: `comida-${Date.now()}-${Math.random()}` })),
    }));
  };

  const handleToggleRestriccion = (codigo: string) => {
    setRestriccionesSeleccionadas((prev) =>
      prev.includes(codigo) ? prev.filter((r) => r !== codigo) : [...prev, codigo],
    );
  };

  const handleGuardarMenu = () => {
    // TODO: Integrar con backend
    console.log("Guardando menú:", {
      nombre: nombreMenu,
      objetivo,
      restricciones: restriccionesSeleccionadas,
      comidas,
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Generador de Menús</h2>
          <p className="text-muted-foreground text-sm">Crea planes alimenticios personalizados para tus clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="mr-2 size-4" />
                Guardar Menú
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Guardar Menú</DialogTitle>
                <DialogDescription>Guarda este plan alimenticio para asignarlo a un cliente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre del menú</Label>
                  <Input
                    placeholder="Ej: Plan de definición - Semana 1"
                    value={nombreMenu}
                    onChange={(e) => setNombreMenu(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Asignar a cliente (opcional)</Label>
                  <div className="relative">
                    <Users className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                    <Input
                      placeholder="Buscar cliente..."
                      value={clienteBusqueda}
                      onChange={(e) => setClienteBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGuardarMenu}>
                  <Save className="mr-2 size-4" />
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Panel de configuración */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Objetivo */}
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Select value={objetivo} onValueChange={setObjetivo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {objetivosMenu.map((obj) => (
                    <SelectItem key={obj.value} value={obj.value}>
                      {obj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Restricciones */}
            <div className="space-y-2">
              <Label>Restricciones</Label>
              <div className="flex flex-wrap gap-1">
                {restriccionesData
                  .filter((r) => r.activo)
                  .map((restriccion) => (
                    <Badge
                      key={restriccion.id}
                      variant={restriccionesSeleccionadas.includes(restriccion.codigo) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleToggleRestriccion(restriccion.codigo)}
                    >
                      {restriccion.icono} {restriccion.nombre}
                    </Badge>
                  ))}
              </div>
            </div>

            <Separator />

            {/* Resumen diario */}
            <div className="space-y-2">
              <Label>Totales del día</Label>
              <div className="bg-muted/50 space-y-1 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span>Calorías</span>
                  <span className="font-medium">{totalesDia.calorias.toFixed(0)} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Proteínas</span>
                  <span className="font-medium">{totalesDia.proteinas.toFixed(0)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbohidratos</span>
                  <span className="font-medium">{totalesDia.carbohidratos.toFixed(0)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Grasas</span>
                  <span className="font-medium">{totalesDia.grasas.toFixed(0)}g</span>
                </div>
              </div>
            </div>

            {/* Sustitución automática */}
            {restriccionesSeleccionadas.length > 0 && (
              <Button variant="outline" size="sm" className="w-full">
                <RefreshCcw className="mr-2 size-4" />
                Aplicar sustituciones
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Panel principal de edición */}
        <div className="space-y-4 lg:col-span-3">
          {/* Selector de día */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {diasSemana.map((dia) => (
              <Button
                key={dia.value}
                variant={diaActivo === dia.value ? "default" : "outline"}
                size="sm"
                onClick={() => setDiaActivo(dia.value)}
                className="min-w-[100px]"
              >
                {dia.label}
                {comidas[dia.value]?.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                    {comidas[dia.value].length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Copiar desde otro día */}
          {comidas[diaActivo]?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <p className="text-muted-foreground mb-3 text-sm">Este día está vacío. ¿Quieres copiar de otro día?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {diasSemana
                    .filter((d) => d.value !== diaActivo && comidas[d.value]?.length > 0)
                    .map((dia) => (
                      <Button key={dia.value} variant="outline" size="sm" onClick={() => handleCopiarDia(dia.value)}>
                        <Copy className="mr-2 size-3" />
                        {dia.label}
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de comidas */}
          <div className="space-y-3">
            {comidas[diaActivo]?.map((comida, index) => (
              <ComidaEditor
                key={comida.id}
                comida={comida}
                onUpdate={(c) => handleUpdateComida(index, c)}
                onDelete={() => handleDeleteComida(index)}
              />
            ))}
          </div>

          {/* Botón añadir comida */}
          <Button variant="outline" className="w-full border-dashed" onClick={handleAddComida}>
            <Plus className="mr-2 size-4" />
            Añadir comida
          </Button>

          {/* Calculadora rápida */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="size-4" />
                Calculadora de macros
              </CardTitle>
              <CardDescription>Ajusta las cantidades para alcanzar tus objetivos diarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Objetivo calorías</Label>
                  <Input type="number" placeholder="2000" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Proteínas (g)</Label>
                  <Input type="number" placeholder="150" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Carbohidratos (g)</Label>
                  <Input type="number" placeholder="200" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Grasas (g)</Label>
                  <Input type="number" placeholder="70" className="h-9" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
