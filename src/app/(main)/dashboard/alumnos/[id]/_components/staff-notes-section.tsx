"use client";

import { useCallback, useEffect, useState } from "react";

import { Loader2, NotebookPen, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_NOTES_API_READY, ClientNotesService, type StaffNote } from "@/lib/services/client-notes-service";

/** Notas internas del staff sobre el cliente (invisibles para el cliente). */
export function StaffNotesSection({ userId, authorRole }: { userId: string; authorRole: string | null }) {
  const [notes, setNotes] = useState<StaffNote[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setNotes(await ClientNotesService.getNotes(userId));
    } catch (e) {
      toast.error(`No se pudieron cargar las notas: ${(e as Error).message}`);
      setNotes([]);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    try {
      await ClientNotesService.addNote(userId, body, authorRole);
      setDraft("");
      await load();
      toast.success("Nota añadida");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (note: StaffNote) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    setBusy(true);
    try {
      await ClientNotesService.deleteNote(userId, note.id);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="size-5" /> Notas de staff
        </CardTitle>
        <CardDescription>Notas internas del equipo sobre este cliente. El cliente no las ve.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!CLIENT_NOTES_API_READY && (
          <p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
            El backend aún no expone <code>admin-panel/users/:id/notes</code>; estas notas viven solo en esta sesión y
            no se guardan (contrato propuesto en INFORME-FASE-17).
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe una nota interna sobre el cliente…"
            rows={3}
          />
          <Button className="w-fit gap-2 self-end" onClick={add} disabled={!draft.trim() || busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Añadir nota
          </Button>
        </div>
        {notes === null ? (
          <p className="text-muted-foreground text-sm">Cargando notas…</p>
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin notas todavía.</p>
        ) : (
          <div className="divide-y rounded-md border">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 p-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm whitespace-pre-wrap">{n.body}</p>
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    {new Date(n.created_at).toLocaleString("es-ES")}
                    {n.author_role && <Badge variant="outline">{n.author_role}</Badge>}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-red-600"
                  onClick={() => remove(n)}
                  disabled={busy}
                  aria-label="Eliminar nota"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
