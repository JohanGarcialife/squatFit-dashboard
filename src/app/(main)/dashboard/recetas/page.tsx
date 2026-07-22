import { RecetasView } from "./_components/recetas-view";

export default function RecetasPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <RecetasView />
    </div>
  );
}
