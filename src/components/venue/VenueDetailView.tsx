"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { assetUrl } from "@/lib/config";

export type VenueDetailData = {
  id: string;
  name: string;
  city: string;
  description: string;
  type: string;
  cuisine: string;
  priceHint: string;
  tagline: string;
  address: string;
  phone: string;
  contactEmail: string;
  amenities: string;
  openingHours: string;
  mapEmbedUrl: string;
  coverImage: string | null;
  gallery: { id: string; imageUrl: string; caption: string }[];
  menuCategories: {
    id: string;
    name: string;
    items: { id: string; name: string; description: string; price: string }[];
  }[];
  locations: {
    id: string;
    name: string;
    description: string;
    panoramaUrl: string | null;
    _count: { tables: number };
  }[];
};

function parseStringArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

function parseHours(raw: string): { day: string; hours: string }[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is { day: string; hours: string } => {
        return !!x && typeof x === "object" && "day" in x && "hours" in x;
      })
      .map((x) => ({ day: String(x.day), hours: String(x.hours) }));
  } catch {
    return [];
  }
}

export function VenueDetailView({ venue }: { venue: VenueDetailData }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const amenities = useMemo(() => parseStringArray(venue.amenities), [venue.amenities]);
  const hours = useMemo(() => parseHours(venue.openingHours), [venue.openingHours]);

  const heroImage =
    assetUrl(venue.coverImage) ??
    assetUrl(venue.gallery[0]?.imageUrl) ??
    assetUrl(venue.locations.find((l) => l.panoramaUrl)?.panoramaUrl ?? null) ??
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85";

  const primaryLocation =
    venue.locations.find((l) => l._count.tables > 0) ?? venue.locations[0] ?? null;

  const metaLine = [venue.cuisine, venue.priceHint, venue.city].filter(Boolean).join(" · ");

  return (
    <>
      <section
        className="venue-hero"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="container venue-hero-inner">
          <p className="eyebrow">{venue.type === "HOTEL" ? "Hotel dining" : "Restaurant"}</p>
          <h1>{venue.name}</h1>
          {venue.tagline && <p className="venue-tagline">{venue.tagline}</p>}
          {metaLine && <p className="venue-meta-line">{metaLine}</p>}
        </div>
      </section>

      <div className="container venue-detail-layout">
        <div className="venue-detail-main">
          {venue.description && (
            <section className="venue-block">
              <h2>Our story</h2>
              <p className="lead venue-story">{venue.description}</p>
            </section>
          )}

          {venue.locations.some((l) => l.panoramaUrl) && (
            <section className="venue-block venue-tour-cta panel panel-royal" id="tour-360">
              <p className="eyebrow">Interactive tour</p>
              <h2>Step inside before you dine</h2>
              <p className="lead">
                Explore the dining room in immersive 360°, walk between scenes, and choose the table that feels right.
              </p>
              {primaryLocation && (
                <LuxuryButton href={`/book/${primaryLocation.id}`} className="venue-book-cta">
                  Launch 360° reservation →
                </LuxuryButton>
              )}
            </section>
          )}

          {venue.gallery.length > 0 && (
            <section className="venue-block">
              <h2>Gallery</h2>
              <div className="venue-gallery-grid">
                {venue.gallery.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    className="venue-gallery-thumb"
                    onClick={() => setLightbox(i)}
                    aria-label={img.caption || `Photo ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrl(img.imageUrl) ?? ""} alt={img.caption || venue.name} loading="lazy" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {venue.menuCategories.length > 0 && (
            <section className="venue-block">
              <h2>Menu highlights</h2>
              <div className="venue-menu">
                {venue.menuCategories.map((cat) => (
                  <div key={cat.id} className="venue-menu-category">
                    <h3>{cat.name}</h3>
                    <ul>
                      {cat.items.map((item) => (
                        <li key={item.id}>
                          <div className="venue-menu-item-head">
                            <span>{item.name}</span>
                            {item.price && <span className="venue-menu-price">{item.price}</span>}
                          </div>
                          {item.description && <p>{item.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="venue-block">
            <h2>Dining locations</h2>
            {venue.locations.length === 0 ? (
              <div className="empty-state">No dining locations listed yet.</div>
            ) : (
              <div className="restaurant-grid">
                {venue.locations.map((loc) => (
                  <Link key={loc.id} className="restaurant-card" href={`/book/${loc.id}`}>
                    <div className="restaurant-body">
                      <h3>{loc.name}</h3>
                      <p className="lead" style={{ fontSize: 14, margin: "8px 0 0" }}>
                        {loc.description || "Reserve a table in this space."}
                      </p>
                      <div className="restaurant-meta" style={{ marginTop: 12 }}>
                        <span>{loc._count.tables} tables</span>
                        {loc.panoramaUrl && (
                          <>
                            <span>•</span>
                            <span>360° tour</span>
                          </>
                        )}
                      </div>
                      <span className="button primary location-card-action">Book with 360° →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {(hours.length > 0 || amenities.length > 0 || venue.address) && (
            <section className="venue-block venue-info-grid">
              {hours.length > 0 && (
                <div>
                  <h2>Hours</h2>
                  <ul className="venue-hours-list">
                    {hours.map((h, i) => (
                      <li key={`${h.day}-${i}`}>
                        <span>{h.day}</span>
                        <span>{h.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {amenities.length > 0 && (
                <div>
                  <h2>Amenities</h2>
                  <ul className="venue-amenities">
                    {amenities.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(venue.address || venue.phone || venue.contactEmail) && (
                <div>
                  <h2>Visit</h2>
                  {venue.address && <p>{venue.address}</p>}
                  {venue.phone && (
                    <p>
                      <a href={`tel:${venue.phone.replace(/\s/g, "")}`}>{venue.phone}</a>
                    </p>
                  )}
                  {venue.contactEmail && (
                    <p>
                      <a href={`mailto:${venue.contactEmail}`}>{venue.contactEmail}</a>
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {venue.mapEmbedUrl && (
            <section className="venue-block">
              <h2>Location</h2>
              <div className="venue-map-embed">
                <iframe
                  title={`Map — ${venue.name}`}
                  src={venue.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </section>
          )}
        </div>

        <aside className="venue-book-sticky">
          <div className="venue-book-card panel">
            <p className="eyebrow">Reserve</p>
            <h3>Book your table</h3>
            <p className="lead" style={{ fontSize: 14 }}>
              Choose your table in immersive 360° before you arrive.
            </p>
            {primaryLocation ? (
              <LuxuryButton href={`/book/${primaryLocation.id}`} className="venue-book-cta">
                Book at {primaryLocation.name}
              </LuxuryButton>
            ) : (
              <p className="muted">Booking opens when a dining location is available.</p>
            )}
            {venue.locations.length > 1 && primaryLocation && (
              <p className="venue-alt-locations">
                Or pick another space in{" "}
                <a href="#dining-locations" onClick={(e) => e.preventDefault()}>
                  dining locations
                </a>{" "}
                below.
              </p>
            )}
          </div>
        </aside>
      </div>

      {lightbox !== null && venue.gallery[lightbox] && (
        <div
          className="venue-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button type="button" className="venue-lightbox-close" onClick={() => setLightbox(null)}>
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetUrl(venue.gallery[lightbox].imageUrl) ?? ""}
            alt={venue.gallery[lightbox].caption || venue.name}
            onClick={(e) => e.stopPropagation()}
          />
          {venue.gallery[lightbox].caption && (
            <p className="venue-lightbox-caption">{venue.gallery[lightbox].caption}</p>
          )}
        </div>
      )}
    </>
  );
}
