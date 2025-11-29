"use client";

import { useState, useMemo } from "react";

import {
  Search,
  Filter,
  Play,
  Video,
  Dumbbell,
  MoreHorizontal,
  ArrowLeftRight,
  Info,
  Plus,
  Grid3X3,
  List,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ejerciciosData, sustitucionesData, gruposMusculares, tiposMaterial, nivelesDificultad } from "./data";
import type { Ejercicio, GrupoMuscular, TipoMaterial, NivelDificultad } from "./schema";

// ============================================
// HELPERS
// ============================================

const getGrupoMuscularLabel = (grupo: GrupoMuscular) => {
  const found = gruposMusculares.find((g) => g.value === grupo);
  return found?.label || grupo;
};

const getMaterialLabel = (material: TipoMaterial) => {
  const found = tiposMaterial.find((m) => m.value === material);
  return found?.label || material;
};

const getNivelBadgeClass = (nivel: NivelDificultad) => {
  switch (nivel) {
    case "principiante":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "intermedio":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "avanzado":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
};

const getNivelLabel = (nivel: NivelDificultad) => {
  return nivel.charAt(0).toUpperCase() + nivel.slice(1);
};

// ============================================
// COMPONENTES
// ============================================

interface EjercicioCardProps {
  ejercicio: Ejercicio;
  onSelect?: (ejercicio: Ejercicio) => void;
  viewMode: "grid" | "list";
}

function EjercicioCard({ ejercicio, onSelect, viewMode }: EjercicioCardProps) {
  const [showVideo, setShowVideo] = useState(false);

  const sustituciones = useMemo(() => {
    return sustitucionesData
      .filter((s) => s.ejercicioOriginalId === ejercicio.id)
      .map((s) => ({
        ...s,
        ejercicio: ejerciciosData.find((e) => e.id === s.ejercicioSustitutoId),
      }));
  }, [ejercicio.id]);

  if (viewMode === "list") {
    return (
      <div className="group hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4 transition-colors">
        {/* Thumbnail / Video */}
        <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
          {ejercicio.videoUrl ? (
            <Dialog open={showVideo} onOpenChange={setShowVideo}>
              <DialogTrigger asChild>
                <button className="from-primary/20 to-primary/5 hover:from-primary/30 flex size-full items-center justify-center bg-gradient-to-br transition-colors">
                  <Play className="text-primary size-6" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{ejercicio.nombre}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video">
                  <iframe
                    src={ejercicio.videoUrl}
                    className="size-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex size-full items-center justify-center">
              <Dumbbell className="text-muted-foreground size-6" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="truncate font-semibold">{ejercicio.nombre}</h4>
              {ejercicio.nombreIngles && (
                <p className="text-muted-foreground truncate text-xs">{ejercicio.nombreIngles}</p>
              )}
            </div>
            <Badge variant="secondary" className={cn("shrink-0 text-xs", getNivelBadgeClass(ejercicio.nivel))}>
              {getNivelLabel(ejercicio.nivel)}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span>{getGrupoMuscularLabel(ejercicio.grupoMuscular)}</span>
            <span>•</span>
            <span>{ejercicio.material.map(getMaterialLabel).join(", ")}</span>
            {sustituciones.length > 0 && (
              <>
                <span>•</span>
                <span className="text-primary flex items-center gap-1">
                  <ArrowLeftRight className="size-3" />
                  {sustituciones.length} sustituciones
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <EjercicioDetailDialog ejercicio={ejercicio} sustituciones={sustituciones} />
          <Button variant="outline" size="sm" onClick={() => onSelect?.(ejercicio)}>
            <Plus className="mr-1 size-4" />
            Añadir
          </Button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {/* Video / Thumbnail */}
      <div className="bg-muted relative aspect-video">
        {ejercicio.videoUrl ? (
          <Dialog open={showVideo} onOpenChange={setShowVideo}>
            <DialogTrigger asChild>
              <button className="from-primary/20 to-primary/5 hover:from-primary/30 flex size-full items-center justify-center bg-gradient-to-br transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary/20 rounded-full p-3">
                    <Play className="text-primary size-8" />
                  </div>
                  <span className="text-muted-foreground text-xs">Ver vídeo</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{ejercicio.nombre}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video">
                <iframe
                  src={ejercicio.videoUrl}
                  className="size-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex size-full items-center justify-center">
            <Dumbbell className="text-muted-foreground/50 size-12" />
          </div>
        )}
        {/* Badge nivel */}
        <Badge
          variant="secondary"
          className={cn("absolute top-2 right-2 text-xs", getNivelBadgeClass(ejercicio.nivel))}
        >
          {getNivelLabel(ejercicio.nivel)}
        </Badge>
        {ejercicio.videoUrl && (
          <Badge variant="secondary" className="absolute top-2 left-2 gap-1 text-xs">
            <Video className="size-3" />
            Video
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-base">{ejercicio.nombre}</CardTitle>
        {ejercicio.nombreIngles && (
          <CardDescription className="line-clamp-1 text-xs">{ejercicio.nombreIngles}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            {getGrupoMuscularLabel(ejercicio.grupoMuscular)}
          </Badge>
          {ejercicio.gruposSecundarios?.slice(0, 2).map((grupo) => (
            <Badge key={grupo} variant="secondary" className="text-xs">
              {getGrupoMuscularLabel(grupo)}
            </Badge>
          ))}
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-1.5 text-xs">
          {ejercicio.material.map((mat) => (
            <span key={mat} className="bg-muted rounded px-2 py-0.5">
              {getMaterialLabel(mat)}
            </span>
          ))}
        </div>

        {sustituciones.length > 0 && (
          <div className="text-primary flex items-center gap-1 text-xs">
            <ArrowLeftRight className="size-3" />
            {sustituciones.length} sustitución(es) disponible(s)
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <EjercicioDetailDialog ejercicio={ejercicio} sustituciones={sustituciones} />
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onSelect?.(ejercicio)}>
            <Plus className="mr-1 size-4" />
            Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EjercicioDetailDialogProps {
  ejercicio: Ejercicio;
  sustituciones: Array<{
    ejercicioSustitutoId: string;
    ejercicioSustitutoNombre: string;
    razon: string;
    equivalencia: number;
    notas?: string;
    ejercicio?: Ejercicio;
  }>;
}

function EjercicioDetailDialog({ ejercicio, sustituciones }: EjercicioDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="mr-1 size-4" />
          Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ejercicio.nombre}
            <Badge className={cn("ml-2", getNivelBadgeClass(ejercicio.nivel))}>{getNivelLabel(ejercicio.nivel)}</Badge>
          </DialogTitle>
          {ejercicio.nombreIngles && <DialogDescription>{ejercicio.nombreIngles}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">
                Información
              </TabsTrigger>
              <TabsTrigger value="sustituciones" className="flex-1">
                Sustituciones ({sustituciones.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              {ejercicio.descripcion && (
                <div>
                  <h4 className="mb-1 font-semibold">Descripción</h4>
                  <p className="text-muted-foreground text-sm">{ejercicio.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Músculos</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>{getGrupoMuscularLabel(ejercicio.grupoMuscular)}</Badge>
                    {ejercicio.gruposSecundarios?.map((g) => (
                      <Badge key={g} variant="secondary">
                        {getGrupoMuscularLabel(g)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Material</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ejercicio.material.map((m) => (
                      <Badge key={m} variant="outline">
                        {getMaterialLabel(m)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {ejercicio.instrucciones && ejercicio.instrucciones.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Instrucciones</h4>
                  <ol className="text-muted-foreground list-inside list-decimal space-y-1.5 text-sm">
                    {ejercicio.instrucciones.map((instr, i) => (
                      <li key={i}>{instr}</li>
                    ))}
                  </ol>
                </div>
              )}

              {ejercicio.erroresComunes && ejercicio.erroresComunes.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-amber-600">Errores comunes</h4>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                    {ejercicio.erroresComunes.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {ejercicio.videoUrl && (
                <div>
                  <h4 className="mb-2 font-semibold">Vídeo demostrativo</h4>
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={ejercicio.videoUrl}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sustituciones" className="mt-4 space-y-3">
              {sustituciones.length > 0 ? (
                sustituciones.map((sust) => (
                  <div key={sust.ejercicioSustitutoId} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="text-primary size-4" />
                        <span className="font-medium">{sust.ejercicioSustitutoNombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {sust.equivalencia}% equivalente
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {sust.razon}
                        </Badge>
                      </div>
                    </div>
                    {sust.notas && <p className="text-muted-foreground text-sm">{sust.notas}</p>}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <ArrowLeftRight className="mx-auto mb-2 size-8 opacity-50" />
                  <p>No hay sustituciones definidas para este ejercicio</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function BibliotecaEjercicios() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("todos");
  const [filtroMaterial, setFiltroMaterial] = useState<string>("todos");
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [soloConVideo, setSoloConVideo] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const ejerciciosFiltrados = useMemo(() => {
    let resultado = [...ejerciciosData];

    // Búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (e) =>
          e.nombre.toLowerCase().includes(searchLower) ||
          e.nombreIngles?.toLowerCase().includes(searchLower) ||
          e.etiquetas?.some((t) => t.toLowerCase().includes(searchLower)),
      );
    }

    // Filtro grupo muscular
    if (filtroGrupo !== "todos") {
      resultado = resultado.filter(
        (e) => e.grupoMuscular === filtroGrupo || e.gruposSecundarios?.includes(filtroGrupo as GrupoMuscular),
      );
    }

    // Filtro material
    if (filtroMaterial !== "todos") {
      resultado = resultado.filter((e) => e.material.includes(filtroMaterial as TipoMaterial));
    }

    // Filtro nivel
    if (filtroNivel !== "todos") {
      resultado = resultado.filter((e) => e.nivel === filtroNivel);
    }

    // Solo con video
    if (soloConVideo) {
      resultado = resultado.filter((e) => e.videoUrl);
    }

    return resultado;
  }, [busqueda, filtroGrupo, filtroMaterial, filtroNivel, soloConVideo]);

  const handleSelectEjercicio = (ejercicio: Ejercicio) => {
    // TODO: Integrar con backend - añadir ejercicio a rutina
    console.log("Ejercicio seleccionado:", ejercicio);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Biblioteca de Ejercicios</h3>
          <p className="text-muted-foreground text-sm">{ejerciciosFiltrados.length} ejercicios encontrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="size-4" />
          </Button>
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
            <List className="size-4" />
          </Button>
          <Button className="gap-2">
            <Plus className="size-4" />
            Nuevo ejercicio
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar ejercicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Grupo muscular" />
          </SelectTrigger>
          <SelectContent>
            {gruposMusculares.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroMaterial} onValueChange={setFiltroMaterial}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            {tiposMaterial.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroNivel} onValueChange={setFiltroNivel}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Nivel" />
          </SelectTrigger>
          <SelectContent>
            {nivelesDificultad.map((n) => (
              <SelectItem key={n.value} value={n.value}>
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={soloConVideo ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSoloConVideo(!soloConVideo)}
          className="gap-2"
        >
          <Video className="size-4" />
          Solo con vídeo
        </Button>
      </div>

      {/* Lista de ejercicios */}
      {ejerciciosFiltrados.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ejerciciosFiltrados.map((ejercicio) => (
              <EjercicioCard
                key={ejercicio.id}
                ejercicio={ejercicio}
                onSelect={handleSelectEjercicio}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {ejerciciosFiltrados.map((ejercicio) => (
              <EjercicioCard
                key={ejercicio.id}
                ejercicio={ejercicio}
                onSelect={handleSelectEjercicio}
                viewMode={viewMode}
              />
            ))}
          </div>
        )
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Dumbbell className="text-muted-foreground/50 mb-4 size-12" />
            <h3 className="font-semibold">No se encontraron ejercicios</h3>
            <p className="text-muted-foreground mt-1 text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </Card>
      )}
    </div>
  );
}
