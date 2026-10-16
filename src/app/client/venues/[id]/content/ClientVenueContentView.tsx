"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDashboardShell } from "@/components/client/ClientDashboardShell";
import { api } from "@/lib/api";
import { assetUrl } from "@/lib/config";
import { getUser } from "@/lib/auth-storage";

type GalleryImage = { id: string; imageUrl: string; caption: string };
type MenuItem = { id: string; name: string; description: string; price: string };
type MenuCategory = { id: string; name: string; items: MenuItem[] };

type VenueDetail = {
  id: string;
  name: string;
  city: string;
  description: string;
  cuisine: string;
  priceHint: string;
  tagline: string;
  address: string;
  phone: string;
  contactEmail: string;
  amenities: string;
  openingHours: string;
  mapEmbedUrl: string;
  gallery: GalleryImage[];
  menuCategories: MenuCategory[];
};

const DEFAULT_HOURS = JSON.stringify(
  [
    { day: "Mon – Thu", hours: "12:00 – 22:00" },
    { day: "Fri – Sat", hours: "12:00 – 23:30" },
    { day: "Sun", hours: "12:00 – 21:00" },
  ],
  null,
  2
);

export function ClientVenueContentView({ id }: { id: string }) {
  const router = useRouter();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [profile, setProfile] = useState({
    tagline: "",
    description: "",
    cuisine: "",
    priceHint: "",
    address: "",
    phone: "",
    contactEmail: "",
    amenities: "[]",
    openingHours: DEFAULT_HOURS,
    mapEmbedUrl: "",
  });
  const [catName, setCatName] = useState("");
  const [itemForm, setItemForm] = useState({ categoryId: "", name: "", description: "", price: "" });
  const [galleryCaption, setGalleryCaption] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const load = async () => {
    const data = await api<VenueDetail>(`/api/client/venues/${id}/detail`);
    setVenue(data);
    setProfile({
      tagline: data.tagline,
      description: data.description,
      cuisine: data.cuisine,
      priceHint: data.priceHint,
      address: data.address,
      phone: data.phone,
      contactEmail: data.contactEmail,
      amenities: data.amenities || "[]",
      openingHours: data.openingHours || DEFAULT_HOURS,
      mapEmbedUrl: data.mapEmbedUrl,
    });
    if (data.menuCategories.length && !itemForm.categoryId) {
      setItemForm((f) => ({ ...f, categoryId: data.menuCategories[0].id }));
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "CLIENT") {
      router.replace("/client/login");
      return;
    }
    load().catch(() => showToast("Failed to load venue"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api(`/api/client/venues/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...profile,
          name: venue?.name,
          city: venue?.city,
        }),
      });
      showToast("Profile saved");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed");
    }
  };

  const uploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", galleryCaption);
    try {
      await api(`/api/client/venues/${id}/gallery`, { method: "POST", body: fd });
      setGalleryCaption("");
      e.target.value = "";
      showToast("Photo added");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const deleteGallery = async (imageId: string) => {
    try {
      await api(`/api/client/venues/${id}/gallery/${imageId}`, { method: "DELETE" });
      showToast("Photo removed");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await api(`/api/client/venues/${id}/menu/categories`, {
        method: "POST",
        body: JSON.stringify({ name: catName.trim() }),
      });
      setCatName("");
      showToast("Category added");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api(`/api/client/venues/${id}/menu/items`, {
        method: "POST",
        body: JSON.stringify(itemForm),
      });
      setItemForm((f) => ({ ...f, name: "", description: "", price: "" }));
      showToast("Menu item added");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await api(`/api/client/menu/items/${itemId}`, { method: "DELETE" });
      showToast("Item removed");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  if (!venue) {
    return (
      <ClientDashboardShell title="Venue page content">
        <p className="lead">Loading venue content…</p>
      </ClientDashboardShell>
    );
  }

  return (
    <ClientDashboardShell
      title="Venue page content"
      subtitle={`${venue.name} — gallery, menu, hours, and contact on the public restaurant page.`}
    >
        <div className="dash-inline-links">
          <Link href={`/client/venues/${id}`}>← Locations & 360°</Link>
          <Link href={`/venues/${id}`} target="_blank">
            Preview public page ↗
          </Link>
        </div>

        <form className="panel form-grid venue-cms-form" onSubmit={saveProfile}>
          <h2>Profile</h2>
          <label>
            Tagline
            <input value={profile.tagline} onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))} />
          </label>
          <label>
            Cuisine
            <input value={profile.cuisine} onChange={(e) => setProfile((p) => ({ ...p, cuisine: e.target.value }))} />
          </label>
          <label>
            Price hint
            <input
              value={profile.priceHint}
              onChange={(e) => setProfile((p) => ({ ...p, priceHint: e.target.value }))}
              placeholder="e.g. $$$ · Fine dining"
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              rows={4}
              value={profile.description}
              onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
          <label>
            Address
            <input value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
          </label>
          <label>
            Phone
            <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </label>
          <label>
            Contact email
            <input
              value={profile.contactEmail}
              onChange={(e) => setProfile((p) => ({ ...p, contactEmail: e.target.value }))}
            />
          </label>
          <label>
            Map embed URL
            <input
              value={profile.mapEmbedUrl}
              onChange={(e) => setProfile((p) => ({ ...p, mapEmbedUrl: e.target.value }))}
              placeholder="Google Maps embed iframe src"
            />
          </label>
          <label className="span-2">
            Amenities (JSON array of strings)
            <textarea
              rows={3}
              value={profile.amenities}
              onChange={(e) => setProfile((p) => ({ ...p, amenities: e.target.value }))}
              placeholder='["Valet parking","Private dining","Wine cellar"]'
            />
          </label>
          <label className="span-2">
            Opening hours (JSON)
            <textarea
              rows={6}
              value={profile.openingHours}
              onChange={(e) => setProfile((p) => ({ ...p, openingHours: e.target.value }))}
            />
          </label>
          <button type="submit" className="button primary">
            Save profile
          </button>
        </form>

        <section className="panel" style={{ marginTop: 24 }}>
          <h2>Gallery</h2>
          <div className="form-grid" style={{ maxWidth: 480, marginTop: 12 }}>
            <label>
              Caption (optional)
              <input value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} />
            </label>
            <label>
              Upload photo
              <input type="file" accept="image/*" onChange={uploadGallery} />
            </label>
          </div>
          <div className="venue-gallery-grid" style={{ marginTop: 16 }}>
            {venue.gallery.map((img) => (
              <div key={img.id} className="venue-cms-gallery-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl(img.imageUrl) ?? ""} alt={img.caption || ""} />
                <button type="button" className="button ghost small" onClick={() => deleteGallery(img.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ marginTop: 24 }}>
          <h2>Menu</h2>
          <form className="form-grid" style={{ maxWidth: 360, marginTop: 12 }} onSubmit={addCategory}>
            <label>
              New category
              <input value={catName} onChange={(e) => setCatName(e.target.value)} required />
            </label>
            <button type="submit" className="button primary">
              Add category
            </button>
          </form>

          <form className="form-grid venue-cms-menu-add" onSubmit={addItem} style={{ marginTop: 16 }}>
            <label>
              Category
              <select
                value={itemForm.categoryId}
                onChange={(e) => setItemForm((f) => ({ ...f, categoryId: e.target.value }))}
                required
              >
                <option value="">Select…</option>
                {venue.menuCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Item name
              <input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} required />
            </label>
            <label>
              Price
              <input value={itemForm.price} onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))} />
            </label>
            <label className="span-2">
              Description
              <input
                value={itemForm.description}
                onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <button type="submit" className="button primary">
              Add menu item
            </button>
          </form>

          {venue.menuCategories.map((cat) => (
            <div key={cat.id} style={{ marginTop: 20 }}>
              <h3>{cat.name}</h3>
              <ul className="venue-cms-menu-list">
                {cat.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.name}
                      {item.price ? ` · ${item.price}` : ""}
                    </span>
                    <button type="button" className="button ghost small" onClick={() => deleteItem(item.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </ClientDashboardShell>
  );
}
