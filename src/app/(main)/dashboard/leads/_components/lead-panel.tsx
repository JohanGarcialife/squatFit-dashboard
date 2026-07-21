"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Mail,
  Phone,
  Clock,
  StickyNote,
  Send,
  Tag,
  CalendarDays,
  UserCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAddLeadNote, useConvertLead, useUpdateLead } from "@/hooks/use-leads";
import {
  LEAD_CONVERT_READY,
  LEAD_OBJECTIONS,
  LEAD_OBJECTION_LABEL,
  LEAD_STATES,
  leadsV2WritesEnabled,
  type Lead,
  type LeadObjection,
  type LeadState,
} from "@/lib/services/leads-service";

import { LeadCustomerBadge, LeadSourceBadge, LeadStateBadge } from "./lead-badges";

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

/** Valor centinela del select de objeción para «sin clasificar». */
const NO_OBJECTION = "none";

export function LeadPanel({ lead, open, onOpenChange }: LeadPanelProps) {
  const updateLead = useUpdateLead();
  const convertLead = useConvertLead();
  const addNote = useAddLeadNote();
  const [noteDraft, setNoteDraft] = useState("");

  if (!lead) return null;

  const isSample = lead.id.startsWith("sample-");
  const v2Writes = isSample || leadsV2WritesEnabled();
  const canConvert = isSample || LEAD_CONVERT_READY;

  const handleState = (state: LeadState) => {
    updateLead.mutate(
      { id: lead.id, patch: { state } },
      {
        onSuccess: () => toast.success(`Estado → ${state}`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  };

  const handleObjection = (value: string) => {
    const objection = value === NO_OBJECTION ? null : (value as LeadObjection);
    updateLead.mutate(
      { id: lead.id, patch: { objection } },
      {
        onSuccess: () =>
          toast.success(objection ? `Objeción → ${LEAD_OBJECTION_LABEL[objection]}` : "Objeción retirada"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  };

  const handleConvert = () => {
    convertLead.mutate(lead.id, {
      onSuccess: (result) => {
        if (result.linked) {
          toast.success(`${lead.name} convertido en cliente ✅`);
        } else {
          // Ganado pero sin usuario enlazado: aviso claro (Fase 9.4).
          toast.warning(result.warning ?? "Convertido a ganado, pero sin usuario enlazado.", {
            duration: 8000,
          });
        }
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
    });
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
          <SheetDescription className="flex flex-wrap items-center gap-3">
            <LeadSourceBadge source={lead.source} />
            <LeadStateBadge state={lead.state} />
            {lead.is_customer && <LeadCustomerBadge />}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 py-4">
          {/* Datos de contacto */}
          <div className="space-y-2">
            {lead.email && <InfoRow icon={<Mail className="size-4" />}>{lead.email}</InfoRow>}
            {lead.phone && <InfoRow icon={<Phone className="size-4" />}>{lead.phone}</InfoRow>}
            {lead.interest && <InfoRow icon={<Tag className="size-4" />}>{lead.interest}</InfoRow>}
            {(lead.assigned ?? lead.setter ?? lead.closer) && (
              <InfoRow icon={<UserCheck className="size-4" />}>
                {lead.assigned
                  ? `Asignado: ${lead.assigned}`
                  : [lead.setter && `Setter: ${lead.setter}`, lead.closer && `Closer: ${lead.closer}`]
                      .filter(Boolean)
                      .join(" · ")}
              </InfoRow>
            )}
            <InfoRow icon={<CalendarDays className="size-4" />}>
              Alta {new Date(lead.intake_date).toLocaleDateString("es-ES")}
            </InfoRow>
          </div>

          {/* Conversión en cliente */}
          <Separator />
          <div className="space-y-2">
            {lead.is_customer ? (
              <div className="flex flex-wrap items-center gap-2">
                <LeadCustomerBadge />
                {lead.converted_user_id && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <Link href={`/dashboard/alumnos/${lead.converted_user_id}`}>
                      Ver ficha del cliente
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {lead.state === "Ganado" && (
                  <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                    Ganado sin cliente enlazado: no había un usuario con su email o teléfono. Reintenta el enlace cuando
                    el cliente cree su cuenta.
                  </p>
                )}
                <Button
                  className="w-full gap-2"
                  onClick={handleConvert}
                  disabled={!canConvert || convertLead.isPending}
                >
                  {convertLead.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UserCheck className="size-4" />
                  )}
                  {lead.state === "Ganado" ? "Reintentar enlace de cliente" : "Convertir en cliente"}
                </Button>
                {!canConvert && (
                  <p className="text-muted-foreground text-xs">
                    Se activará cuando el backend (Fase 9) publique <code>POST /admin-panel/leads/:id/convert</code>.
                  </p>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Cambio de estado */}
          <div className="space-y-2">
            <Label>Estado del pipeline</Label>
            <Select value={lead.state} onValueChange={(v: LeadState) => handleState(v)} disabled={updateLead.isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATES.map((s) => {
                  const v2Only = s === "Esperando pago" || s === "Seguimiento";
                  return (
                    <SelectItem key={s} value={s} disabled={v2Only && !v2Writes}>
                      {s}
                      {v2Only && !v2Writes ? " · Fase 9" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Objeción (repesca) */}
          <div className="space-y-2">
            <Label>Objeción de venta</Label>
            <Select
              value={lead.objection ?? NO_OBJECTION}
              onValueChange={handleObjection}
              disabled={updateLead.isPending || !v2Writes}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_OBJECTION}>Sin clasificar</SelectItem>
                {LEAD_OBJECTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {LEAD_OBJECTION_LABEL[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!v2Writes && (
              <p className="text-muted-foreground text-xs">
                Editable cuando el backend (Fase 9) publique el campo <code>objection</code>.
              </p>
            )}
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
