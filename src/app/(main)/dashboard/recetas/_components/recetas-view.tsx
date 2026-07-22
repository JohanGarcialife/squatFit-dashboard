"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ChefHat,
  Clock,
  Flame,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RECIPES_API_READY, RecetasAdminService, type AdminRecipe } from "@/lib/services/recetas-admin-service";

import { RecetaEditorDialog } from "./receta-editor-dialog";

/** Píldora de un macro (kcal / HC / P / G). */
function MacroBadge({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value}
        {unit ?? "g"}
      </span>
    </Badge>
  );
}

export function RecetasView() {
  const [recipes, setRecipes] = useState<AdminRecipe[] | null>(null);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<{ open: boolean; recipe: AdminRecipe | null }>({ open: false, recipe: null });

  const load = useCallback(async () => {
    try {
      setRecipes(await RecetasAdminService.getRecipes());
    } catch (e) {
      toast.error(`No se pudieron cargar las recetas: ${(e as Error).message}`);
      setRecipes([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!recipes) return null;
    const q = search.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q)),
    );
  }, [recipes, search]);

  const remove = (r: AdminRecipe) => {
    if (!confirm(`¿Eliminar la receta «${r.name}»?`)) return;
    void (async () => {
      try {
        await RecetasAdminService.deleteRecipe(r.id);
        toast.success("Receta eliminada");
        await load();
      } catch (e) {
        toast.error((e as Error).message);
      }
    })();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
            <ChefHat className="size-7" /> Recetas
          </h1>
          <p className="text-muted-foreground">
            Editor del banco de recetas: duración, ingredientes, preparación, materiales y macros.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setEditor({ open: true, recipe: null })}>
          <Plus className="size-4" /> Nueva receta
        </Button>
      </div>

      {!RECIPES_API_READY && (
        <Alert>
          <TriangleAlert className="size-4" />
          <AlertTitle>Modo demostración</AlertTitle>
          <AlertDescription>
            Los endpoints <code>admin-panel/recipes/*</code> aún no existen en producción (sondeado 22-jul: 404). Se
            muestra un banco de ejemplo y los cambios no se guardan. Al desplegar el backend, poner
            <code> RECIPES_API_READY = true</code> en <code>recetas-admin-service.ts</code> (contrato en
            INFORME-FASE-17).
          </AlertDescription>
        </Alert>
      )}

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o ingrediente…"
          className="pl-9"
        />
      </div>

      {filtered === null ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
            <UtensilsCrossed className="size-8" />
            {search ? "Ninguna receta coincide con la búsqueda." : "Todavía no hay recetas. Crea la primera."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start justify-between gap-2 text-base">
                  <span>{r.name}</span>
                  <span className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setEditor({ open: true, recipe: r })}
                      aria-label={`Editar ${r.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-600"
                      onClick={() => remove(r)}
                      aria-label={`Eliminar ${r.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </span>
                </CardTitle>
                {r.description && <p className="text-muted-foreground text-sm">{r.description}</p>}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 pt-2">
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {r.duration_minutes != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" /> {r.duration_minutes} min
                    </span>
                  )}
                  {r.servings != null && (
                    <span className="flex items-center gap-1">
                      <Users className="size-4" /> {r.servings} {r.servings === 1 ? "ración" : "raciones"}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <UtensilsCrossed className="size-4" /> {r.ingredients.length} ingredientes
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="gap-1 bg-[#FFEDE0] text-[#FF690B] dark:bg-[#FF690B]/20 dark:text-[#ffa266]">
                    <Flame className="size-3" /> {r.kcal} kcal
                  </Badge>
                  <MacroBadge label="HC" value={r.carbohydrates} />
                  <MacroBadge label="P" value={r.proteins} />
                  <MacroBadge label="G" value={r.fats} />
                </div>
              </CardContent>
              <CardFooter className="text-muted-foreground pt-0 text-xs">
                {r.preparation_steps.length} pasos ·{" "}
                {r.materials.length > 0 ? r.materials.join(", ") : "sin materiales"}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <RecetaEditorDialog
        open={editor.open}
        recipe={editor.recipe}
        onOpenChange={(open) => setEditor((s) => ({ ...s, open }))}
        onSaved={load}
      />
    </div>
  );
}
