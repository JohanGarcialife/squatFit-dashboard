"use client";

/**
 * ============================================================================
 * PÁGINA: Trainer - Módulo Principal de Trainer
 * ============================================================================
 *
 * ESTADO DE CONEXIÓN AL BACKEND:
 *
 * ✅ COMPONENTES CONECTADOS:
 * - TrainerCards: Conectado parcialmente
 *   → Tareas: GET /api/v1/admin-panel/tasks/assigned-to-me ✅
 *   → Clientes: GET /api/v1/admin-panel/advices ✅
 *   → Métricas de sesiones/series/volumen/RPE: Mock data ❌
 *
 * ❌ COMPONENTES SIN CONEXIÓN (MOCK DATA):
 * - BibliotecaEjercicios: Sin endpoints disponibles
 * - EdicionMasiva: Sin endpoints disponibles
 * - RenovarSemana: Sin endpoints disponibles
 * - LesionesRestricciones: Sin endpoints disponibles
 *
 * VER DETALLES EN CADA COMPONENTE INDIVIDUAL
 * ============================================================================
 */

import { useState } from "react";

import { Dumbbell, Shield } from "lucide-react";
// import { Table2, CalendarPlus, Activity } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BibliotecaEjercicios } from "./_components/biblioteca-ejercicios";
// import { EdicionMasiva } from "./_components/edicion-masiva";
import { LesionesRestricciones } from "./_components/lesiones-restricciones";
// import { RenovarSemana } from "./_components/renovar-semana";
import { TrainerCards } from "./_components/trainer-cards";

export default function TrainerPage() {
  const [activeTab, setActiveTab] = useState("biblioteca");

  return (
    <div className="@container/main flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Trainer</h1>
        <p className="text-muted-foreground">
          Gestiona ejercicios, rutinas y el progreso de entrenamiento de tus clientes
        </p>
      </div>

      {/* Cards de adherencia (KPIs) */}
      <TrainerCards />

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="biblioteca"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Dumbbell className="mr-2 size-4" />
              Biblioteca de Ejercicios
            </TabsTrigger>
            {/* <TabsTrigger
              value="edicion"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Table2 className="mr-2 size-4" />
              Edición Masiva
            </TabsTrigger> */}
            {/* <TabsTrigger
              value="renovar"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <CalendarPlus className="mr-2 size-4" />
              Renovar Semana
            </TabsTrigger> */}
            <TabsTrigger
              value="restricciones"
              className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Shield className="mr-2 size-4" />
              Lesiones y Restricciones
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="biblioteca" className="mt-6">
          <BibliotecaEjercicios />
        </TabsContent>

        {/* <TabsContent value="edicion" className="mt-6">
          <EdicionMasiva />
        </TabsContent> */}

        {/* <TabsContent value="renovar" className="mt-6">
          <RenovarSemana />
        </TabsContent> */}

        <TabsContent value="restricciones" className="mt-6">
          <LesionesRestricciones />
        </TabsContent>
      </Tabs>
    </div>
  );
}
