"use client";

import { useState } from "react";

import { Mail, Phone, Clock, StickyNote, Send, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAddLeadNote, useUpdateLeadState } from "@/hooks/use-leads";
import { LEAD_STATES, type Lead, type LeadState } from "@/lib/services/leads-service";

import { LeadSourceBadge, LeadStateBadge } from "./lead-badges";

interface LeadPanelProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      {icon}
      <span className="text-foreground">{children}</span>
    </div>
  );
}

export function LeadPanel({ lead, open, onOpenChange }: LeadPanelProps) {
  const updateState = useUpdateLeadState();
  const addNote = useAddLeadNote();
  const [noteDraft, setNoteDraft] = useState("");

  if (!lead) return null;

  const handleState = (state: LeadState) => {
    updateState.mutate(
      { id: lead.id, state },
      {
        onSuccess: () => toast.success(`Estado → ${state}`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  };

  const handleAddNote = () => {
    if (!noteDraft.trim()) return;
    addNote.mutate(
      { id: lead.id, body: noteDraft.trim() },
      {
        onSuccess: () => {
          setNoteDraft("");
          toast.success("Nota añadida");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl">{lead.name}</SheetTitle>
          <SheetDescription className="flex items-center gap-3">
            <LeadSourceBadge source={lead.source} />
            <LeadStateBadge state={lead.state} />
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 py-4">
          {/* Datos de contacto */}
          <div className="space-y-2">
            {lead.email && <InfoRow icon={<Mail className="size-4" />}>{lead.email}</InfoRow>}
            {lead.phone && <InfoRow icon={<Phone className="size-4" />}>{lead.phone}</InfoRow>}
            {lead.interest && <InfoRow icon={<Tag className="size-4" />}>{lead.interest}</InfoRow>}
            <InfoRow icon={<Clock className="size-4" />}>
              Alta {new Date(lead.created_at).toLocaleDateString("es-ES")}
            </InfoRow>
          </div>

          <Separator />

          {/* Cambio de estado */}
          <div className="space-y-2">
            <Label>Estado del pipeline</Label>
            <Select
              value={lead.state}
              onValueChange={(v: LeadState) => handleState(v)}
              disabled={updateState.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Notas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <StickyNote className="size-4" />
              Notas
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Escribe una nota…"
                className="min-h-[60px] resize-none"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
              <Button
                size="icon"
                onClick={handleAddNote}
                disabled={!noteDraft.trim() || addNote.isPending}
                aria-label="Añadir nota"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {lead.notes.length === 0 && <p className="text-muted-foreground text-xs">Sin notas todavía.</p>}
              {lead.notes.map((n) => (
                <div key={n.id} className="bg-muted/40 rounded-md border p-2.5 text-sm">
                  <p>{n.body}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {n.author ?? "Staff"} · {new Date(n.created_at).toLocaleString("es-ES")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Historial */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4" />
              Historial
            </div>
            <ol className="relative space-y-3 border-l pl-4">
              {lead.history
                .slice()
                .reverse()
                .map((h) => (
                  <li key={h.id} className="relative">
                    <span className="bg-primary absolute top-1 -left-[21px] size-2 rounded-full" />
                    <p className="text-sm">
                      {h.event}
                      {h.from_state && h.to_state && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({h.from_state} → {h.to_state})
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs">{new Date(h.created_at).toLocaleString("es-ES")}</p>
                  </li>
                ))}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
