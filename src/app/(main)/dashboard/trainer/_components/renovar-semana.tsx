"use client";

import { useState, useMemo } from "react";

import {
  CalendarPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  TrendingUp,
  Settings2,
  Dumbbell,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  clientesEntrenamientoData,
  plantillasEntrenamiento,
  tiposProgresion,
  tiposLesion,
  tiposRestriccion,
} from "./data";
import type { ClienteEntrenamiento, TipoPlantilla, TipoProgresion, ConfiguracionProgresion } from "./schema";

// ============================================
// HELPERS
// ============================================

const getInitials = (nombre: string) => {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getProximoLunes = () => {
  const hoy = new Date();
  const diasHastaLunes = (8 - hoy.getDay()) % 7 || 7;
  const proximoLunes = new Date(hoy);
  proximoLunes.setDate(hoy.getDate() + diasHastaLunes);
  return proximoLunes.toISOString().split("T")[0];
};

// ============================================
// COMPONENTES
// ============================================

interface PlantillaCardProps {
  plantilla: (typeof plantillasEntrenamiento)[0];
  isSelected: boolean;
  onSelect: () => void;
}

function PlantillaCard({ plantilla, isSelected, onSelect }: PlantillaCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-primary border-primary ring-2",
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{plantilla.label}</CardTitle>
          {isSelected && <CheckCircle2 className="text-primary size-5" />}
        </div>
        <CardDescription className="text-xs">{plantilla.descripcion}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="text-muted-foreground size-4" />
          <span>{plantilla.diasSemana === 0 ? "Personalizable" : `${plantilla.diasSemana} días/semana`}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface ClienteSelectorProps {
  clientes: ClienteEntrenamiento[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

function ClienteSelector({ clientes, selectedIds, onToggle, onToggleAll }: ClienteSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Seleccionar clientes</Label>
        <Button variant="ghost" size="sm" onClick={onToggleAll} className="h-7 text-xs">
          {selectedIds.size === clientes.length ? "Deseleccionar todos" : "Seleccionar todos"}
        </Button>
      </div>
      <ScrollArea className="h-[200px] rounded-md border">
        <div className="space-y-1 p-2">
          {clientes.map((cliente) => {
            const tieneRestricciones = cliente.lesiones.length > 0 || cliente.restricciones.length > 0;
            return (
              <div
                key={cliente.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors",
                  selectedIds.has(cliente.id) ? "bg-primary/10" : "hover:bg-muted/50",
                )}
                onClick={() => onToggle(cliente.id)}
              >
                <Checkbox checked={selectedIds.has(cliente.id)} />
                <Avatar className="size-8">
                  <AvatarImage src={cliente.avatar} />
                  <AvatarFallback className="text-xs">{getInitials(cliente.nombre)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{cliente.nombre}</p>
                  <p className="text-muted-foreground text-xs">
                    {plantillasEntrenamiento.find((p) => p.value === cliente.plantillaActual)?.label || "Sin plantilla"}
                  </p>
                </div>
                {tieneRestricciones && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="size-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tiene lesiones o restricciones</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <p className="text-muted-foreground text-xs">
        {selectedIds.size} de {clientes.length} seleccionados
      </p>
    </div>
  );
}

interface ConfiguracionProgresionFormProps {
  config: ConfiguracionProgresion;
  onChange: (config: ConfiguracionProgresion) => void;
}

function ConfiguracionProgresionForm({ config, onChange }: ConfiguracionProgresionFormProps) {
  const handleChange = <K extends keyof ConfiguracionProgresion>(key: K, value: ConfiguracionProgresion[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Tipo de progresión */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tipo de progresión</Label>
        <RadioGroup
          value={config.tipoProgresion}
          onValueChange={(v) => handleChange("tipoProgresion", v as TipoProgresion)}
          className="grid grid-cols-2 gap-3"
        >
          {tiposProgresion.map((tipo) => (
            <div key={tipo.value}>
              <RadioGroupItem value={tipo.value} id={tipo.value} className="peer sr-only" />
              <Label
                htmlFor={tipo.value}
                className={cn(
                  "flex cursor-pointer flex-col items-start rounded-lg border-2 p-3 transition-all",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                  "hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-medium">{tipo.label}</span>
                <span className="text-muted-foreground text-xs">{tipo.descripcion}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Valor de incremento */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {config.tipoProgresion === "porcentaje_1rm"
              ? "Incremento de %"
              : config.tipoProgresion === "incremento_kg"
                ? "Incremento en kg"
                : config.tipoProgresion === "incremento_reps"
                  ? "Incremento en reps"
                  : "RPE objetivo"}
          </Label>
          <span className="text-sm font-semibold tabular-nums">
            {config.valorIncremento}
            {config.tipoProgresion === "porcentaje_1rm" ? "%" : config.tipoProgresion === "incremento_kg" ? " kg" : ""}
          </span>
        </div>
        <Slider
          value={[config.valorIncremento]}
          onValueChange={([v]) => handleChange("valorIncremento", v)}
          min={config.tipoProgresion === "porcentaje_1rm" ? 1 : config.tipoProgresion === "incremento_kg" ? 0.5 : 1}
          max={config.tipoProgresion === "porcentaje_1rm" ? 10 : config.tipoProgresion === "incremento_kg" ? 5 : 3}
          step={config.tipoProgresion === "incremento_kg" ? 0.5 : 1}
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>Conservador</span>
          <span>Agresivo</span>
        </div>
      </div>

      {/* Aplicar a */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Aplicar progresión a</Label>
        <Select
          value={config.aplicarA}
          onValueChange={(v) => handleChange("aplicarA", v as "todos" | "principales" | "accesorios")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los ejercicios</SelectItem>
            <SelectItem value="principales">Solo ejercicios principales</SelectItem>
            <SelectItem value="accesorios">Solo accesorios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opciones avanzadas */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="avanzado">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Settings2 className="size-4" />
              Opciones avanzadas
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* RPE máximo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">RPE máximo permitido</Label>
                <span className="text-sm font-medium">{config.maxRPE || 9}</span>
              </div>
              <Slider
                value={[config.maxRPE || 9]}
                onValueChange={([v]) => handleChange("maxRPE", v)}
                min={7}
                max={10}
                step={0.5}
              />
            </div>

            {/* Deload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Semana de deload cada</Label>
                <Select
                  value={String(config.deloadCadaSemanas || 4)}
                  onValueChange={(v) => handleChange("deloadCadaSemanas", Number(v))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 semanas</SelectItem>
                    <SelectItem value="4">4 semanas</SelectItem>
                    <SelectItem value="5">5 semanas</SelectItem>
                    <SelectItem value="6">6 semanas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* % Deload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Reducción en deload</Label>
                <span className="text-sm font-medium">{config.porcentajeDeload || 40}%</span>
              </div>
              <Slider
                value={[config.porcentajeDeload || 40]}
                onValueChange={([v]) => handleChange("porcentajeDeload", v)}
                min={20}
                max={60}
                step={5}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function RenovarSemana() {
  const [selectedPlantilla, setSelectedPlantilla] = useState<TipoPlantilla | null>(null);
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set());
  const [fechaInicio, setFechaInicio] = useState(getProximoLunes());
  const [respetarRestricciones, setRespetarRestricciones] = useState(true);
  const [copiarSemanaAnterior, setCopiarSemanaAnterior] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [configProgresion, setConfigProgresion] = useState<ConfiguracionProgresion>({
    tipoProgresion: "incremento_kg",
    valorIncremento: 2.5,
    aplicarA: "principales",
    maxRPE: 9,
    deloadCadaSemanas: 4,
    porcentajeDeload: 40,
  });

  const clientesConPlantillaSeleccionada = useMemo(() => {
    if (!selectedPlantilla) return clientesEntrenamientoData;
    return clientesEntrenamientoData.filter((c) => c.plantillaActual === selectedPlantilla);
  }, [selectedPlantilla]);

  const clientesConRestricciones = useMemo(() => {
    return clientesEntrenamientoData.filter(
      (c) => selectedClientes.has(c.id) && (c.lesiones.length > 0 || c.restricciones.length > 0),
    );
  }, [selectedClientes]);

  const toggleCliente = (id: string) => {
    const newSet = new Set(selectedClientes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedClientes(newSet);
  };

  const toggleAllClientes = () => {
    if (selectedClientes.size === clientesConPlantillaSeleccionada.length) {
      setSelectedClientes(new Set());
    } else {
      setSelectedClientes(new Set(clientesConPlantillaSeleccionada.map((c) => c.id)));
    }
  };

  const handleGenerar = async () => {
    if (!selectedPlantilla || selectedClientes.size === 0) return;

    setIsProcessing(true);

    // TODO: Integrar con API - POST /api/semanas/renovar
    const request = {
      clienteIds: Array.from(selectedClientes),
      plantilla: selectedPlantilla,
      fechaInicio,
      progresion: configProgresion,
      respetarRestricciones,
      copiarSemanaAnterior,
    };

    console.log("Generando semanas:", request);

    // Simular procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
  };

  const canGenerate = selectedPlantilla && selectedClientes.size > 0 && fechaInicio;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Renovar Semana</h3>
          <p className="text-muted-foreground text-sm">
            Genera la próxima semana de entrenamiento con reglas de progresión
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Configuración principal */}
        <div className="space-y-6">
          {/* Selección de plantilla */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="size-4" />
                Plantilla de entrenamiento
              </CardTitle>
              <CardDescription>Selecciona el tipo de rutina para generar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plantillasEntrenamiento.map((plantilla) => (
                  <PlantillaCard
                    key={plantilla.value}
                    plantilla={plantilla}
                    isSelected={selectedPlantilla === plantilla.value}
                    onSelect={() => setSelectedPlantilla(plantilla.value)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuración de progresión */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4" />
                Reglas de progresión
              </CardTitle>
              <CardDescription>Define cómo incrementar la carga de una semana a otra</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfiguracionProgresionForm config={configProgresion} onChange={setConfigProgresion} />
            </CardContent>
          </Card>

          {/* Opciones adicionales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="size-4" />
                Opciones de generación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Fecha de inicio</Label>
                  <p className="text-muted-foreground text-xs">Primer día de la nueva semana</p>
                </div>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-[180px]"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Copiar de semana anterior</Label>
                  <p className="text-muted-foreground text-xs">Usa la última semana como base</p>
                </div>
                <Switch checked={copiarSemanaAnterior} onCheckedChange={setCopiarSemanaAnterior} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Respetar restricciones</Label>
                  <p className="text-muted-foreground text-xs">Adapta ejercicios según lesiones</p>
                </div>
                <Switch checked={respetarRestricciones} onCheckedChange={setRespetarRestricciones} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral - Selección de clientes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4" />
                Clientes
              </CardTitle>
              <CardDescription>
                {selectedPlantilla
                  ? `Mostrando clientes con plantilla ${plantillasEntrenamiento.find((p) => p.value === selectedPlantilla)?.label}`
                  : "Selecciona una plantilla para filtrar"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClienteSelector
                clientes={selectedPlantilla ? clientesConPlantillaSeleccionada : clientesEntrenamientoData}
                selectedIds={selectedClientes}
                onToggle={toggleCliente}
                onToggleAll={toggleAllClientes}
              />
            </CardContent>
          </Card>

          {/* Advertencias */}
          {clientesConRestricciones.length > 0 && respetarRestricciones && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-4" />
                  Clientes con restricciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2 text-xs">
                  Los siguientes clientes tienen lesiones o restricciones que afectarán la generación:
                </p>
                <div className="space-y-1">
                  {clientesConRestricciones.map((cliente) => (
                    <div key={cliente.id} className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{cliente.nombre}:</span>
                      <span className="text-muted-foreground">
                        {[
                          ...cliente.lesiones.map((l) => tiposLesion.find((t) => t.value === l)?.label),
                          ...cliente.restricciones.map((r) => tiposRestriccion.find((t) => t.value === r)?.label),
                        ].join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen y acción */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plantilla:</span>
                <span className="font-medium">
                  {selectedPlantilla
                    ? plantillasEntrenamiento.find((p) => p.value === selectedPlantilla)?.label
                    : "Sin seleccionar"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clientes:</span>
                <span className="font-medium">{selectedClientes.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha inicio:</span>
                <span className="font-medium">
                  {new Date(fechaInicio).toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progresión:</span>
                <span className="font-medium">
                  {tiposProgresion.find((t) => t.value === configProgresion.tipoProgresion)?.label}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2" disabled={!canGenerate || isProcessing} onClick={handleGenerar}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="size-4" />
                    Generar {selectedClientes.size} semana
                    {selectedClientes.size !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
