"use client";

import { useState } from "react";

import { BarChart3 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  KPIOverviewCards,
  KPICharts,
  // AlertsPanel, // ❌ NO CONECTADO - Comentado
  TicketsCauses,
  // NotificationsList, // ❌ NO CONECTADO - Comentado
  // XPTable, // ❌ NO CONECTADO - Comentado
  FiltersBar,
  ExportActions,
} from "./_components";
import type { FiltrosMarketing } from "./_components/schema";

export default function MarketingPage() {
  const [filtros, setFiltros] = useState<FiltrosMarketing>({});

  const handleFilterChange = (newFiltros: FiltrosMarketing) => {
    setFiltros(newFiltros);
    console.log("Filtros aplicados:", newFiltros);
    // Aquí se podría refrescar los datos con los nuevos filtros
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
            <BarChart3 className="text-primary size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Marketing y KPIs</h1>
            <p className="text-muted-foreground text-sm">Indicadores clave, notificaciones y sistema de puntos</p>
          </div>
        </div>
        <ExportActions filtros={filtros} />
      </div>

      {/* Filtros */}
      <FiltersBar onFilterChange={handleFilterChange} />

      {/* KPIs Cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Indicadores Clave</h2>
        <KPIOverviewCards />
      </section>

      {/* Gráficos */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Análisis Visual</h2>
        <KPICharts />
      </section>

      {/* Tickets - Solo este componente está conectado al backend */}
      <div className="grid grid-cols-1 gap-6">
        <TicketsCauses />
      </div>

      {/* ========================================================================
          COMPONENTES NO CONECTADOS AL BACKEND - COMENTADOS
          ======================================================================== */}

      {/* ❌ AlertsPanel - NO CONECTADO
          Endpoint inexistente: GET /api/v1/admin-panel/marketing/alertas
          Usa solo datos mock: getMockAlertasCriticas()
      */}
      {/* <AlertsPanel /> */}

      {/* ❌ Tabs: Notificaciones y Sistema XP - NO CONECTADOS
          - NotificationsList: Endpoint inexistente GET /api/v1/admin-panel/marketing/notificaciones
          - XPTable: Endpoints inexistentes GET /api/v1/admin-panel/marketing/tabla-xp
                     y GET /api/v1/admin-panel/marketing/creditos-mensuales
          Usan solo datos mock
      */}
      {/* <Tabs defaultValue="notificaciones" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="xp">Sistema XP</TabsTrigger>
        </TabsList>
        <TabsContent value="notificaciones" className="mt-4">
          <NotificationsList />
        </TabsContent>
        <TabsContent value="xp" className="mt-4">
          <XPTable />
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
