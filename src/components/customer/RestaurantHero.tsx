"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { fadeUp, motionEase } from "./motion";
import { RestaurantSearch, type RestaurantSearchValues } from "./RestaurantSearch";
import { FormEvent } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=90";

type Props = {
  search: RestaurantSearchValues;
  onSearchChange: (patch: Partial<RestaurantSearchValues>) => void;
  onSearchSubmit: (e: FormEvent) => void;
};

/** Cinematic full-viewport hero — Sexy Fish–inspired editorial luxury */
export function RestaurantHero({ search, onSearchChange, onSearchSubmit }: Props) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        whileInView: "show" as const,
        viewport: { once: true },
        variants: fadeUp,
        transition: { duration: 0.6, ease: motionEase },
      };

  return (
    <section
      className="hero-luxury hero-cinematic relative overflow-hidden"
      style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
    >
      <div className="hero-vignette" aria-hidden />
      <div className="container hero-luxury-inner relative z-[1]">
        <motion.div className="hero-copy" {...motionProps}>
          <p className="eyebrow hero-eyebrow">Luxury hospitality</p>
          <h1 className="max-w-[14ch] text-balance">Discover Extraordinary Dining.</h1>
          <p className="hero-subline">Explore. Experience. Reserve.</p>
          <p className="lead hero-description text-lux-muted max-w-[52ch]">
            Step inside the finest restaurants, discover your perfect table in 360°, and make every dining moment
            unforgettable.
          </p>
          <div className="nav-actions hero-ctas flex flex-wrap gap-3">
            <LuxuryButton href="#venues">Explore Restaurants</LuxuryButton>
            <LuxuryButton href="#experience-360" variant="outline">
              Experience in 360°
            </LuxuryButton>
          </div>
        </motion.div>
        <motion.div {...motionProps} transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.12, ease: motionEase }}>
          <RestaurantSearch values={search} onChange={onSearchChange} onSubmit={onSearchSubmit} />
        </motion.div>
      </div>
    </section>
  );
}
