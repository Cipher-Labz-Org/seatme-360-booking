import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/TopBar";
import { DiscoverView } from "./DiscoverView";
import { enrichVenuesDisplay } from "@/lib/venueImagery";
import { fetchPublicVenues } from "@/lib/publicData";

export default async function DiscoverPage() {
  const venues = enrichVenuesDisplay(await fetchPublicVenues());
  return (
    <>
      <TopBar />
      <main className="discover-page">
        <Suspense fallback={<div className="container page-main loading-shimmer">Loading restaurants…</div>}>
          <DiscoverView venues={venues} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
