// src/data/mock.ts
import { CATEGORIES, CONDITIONS, FEATURE_TAGS, MEET_SPOTS } from "../config/marketplace";

export type Listing = {
  id: string;
  title: string;
  price: number;
  categoryId: string;
  conditionId: string;
  sellerId: string;
  meetSpotId: string;
  imageUrl: string;
  featureTagIds?: string[];
  createdAtMs: number;
};

export const DEV_USERS = [
  { id: "buyer123", hint: "Browse & chat as buyer" },
  { id: "seller456", hint: "Try messaging as seller" },
  { id: "grad789", hint: "Grad student vibe" },
];

const now = Date.now();

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "listingA",
    title: "MacBook Pro 13 (M1) — Great condition",
    price: 650,
    categoryId: CATEGORIES.find((c) => c.id === "electronics")!.id,
    conditionId: CONDITIONS.find((c) => c.id === "like_new")!.id,
    sellerId: "seller456",
    meetSpotId: MEET_SPOTS.find((m) => m.id === "library")!.id,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80",
    featureTagIds: [FEATURE_TAGS.find((t) => t.id === "hot")!.id],
    createdAtMs: now - 2 * 60 * 60 * 1000,
  },
  {
    id: "listingB",
    title: "Calculus Textbook (Stewart) — 8th Ed",
    price: 35,
    categoryId: CATEGORIES.find((c) => c.id === "books")!.id,
    conditionId: CONDITIONS.find((c) => c.id === "good")!.id,
    sellerId: "seller789",
    meetSpotId: MEET_SPOTS.find((m) => m.id === "central")!.id,
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80",
    featureTagIds: [FEATURE_TAGS.find((t) => t.id === "deal")!.id],
    createdAtMs: now - 6 * 60 * 60 * 1000,
  },
  {
    id: "listingC",
    title: "Mini Fridge — perfect for dorm",
    price: 90,
    categoryId: CATEGORIES.find((c) => c.id === "home")!.id,
    conditionId: CONDITIONS.find((c) => c.id === "fair")!.id,
    sellerId: "seller456",
    meetSpotId: MEET_SPOTS.find((m) => m.id === "arlington_hall")!.id,
    imageUrl:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1400&q=80",
    createdAtMs: now - 12 * 60 * 60 * 1000,
  },
  {
    id: "listingD",
    title: "Office Chair — ergonomic mesh",
    price: 55,
    categoryId: CATEGORIES.find((c) => c.id === "furniture")!.id,
    conditionId: CONDITIONS.find((c) => c.id === "good")!.id,
    sellerId: "seller111",
    meetSpotId: MEET_SPOTS.find((m) => m.id === "eng")!.id,
    imageUrl:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1400&q=80",
    createdAtMs: now - 20 * 60 * 60 * 1000,
  },
];