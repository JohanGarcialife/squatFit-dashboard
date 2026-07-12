import { Metadata } from "next";

import { ProductosCatalogCards } from "./_components/catalog/catalog-cards";
import { ProductosCatalogTable } from "./_components/catalog/catalog-table";

export const metadata: Metadata = {
  title: "Productos | Squad Fit",
  description: "Catálogo unificado de productos vendibles",
};

export default function ProductosPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <ProductosCatalogCards />
      <ProductosCatalogTable />
    </div>
  );
}
