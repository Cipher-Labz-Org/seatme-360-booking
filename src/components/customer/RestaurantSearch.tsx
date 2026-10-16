"use client";

import { FormEvent } from "react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

export type RestaurantSearchValues = {
  location: string;
  date: string;
  time: string;
  guests: string;
};

type Props = {
  values: RestaurantSearchValues;
  onChange: (patch: Partial<RestaurantSearchValues>) => void;
  onSubmit: (e: FormEvent) => void;
  className?: string;
};

/** Floating glass search bar for homepage & discovery */
export function RestaurantSearch({ values, onChange, onSubmit, className = "" }: Props) {
  return (
    <form
      className={`hero-search-glass hero-search-float ${className}`.trim()}
      onSubmit={onSubmit}
      aria-label="Search restaurants"
    >
      <label>
        Location
        <input
          type="text"
          placeholder="City or area"
          value={values.location}
          onChange={(e) => onChange({ location: e.target.value })}
          autoComplete="address-level2"
        />
      </label>
      <label>
        Date
        <input
          type="date"
          value={values.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />
      </label>
      <label>
        Time
        <input
          type="time"
          value={values.time}
          onChange={(e) => onChange({ time: e.target.value })}
        />
      </label>
      <label>
        Guests
        <select value={values.guests} onChange={(e) => onChange({ guests: e.target.value })}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div className="hero-search-submit">
        <LuxuryButton type="submit">Search Restaurants</LuxuryButton>
      </div>
    </form>
  );
}
