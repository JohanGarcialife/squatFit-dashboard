"use client";

import { useState, useMemo } from "react";

import {
  Search,
  AlertTriangle,
  Plus,
  X,
  Edit2,
  Save,
  User,
  Shield,
  Activity,
  Heart,
  Dumbbell,
  Ban,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  Filter,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { clientesEntrenamientoData, tiposLesion, tiposRestriccion, ejerciciosData } from "./data";
import type { ClienteEntrenamiento, TipoLesion, TipoRestriccion } from "./schema";

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

// Ejercicios recomendados a evitar según lesión
const ejerciciosEvitar: Record<TipoLesion, string[]> = {
  lumbar: ["Peso muerto", "Sentadilla con barra", "Buenos días", "Remo con barra"],
  rodilla: ["Sentadilla profunda", "Extensión de cuádriceps", "Zancadas con salto", "Box jumps"],
  hombro: ["Press militar", "Elevaciones laterales pesadas", "Fondos", "Pull-ups con agarre ancho"],
  cervical: ["Press tras nuca", "Jalón tras nuca", "Encogimientos pesados"],
  codo: ["Curl predicador", "Extensión de tríceps con carga pesada", "Press francés"],
  muneca: ["Clean & Jerk", "Front squat", "Flexiones en posición cerrada"],
  cadera: ["Sentadilla sumo profunda", "Abducción con carga pesada", "Hip thrust pesado"],
  tobillo: ["Sentadilla con talones elevados", "Saltos", "Ejercicios pliométricos"],
};

// ============================================
// COMPONENTES
// ============================================

interface LesionChipProps {
  lesion: TipoLesion;
  onRemove?: () => void;
  editable?: boolean;
}

function LesionChip({ lesion, onRemove, editable = false }: LesionChipProps) {
  const config = tiposLesion.find((t) => t.value === lesion);
  if (!config) return null;

  return (
    <Badge variant="secondary" className={cn("gap-1", config.color)}>
      <Heart className="size-3" />
      {config.label}
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-black/10"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}

interface RestriccionChipProps {
  restriccion: TipoRestriccion;
  onRemove?: () => void;
  editable?: boolean;
}

function RestriccionChip({ restriccion, onRemove, editable = false }: RestriccionChipProps) {
  const config = tiposRestriccion.find((t) => t.value === restriccion);
  if (!config) return null;

  return (
    <Badge variant="outline" className={cn("gap-1", config.color)}>
      <Ban className="size-3" />
      {config.label}
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-black/10"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}

interface CustomRestriccionChipProps {
  texto: string;
  onRemove?: () => void;
  editable?: boolean;
}

function CustomRestriccionChip({ texto, onRemove, editable = false }: CustomRestriccionChipProps) {
  return (
    <Badge variant="outline" className="gap-1 bg-slate-50 dark:bg-slate-900">
      <AlertTriangle className="size-3" />
      {texto}
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-black/10"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}

interface ClienteRestriccionesCardProps {
  cliente: ClienteEntrenamiento;
  onEdit: () => void;
}

function ClienteRestriccionesCard({ cliente, onEdit }: ClienteRestriccionesCardProps) {
  const tieneRestricciones =
    cliente.lesiones.length > 0 ||
    cliente.restricciones.length > 0 ||
    (cliente.restriccionesCustom && cliente.restriccionesCustom.length > 0);

  const ejerciciosAEvitar = useMemo(() => {
    const evitar = new Set<string>();
    cliente.lesiones.forEach((lesion) => {
      ejerciciosEvitar[lesion]?.forEach((ej) => evitar.add(ej));
    });
    return Array.from(evitar);
  }, [cliente.lesiones]);

  return (
    <Card className={cn(!tieneRestricciones && "opacity-70")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={cliente.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">{getInitials(cliente.nombre)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{cliente.nombre}</CardTitle>
              <CardDescription className="text-xs">{cliente.email}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-8" onClick={onEdit}>
            <Edit2 className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {tieneRestricciones ? (
          <>
            {/* Lesiones */}
            {cliente.lesiones.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Heart className="size-3" />
                  Lesiones
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {cliente.lesiones.map((lesion) => (
                    <LesionChip key={lesion} lesion={lesion} />
                  ))}
                </div>
              </div>
            )}

            {/* Restricciones */}
            {cliente.restricciones.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Ban className="size-3" />
                  Restricciones de material/movimiento
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {cliente.restricciones.map((restriccion) => (
                    <RestriccionChip key={restriccion} restriccion={restriccion} />
                  ))}
                </div>
              </div>
            )}

            {/* Restricciones custom */}
            {cliente.restriccionesCustom && cliente.restriccionesCustom.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <AlertTriangle className="size-3" />
                  Notas adicionales
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {cliente.restriccionesCustom.map((custom, i) => (
                    <CustomRestriccionChip key={i} texto={custom} />
                  ))}
                </div>
              </div>
            )}

            {/* Ejercicios a evitar */}
            {ejerciciosAEvitar.length > 0 && (
              <div className="space-y-2 border-t pt-2">
                <Label className="flex items-center gap-1 text-xs text-red-600">
                  <X className="size-3" />
                  Ejercicios a evitar
                </Label>
                <p className="text-muted-foreground text-xs">{ejerciciosAEvitar.join(", ")}</p>
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500" />
            <p className="text-muted-foreground text-sm">Sin lesiones ni restricciones registradas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EditRestriccionesDialogProps {
  cliente: ClienteEntrenamiento;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lesiones: TipoLesion[], restricciones: TipoRestriccion[], custom: string[]) => void;
}

function EditRestriccionesDialog({ cliente, open, onOpenChange, onSave }: EditRestriccionesDialogProps) {
  const [lesiones, setLesiones] = useState<TipoLesion[]>(cliente.lesiones);
  const [restricciones, setRestricciones] = useState<TipoRestriccion[]>(cliente.restricciones);
  const [customRestricciones, setCustomRestricciones] = useState<string[]>(cliente.restriccionesCustom || []);
  const [newCustom, setNewCustom] = useState("");

  const handleAddLesion = (lesion: TipoLesion) => {
    if (!lesiones.includes(lesion)) {
      setLesiones([...lesiones, lesion]);
    }
  };

  const handleRemoveLesion = (lesion: TipoLesion) => {
    setLesiones(lesiones.filter((l) => l !== lesion));
  };

  const handleAddRestriccion = (restriccion: TipoRestriccion) => {
    if (!restricciones.includes(restriccion)) {
      setRestricciones([...restricciones, restriccion]);
    }
  };

  const handleRemoveRestriccion = (restriccion: TipoRestriccion) => {
    setRestricciones(restricciones.filter((r) => r !== restriccion));
  };

  const handleAddCustom = () => {
    if (newCustom.trim() && !customRestricciones.includes(newCustom.trim())) {
      setCustomRestricciones([...customRestricciones, newCustom.trim()]);
      setNewCustom("");
    }
  };

  const handleRemoveCustom = (custom: string) => {
    setCustomRestricciones(customRestricciones.filter((c) => c !== custom));
  };

  const handleSave = () => {
    onSave(lesiones, restricciones, customRestricciones);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={cliente.avatar} />
              <AvatarFallback>{getInitials(cliente.nombre)}</AvatarFallback>
            </Avatar>
            {cliente.nombre}
          </DialogTitle>
          <DialogDescription>Edita las lesiones y restricciones de entrenamiento</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Lesiones */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Heart className="size-4 text-red-500" />
                Lesiones
              </Label>
              <div className="flex flex-wrap gap-2">
                {lesiones.map((lesion) => (
                  <LesionChip key={lesion} lesion={lesion} editable onRemove={() => handleRemoveLesion(lesion)} />
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1">
                      <Plus className="size-3" />
                      Añadir lesión
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar lesión..." />
                      <CommandList>
                        <CommandEmpty>No encontrado</CommandEmpty>
                        <CommandGroup>
                          {tiposLesion
                            .filter((t) => !lesiones.includes(t.value))
                            .map((tipo) => (
                              <CommandItem key={tipo.value} onSelect={() => handleAddLesion(tipo.value)}>
                                {tipo.label}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            {/* Restricciones */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Ban className="size-4 text-amber-500" />
                Restricciones de material/movimiento
              </Label>
              <div className="flex flex-wrap gap-2">
                {restricciones.map((restriccion) => (
                  <RestriccionChip
                    key={restriccion}
                    restriccion={restriccion}
                    editable
                    onRemove={() => handleRemoveRestriccion(restriccion)}
                  />
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1">
                      <Plus className="size-3" />
                      Añadir restricción
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar restricción..." />
                      <CommandList>
                        <CommandEmpty>No encontrado</CommandEmpty>
                        <CommandGroup>
                          {tiposRestriccion
                            .filter((t) => !restricciones.includes(t.value))
                            .map((tipo) => (
                              <CommandItem key={tipo.value} onSelect={() => handleAddRestriccion(tipo.value)}>
                                {tipo.label}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            {/* Custom */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-slate-500" />
                Notas adicionales
              </Label>
              <div className="flex flex-wrap gap-2">
                {customRestricciones.map((custom, i) => (
                  <CustomRestriccionChip key={i} texto={custom} editable onRemove={() => handleRemoveCustom(custom)} />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Solo puede entrenar 2 días/semana"
                  value={newCustom}
                  onChange={(e) => setNewCustom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                />
                <Button variant="outline" onClick={handleAddCustom}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 size-4" />
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function LesionesRestricciones() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "con_restricciones" | "sin_restricciones">("todos");
  const [clienteEditando, setClienteEditando] = useState<ClienteEntrenamiento | null>(null);

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientesEntrenamientoData];

    // Búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) => c.nombre.toLowerCase().includes(searchLower) || c.email.toLowerCase().includes(searchLower),
      );
    }

    // Filtro por restricciones
    if (filtro === "con_restricciones") {
      resultado = resultado.filter(
        (c) =>
          c.lesiones.length > 0 ||
          c.restricciones.length > 0 ||
          (c.restriccionesCustom && c.restriccionesCustom.length > 0),
      );
    } else if (filtro === "sin_restricciones") {
      resultado = resultado.filter(
        (c) =>
          c.lesiones.length === 0 &&
          c.restricciones.length === 0 &&
          (!c.restriccionesCustom || c.restriccionesCustom.length === 0),
      );
    }

    return resultado;
  }, [busqueda, filtro]);

  // Estadísticas
  const stats = useMemo(() => {
    const conLesiones = clientesEntrenamientoData.filter((c) => c.lesiones.length > 0).length;
    const conRestricciones = clientesEntrenamientoData.filter((c) => c.restricciones.length > 0).length;
    const totalAfectados = clientesEntrenamientoData.filter(
      (c) =>
        c.lesiones.length > 0 ||
        c.restricciones.length > 0 ||
        (c.restriccionesCustom && c.restriccionesCustom.length > 0),
    ).length;

    // Contar lesiones más comunes
    const lesionCount: Record<string, number> = {};
    clientesEntrenamientoData.forEach((c) => {
      c.lesiones.forEach((l) => {
        lesionCount[l] = (lesionCount[l] || 0) + 1;
      });
    });

    return {
      conLesiones,
      conRestricciones,
      totalAfectados,
      total: clientesEntrenamientoData.length,
      lesionCount,
    };
  }, []);

  const handleSaveRestricciones = (lesiones: TipoLesion[], restricciones: TipoRestriccion[], custom: string[]) => {
    // TODO: Integrar con API - PATCH /api/clientes/:id/restricciones
    console.log("Guardando:", { lesiones, restricciones, custom });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lesiones y Restricciones</h3>
          <p className="text-muted-foreground text-sm">Gestiona las limitaciones de entrenamiento de cada cliente</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="to-card bg-gradient-to-br from-red-50 dark:from-red-950/30">
          <CardHeader className="pb-2">
            <CardDescription>Con lesiones</CardDescription>
            <CardTitle className="text-2xl">{stats.conLesiones}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">de {stats.total} clientes</p>
          </CardContent>
        </Card>
        <Card className="to-card bg-gradient-to-br from-amber-50 dark:from-amber-950/30">
          <CardHeader className="pb-2">
            <CardDescription>Con restricciones</CardDescription>
            <CardTitle className="text-2xl">{stats.conRestricciones}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">de material o movimiento</p>
          </CardContent>
        </Card>
        <Card className="to-card bg-gradient-to-br from-purple-50 dark:from-purple-950/30">
          <CardHeader className="pb-2">
            <CardDescription>Total afectados</CardDescription>
            <CardTitle className="text-2xl">{stats.totalAfectados}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">requieren adaptación</p>
          </CardContent>
        </Card>
        <Card className="to-card bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30">
          <CardHeader className="pb-2">
            <CardDescription>Sin restricciones</CardDescription>
            <CardTitle className="text-2xl">{stats.total - stats.totalAfectados}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">entrenamiento completo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los clientes</SelectItem>
            <SelectItem value="con_restricciones">Con restricciones</SelectItem>
            <SelectItem value="sin_restricciones">Sin restricciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumen de lesiones más comunes */}
      {Object.keys(stats.lesionCount).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lesiones más frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.lesionCount)
                .sort(([, a], [, b]) => b - a)
                .map(([lesion, count]) => {
                  const config = tiposLesion.find((t) => t.value === lesion);
                  return (
                    <Badge key={lesion} variant="secondary" className={cn("gap-1", config?.color)}>
                      {config?.label || lesion}
                      <span className="rounded-full bg-black/10 px-1.5 text-xs">{count}</span>
                    </Badge>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de clientes */}
      {clientesFiltrados.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((cliente) => (
            <ClienteRestriccionesCard key={cliente.id} cliente={cliente} onEdit={() => setClienteEditando(cliente)} />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <User className="text-muted-foreground/50 mb-4 size-12" />
            <h3 className="font-semibold">No se encontraron clientes</h3>
            <p className="text-muted-foreground mt-1 text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </Card>
      )}

      {/* Dialog de edición */}
      {clienteEditando && (
        <EditRestriccionesDialog
          cliente={clienteEditando}
          open={!!clienteEditando}
          onOpenChange={(open) => !open && setClienteEditando(null)}
          onSave={handleSaveRestricciones}
        />
      )}
    </div>
  );
}
