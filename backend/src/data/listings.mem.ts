// TODO: replace with DB table later
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
};

export const LISTINGS: Listing[] = [
  {
    id: "listingA",
    title: "MacBook Pro 13 (M1) — Great condition",
    price: 650,
    categoryId: "electronics",
    conditionId: "like_new",
    sellerId: "seller456",
    meetSpotId: "uta_library",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
    featureTagIds: ["hot"]
  },
  {
    id: "listingB",
    title: "Calculus Textbook (Stewart) — 8th Ed",
    price: 35,
    categoryId: "books",
    conditionId: "good",
    sellerId: "seller789",
    meetSpotId: "central_campus",
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80",
    featureTagIds: ["deal"]
  }
];