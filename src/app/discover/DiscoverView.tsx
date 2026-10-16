"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RestaurantCard } from "@/components/luxury/RestaurantCard";
import { SectionHeader } from "@/components/luxury/SectionHeader";
import type { PublicVenue } from "@/lib/types";

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function DiscoverView({ venues }: { venues: PublicVenue[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("location") ?? searchParams.get("city") ?? "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? tomorrowIso());
  const [time, setTime] = useState(searchParams.get("time") ?? "19:00");
  const [guests, setGuests] = useState(searchParams.get("guests") ?? "2");

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    venues.forEach((v) => {
      if (v.cuisine?.trim()) set.add(v.cuisine.trim());
    });
    return Array.from(set).sort();
  }, [venues]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return venues.filter((v) => {
      if (cuisine && v.cuisine !== cuisine) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        (v.description?.toLowerCase().includes(q) ?? false) ||
        (v.cuisine?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [venues, query, cuisine]);

  const bookQuery = `?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&guests=${encodeURIComponent(guests)}`;

  return (
    <div className="container discover-inner">
      <SectionHeader
        eyebrow="Restaurant discovery"
        title="Find your next extraordinary table"
        lead="Search by city, cuisine, and party details — then step inside with 360° before you reserve."
      />

      <form
        className="discover-search panel panel-royal"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filter restaurants"
      >
        <label>
          Location
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City or restaurant name"
          />
        </label>
        <label>
          Cuisine
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
            <option value="">All cuisines</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Time
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <label>
          Guests
          <select value={guests} onChange={(e) => setGuests(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </form>

      {filtered.length === 0 ? (
        <div className="empty-state discover-empty">
          No restaurants match your search. Try clearing filters or explore all venues below.
        </div>
      ) : (
        <>
          <p className="discover-count">
            {filtered.length} {filtered.length === 1 ? "venue" : "venues"}
          </p>
          <div className="restaurant-grid discover-grid">
            {filtered.map((venue) => (
              <RestaurantCard key={venue.id} venue={venue} bookQuery={bookQuery} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
