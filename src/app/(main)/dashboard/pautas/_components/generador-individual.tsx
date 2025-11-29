"use client";

import { useState, useMemo } from "react";

import {
  Search,
  User,
  Activity,
  Heart,
  Coffee,
  Pill,
  ChevronDown,
  ChevronUp,
  Save,
  Download,
  Calculator,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  RefreshCcw,
  Flame,
  Dumbbell,
  Scale,
  Ruler,
  Target,
  Clock,
  Droplets,
  Brain,
  Moon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  pautasData,
  suplementosDisponibles,
  condicionesMedicasComunes,
  alergiasComunes,
  bebidasComunes,
  objetivosPauta,
  nivelesActividad,
  estadosPauta,
  tiposAlimentacion,
  calcularTMB,
  calcularTDEE,
  calcularMacrosRecomendados,
} from "./data";
import type { PautaNutricional, Suplemento } from "./schema";

// =============================================
// COMPONENTE: SELECTOR DE CLIENTE
// =============================================

interface ClienteSelectorProps {
  clienteSeleccionado: PautaNutricional | null;
  onSelectCliente: (pauta: PautaNutricional | null) => void;
}

function ClienteSelector({ clienteSeleccionado, onSelectCliente }: ClienteSelectorProps) {
  const [busqueda, setBusqueda] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const clientesFiltrados = useMemo(() => {
    if (!busqueda) return pautasData;
    return pautasData.filter((p) => p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()));
  }, [busqueda]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="size-4" />
          Seleccionar Cliente
        </CardTitle>
        <CardDescription>Busca un cliente para editar su pauta nutricional y deportiva</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
          <Input
            placeholder="Buscar cliente por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        {clienteSeleccionado ? (
          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={clienteSeleccionado.fichaRapida.clienteAvatar} />
                <AvatarFallback>
                  {clienteSeleccionado.clienteNombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{clienteSeleccionado.clienteNombre}</p>
                <p className="text-muted-foreground text-sm">
                  {objetivosPauta.find((o) => o.value === clienteSeleccionado.fichaRapida.objetivo)?.label}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onSelectCliente(null)}>
              Cambiar
            </Button>
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {clientesFiltrados.map((pauta) => (
              <div
                key={pauta.id}
                className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                onClick={() => onSelectCliente(pauta)}
              >
                <Avatar className="size-10">
                  <AvatarImage src={pauta.fichaRapida.clienteAvatar} />
                  <AvatarFallback>
                    {pauta.clienteNombre
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{pauta.clienteNombre}</p>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>{pauta.fichaRapida.edad} años</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {estadosPauta.find((e) => e.value === pauta.estado)?.label}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{pauta.macros.calorias} kcal</p>
                  <p className="text-muted-foreground">Objetivo diario</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// COMPONENTE: MACROS Y FICHA RÁPIDA
// =============================================

interface MacrosFichaProps {
  pauta: PautaNutricional;
  onUpdate: (pauta: PautaNutricional) => void;
}

function MacrosFichaRapida({ pauta, onUpdate }: MacrosFichaProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleRecalcular = () => {
    const tmb = calcularTMB(
      pauta.fichaRapida.pesoActual,
      pauta.fichaRapida.altura,
      pauta.fichaRapida.edad,
      pauta.fichaRapida.sexo,
    );
    const tdee = calcularTDEE(tmb, pauta.fichaRapida.nivelActividad);
    const macrosRecomendados = calcularMacrosRecomendados(tdee, pauta.fichaRapida.objetivo);

    onUpdate({
      ...pauta,
      fichaRapida: { ...pauta.fichaRapida, tmb, tdee },
      macros: { ...pauta.macros, ...macrosRecomendados },
    });
  };

  const macrosPorcentaje = useMemo(() => {
    const total = pauta.macros.proteinas * 4 + pauta.macros.carbohidratos * 4 + pauta.macros.grasas * 9;
    return {
      proteinas: Math.round(((pauta.macros.proteinas * 4) / total) * 100),
      carbohidratos: Math.round(((pauta.macros.carbohidratos * 4) / total) * 100),
      grasas: Math.round(((pauta.macros.grasas * 9) / total) * 100),
    };
  }, [pauta.macros]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="text-primary size-5" />
                <div>
                  <CardTitle className="text-base">Macros, Ficha Rápida y Evaluación</CardTitle>
                  <CardDescription>Datos básicos y objetivos nutricionales</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold">{pauta.macros.calorias} kcal</p>
                  <p className="text-muted-foreground text-xs">Objetivo diario</p>
                </div>
                {isOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Ficha Rápida */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium">
                  <User className="size-4" />
                  Datos Personales
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Edad</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={pauta.fichaRapida.edad}
                        onChange={(e) =>
                          onUpdate({
                            ...pauta,
                            fichaRapida: { ...pauta.fichaRapida, edad: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="h-9"
                      />
                      <span className="text-muted-foreground text-sm">años</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sexo</Label>
                    <Select
                      value={pauta.fichaRapida.sexo}
                      onValueChange={(value) =>
                        onUpdate({
                          ...pauta,
                          fichaRapida: { ...pauta.fichaRapida, sexo: value as "masculino" | "femenino" | "otro" },
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Altura</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={pauta.fichaRapida.altura}
                        onChange={(e) =>
                          onUpdate({
                            ...pauta,
                            fichaRapida: { ...pauta.fichaRapida, altura: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="h-9"
                      />
                      <span className="text-muted-foreground text-sm">cm</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Peso Actual</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={pauta.fichaRapida.pesoActual}
                        onChange={(e) =>
                          onUpdate({
                            ...pauta,
                            fichaRapida: { ...pauta.fichaRapida, pesoActual: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="h-9"
                      />
                      <span className="text-muted-foreground text-sm">kg</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Peso Objetivo (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="—"
                      value={pauta.fichaRapida.pesoObjetivo || ""}
                      onChange={(e) =>
                        onUpdate({
                          ...pauta,
                          fichaRapida: { ...pauta.fichaRapida, pesoObjetivo: parseFloat(e.target.value) || undefined },
                        })
                      }
                      className="h-9"
                    />
                    <span className="text-muted-foreground text-sm">kg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium">
                  <Target className="size-4" />
                  Objetivo y Actividad
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Objetivo</Label>
                    <Select
                      value={pauta.fichaRapida.objetivo}
                      onValueChange={(value) =>
                        onUpdate({
                          ...pauta,
                          fichaRapida: { ...pauta.fichaRapida, objetivo: value as typeof pauta.fichaRapida.objetivo },
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {objetivosPauta.map((obj) => (
                          <SelectItem key={obj.value} value={obj.value}>
                            {obj.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Nivel de Actividad</Label>
                    <Select
                      value={pauta.fichaRapida.nivelActividad}
                      onValueChange={(value) =>
                        onUpdate({
                          ...pauta,
                          fichaRapida: {
                            ...pauta.fichaRapida,
                            nivelActividad: value as typeof pauta.fichaRapida.nivelActividad,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {nivelesActividad.map((nivel) => (
                          <SelectItem key={nivel.value} value={nivel.value}>
                            <div>
                              <span>{nivel.label}</span>
                              <span className="text-muted-foreground ml-2 text-xs">({nivel.descripcion})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted/50 space-y-1 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span>TMB (Metab. Basal)</span>
                      <span className="font-medium">{pauta.fichaRapida.tmb} kcal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TDEE (Gasto Total)</span>
                      <span className="font-medium">{pauta.fichaRapida.tdee} kcal</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" onClick={handleRecalcular}>
                    <RefreshCcw className="mr-2 size-4" />
                    Recalcular TMB/TDEE
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Macros */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-medium">
                <Flame className="size-4" />
                Macronutrientes Objetivo
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Calorías</Label>
                    <span className="text-muted-foreground text-xs">kcal</span>
                  </div>
                  <Input
                    type="number"
                    value={pauta.macros.calorias}
                    onChange={(e) =>
                      onUpdate({
                        ...pauta,
                        macros: { ...pauta.macros, calorias: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="h-10 text-center text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Proteínas ({macrosPorcentaje.proteinas}%)</Label>
                    <span className="text-muted-foreground text-xs">g</span>
                  </div>
                  <Input
                    type="number"
                    value={pauta.macros.proteinas}
                    onChange={(e) =>
                      onUpdate({
                        ...pauta,
                        macros: { ...pauta.macros, proteinas: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="h-10 text-center text-lg font-semibold"
                  />
                  <Progress value={macrosPorcentaje.proteinas} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Carbohidratos ({macrosPorcentaje.carbohidratos}%)</Label>
                    <span className="text-muted-foreground text-xs">g</span>
                  </div>
                  <Input
                    type="number"
                    value={pauta.macros.carbohidratos}
                    onChange={(e) =>
                      onUpdate({
                        ...pauta,
                        macros: { ...pauta.macros, carbohidratos: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="h-10 text-center text-lg font-semibold"
                  />
                  <Progress value={macrosPorcentaje.carbohidratos} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Grasas ({macrosPorcentaje.grasas}%)</Label>
                    <span className="text-muted-foreground text-xs">g</span>
                  </div>
                  <Input
                    type="number"
                    value={pauta.macros.grasas}
                    onChange={(e) =>
                      onUpdate({
                        ...pauta,
                        macros: { ...pauta.macros, grasas: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="h-10 text-center text-lg font-semibold"
                  />
                  <Progress value={macrosPorcentaje.grasas} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Fibra (opcional)</Label>
                    <span className="text-muted-foreground text-xs">g</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="—"
                    value={pauta.macros.fibra || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...pauta,
                        macros: { ...pauta.macros, fibra: parseInt(e.target.value) || undefined },
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Agua (opcional)</Label>
                    <span className="text-muted-foreground text-xs">litros</span>
                  </div>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="—"
                    value={pauta.macros.agua || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...pauta,
                        macros: { ...pauta.macros, agua: parseFloat(e.target.value) || undefined },
                      })
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Evaluación General */}
            {pauta.evaluacionGeneral && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium">
                  <Scale className="size-4" />
                  Evaluación General
                </h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">% Grasa Corporal</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={pauta.evaluacionGeneral.porcentajeGrasa || ""}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Masa Muscular (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={pauta.evaluacionGeneral.masaMuscular || ""}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">IMC</Label>
                    <Input type="number" step="0.1" value={pauta.evaluacionGeneral.imc || ""} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cintura (cm)</Label>
                    <Input type="number" value={pauta.evaluacionGeneral.circunferenciaCintura || ""} className="h-9" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <Activity className="size-3" />
                      Nivel de Energía
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[pauta.evaluacionGeneral.nivelEnergia || 5]}
                        max={10}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-8 text-center font-medium">{pauta.evaluacionGeneral.nivelEnergia}/10</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <Moon className="size-3" />
                      Calidad del Sueño
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[pauta.evaluacionGeneral.calidadSueno || 5]}
                        max={10}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-8 text-center font-medium">{pauta.evaluacionGeneral.calidadSueno}/10</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <Brain className="size-3" />
                      Nivel de Estrés
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[pauta.evaluacionGeneral.nivelEstres || 5]}
                        max={10}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-8 text-center font-medium">{pauta.evaluacionGeneral.nivelEstres}/10</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Observaciones</Label>
                  <Textarea
                    placeholder="Notas de la evaluación..."
                    value={pauta.evaluacionGeneral.observaciones || ""}
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// =============================================
// COMPONENTE: HISTORIAL MÉDICO
// =============================================

interface HistorialMedicoProps {
  pauta: PautaNutricional;
  onUpdate: (pauta: PautaNutricional) => void;
}

function HistorialMedicoSection({ pauta, onUpdate }: HistorialMedicoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-red-500" />
                <div>
                  <CardTitle className="text-base">Historial Médico</CardTitle>
                  <CardDescription>Condiciones, alergias y medicación</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {pauta.historialMedico && (
                  <div className="flex gap-2">
                    {(pauta.historialMedico.condicionesMedicas?.length ?? 0) > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {pauta.historialMedico.condicionesMedicas.length} condiciones
                      </Badge>
                    )}
                    {(pauta.historialMedico.alergias?.length ?? 0) > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {pauta.historialMedico.alergias.length} alergias
                      </Badge>
                    )}
                  </div>
                )}
                {isOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Condiciones Médicas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Condiciones Médicas</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 size-4" />
                      Añadir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir Condición Médica</DialogTitle>
                      <DialogDescription>Selecciona o añade una condición médica del cliente</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Condiciones Comunes</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {condicionesMedicasComunes.map((cond, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Checkbox id={`cond-${i}`} />
                              <label htmlFor={`cond-${i}`} className="text-sm">
                                {cond.nombre}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Otra condición</Label>
                        <Input placeholder="Nombre de la condición" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {pauta.historialMedico?.condicionesMedicas?.length ? (
                <div className="space-y-2">
                  {pauta.historialMedico.condicionesMedicas.map((cond, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{cond.nombre}</p>
                        <p className="text-muted-foreground text-sm">{cond.impactoNutricional}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{cond.estado}</Badge>
                        <Button variant="ghost" size="icon" className="text-destructive size-8">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay condiciones médicas registradas</p>
              )}
            </div>

            <Separator />

            {/* Alergias */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Alergias e Intolerancias
                </h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 size-4" />
                      Añadir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir Alergia/Intolerancia</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Alergias Comunes</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {alergiasComunes.map((alergia, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Checkbox id={`alergia-${i}`} />
                              <label htmlFor={`alergia-${i}`} className="text-sm">
                                {alergia.alergeno}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-wrap gap-2">
                {pauta.historialMedico?.alergias?.length ? (
                  pauta.historialMedico.alergias.map((alergia, i) => (
                    <Badge key={i} variant="destructive" className="gap-1">
                      {alergia.alergeno}
                      <button className="ml-1 hover:text-white/80">×</button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay alergias registradas</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Medicación actual */}
            <div className="space-y-3">
              <h4 className="font-medium">Medicación Actual</h4>
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-muted-foreground text-sm">
                  No hay medicación registrada. Haz clic en &quot;Añadir&quot; para agregar.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 size-4" />
                  Añadir medicación
                </Button>
              </div>
            </div>

            {/* Antecedentes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Antecedentes cardiovasculares</span>
                <Switch checked={pauta.historialMedico?.antecedentesCardiovasculares} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Antecedentes metabólicos</span>
                <Switch checked={pauta.historialMedico?.antecedentesMetabolicos} />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// =============================================
// COMPONENTE: BEBIDAS Y COMIDAS
// =============================================

interface BebidasComidasProps {
  pauta: PautaNutricional;
  onUpdate: (pauta: PautaNutricional) => void;
}

function BebidasComidasSection({ pauta, onUpdate }: BebidasComidasProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="size-5 text-amber-600" />
                <div>
                  <CardTitle className="text-base">Bebidas y Comidas</CardTitle>
                  <CardDescription>Preferencias alimentarias y hábitos de consumo</CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Tipo de alimentación */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Alimentación</Label>
                <Select defaultValue="omnivoro">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAlimentacion.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comidas por día</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} comidas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Consumo de agua */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <Droplets className="size-4 text-blue-500" />
                Consumo de Agua
              </h4>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[2.5]} max={5} min={0.5} step={0.5} className="flex-1" />
                <span className="w-20 text-center font-medium">2.5 litros</span>
              </div>
            </div>

            <Separator />

            {/* Bebidas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Consumo de Bebidas</h4>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 size-4" />
                  Añadir
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Coffee className="size-4" />
                    <span>Café</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="h-8 w-20" defaultValue={2} />
                    <span className="text-muted-foreground text-sm">tazas/día</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span>🍵</span>
                    <span>Té / Infusiones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="h-8 w-20" defaultValue={1} />
                    <span className="text-muted-foreground text-sm">tazas/día</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Restricciones dietéticas */}
            <div className="space-y-3">
              <h4 className="font-medium">Restricciones Dietéticas</h4>
              <div className="flex flex-wrap gap-2">
                {["Sin gluten", "Sin lactosa", "Sin frutos secos", "Bajo en sodio", "Bajo en azúcar"].map(
                  (restriccion) => (
                    <Badge
                      key={restriccion}
                      variant="outline"
                      className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                    >
                      {restriccion}
                    </Badge>
                  ),
                )}
              </div>
            </div>

            {/* Preferencias */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alimentos Preferidos</Label>
                <Textarea placeholder="Pollo, arroz, brócoli..." className="min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <Label>Alimentos a Evitar</Label>
                <Textarea placeholder="Mariscos, lácteos..." className="min-h-[80px]" />
              </div>
            </div>

            {/* Hábitos */}
            <div className="space-y-3">
              <h4 className="font-medium">Hábitos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm">Cocina en casa</span>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tiempo disponible para cocinar</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora o más</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// =============================================
// COMPONENTE: SUPLEMENTACIÓN
// =============================================

interface SuplementacionProps {
  pauta: PautaNutricional;
  onUpdate: (pauta: PautaNutricional) => void;
}

function SuplementacionSection({ pauta, onUpdate }: SuplementacionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suplementosActivos, setSuplementosActivos] = useState<string[]>([]);

  const handleToggleSuplemento = (suplementoId: string) => {
    setSuplementosActivos((prev) =>
      prev.includes(suplementoId) ? prev.filter((id) => id !== suplementoId) : [...prev, suplementoId],
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="size-5 text-green-600" />
                <div>
                  <CardTitle className="text-base">Suplementación y Beneficios</CardTitle>
                  <CardDescription>Suplementos recomendados y actuales</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {suplementosActivos.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {suplementosActivos.length} activos
                  </Badge>
                )}
                {isOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Suplementos activos */}
            <div className="space-y-3">
              <h4 className="font-medium">Suplementos Activos</h4>
              {suplementosActivos.length > 0 ? (
                <div className="space-y-2">
                  {suplementosDisponibles
                    .filter((s) => suplementosActivos.includes(s.id))
                    .map((suplemento) => (
                      <div
                        key={suplemento.id}
                        className="flex items-center justify-between rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20"
                      >
                        <div className="flex items-center gap-3">
                          <Check className="size-5 text-green-600" />
                          <div>
                            <p className="font-medium">{suplemento.nombre}</p>
                            <p className="text-muted-foreground text-sm">
                              {suplemento.dosis} - {suplemento.momentoToma}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleSuplemento(suplemento.id)}>
                          Quitar
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay suplementos activos</p>
              )}
            </div>

            <Separator />

            {/* Catálogo de suplementos */}
            <div className="space-y-3">
              <h4 className="font-medium">Catálogo de Suplementos</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suplementosDisponibles
                  .filter((s) => !suplementosActivos.includes(s.id))
                  .map((suplemento) => (
                    <div key={suplemento.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{suplemento.nombre}</p>
                          <p className="text-muted-foreground text-xs">{suplemento.marca}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleToggleSuplemento(suplemento.id)}>
                          <Plus className="mr-1 size-3" />
                          Añadir
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Dosis:</span> {suplemento.dosis}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Momento:</span> {suplemento.momentoToma}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {suplemento.beneficios.slice(0, 3).map((beneficio, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {beneficio}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {suplemento.contraindicaciones && (
                        <div className="mt-2 flex items-start gap-1 rounded bg-amber-50 p-2 dark:bg-amber-950/30">
                          <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-600" />
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            {suplemento.contraindicaciones.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Objetivos de suplementación */}
            <div className="space-y-3">
              <h4 className="font-medium">Objetivos de Suplementación</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ganar masa muscular",
                  "Mejorar recuperación",
                  "Aumentar energía",
                  "Salud articular",
                  "Mejorar sueño",
                  "Rendimiento deportivo",
                ].map((objetivo) => (
                  <Badge
                    key={objetivo}
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    {objetivo}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// =============================================
// COMPONENTE PRINCIPAL: GENERADOR INDIVIDUAL
// =============================================

export function GeneradorIndividual() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<PautaNutricional | null>(null);
  const [pautaEditada, setPautaEditada] = useState<PautaNutricional | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectCliente = (pauta: PautaNutricional | null) => {
    setClienteSeleccionado(pauta);
    setPautaEditada(pauta ? { ...pauta } : null);
  };

  const handleUpdatePauta = (pauta: PautaNutricional) => {
    setPautaEditada(pauta);
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    // TODO: Integrar con API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Generador Individual de Pautas</h2>
          <p className="text-muted-foreground text-sm">Edita las pautas nutricionales y deportivas de cada cliente</p>
        </div>
        {pautaEditada && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Exportar PDF
            </Button>
            <Button size="sm" onClick={handleGuardar} disabled={isSaving}>
              <Save className="mr-2 size-4" />
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </div>

      {/* Selector de cliente */}
      <ClienteSelector clienteSeleccionado={clienteSeleccionado} onSelectCliente={handleSelectCliente} />

      {/* Secciones de edición */}
      {pautaEditada && (
        <div className="space-y-4">
          <MacrosFichaRapida pauta={pautaEditada} onUpdate={handleUpdatePauta} />
          <HistorialMedicoSection pauta={pautaEditada} onUpdate={handleUpdatePauta} />
          <BebidasComidasSection pauta={pautaEditada} onUpdate={handleUpdatePauta} />
          <SuplementacionSection pauta={pautaEditada} onUpdate={handleUpdatePauta} />
        </div>
      )}

      {/* Estado vacío */}
      {!clienteSeleccionado && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="text-muted-foreground/50 size-12" />
            <h3 className="mt-4 font-semibold">Selecciona un cliente</h3>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              Busca y selecciona un cliente para comenzar a editar su pauta nutricional y deportiva
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
