"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, motionEase } from "@/components/customer/motion";
import { SectionHeader } from "@/components/luxury/SectionHeader";

const OCCASIONS: { label: string; href: string; image: string }[] = [
  {
    label: "Romantic Dining",
    href: "/discover?occasion=Romantic%20Dining",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Family",
    href: "/discover?occasion=Family",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Friends",
    href: "/discover?occasion=Friends",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Business",
    href: "/discover?occasion=Business",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Birthdays",
    href: "/discover?occasion=Birthdays",
    image: "https://images.unsplash.com/photo-1464366400600-7163b472aad3?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Anniversaries",
    href: "/discover?occasion=Anniversaries",
    image: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Special Occasions",
    href: "/discover?occasion=Special%20Occasions",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Solo Dining",
    href: "/discover?occasion=Solo%20Dining",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
  },
];

export function HomeOccasions() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section section-occasions">
      <div className="container">
        <SectionHeader
          eyebrow="Moments"
          title="Discover by occasion"
          lead="Editorial collections to inspire your next reservation — each opens restaurant discovery with that occasion ready for booking."
        />
        <div className="occasion-editorial-grid">
          {OCCASIONS.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              className={`occasion-editorial-tile ${i === 0 || i === 3 ? "occasion-tile-wide" : ""}`}
              style={{
                backgroundImage: `linear-gradient(165deg, rgba(8,8,8,0.12) 0%, rgba(8,8,8,0.82) 78%), url('${item.image}')`,
              }}
              {...(reduceMotion
                ? {}
                : {
                    initial: "hidden",
                    whileInView: "show",
                    viewport: { once: true },
                    variants: fadeUp,
                    transition: { duration: 0.5, delay: i * 0.03, ease: motionEase },
                  })}
            >
              <span className="occasion-editorial-label">{item.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
