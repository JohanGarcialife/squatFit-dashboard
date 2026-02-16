"use client";

import { useState } from "react";

import { Users, AlertTriangle } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="clientes"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Users className="mr-2 size-4" />
              Panel de Clientes
            </TabsTrigger>
            {/* <TabsTrigger
              value="agenda"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <CalendarCheck className="mr-2 size-4" />
              Agenda de Revisiones
            </TabsTrigger> */}
            <TabsTrigger
              value="alertas"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <AlertTriangle className="mr-2 size-4" />
              Alertas de Cumplimiento
            </TabsTrigger>
          </TabsList>
        </div>

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
