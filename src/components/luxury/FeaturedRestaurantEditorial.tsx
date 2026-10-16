"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { venueCoverUrl, type PublicVenueDisplay } from "@/lib/venueImagery";
import type { PublicVenue } from "@/lib/types";
import { fadeUp, motionEase } from "@/components/customer/motion";

type Props = {
  venues: (PublicVenue | PublicVenueDisplay)[];
  bookQuery: string;
};

export function FeaturedRestaurantEditorial({ venues, bookQuery }: Props) {
  const reduceMotion = useReducedMotion();

  if (venues.length === 0) {
    return <div className="empty-state">Partner restaurants will appear here as they join SeatMe.</div>;
  }

  return (
    <div className="featured-editorial">
      {venues.map((venue, i) => {
        const has360 = venue.locations.some((l) => l.panoramaUrl);
        const firstLoc = venue.locations[0];
        const image =
          "displayCoverUrl" in venue && venue.displayCoverUrl
            ? venue.displayCoverUrl
            : venueCoverUrl(venue.id, venue.coverImage);
        const reverse = i % 2 === 1;

        return (
          <motion.article
            key={venue.id}
            className={`featured-row ${reverse ? "featured-row-reverse" : ""}`}
            {...(reduceMotion
              ? {}
              : {
                  initial: "hidden",
                  whileInView: "show",
                  viewport: { once: true, margin: "-60px" },
                  variants: fadeUp,
                  transition: { duration: 0.65, ease: motionEase, delay: i * 0.04 },
                })}
          >
            <Link href={`/venues/${venue.id}`} className="featured-row-media" style={{ backgroundImage: `url('${image}')` }}>
              <div className="featured-row-media-shade" aria-hidden />
              {has360 && <span className="featured-badge">360° available</span>}
            </Link>
            <div className="featured-row-body">
              <p className="eyebrow">{venue.city}</p>
              <h3>{venue.name}</h3>
              <p className="featured-cuisine">
                {venue.cuisine || (venue.type === "HOTEL" ? "Hotel dining" : "Fine dining")}
                {venue.priceHint ? ` · ${venue.priceHint}` : ""}
              </p>
              <p className="featured-excerpt">
                {venue.description?.slice(0, 160) ||
                  "An exclusive address on SeatMe — explore the room in 360° and reserve your table."}
                {venue.description && venue.description.length > 160 ? "…" : ""}
              </p>
              <div className="featured-row-actions">
                <Link className="button outline" href={`/venues/${venue.id}`}>
                  View restaurant
                </Link>
                {firstLoc && (
                  <Link className="button primary" href={`/book/${firstLoc.id}${bookQuery}`}>
                    Reserve table
                  </Link>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
