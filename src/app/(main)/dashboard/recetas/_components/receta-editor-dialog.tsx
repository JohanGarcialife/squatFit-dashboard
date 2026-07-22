"use client";

import { useEffect, useState } from "react";

import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RecetasAdminService,
  type AdminRecipe,
  type RecipeIngredient,
  type RecipeInput,
} from "@/lib/services/recetas-admin-service";

interface RecetaEditorDialogProps {
  open: boolean;
  /** null = crear nueva. */
  recipe: AdminRecipe | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
}

const EMPTY_ING: RecipeIngredient = { name: "", quantity: "" };

export function RecetaEditorDialog({ open, recipe, onOpenChange, onSaved }: RecetaEditorDialogProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [servings, setServings] = useState("");
  const [kcal, setKcal] = useState("");
  const [carbs, setCarbs] = useState("");
  const [proteins, setProteins] = useState("");
  const [fats, setFats] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([{ ...EMPTY_ING }]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [materials, setMaterials] = useState<string[]>([]);

  // Rellenar el formulario al abrir (crear → vacío, editar → receta).
  useEffect(() => {
    if (!open) return;
    setName(recipe?.name ?? "");
    setDescription(recipe?.description ?? "");
    setDuration(recipe?.duration_minutes != null ? String(recipe.duration_minutes) : "");
    setServings(recipe?.servings != null ? String(recipe.servings) : "");
    setKcal(recipe ? String(recipe.kcal) : "");
    setCarbs(recipe ? String(recipe.carbohydrates) : "");
    setProteins(recipe ? String(recipe.proteins) : "");
    setFats(recipe ? String(recipe.fats) : "");
    setIngredients(
      recipe && recipe.ingredients.length > 0 ? recipe.ingredients.map((i) => ({ ...i })) : [{ ...EMPTY_ING }],
    );
    setSteps(recipe && recipe.preparation_steps.length > 0 ? [...recipe.preparation_steps] : [""]);
    setMaterials(recipe ? [...recipe.materials] : []);
  }, [open, recipe]);

  const num = (v: string) => (v.trim() === "" ? 0 : Math.max(0, Number(v)));

  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("La receta necesita un nombre");
      return;
    }
    const cleanIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
      .filter((i) => i.name);
    if (cleanIngredients.length === 0) {
      toast.error("Añade al menos un ingrediente");
      return;
    }
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    if (cleanSteps.length === 0) {
      toast.error("Añade al menos un paso de preparación");
      return;
    }
    const input: RecipeInput = {
      name: cleanName,
      description: description.trim() || null,
      duration_minutes: duration.trim() === "" ? null : num(duration),
      servings: servings.trim() === "" ? null : num(servings),
      ingredients: cleanIngredients,
      preparation_steps: cleanSteps,
      materials: materials.map((m) => m.trim()).filter(Boolean),
      kcal: num(kcal),
      carbohydrates: num(carbs),
      proteins: num(proteins),
      fats: num(fats),
    };
    setSaving(true);
    try {
      if (recipe) {
        await RecetasAdminService.updateRecipe(recipe.id, input);
        toast.success("Receta guardada");
      } else {
        await RecetasAdminService.createRecipe(input);
        toast.success("Receta creada");
      }
      await onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return;
    const arr = [...steps];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setSteps(arr);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recipe ? `Editar «${recipe.name}»` : "Nueva receta"}</DialogTitle>
          <DialogDescription>Duración, ingredientes, preparación, materiales y macros por ración.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Datos generales */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="receta-nombre">Nombre *</Label>
              <Input
                id="receta-nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bowl de pollo, arroz y verduras"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="receta-descripcion">Descripción</Label>
              <Textarea
                id="receta-descripcion"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción que ve el cliente"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receta-duracion">Duración (min)</Label>
              <Input
                id="receta-duracion"
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="25"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receta-raciones">Raciones</Label>
              <Input
                id="receta-raciones"
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="2"
              />
            </div>
          </div>

          {/* Macros */}
          <div className="flex flex-col gap-2">
            <Label>Macros por ración</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["Kcal", kcal, setKcal],
                  ["Carbohidratos (g)", carbs, setCarbs],
                  ["Proteínas (g)", proteins, setProteins],
                  ["Grasas (g)", fats, setFats],
                ] as const
              ).map(([label, value, set]) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <Input type="number" min={0} value={value} onChange={(e) => set(e.target.value)} placeholder="0" />
                </div>
              ))}
            </div>
          </div>

          {/* Ingredientes */}
          <div className="flex flex-col gap-2">
            <Label>Ingredientes *</Label>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={ing.name}
                  onChange={(e) =>
                    setIngredients(ingredients.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  placeholder="Ingrediente"
                  className="flex-1"
                />
                <Input
                  value={ing.quantity}
                  onChange={(e) =>
                    setIngredients(ingredients.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))
                  }
                  placeholder="Cantidad (200 g)"
                  className="w-36"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-red-600"
                  onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                  disabled={ingredients.length === 1}
                  aria-label="Quitar ingrediente"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-fit gap-1"
              onClick={() => setIngredients([...ingredients, { ...EMPTY_ING }])}
            >
              <Plus className="size-3" /> Añadir ingrediente
            </Button>
          </div>

          {/* Preparación */}
          <div className="flex flex-col gap-2">
            <Label>Preparación (pasos en orden) *</Label>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="bg-muted text-muted-foreground mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {i + 1}
                </span>
                <Textarea
                  value={step}
                  onChange={(e) => setSteps(steps.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Paso ${i + 1}`}
                  rows={1}
                  className="min-h-9 flex-1"
                />
                <div className="flex shrink-0 flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5"
                    disabled={i === 0}
                    onClick={() => moveStep(i, -1)}
                    aria-label="Subir paso"
                  >
                    <ChevronUp className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5"
                    disabled={i === steps.length - 1}
                    onClick={() => moveStep(i, 1)}
                    aria-label="Bajar paso"
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-red-600"
                  onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                  disabled={steps.length === 1}
                  aria-label="Quitar paso"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-fit gap-1" onClick={() => setSteps([...steps, ""])}>
              <Plus className="size-3" /> Añadir paso
            </Button>
          </div>

          {/* Materiales */}
          <div className="flex flex-col gap-2">
            <Label>Materiales / utensilios</Label>
            {materials.length === 0 && (
              <p className="text-muted-foreground text-xs">Sin materiales. Añade sartén, batidora, horno…</p>
            )}
            {materials.map((mat, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={mat}
                  onChange={(e) => setMaterials(materials.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder="Sartén antiadherente"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-red-600"
                  onClick={() => setMaterials(materials.filter((_, j) => j !== i))}
                  aria-label="Quitar material"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-fit gap-1" onClick={() => setMaterials([...materials, ""])}>
              <Plus className="size-3" /> Añadir material
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {recipe ? "Guardar cambios" : "Crear receta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
