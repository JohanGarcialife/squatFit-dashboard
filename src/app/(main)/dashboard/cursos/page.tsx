import { CursosCards } from "./_components/cursos-cards";
import { CursosTable } from "./_components/cursos-table";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Tarjetas de resumen */}
      <CursosCards />
      
      {/* Tabla de cursos */}
      <CursosTable />
    </div>
  );
}

