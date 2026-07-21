"use client";

import { useEffect, useState } from "react";

import { Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CursoContenidoService, type FullTest, type TestQuestion } from "@/lib/services/curso-contenido-service";

interface Props {
  testId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const emptyQuestion = (): TestQuestion => ({
  question: "",
  explanation: "",
  options: [
    { text: "", correct: true },
    { text: "", correct: false },
  ],
});

export function TestEditorDialog({ testId, open, onOpenChange, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<Pick<FullTest, "title" | "kind"> | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  useEffect(() => {
    if (!open || !testId) return;
    setLoading(true);
    CursoContenidoService.getTest(testId)
      .then((t) => {
        setMeta({ title: t.title, kind: t.kind });
        setQuestions(t.questions.length ? t.questions : [emptyQuestion()]);
      })
      .catch((e) => toast.error(`No se pudo cargar el test: ${e.message}`))
      .finally(() => setLoading(false));
  }, [open, testId]);

  const updateQuestion = (qi: number, patch: Partial<TestQuestion>) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

  const updateOption = (qi: number, oi: number, patch: Partial<{ text: string; correct: boolean }>) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) } : q,
      ),
    );

  const setCorrect = (qi: number, oi: number) =>
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => ({ ...o, correct: j === oi })) } : q)),
    );

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);
  const removeQuestion = (qi: number) => setQuestions((qs) => qs.filter((_, i) => i !== qi));
  const addOption = (qi: number) =>
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, options: [...q.options, { text: "", correct: false }] } : q)),
    );
  const removeOption = (qi: number, oi: number) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q)));

  const validate = (): string | null => {
    if (!questions.length) return "Añade al menos una pregunta.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `La pregunta ${i + 1} está vacía.`;
      const opts = q.options.filter((o) => o.text.trim());
      if (opts.length < 2) return `La pregunta ${i + 1} necesita al menos 2 opciones.`;
      if (!q.options.some((o) => o.correct && o.text.trim()))
        return `Marca la opción correcta de la pregunta ${i + 1}.`;
    }
    return null;
  };

  const handleSave = async () => {
    if (!testId) return;
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const clean = questions.map((q, i) => ({
        question: q.question.trim(),
        priority: i + 1,
        explanation: q.explanation?.trim() || null,
        options: q.options
          .filter((o) => o.text.trim())
          .map((o, j) => ({ text: o.text.trim(), correct: !!o.correct, priority: j + 1 })),
      }));
      await CursoContenidoService.replaceTest(testId, clean);
      toast.success("Test guardado");
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(`No se pudo guardar: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar test
            {meta?.kind && (
              <Badge variant="secondary">
                {meta.kind === "class" ? "Clase" : meta.kind === "module" ? "Módulo" : "Final"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {meta?.title ?? "Preguntas de opción única. Marca una respuesta correcta por pregunta."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-muted-foreground flex items-center justify-center py-16">
            <Loader2 className="mr-2 size-5 animate-spin" /> Cargando…
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start gap-2">
                  <Badge variant="outline" className="mt-1 shrink-0">
                    {qi + 1}
                  </Badge>
                  <Textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                    placeholder="Enunciado de la pregunta"
                    className="min-h-10 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => removeQuestion(qi)}
                    aria-label="Eliminar pregunta"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-2 pl-8">
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrect(qi, oi)}
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                          o.correct ? "border-green-600 text-green-600" : "border-muted-foreground/40 text-transparent"
                        }`}
                        aria-label="Marcar como correcta"
                        title="Marcar como correcta"
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                      <Input
                        value={o.text}
                        onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                        placeholder={`Opción ${String.fromCharCode(65 + oi)}`}
                        className={o.correct ? "border-green-600/50" : ""}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        onClick={() => removeOption(qi, oi)}
                        disabled={q.options.length <= 2}
                        aria-label="Eliminar opción"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-fit gap-1" onClick={() => addOption(qi)}>
                    <Plus className="size-3" /> Añadir opción
                  </Button>

                  <div className="mt-2">
                    <Label className="text-muted-foreground text-xs">Explicación (feedback tras responder)</Label>
                    <Textarea
                      value={q.explanation ?? ""}
                      onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                      placeholder="Por qué es correcta (opcional)"
                      className="mt-1 min-h-10"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="gap-2" onClick={addQuestion}>
              <Plus className="size-4" /> Añadir pregunta
            </Button>
          </div>
        )}

        <Separator />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Guardar test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
