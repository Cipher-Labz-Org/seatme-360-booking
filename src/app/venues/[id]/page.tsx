import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/TopBar";
import { VenueDetailView, type VenueDetailData } from "@/components/venue/VenueDetailView";
import { API_URL } from "@/lib/config";

async function getVenue(id: string): Promise<VenueDetailData | null> {
  const res = await fetch(`${API_URL}/api/public/venues/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = await getVenue(id);
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
