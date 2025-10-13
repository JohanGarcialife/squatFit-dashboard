import { AlumnosCards } from "./_components/alumnos-cards";
import { AlumnosTable } from "./_components/alumnos-table";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Tarjetas de resumen */}
      <AlumnosCards />
      
      {/* Tabla de alumnos */}
      <AlumnosTable />
    </div>
  );
}

