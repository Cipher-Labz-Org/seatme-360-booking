import { LuxuryNavigation } from "@/components/customer/LuxuryNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { HomePremium } from "@/components/home/HomePremium";
import { API_URL } from "@/lib/config";
import { enrichVenuesDisplay } from "@/lib/venueImagery";
import type { PublicVenue } from "@/lib/types";

async function getVenues(): Promise<PublicVenue[]> {
  const res = await fetch(`${API_URL}/api/public/venues`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const venues = enrichVenuesDisplay(await getVenues());

  return (
    <>
      <LuxuryNavigation transparent />
      <main className="home-main">
        <HomePremium venues={venues} />
      </main>
      <SiteFooter />
    </>
  );
}
