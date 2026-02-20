import { useMemo, useState, useEffect } from "react";
import {
  DollarSign,
  MapPin,
  Tag,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import {
  listListings,
  createListing,
  updateListing,
  deleteListing,
} from "../lib/api";
import { useNavigate } from "react-router-dom";
import { initiateContact } from "../lib/api";
import { useAuth } from "../state/auth";
import seal from "../assets/uta/uta-seal.png";

import { Card, Button, Input, Pill } from "../components/ui";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  sellerId: string;
  location: string;
  image: string;
};

type HeroChip = {
  id: string;
  label: string;
  className: string;
};

type CampusTip = {
  id: string;
  text: string;
};

export default function Listings() {
  const nav = useNavigate();
  const { token, userId } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    condition_id: "",
    meet_spot_id: "",
    image_url: "",
  });

  async function refreshListings() {
    const resp = await listListings();
    const mapped = (resp.listings || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      category: l.category_id,
      condition: l.condition_id,
      sellerId: l.seller_id,
      location: l.meet_spot_id,
      image: l.image_url,
    }));
    setListings(mapped);
  }

  useEffect(() => {
    refreshListings().finally(() => setLoading(false));
  }, []);

  const HERO_CHIPS: HeroChip[] = useMemo(
    () => [
      { id: "fast", label: "Fast pickup", className: "bg-orange-50 text-uta-orange border border-orange-100" },
      { id: "verified", label: "Verified flow", className: "bg-blue-50 text-uta-blue border border-blue-100" },
      { id: "chat", label: "Chat-first", className: "bg-blue-50 text-uta-blue border border-blue-100" },
    ],
    []
  );

  const CAMPUS_TIPS: CampusTip[] = useMemo(
    () => [
      { id: "t1", text: "Meet at library / UC / engineering lobby." },
      { id: "t2", text: "Verify condition before payment." },
      { id: "t3", text: "Keep chats inside the app." },
    ],
    []
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(listings.map((l) => l.category)));
    return ["All", ...unique];
  }, [listings]);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return listings.filter((l) => {
      const matchesQ = l.title.toLowerCase().includes(query);
      const matchesCat =
        category === "All" ? true : l.category === category;
      return matchesQ && matchesCat;
    });
  }, [listings, q, category]);

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="text-lg font-bold">Loading listings...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <Card className="p-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-uta-blue/10 blur-2xl" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-uta-orange/10 blur-2xl" />

        <div className="flex-col justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <div className="bg-blue-50 text-uta-blue border my-2border-blue-100">
                <img
                  src={seal}
                  alt="UTA Seal"
                  className="h-20 w-auto object-contain opacity-100"
                />
                Student Community Marketplace
              </div>
              <h1 className="mt-3 text-3xl font-extrabold text-uta-navy">
                Find deals on campus
              </h1>
            </div>
          </div>
          {/* {token && (
            <Button
              className="bg-uta-blue"
              onClick={() => nav("/my-listings")}
            >
              Create Listing
            </Button>
          )} */}
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${category === c
                ? "bg-uta-blue text-white border-uta-blue"
                : "bg-white text-slate-700 border-slate-200"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {/* GRID */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l) => (
          <div key={l.id} className="group overflow-hidden rounded-3xl border bg-white shadow-soft">
            <img
              src={l.image}
              alt={l.title}
              className="h-48 w-full object-cover"
            />

            <div className="p-5">
              <div className="flex justify-between">
                <h3 className="font-bold text-uta-navy">{l.title}</h3>
                <div className="bg-uta-orange px-3 py-2 text-white font-bold rounded-xl">
                  ${l.price}
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                {l.category} • {l.condition} • {l.location}
              </div>

              <div className="mt-4 flex justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const resp = await initiateContact(
                        token!,
                        l.id,
                        l.sellerId,
                        "whatsapp"
                      );
                      if (resp.contact_url) window.open(resp.contact_url, "_blank");
                    }}
                  >
                    WhatsApp
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={async () => {
                      const resp = await initiateContact(
                        token!,
                        l.id,
                        l.sellerId,
                        "email"
                      );
                      if (resp.contact_url) window.open(resp.contact_url, "_blank");
                    }}
                  >
                    Email
                  </Button>
                </div>

                {l.sellerId === userId && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(l);
                        setForm({
                          title: l.title,
                          description: "",
                          price: String(l.price),
                          category_id: l.category,
                          condition_id: l.condition,
                          meet_spot_id: l.location,
                          image_url: l.image,
                        });
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={async () => {
                        await deleteListing(token!, l.id);
                        refreshListings();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] space-y-3">
            <h2 className="font-bold text-lg">
              {editing ? "Edit Listing" : "Create Listing"}
            </h2>

            {Object.keys(form).map((key) => (
              <Input
                key={key}
                placeholder={key}
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
            ))}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!token) return;

                  if (editing) {
                    await updateListing(token, editing.id, form);
                  } else {
                    await createListing(token, form);
                  }

                  setShowModal(false);
                  setEditing(null);
                  refreshListings();
                }}
              >
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}