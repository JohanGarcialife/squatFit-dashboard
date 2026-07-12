import { Metadata } from "next";

import { PedidosTable } from "./_components/pedidos-table";

export const metadata: Metadata = {
  title: "Pedidos | Squad Fit",
  description: "Administración de pedidos: estados, pagos, emails y reembolsos",
};

export default function PedidosPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <PedidosTable />
    </div>
  );
}
