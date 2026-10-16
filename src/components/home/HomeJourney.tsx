"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, motionEase } from "@/components/customer/motion";
import { SectionHeader } from "@/components/luxury/SectionHeader";

const STEPS = [
  { n: "01", title: "Discover", text: "Browse cinematic restaurant profiles on SeatMe." },
  { n: "02", title: "Plan Your Dining", text: "Choose date, time, and party size with real availability." },
  { n: "03", title: "Explore in 360°", text: "Walk the dining room and navigate between scenes." },
  { n: "04", title: "Choose Your Table", text: "Select an available table in the view or on the floor plan." },
  { n: "05", title: "Preview Your View", text: "See the table's own panorama when the venue provides it." },
  { n: "06", title: "Confirm Reservation", text: "Complete your details — confirmed through our booking API." },
];

export function HomeJourney() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section section-journey" id="experience">
      <div className="container">
        <SectionHeader eyebrow="The journey" title="How it works" lead="Six refined steps from discovery to confirmation." />
        <div className="journey-track" role="list">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              className="journey-step"
              role="listitem"
              {...(reduceMotion
                ? {}
                : {
                    initial: "hidden",
                    whileInView: "show",
                    viewport: { once: true },
                    variants: fadeUp,
                    transition: { duration: 0.5, delay: i * 0.06, ease: motionEase },
                  })}
            >
              <span className="journey-number">{step.n}</span>
              <div className="journey-step-body">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              {i < STEPS.length - 1 && <span className="journey-connector" aria-hidden />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
