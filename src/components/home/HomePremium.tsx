"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { RestaurantHero } from "@/components/customer/RestaurantHero";
import type { RestaurantSearchValues } from "@/components/customer/RestaurantSearch";
import { fadeUp, motionEase } from "@/components/customer/motion";
import { HomeCuratedExperiences } from "@/components/home/HomeCuratedExperiences";
import { HomeJourney } from "@/components/home/HomeJourney";
import { HomeOccasions } from "@/components/home/HomeOccasions";
import { FeaturedRestaurantEditorial } from "@/components/luxury/FeaturedRestaurantEditorial";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { SectionHeader } from "@/components/luxury/SectionHeader";
import type { PublicVenueDisplay } from "@/lib/venueImagery";

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

type Props = {
  venues: PublicVenueDisplay[];
};

export function HomePremium({ venues }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState<RestaurantSearchValues>({
    location: "",
    date: tomorrowIso(),
    time: "19:00",
    guests: "2",
  });

  const sectionMotion = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        whileInView: "show" as const,
        viewport: { once: true, margin: "-40px" },
        variants: fadeUp,
        transition: { duration: 0.55, ease: motionEase },
      };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams({
      location: search.location,
      date: search.date,
      time: search.time,
      guests: search.guests,
    });
    router.push(`/discover?${qs}`);
  };

  const featured = venues.slice(0, 6);
  const bookQuery = `?date=${search.date}&time=${search.time}&guests=${search.guests}`;
  const previewVenue = venues.find((v) => v.locations.some((l) => l.panoramaUrl)) ?? venues[0];
  const previewImage = previewVenue?.displayCoverUrl;

  return (
    <>
      <RestaurantHero
        search={search}
        onSearchChange={(patch) => setSearch((s) => ({ ...s, ...patch }))}
        onSearchSubmit={onSearch}
      />

      <section className="section section-spacious" id="venues">
        <div className="container">
          <SectionHeader
            eyebrow="Curated collection"
            title="Featured restaurants"
            lead="Editorial portraits of partner venues — open a profile or reserve the first available dining room."
          />
          <FeaturedRestaurantEditorial venues={featured} bookQuery={bookQuery} />
          {venues.length > 6 && (
            <div className="section-cta-row">
              <LuxuryButton href="/discover" variant="outline">
                View all restaurants →
              </LuxuryButton>
            </div>
          )}
        </div>
      </section>

      <section className="section section-immersive" id="experience-360">
        <div className="container immersive-split">
          <motion.div className="immersive-visual" {...sectionMotion}>
            <div
              className="immersive-frame"
              style={{
                backgroundImage: previewImage
                  ? `url('${previewImage}')`
                  : "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=85')",
              }}
            >
              <span className="badge badge-gold">360° signature</span>
              <div className="immersive-hotspots" aria-hidden>
                <span className="immersive-dot" style={{ left: "28%", top: "62%" }} />
                <span className="immersive-dot" style={{ left: "54%", top: "48%" }} />
                <span className="immersive-dot selected" style={{ left: "72%", top: "58%" }} />
              </div>
              <p className="immersive-caption">Exact tables appear as gold markers inside the live tour.</p>
            </div>
          </motion.div>
          <motion.div {...sectionMotion}>
            <SectionHeader
              eyebrow="Immersive exploration"
              title="Experience dining in 360°"
              lead="Walk the room before you arrive. Select a specific table, preview the view from that seat when the restaurant provides it, and reserve only after the booking system confirms availability."
            />
            <ul className="immersive-points">
              <li>Tour dining rooms with the existing 360° viewer</li>
              <li>Choose an exact table — not a generic time slot</li>
              <li>Availability is checked against the live reservation calendar</li>
            </ul>
            <LuxuryButton href="/discover" variant="outline">
              Start exploring →
            </LuxuryButton>
          </motion.div>
        </div>
      </section>

      <HomeOccasions />
      <HomeCuratedExperiences />
      <HomeJourney />
    </>
  );
}
