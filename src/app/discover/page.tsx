import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/TopBar";
import { DiscoverView } from "./DiscoverView";
import { API_URL } from "@/lib/config";
import type { PublicVenue } from "@/lib/types";

async function getVenues(): Promise<PublicVenue[]> {
  const res = await fetch(`${API_URL}/api/public/venues`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function DiscoverPage() {
  const venues = await getVenues();
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
