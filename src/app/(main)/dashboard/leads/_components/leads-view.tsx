"use client";

import { useEffect, useMemo, useState } from "react";

import { LayoutList, KanbanSquare, RefreshCcw, Search, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { BrandTabs } from "@/components/brand-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads, useUpdateLead } from "@/hooks/use-leads";
import {
  LEADS_API_READY,
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  LEAD_STATES,
  type Lead,
  type LeadObjection,
  type LeadSource,
  type LeadState,
} from "@/lib/services/leads-service";

import { CreateLeadDialog } from "./create-lead-dialog";
import { ImportCsvDialog } from "./import-csv-dialog";
import { LeadPanel } from "./lead-panel";
import { LeadsKanban } from "./leads-kanban";
import { LeadsRepesca } from "./leads-repesca";
import { LeadsTable } from "./leads-table";

const VIEW_TABS = [
  { id: "tabla", label: "Tabla", icon: <LayoutList className="size-4" /> },
  { id: "pipeline", label: "Pipeline comercial", icon: <KanbanSquare className="size-4" /> },
  { id: "repesca", label: "Repesca", icon: <RefreshCcw className="size-4" /> },
];

export function LeadsView() {
  const [view, setView] = useState("tabla");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<LeadSource | "all">("all");
  const [state, setState] = useState<LeadState | "all">("all");
  const [setter, setSetter] = useState<string>("all");
  const [closer, setCloser] = useState<string>("all");

  // `?demo=1` fuerza los datos de ejemplo (revisar Fase 10 antes de Fase 9).
  // Se lee tras montar para no desincronizar la hidratación SSR.
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    setDemo(new URLSearchParams(window.location.search).has("demo"));
  }, []);

  const [selected, setSelected] = useState<Lead | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // UN solo listado: origen y setter/closer son FILTROS, no tableros. La tabla
  // filtra además por estado; en los kanbans el estado lo marcan las columnas
  // (pipeline) o el par Perdido/Seguimiento (repesca).
  const query = useMemo(
    () => ({ search, source, state: view === "tabla" ? state : ("all" as const), demo }),
    [search, source, state, view, demo],
  );
  const { data: leads = [], isLoading } = useLeads(query);
  const updateLead = useUpdateLead();

  // setter/closer aún no viajan a la API (fuera del contrato de Fase 9): se
  // filtran en cliente y los selectores solo aparecen si algún lead los trae.
  const setterOptions = useMemo(() => [...new Set(leads.map((l) => l.setter).filter(Boolean))] as string[], [leads]);
  const closerOptions = useMemo(() => [...new Set(leads.map((l) => l.closer).filter(Boolean))] as string[], [leads]);

  const visibleLeads = useMemo(() => {
    let out = leads;
    if (setter !== "all") out = out.filter((l) => l.setter === setter);
    if (closer !== "all") out = out.filter((l) => l.closer === closer);
    // Fecha de ingreso DESC: las nuevas arriba (tabla y tarjetas kanban).
    return [...out].sort((a, b) => new Date(b.intake_date).getTime() - new Date(a.intake_date).getTime());
  }, [leads, setter, closer]);

  // Mantener sincronizado el lead abierto en el panel con los datos frescos.
  const openLead = selected ? (leads.find((l) => l.id === selected.id) ?? selected) : null;

  const handleOpen = (lead: Lead) => {
    setSelected(lead);
    setPanelOpen(true);
  };

  const handleMove = (id: string, newState: LeadState) => {
    updateLead.mutate(
      { id, patch: { state: newState } },
      { onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo mover el lead") },
    );
  };

  const handleSetObjection = (id: string, objection: LeadObjection) => {
    updateLead.mutate(
      { id, patch: { objection } },
      { onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo cambiar la objeción") },
    );
  };

  return (
    <div className="@container/main flex flex-col gap-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">CRM · Leads</h1>
          <p className="text-muted-foreground text-sm">
            Pipeline de captación desde web e Instagram: contacta, agenda, cierra… y repesca.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" />
            Importar CSV
          </Button>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <UserPlus className="size-4" />
            Nuevo lead
          </Button>
        </div>
      </div>

      {!LEADS_API_READY && (
        <div className="rounded-md border border-dashed bg-[#FFEDE0]/40 px-4 py-2.5 text-sm text-[#8a3d06]">
          Datos de ejemplo: el backend de leads (<code>/admin-panel/leads</code>) aún no está desplegado. Todo (tabla,
          kanban, notas, importación) queda listo para encender con <code>LEADS_API_READY = true</code>.
        </div>
      )}
      {LEADS_API_READY && demo && (
        <div className="rounded-md border border-dashed bg-[#FFEDE0]/40 px-4 py-2.5 text-sm text-[#8a3d06]">
          Vista de demostración (<code>?demo=1</code>): datos de ejemplo en memoria, no se toca la API real. Quita el
          parámetro de la URL para volver a los leads reales.
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
          <Input
            placeholder="Buscar por nombre, email, teléfono o interés…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={source} onValueChange={(v: LeadSource | "all") => setSource(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los orígenes</SelectItem>
            {LEAD_SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_SOURCE_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {setterOptions.length > 0 && (
          <Select value={setter} onValueChange={setSetter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Setter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los setters</SelectItem>
              {setterOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {closerOptions.length > 0 && (
          <Select value={closer} onValueChange={setCloser}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Closer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los closers</SelectItem>
              {closerOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={state} onValueChange={(v: LeadState | "all") => setState(v)} disabled={view !== "tabla"}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {LEAD_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <BrandTabs tabs={VIEW_TABS} active={view} onChange={setView} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : view === "tabla" ? (
        <Card>
          <CardContent className="pt-6">
            <LeadsTable leads={visibleLeads} onOpen={handleOpen} />
          </CardContent>
        </Card>
      ) : view === "pipeline" ? (
        <LeadsKanban leads={visibleLeads} onMove={handleMove} onOpen={handleOpen} />
      ) : (
        <LeadsRepesca leads={visibleLeads} onSetObjection={handleSetObjection} onOpen={handleOpen} />
      )}

      <LeadPanel lead={openLead} open={panelOpen} onOpenChange={setPanelOpen} />
      <ImportCsvDialog open={importOpen} onOpenChange={setImportOpen} demo={demo} />
      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} demo={demo} />
    </div>
  );
}
