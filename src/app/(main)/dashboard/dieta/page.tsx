"use client";

import { useState } from "react";

import { Apple, ChefHat, ArrowLeftRight } from "lucide-react";

import { BrandTabs } from "@/components/brand-tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { BancoRecetas } from "./_components/banco-recetas";
import { CargaMasiva } from "./_components/carga-masiva";
import { DietaCards } from "./_components/dieta-cards";
import { GeneradorMenus } from "./_components/generador-menus";
import { ListaAlimentos } from "./_components/lista-alimentos";
import { SustitucionesRestricciones } from "./_components/sustituciones-restricciones";

export default function DietaPage() {
  const [activeTab, setActiveTab] = useState("recetas");

  return (
    <div className="@container/main flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dieta</h1>
        <p className="text-muted-foreground">
          Gestiona dietas, alimentos, recetas y planes alimenticios para tus clientes
        </p>
      </div>

      {/* Cards de resumen */}
      <DietaCards />

      {/* Submenú de marca */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <BrandTabs
          tabs={[
            // TODO: Generador de Menús y Carga Masiva — pendientes de implementación backend
            { id: "alimentos", label: "Lista de Alimentos", icon: <Apple className="size-4" /> },
            { id: "recetas", label: "Banco de Recetas", icon: <ChefHat className="size-4" /> },
            { id: "sustituciones", label: "Sustituciones", icon: <ArrowLeftRight className="size-4" /> },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* TODO: Generador de Menús - Pendiente de implementación backend
        <TabsContent value="generador" className="mt-6">
          <GeneradorMenus />
        </TabsContent>
        */}

        <TabsContent value="alimentos" className="mt-6">
          <ListaAlimentos />
        </TabsContent>

        <TabsContent value="recetas" className="mt-6">
          <BancoRecetas />
        </TabsContent>

        {/* TODO: Carga Masiva - Pendiente de implementación backend
        <TabsContent value="carga-masiva" className="mt-6">
          <CargaMasiva />
        </TabsContent>
        */}

        <TabsContent value="sustituciones" className="mt-6">
          <SustitucionesRestricciones />
        </TabsContent>
      </Tabs>
    </div>
  );
}
