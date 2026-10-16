import { BookLocationView } from "./BookLocationView";

export default async function BookLocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{ date?: string; time?: string; guests?: string; occasion?: string }>;
}) {
  const { locationId } = await params;
  const sp = await searchParams;
  return (
    <BookLocationView
      locationId={locationId}
      initialDate={sp.date}
      initialTime={sp.time}
      initialGuests={sp.guests}
      initialOccasion={sp.occasion}
    />
  );
}
