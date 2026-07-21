import { CursoContenidoView } from "./_components/curso-contenido-view";

export default async function CursoContenidoPage({ params }: { params: Promise<{ cursoId: string }> }) {
  const { cursoId } = await params;
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <CursoContenidoView cursoId={cursoId} />
    </div>
  );
}
