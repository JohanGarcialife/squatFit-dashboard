"use client";

import { useState } from "react";

import { User } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="individual"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <User className="mr-2 size-4" />
              Generador Individual
            </TabsTrigger>
            {/* <TabsTrigger
              value="masiva"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Users className="mr-2 size-4" />
              Edición Masiva
            </TabsTrigger> */}
          </TabsList>
        </div>

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
