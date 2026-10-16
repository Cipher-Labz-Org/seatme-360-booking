import { ClientVenueContentView } from "./ClientVenueContentView";

export default async function ClientVenueContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientVenueContentView id={id} />;
}
