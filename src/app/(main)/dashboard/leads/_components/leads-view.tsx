"use client";

import { useMemo, useState } from "react";

import { LayoutList, KanbanSquare, Search, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { BrandTabs } from "@/components/brand-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads, useUpdateLeadState } from "@/hooks/use-leads";
import {
  LEADS_API_READY,
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  LEAD_STATES,
  type Lead,
  type LeadSource,
  type LeadState,
} from "@/lib/services/leads-service";

import { CreateLeadDialog } from "./create-lead-dialog";
import { ImportCsvDialog } from "./import-csv-dialog";
import { LeadPanel } from "./lead-panel";
import { LeadsKanban } from "./leads-kanban";
import { LeadsTable } from "./leads-table";

const VIEW_TABS = [
  { id: "tabla", label: "Tabla", icon: <LayoutList className="size-4" /> },
  { id: "kanban", label: "Kanban", icon: <KanbanSquare className="size-4" /> },
];

export function LeadsView() {
  const [view, setView] = useState("tabla");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<LeadSource | "all">("all");
  const [state, setState] = useState<LeadState | "all">("all");

  const [selected, setSelected] = useState<Lead | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // La tabla filtra por los tres criterios; el kanban filtra por búsqueda y
  // origen (el estado es el eje de las columnas, así que ahí no se aplica).
  const query = useMemo(
    () => ({ search, source, state: view === "kanban" ? ("all" as const) : state }),
    [search, source, state, view],
  );
  const { data: leads = [], isLoading } = useLeads(query);
  const updateState = useUpdateLeadState();

  // Mantener sincronizado el lead abierto en el panel con los datos frescos.
  const openLead = selected ? (leads.find((l) => l.id === selected.id) ?? selected) : null;

  const handleOpen = (lead: Lead) => {
    setSelected(lead);
    setPanelOpen(true);
  };

  const handleMove = (id: string, newState: LeadState) => {
    updateState.mutate(
      { id, state: newState },
      { onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo mover el lead") },
    );
  };

  return (
    <div className="@container/main flex flex-col gap-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">CRM · Leads</h1>
          <p className="text-muted-foreground text-sm">
            Pipeline de captación desde web e Instagram: contacta, agenda y cierra.
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
        <Select value={state} onValueChange={(v: LeadState | "all") => setState(v)} disabled={view === "kanban"}>
          <SelectTrigger className="w-[150px]">
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
            <LeadsTable leads={leads} onOpen={handleOpen} />
          </CardContent>
        </Card>
      ) : (
        <LeadsKanban leads={leads} onMove={handleMove} onOpen={handleOpen} />
      )}

      <LeadPanel lead={openLead} open={panelOpen} onOpenChange={setPanelOpen} />
      <ImportCsvDialog open={importOpen} onOpenChange={setImportOpen} />
      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
