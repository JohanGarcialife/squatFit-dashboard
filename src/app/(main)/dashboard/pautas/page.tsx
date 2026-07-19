"use client";

import { useState } from "react";

import { User } from "lucide-react";

import { BrandTabs } from "@/components/brand-tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// import { EdicionMasiva } from "./_components/edicion-masiva";
import { GeneradorIndividual } from "./_components/generador-individual";
import { PautasCards } from "./_components/pautas-cards";

export default function PautasPage() {
  const [activeTab, setActiveTab] = useState("individual");

  return (
    <div className="@container/main flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pautas</h1>
        <p className="text-muted-foreground">Genera y gestiona las pautas nutricionales y deportivas de tus clientes</p>
      </div>

      {/* Cards de resumen */}
      <PautasCards />

      {/* Submenú de marca */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <BrandTabs
          tabs={[
            // TODO: Edición Masiva — pendiente de implementación backend
            { id: "individual", label: "Generador Individual", icon: <User className="size-4" /> },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        <TabsContent value="individual" className="mt-6">
          <GeneradorIndividual />
        </TabsContent>

        {/* <TabsContent value="masiva" className="mt-6">
          <EdicionMasiva />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
