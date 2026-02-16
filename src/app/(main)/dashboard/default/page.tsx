/**
 * Página principal del Dashboard HOME
 * Muestra métricas, ventas, tareas, asesorías, IMC y cursos
 */

import { AsesoriasOverview } from "./_components/asesorias-overview";
import { CursosGrid } from "./_components/cursos-grid";
import { HomeCards } from "./_components/home-cards";
import { IMCWidget } from "./_components/imc-widget";
import { TareasWidget } from "./_components/tareas-widget";
import { VentasRecientes } from "./_components/ventas-recientes";

export default function DashboardDefaultPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard - Squat Fit</h1>
        <p className="text-muted-foreground">Panel de control administrativo</p>
      </div>

      {/* Fila 1: 4 Cards de Métricas */}
      <HomeCards />

      {/* Fila 2: Ventas Recientes + Widget de Tareas */}
      <div className="grid gap-6 lg:grid-cols-3">
        <VentasRecientes />
        <TareasWidget />
      </div>

      {/* Fila 3: Asesorías Overview + IMC Widget */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AsesoriasOverview />
        <IMCWidget />
      </div>

      {/* Fila 4: Grid de Cursos (Full Width) */}
      <CursosGrid />
    </div>
  );
}
