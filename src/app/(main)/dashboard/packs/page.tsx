import { Metadata } from "next";

import { PacksCards } from "./_components/packs-cards";
import { PacksTable } from "./_components/packs-table";

export const metadata: Metadata = {
  title: "Packs | Squat Fit",
  description: "Gestión de packs de libros",
};

export default function PacksPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <PacksCards />
      <PacksTable />
    </div>
  );
}
