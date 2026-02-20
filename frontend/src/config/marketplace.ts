// src/config/marketplace.ts
export type Category = { id: string; label: string; emoji?: string };
export type Condition = { id: string; label: string };
export type Tag = { id: string; label: string };
export type MeetSpot = { id: string; label: string };

export const BRAND = {
  name: "UTA Marketplace",
  tagline: "Buy • Sell • Chat • Pickup",
  colors: {
    blue: "#0057B8",
    orange: "#F58025",
    navy: "#0B1B3A",
  },
};

export const NAV_LINKS = [
  { id: "browse", label: "Browse", to: "/listings" },
  { id: "sell", label: "Sell", to: "/sell" }, // later
  { id: "messages", label: "Messages", to: "/messages" }, // later
] as const;

export const CATEGORIES: Category[] = [
  { id: "electronics", label: "Electronics", emoji: "💻" },
  { id: "books", label: "Books", emoji: "📚" },
  { id: "furniture", label: "Furniture", emoji: "🪑" },
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "bikes", label: "Bikes", emoji: "🚲" },
  { id: "tickets", label: "Tickets", emoji: "🎟️" },
  { id: "other", label: "Other", emoji: "✨" },
];

export const CONDITIONS: Condition[] = [
  { id: "new", label: "New" },
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "for_parts", label: "For parts" },
];

export const FEATURE_TAGS: Tag[] = [
  { id: "hot", label: "Hot" },
  { id: "deal", label: "Deal" },
  { id: "urgent", label: "Urgent pickup" },
  { id: "verified", label: "Verified seller" },
];

export const QUICK_FILTER_TAGS: Tag[] = [
  { id: "dorm", label: "Dorm" },
  { id: "textbooks", label: "Textbooks" },
  { id: "lab", label: "Lab gear" },
  { id: "parking", label: "Parking-friendly pickup" },
  { id: "budget", label: "Budget" },
];

export const MEET_SPOTS: MeetSpot[] = [
  { id: "library", label: "UTA Library" },
  { id: "uc", label: "University Center" },
  { id: "eng", label: "Engineering Building" },
  { id: "arlington_hall", label: "Arlington Hall" },
  { id: "central", label: "Central Campus" },
];

export const LISTINGS_PAGE = {
  heroTitle: "Browse listings",
  heroSubtitle: "Student-to-student deals. Meet safely on campus.",
  tipsTitle: "Campus tips",
};

export const CAMPUS_TIPS = [
  { id: "meet", text: "Meet at library / UC / engineering lobby." },
  { id: "verify", text: "Verify condition before payment." },
  { id: "chat", text: "Keep chats per rules of the app." },
];

export const DIS = {
  brandTitle: "UTA Marketplace",
  brandSubtitle: "Student-to-student deals",
  brandMark: "U",
  brandHref: "/listings",
  signedInLabel: "Signed in as",
  signOutLabel: "Sign out",
  signInLabel: "Sign in",
  footerLeft: "UTA Marketplace • Distributed Systems Project",
  footerRight: "REST Gateway → gRPC Services → Postgres (later)",
};

export const NAV_ITEMS = [
  { id: "listings", label: "Listings", href: "/listings", match: "exact" as const },
  { id: "Sellers", label: "Sellers", href: "/sellers", match: "prefix" as const },
  { id: "profile", label: "Profile", href: "/profile", match: "exact" as const },
];