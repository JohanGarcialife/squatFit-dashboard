import { Metadata } from "next";

import { CatalogView } from "./_components/catalog-view";

export const metadata: Metadata = {
  title: "Catálogo | Squat Fit",
  description: "Catálogo de productos y mapeo de concesiones (curso/libro/pack/programa)",
};

export default function CatalogoPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <CatalogView />
    </div>
  );
}
