/**
 * Página principal del Dashboard HOME
 * Combina las métricas del API admin-panel + los widgets operativos originales
 */

"use client";

import { DashboardHeader } from "@/app/(main)/dashboard/_components/home/dashboard-header";
import { KPICards } from "@/app/(main)/dashboard/_components/home/kpi-cards";
import { SystemPerformanceDashboard } from "@/app/(main)/dashboard/_components/home/system-performance/system-performance-dashboard";

import { CursosGrid } from "./_components/cursos-grid";
import { HomeCards } from "./_components/home-cards";

export default function DashboardDefaultPage() {
  return (
    <div className="@container/main flex flex-col gap-6">
      {/* ─── SECCIÓN 1: MÉTRICAS GLOBALES DEL API ─── */}
      <DashboardHeader />

      {/* ─── NUEVO: RENDIMIENTO DEL SISTEMA (Comentado temporalmente) ─── */}
      {/* <SystemPerformanceDashboard /> */}

      {/* KPI Cards — Cursos vendidos, Asesorías, Libros, Usuarios */}
      <KPICards />

      {/* ─── SECCIÓN 2: OPERACIONES DEL DÍA ─── */}
      <div className="border-t pt-2">
        <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">Operaciones del día</p>
      </div>

      {/* Cards operativas — Ventas totales, Tareas, Asesorías, Cursos */}
      <HomeCards />

      {/* Grid de Cursos disponibles */}
      <CursosGrid />
    </div>
  );
}
