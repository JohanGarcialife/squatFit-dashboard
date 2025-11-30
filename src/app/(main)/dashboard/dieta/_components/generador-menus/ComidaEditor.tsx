"use client";

import { useState, useMemo } from "react";

import { Plus, Trash2, ChevronDown, ChevronUp, Search, Utensils } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { alimentosData, recetasData, tiposComida, etiquetasComunes } from "../data";
import { ComidaMenu, IngredienteReceta } from "../schema";

import { ComidaEditorProps } from "./types";

function calcularTotales(ingredientes: IngredienteReceta[]) {
  return {
    calorias: ingredientes.reduce((sum, i) => sum + i.calorias, 0),
    proteinas: ingredientes.reduce((sum, i) => sum + i.proteinas, 0),
    carbohidratos: ingredientes.reduce((sum, i) => sum + i.carbohidratos, 0),
    grasas: ingredientes.reduce((sum, i) => sum + i.grasas, 0),
  };
}

export function ComidaEditor({ comida, onUpdate, onDelete }: ComidaEditorProps) {
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

    const ingredientes = [...(comida.ingredientes ?? []), nuevoIngrediente];
    const totales = calcularTotales(ingredientes);

    onUpdate({
      ...comida,
      ingredientes,
      ...totales,
    });
  };

  const handleUpdateIngrediente = (index: number, cantidad: number) => {
    const ingredientes = [...(comida.ingredientes ?? [])];
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
    const ingredientes = (comida.ingredientes ?? []).filter((_, i) => i !== index);
    const totales = calcularTotales(ingredientes);
    onUpdate({ ...comida, ingredientes, ...totales });
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
                  value={comida.hora ?? ""}
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
              <RecetaSelector
                comida={comida}
                recetaSeleccionada={recetaSeleccionada}
                onSelectReceta={handleSelectReceta}
                onPorcionesChange={handlePorcionesChange}
              />
            ) : (
              <IngredientesEditor
                comida={comida}
                searchAlimento={searchAlimento}
                setSearchAlimento={setSearchAlimento}
                alimentosFiltrados={alimentosFiltrados}
                onAddIngrediente={handleAddIngrediente}
                onUpdateIngrediente={handleUpdateIngrediente}
                onRemoveIngrediente={handleRemoveIngrediente}
              />
            )}

            {/* Notas */}
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="Notas adicionales para esta comida..."
                value={comida.notas ?? ""}
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

// Sub-componente para selector de recetas
interface RecetaSelectorProps {
  comida: ComidaMenu;
  recetaSeleccionada: (typeof recetasData)[0] | null | undefined;
  onSelectReceta: (recetaId: string) => void;
  onPorcionesChange: (porciones: number) => void;
}

function RecetaSelector({ comida, recetaSeleccionada, onSelectReceta, onPorcionesChange }: RecetaSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Seleccionar receta</Label>
          <Select value={comida.recetaId ?? ""} onValueChange={onSelectReceta}>
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
            onChange={(e) => onPorcionesChange(parseFloat(e.target.value) || 1)}
          />
        </div>
      </div>

      {recetaSeleccionada && (
        <div className="bg-muted/30 rounded-lg border p-3">
          <div className="flex flex-wrap gap-1">
            {recetaSeleccionada.etiquetas.map((etiqueta) => (
              <Badge key={etiqueta} variant="secondary" className="text-xs">
                {etiquetasComunes.find((e) => e.value === etiqueta)?.label ?? etiqueta}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componente para editor de ingredientes
interface IngredientesEditorProps {
  comida: ComidaMenu;
  searchAlimento: string;
  setSearchAlimento: (search: string) => void;
  alimentosFiltrados: typeof alimentosData;
  onAddIngrediente: (alimento: (typeof alimentosData)[0]) => void;
  onUpdateIngrediente: (index: number, cantidad: number) => void;
  onRemoveIngrediente: (index: number) => void;
}

function IngredientesEditor({
  comida,
  searchAlimento,
  setSearchAlimento,
  alimentosFiltrados,
  onAddIngrediente,
  onUpdateIngrediente,
  onRemoveIngrediente,
}: IngredientesEditorProps) {
  return (
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
              onClick={() => onAddIngrediente(alimento)}
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
                    onChange={(e) => onUpdateIngrediente(index, parseInt(e.target.value) || 100)}
                  />
                  <span className="text-muted-foreground text-sm">g</span>
                  <span className="min-w-[60px] text-right text-sm">{ing.calorias.toFixed(0)} kcal</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-8"
                    onClick={() => onRemoveIngrediente(index)}
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
  );
}
