import Link from "next/link";
import { venueCoverUrl, type PublicVenueDisplay } from "@/lib/venueImagery";
import type { PublicVenue } from "@/lib/types";

type Props = {
  venue: PublicVenue | PublicVenueDisplay;
  bookQuery?: string;
  priority?: boolean;
};

function resolveCover(venue: PublicVenue | PublicVenueDisplay) {
  if ("displayCoverUrl" in venue && venue.displayCoverUrl) return venue.displayCoverUrl;
  return venueCoverUrl(venue.id, venue.coverImage);
}

export function RestaurantCard({ venue, bookQuery = "" }: Props) {
  const cover = resolveCover(venue);
  const has360 = venue.locations.some((l) => l.panoramaUrl);
  const firstBookable = venue.locations[0];

  return (
    <article className="restaurant-card restaurant-card-lux">
      <Link className="restaurant-card-link" href={`/venues/${venue.id}`}>
        <div
          className="restaurant-img restaurant-img-cinematic"
          style={{
            backgroundImage: `url('${cover}')`,
          }}
        >
          <div className="restaurant-img-gradient" aria-hidden />
          {has360 && <span className="badge badge-gold">360° immersive</span>}
        </div>
        <div className="restaurant-body">
          <h3>{venue.name}</h3>
          <p className="restaurant-card-desc">
            {venue.description?.slice(0, 120) || "An exceptional dining destination on SeatMe."}
            {venue.description && venue.description.length > 120 ? "…" : ""}
          </p>
          <div className="restaurant-meta">
            <span>{venue.cuisine || (venue.type === "HOTEL" ? "Hotel dining" : "Fine dining")}</span>
            <span aria-hidden>•</span>
            <span>{venue.city}</span>
            {venue.priceHint && (
              <>
                <span aria-hidden>•</span>
                <span>{venue.priceHint}</span>
              </>
            )}
          </div>
        </div>
      </Link>
      <div className="restaurant-card-actions">
        <Link className="button outline" href={`/venues/${venue.id}`}>
          View profile
        </Link>
        {firstBookable && (
          <Link
            className="button primary"
            href={`/book/${firstBookable.id}${bookQuery}`}
          >
            Reserve →
          </Link>
        )}
      </div>
    </article>
  );
}
