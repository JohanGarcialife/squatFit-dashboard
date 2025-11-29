"use client";

import { useState } from "react";

import { CalendarDays, Apple, ChefHat, Upload, ArrowLeftRight } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BancoRecetas } from "./_components/banco-recetas";
import { CargaMasiva } from "./_components/carga-masiva";
import { DietaCards } from "./_components/dieta-cards";
import { GeneradorMenus } from "./_components/generador-menus";
import { ListaAlimentos } from "./_components/lista-alimentos";
import { SustitucionesRestricciones } from "./_components/sustituciones-restricciones";

export default function DietaPage() {
  const [activeTab, setActiveTab] = useState("generador");

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

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="generador"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <CalendarDays className="mr-2 size-4" />
              Generador de Menús
            </TabsTrigger>
            <TabsTrigger
              value="alimentos"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Apple className="mr-2 size-4" />
              Lista de Alimentos
            </TabsTrigger>
            <TabsTrigger
              value="recetas"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <ChefHat className="mr-2 size-4" />
              Banco de Recetas
            </TabsTrigger>
            <TabsTrigger
              value="carga-masiva"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Upload className="mr-2 size-4" />
              Carga Masiva
            </TabsTrigger>
            <TabsTrigger
              value="sustituciones"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <ArrowLeftRight className="mr-2 size-4" />
              Sustituciones
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generador" className="mt-6">
          <GeneradorMenus />
        </TabsContent>

        <TabsContent value="alimentos" className="mt-6">
          <ListaAlimentos />
        </TabsContent>

        <TabsContent value="recetas" className="mt-6">
          <BancoRecetas />
        </TabsContent>

        <TabsContent value="carga-masiva" className="mt-6">
          <CargaMasiva />
        </TabsContent>

        <TabsContent value="sustituciones" className="mt-6">
          <SustitucionesRestricciones />
        </TabsContent>
      </Tabs>
    </div>
  );
}
