import { ClientVenueView } from "./ClientVenueView";

export default async function ClientVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientVenueView id={id} />;
}
