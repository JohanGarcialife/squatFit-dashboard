import { ClientProfileView } from "./_components/client-profile-view";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientProfileView userId={id} />;
}
