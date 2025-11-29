"use client";

import { useState } from "react";

import { BarChart3 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  KPIOverviewCards,
  KPICharts,
  AlertsPanel,
  TicketsCauses,
  NotificationsList,
  XPTable,
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

      {/* Alertas y Tickets */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AlertsPanel />
        <TicketsCauses />
      </div>

      {/* Tabs: Notificaciones y Sistema XP */}
      <Tabs defaultValue="notificaciones" className="w-full">
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
      </Tabs>
    </div>
  );
}
