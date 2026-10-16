"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, motionEase } from "@/components/customer/motion";
import { SectionHeader } from "@/components/luxury/SectionHeader";

const EXPERIENCES = [
  {
    title: "Private Dining",
    copy: "Intimate rooms for celebrations and discreet entertaining.",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=85",
    href: "/discover",
  },
  {
    title: "Rooftop Experiences",
    copy: "Skyline views and open-air tables — explore venues with outdoor dining.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
    href: "/discover",
  },
  {
    title: "Chef's Table",
    copy: "Counter seating and tasting menus at partner restaurants.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=85",
    href: "/discover",
  },
  {
    title: "Waterfront Dining",
    copy: "Coastal and marina settings — browse by location on SeatMe.",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=85",
    href: "/discover",
  },
  {
    title: "Romantic Dining",
    copy: "Candlelit tables and quiet corners — reserve with a 360° preview.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85",
    href: "/discover?occasion=Romantic%20Dining",
  },
];

export function HomeCuratedExperiences() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section section-curated-visual">
      <div className="container">
        <SectionHeader
          eyebrow="Editorial"
          title="Curated dining experiences"
          lead="Atmospheric settings represented on the platform — explore listings to see what each venue offers."
        />
        <div className="curated-visual-grid">
          {EXPERIENCES.map((exp, i) => (
            <motion.div
              key={exp.title}
              className={`curated-visual-card ${i === 0 ? "curated-visual-hero" : ""}`}
              {...(reduceMotion
                ? {}
                : {
                    initial: "hidden",
                    whileInView: "show",
                    viewport: { once: true },
                    variants: fadeUp,
                    transition: { duration: 0.55, delay: i * 0.05, ease: motionEase },
                  })}
            >
              <Link href={exp.href} className="curated-visual-link">
                <div className="curated-visual-image" style={{ backgroundImage: `url('${exp.image}')` }}>
                  <div className="curated-visual-shade" aria-hidden />
                </div>
                <div className="curated-visual-copy">
                  <h3>{exp.title}</h3>
                  <p>{exp.copy}</p>
                  <span className="curated-visual-cta">Explore →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
