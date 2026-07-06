"use client";

import { DashboardHeader } from "./_components/home/dashboard-header";
import { KPICards } from "./_components/home/kpi-cards";
import { MonthlySalesTable } from "./_components/home/monthly-sales-table";
import { RecentSales } from "./_components/home/recent-sales";
import { SalesOverviewChart } from "./_components/home/sales-overview-chart";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-6">
      {/* Header con saludo dinámico */}
      <DashboardHeader />

      {/* KPI Cards */}
      <KPICards />

      {/* Gráfico de distribución + Ventas recientes */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SalesOverviewChart />
        </div>
        <div className="lg:col-span-3">
          <RecentSales />
        </div>
      </div>

      {/* Tabla de ventas del mes */}
      <MonthlySalesTable />
    </div>
  );
}
