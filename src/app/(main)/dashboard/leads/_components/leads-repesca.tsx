"use client";

import { useMemo, useState } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CalendarDays, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  LEAD_OBJECTIONS,
  LEAD_OBJECTION_LABEL,
  REPESCA_STATES,
  leadsToCsv,
  type Lead,
  type LeadObjection,
} from "@/lib/services/leads-service";
import { cn } from "@/lib/utils";

import { LeadSourceBadge, LeadStateBadge } from "./lead-badges";

interface LeadsRepescaProps {
  /** Lista completa (ya filtrada por búsqueda/origen); aquí se queda solo Perdido/Seguimiento. */
  leads: Lead[];
  onSetObjection: (id: string, objection: LeadObjection) => void;
  onOpen: (lead: Lead) => void;
}

/** Colores por objeción (paleta de marca + neutros). */
const OBJECTION_STYLES: Record<LeadObjection, string> = {
  precio: "border-t-[#FF690B]",
  timing: "border-t-amber-500",
  confianza: "border-t-[#363C98]",
  otros: "border-t-slate-400",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

function RepescaCard({
  lead,
  selected,
  onToggle,
  onOpen,
  dragging,
}: {
  lead: Lead;
  selected?: boolean;
  onToggle?: (id: string, checked: boolean) => void;
  onOpen?: (l: Lead) => void;
  dragging?: boolean;
}) {
  const days = daysSince(lead.intake_date);
  return (
    <div
      className={cn(
        "bg-card w-full rounded-lg border p-3 text-left shadow-sm transition-shadow hover:shadow-md",
        dragging && "rotate-1 shadow-lg",
        selected && "ring-primary/50 ring-2",
      )}
    >
      <div className="flex items-start gap-2">
        {onToggle && (
          <Checkbox
            checked={selected}
            onCheckedChange={(c) => onToggle(lead.id, c === true)}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Seleccionar ${lead.name}`}
            className="mt-0.5"
          />
        )}
        <button type="button" onClick={() => onOpen?.(lead)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold">{lead.name}</p>
          {lead.interest && <p className="text-muted-foreground mt-0.5 truncate text-xs">{lead.interest}</p>}
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <LeadStateBadge state={lead.state} className="px-1.5 py-0 text-[11px]" />
        <LeadSourceBadge source={lead.source} />
      </div>
      <p
        className={cn(
          "text-muted-foreground mt-1.5 flex items-center gap-1 text-[11px]",
          days > 30 && "text-[#FF690B]",
        )}
      >
        <CalendarDays className="size-3" />
        Alta {new Date(lead.intake_date).toLocaleDateString("es-ES")} · hace {days} día{days === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function DraggableRepescaCard(props: {
  lead: Lead;
  selected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onOpen: (l: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: props.lead.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <RepescaCard {...props} />
    </div>
  );
}

function ObjectionColumn({
  objection,
  leads,
  selectedIds,
  onToggle,
  onToggleAll,
  onOpen,
}: {
  objection: LeadObjection;
  leads: Lead[];
  selectedIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  onOpen: (l: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: objection });
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-muted/40 flex w-72 shrink-0 flex-col rounded-xl border-t-4 p-2 transition-colors",
        OBJECTION_STYLES[objection],
        isOver && "bg-muted ring-primary/40 ring-2",
      )}
    >
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(c) =>
              onToggleAll(
                leads.map((l) => l.id),
                c === true,
              )
            }
            aria-label={`Seleccionar toda la columna ${LEAD_OBJECTION_LABEL[objection]}`}
            disabled={leads.length === 0}
          />
          {LEAD_OBJECTION_LABEL[objection]}
        </span>
        <span className="text-muted-foreground bg-background rounded-full px-2 py-0.5 text-xs font-medium">
          {leads.length}
        </span>
      </div>
      <div className="flex min-h-[120px] flex-col gap-2 p-1">
        {leads.map((l) => (
          <DraggableRepescaCard
            key={l.id}
            lead={l}
            selected={selectedIds.has(l.id)}
            onToggle={onToggle}
            onOpen={onOpen}
          />
        ))}
        {leads.length === 0 && <p className="text-muted-foreground/70 px-2 py-6 text-center text-xs">Sin leads</p>}
      </div>
    </div>
  );
}

/**
 * Kanban «Repesca»: solo leads en Perdido/Seguimiento, agrupados por OBJECIÓN
 * (los sin clasificar caen en «Otros»). Arrastrar entre columnas cambia la
 * objeción. Selección con checkbox + export CSV para campañas de recuperación,
 * con filtro «>30 días» sobre la fecha de ingreso.
 */
export function LeadsRepesca({ leads, onSetObjection, onOpen }: LeadsRepescaProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [olderThan30, setOlderThan30] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const repescaLeads = useMemo(() => {
    let out = leads.filter((l) => REPESCA_STATES.includes(l.state));
    if (olderThan30) out = out.filter((l) => daysSince(l.intake_date) > 30);
    return out;
  }, [leads, olderThan30]);

  const byObjection = useMemo(() => {
    const map = Object.fromEntries(LEAD_OBJECTIONS.map((o) => [o, [] as Lead[]])) as Record<LeadObjection, Lead[]>;
    // Sin objeción clasificada → «Otros», para que ningún lead quede fuera.
    for (const l of repescaLeads) map[l.objection ?? "otros"].push(l);
    return map;
  }, [repescaLeads]);

  const selectedLeads = repescaLeads.filter((l) => selectedIds.has(l.id));

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleAll = (ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const handleExport = () => {
    if (selectedLeads.length === 0) return;
    const csv = leadsToCsv(selectedLeads);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `repesca-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${selectedLeads.length} lead(s) exportados a CSV`);
  };

  const activeLead = activeId ? (repescaLeads.find((l) => l.id === activeId) ?? null) : null;

  const handleStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const target = over.id as LeadObjection;
    const lead = repescaLeads.find((l) => l.id === active.id);
    if (lead && LEAD_OBJECTIONS.includes(target) && (lead.objection ?? "otros") !== target) {
      onSetObjection(lead.id, target);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de campaña: filtro >30 días + export de la selección */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch id="repesca-30d" checked={olderThan30} onCheckedChange={setOlderThan30} />
          <Label htmlFor="repesca-30d" className="cursor-pointer text-sm">
            Solo &gt;30 días desde el alta
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            {selectedLeads.length > 0
              ? `${selectedLeads.length} seleccionado${selectedLeads.length === 1 ? "" : "s"}`
              : "Selecciona leads para exportar"}
          </span>
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={selectedLeads.length === 0}>
            <Download className="size-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleStart} onDragEnd={handleEnd}>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {LEAD_OBJECTIONS.map((o) => (
            <ObjectionColumn
              key={o}
              objection={o}
              leads={byObjection[o]}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
              onOpen={onOpen}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? (
            <div className="w-72">
              <RepescaCard lead={activeLead} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
