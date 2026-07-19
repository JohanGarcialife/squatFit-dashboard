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

import { BrandTabs } from "@/components/brand-tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";

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

      {/* Submenú de marca */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <BrandTabs
          tabs={[
            // TODO: Edición Masiva y Renovar Semana — pendientes de implementación backend
            { id: "biblioteca", label: "Biblioteca de Ejercicios", icon: <Dumbbell className="size-4" /> },
            { id: "restricciones", label: "Lesiones y Restricciones", icon: <Shield className="size-4" /> },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

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
