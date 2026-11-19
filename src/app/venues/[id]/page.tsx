import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/TopBar";
import { VenueDetailView } from "@/components/venue/VenueDetailView";
import { fetchPublicVenue } from "@/lib/publicData";

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = await fetchPublicVenue(id);
  if (!venue) notFound();

  return (
    <>
      <TopBar />
      <main className="venue-detail-page">
        <VenueDetailView venue={venue} />
      </main>
      <SiteFooter />
    </>
  );
}
