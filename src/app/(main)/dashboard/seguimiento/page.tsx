"use client";

import { useState } from "react";

import { Users, AlertTriangle } from "lucide-react";

import { BrandTabs } from "@/components/brand-tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// import { AgendaRevisiones } from "./_components/agenda-revisiones";
import { AlertasCumplimiento } from "./_components/alertas-cumplimiento";
import { PanelClientes } from "./_components/panel-clientes";
import { SeguimientoCards } from "./_components/seguimiento-cards";

export default function SeguimientoPage() {
  const [activeTab, setActiveTab] = useState("clientes");

  return (
    <div className="@container/main flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Seguimiento</h1>
        <p className="text-muted-foreground">
          Controla el progreso de tus clientes, gestiona revisiones y mantén el cumplimiento al día
        </p>
      </div>

      {/* Cards de resumen */}
      <SeguimientoCards />

      {/* Submenú de marca */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <BrandTabs
          tabs={[
            // TODO: Agenda de Revisiones — pendiente de implementación backend
            { id: "clientes", label: "Panel de Clientes", icon: <Users className="size-4" /> },
            { id: "alertas", label: "Alertas de Cumplimiento", icon: <AlertTriangle className="size-4" /> },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        <TabsContent value="clientes" className="mt-6">
          <PanelClientes />
        </TabsContent>

        {/* <TabsContent value="agenda" className="mt-6">
          <AgendaRevisiones />
        </TabsContent> */}

        <TabsContent value="alertas" className="mt-6">
          <AlertasCumplimiento />
        </TabsContent>
      </Tabs>
    </div>
  );
}
