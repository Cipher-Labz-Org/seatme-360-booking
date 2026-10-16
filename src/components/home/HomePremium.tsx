"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { RestaurantHero } from "@/components/customer/RestaurantHero";
import type { RestaurantSearchValues } from "@/components/customer/RestaurantSearch";
import { fadeUp, motionEase } from "@/components/customer/motion";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { RestaurantCard } from "@/components/luxury/RestaurantCard";
import { SectionHeader } from "@/components/luxury/SectionHeader";
import type { PublicVenueDisplay } from "@/lib/venueImagery";

const OCCASIONS = [
  { label: "Solo Dining", img: "photo-1559339352-11d035aa65de" },
  { label: "Couple", img: "photo-1414235077428-338989a2e8c0" },
  { label: "Family", img: "photo-1552569970-398a6920ba8" },
  { label: "Friends", img: "photo-1514933651103-005eec06c04b" },
  { label: "Business Dining", img: "photo-1556761175-5973dc0f32e7" },
  { label: "Birthdays", img: "photo-1464366400600-06685a478e14" },
  { label: "Anniversaries", img: "photo-1528607929212-2636ec44253e" },
  { label: "Special Occasions", img: "photo-1504674900247-0877df9cc836" },
];

const CURATED = [
  {
    title: "Cinematic dining rooms",
    copy: "Restaurants with full 360° room tours and table-level views when provided by the venue.",
  },
  {
    title: "Chef-led tasting rooms",
    copy: "Intimate counters and tasting menus — reserve the seat that matches your party.",
  },
  {
    title: "Skyline & terrace",
    copy: "Open-air and penthouse settings with immersive previews before you arrive.",
  },
];

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

  return (
    <>
      <RestaurantHero
        search={search}
        onSearchChange={(patch) => setSearch((s) => ({ ...s, ...patch }))}
        onSearchSubmit={onSearch}
      />

      <section className="section section-spacious" id="venues">
        <div className="container">
          <SectionHeader eyebrow="Curated collection" title="Featured restaurants" />
          {featured.length === 0 ? (
            <div className="empty-state">Partner restaurants will appear here as they join SeatMe.</div>
          ) : (
            <div className="restaurant-grid">
              {featured.map((venue, i) => (
                <motion.div
                  key={venue.id}
                  {...sectionMotion}
                  transition={{ delay: reduceMotion ? 0 : i * 0.05, duration: 0.55, ease: motionEase }}
                >
                  <RestaurantCard venue={venue} bookQuery={bookQuery} />
                </motion.div>
              ))}
            </div>
          )}
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
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=85')",
              }}
            >
              <span className="badge badge-gold">360° signature</span>
            </div>
          </motion.div>
          <motion.div {...sectionMotion}>
            <SectionHeader
              eyebrow="Immersive exploration"
              title="Experience dining in 360°"
              lead="Walk the room before you arrive. Select a table, preview the view from that seat when the restaurant provides it, and reserve with complete confidence."
            />
            <LuxuryButton href="/discover" variant="outline">
              Start exploring →
            </LuxuryButton>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="By occasion" title="Discover by occasion" />
          <div className="occasion-grid occasion-grid-lux">
            {OCCASIONS.map(({ label, img }) => (
              <OccasionTile key={label} label={label} img={img} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-royal">
        <div className="container">
          <SectionHeader
            eyebrow="Editorial picks"
            title="Curated dining experiences"
            lead="Hand-picked categories for travellers and locals who expect more from every reservation."
          />
          <div className="curated-grid">
            {CURATED.map((item) => (
              <article key={item.title} className="curated-card">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-spacious" id="experience">
        <div className="container">
          <SectionHeader eyebrow="The journey" title="How it works" />
          <div className="feature-grid feature-grid-lux">
            {[
              { n: "01", t: "Choose your restaurant", d: "Browse cinematic profiles and dining rooms." },
              { n: "02", t: "Set date, time & guests", d: "Real availability from the venue's calendar." },
              { n: "03", t: "Explore in 360°", d: "Tour the room and navigate between scenes." },
              { n: "04", t: "Select your table", d: "Tap an available table in the view or floor plan." },
              { n: "05", t: "Preview your seat", d: "See the table's own panorama when uploaded." },
              { n: "06", t: "Confirm", d: "Secure your experience in seconds." },
            ].map((step) => (
              <article key={step.n} className="feature-card feature-card-lux">
                <span className="feature-step">{step.n}</span>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function OccasionTile({ label, img }: { label: string; img: string }) {
  return (
    <a
      className="occasion-card occasion-card-lux"
      href={`/discover?occasion=${encodeURIComponent(label)}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.88) 100%), url('https://images.unsplash.com/${img}?auto=format&fit=crop&w=600&q=80')`,
      }}
    >
      {label}
    </a>
  );
}
