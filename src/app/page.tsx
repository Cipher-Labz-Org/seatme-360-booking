import { LuxuryNavigation } from "@/components/customer/LuxuryNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { HomePremium } from "@/components/home/HomePremium";
import { enrichVenuesDisplay } from "@/lib/venueImagery";
import { fetchPublicVenues } from "@/lib/publicData";

export default async function HomePage() {
  const venues = enrichVenuesDisplay(await fetchPublicVenues());

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
