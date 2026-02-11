import { useMemo, useState } from "react";
import { DollarSign, MapPin, Tag, MessageSquare, Sparkles, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../state/auth";
import { startConversation } from "../lib/api";
import { useNavigate } from "react-router-dom";
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
  badge?: string;
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
  const { token } = useAuth();
  const nav = useNavigate();

  // ✅ Centralized data objects (later: replace LISTINGS with API result)
  const LISTINGS: Listing[] = useMemo(
    () => [
      {
        id: "listingA",
        title: "MacBook Pro 13 (M1) — Great condition",
        price: 650,
        category: "Electronics",
        condition: "Like New",
        sellerId: "seller456",
        location: "UTA Library",
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
        badge: "Hot",
      },
      {
        id: "listingB",
        title: "Calculus Textbook (Stewart) — 8th Ed",
        price: 35,
        category: "Books",
        condition: "Good",
        sellerId: "seller789",
        location: "Central Campus",
        image:
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80",
        badge: "Deal",
      },
      {
        id: "listingC",
        title: "Mini Fridge — perfect for dorm",
        price: 90,
        category: "Home",
        condition: "Fair",
        sellerId: "seller456",
        location: "Arlington Hall",
        image:
          "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "listingD",
        title: "Office Chair — ergonomic mesh",
        price: 55,
        category: "Furniture",
        condition: "Good",
        sellerId: "seller111",
        location: "Engineering Building",
        image:
          "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "listingE",
        title: "iPad (9th Gen) + Apple Pencil",
        price: 280,
        category: "Electronics",
        condition: "Good",
        sellerId: "seller222",
        location: "UC",
        image:
          "https://images.unsplash.com/photo-1587033411391-5d9f3a9c8b41?auto=format&fit=crop&w=1600&q=80",
        badge: "Popular",
      },
      {
        id: "listingF",
        title: "Dorm Desk Lamp (warm light)",
        price: 12,
        category: "Home",
        condition: "Like New",
        sellerId: "seller333",
        location: "KC Hall",
        image:
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    []
  );

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

  // ✅ Derived categories from data (no hardcoded category list)
  const categories = useMemo(() => {
    const unique = Array.from(new Set(LISTINGS.map((l) => l.category))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...unique];
  }, [LISTINGS]);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return LISTINGS.filter((l) => {
      const matchesQ = l.title.toLowerCase().includes(query);
      const matchesCat = category === "All" ? true : l.category === category;
      return matchesQ && matchesCat;
    });
  }, [LISTINGS, q, category]);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <Card className="p-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-uta-blue/10 blur-2xl" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-uta-orange/10 blur-2xl" />

        <div className="flex flex-col lg:flex-row gap-6 lg:items-end lg:justify-between">
          <div>
            <Pill className="bg-blue-50 text-uta-blue border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Student Community Marketplace
            </Pill>
            <h1 className="mt-3 text-3xl font-extrabold text-uta-navy">Find deals on campus</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Buy and sell with UTA students — books, electronics, furniture, dorm essentials. Chat instantly and meet safely.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {HERO_CHIPS.map((chip) => (
                <Pill key={chip.id} className={chip.className}>
                  {chip.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[34rem] space-y-2">
            <div className="flex gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search laptops, books, furniture..."
              />
              <Button variant="secondary">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${
                    category === c
                      ? "bg-uta-blue text-white border-uta-blue"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* MAIN GRID + SIDE INFO */}
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="p-5 h-fit">
          <div className="font-extrabold text-uta-navy">Campus tips</div>
          <div className="text-sm text-slate-600 mt-2 space-y-2">
            {CAMPUS_TIPS.map((t) => (
              <div key={t.id}>• {t.text}</div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-uta-ice border border-blue-100 p-4">
            <div className="text-xs text-slate-500">Category</div>
            <div className="mt-1 font-bold text-uta-navy">{category}</div>
          </div>
        </Card>

        <div>
          <div className="mb-3 text-sm text-slate-600">
            Showing <span className="font-bold text-uta-navy">{filtered.length}</span> listings
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((l) => (
              <div key={l.id} className="group overflow-hidden rounded-3xl border bg-white shadow-soft">
                <div className="relative">
                  <img
                    src={l.image}
                    alt={l.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {l.badge && (
                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-uta-navy shadow-soft">
                      {l.badge}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-uta-navy">{l.title}</h3>
                    <div className="shrink-0 rounded-2xl bg-uta-orange px-3 py-2 text-sm font-extrabold text-white shadow-soft">
                      ${l.price}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-uta-blue border border-blue-100">
                      <Tag className="h-3.5 w-3.5" /> {l.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                      <DollarSign className="h-3.5 w-3.5" /> {l.condition}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                      <MapPin className="h-3.5 w-3.5" /> {l.location}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Seller: <span className="font-mono text-slate-700">{l.sellerId}</span>
                    </div>

                    <Button
                      onClick={async () => {
                        if (!token) {
                          nav("/auth");
                          return;
                        }
                        const resp = await startConversation(token, l.id, l.sellerId);
                        nav(`/chat/${resp.conversationId}`);
                      }}
                      className="bg-uta-blue"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!filtered.length && (
            <Card className="mt-6 p-8 text-center">
              <div className="text-lg font-extrabold text-uta-navy">No results</div>
              <div className="mt-1 text-sm text-slate-600">Try a different keyword or category.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}