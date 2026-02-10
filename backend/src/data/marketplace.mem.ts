// TODO: replace with DB/config service later
export const MARKETPLACE_CONFIG = {
  categories: [
    { id: "electronics", label: "Electronics", emoji: "💻" },
    { id: "books", label: "Books", emoji: "📚" },
    { id: "furniture", label: "Furniture", emoji: "🪑" },
    { id: "home", label: "Home", emoji: "🏠" }
  ],
  conditions: [
    { id: "like_new", label: "Like New" },
    { id: "good", label: "Good" },
    { id: "fair", label: "Fair" }
  ],
  featureTags: [
    { id: "hot", label: "Hot" },
    { id: "deal", label: "Deal" },
    { id: "popular", label: "Popular" }
  ],
  meetSpots: [
    { id: "uta_library", label: "UTA Library" },
    { id: "uc", label: "UC" },
    { id: "engineering", label: "Engineering Building" },
    { id: "central_campus", label: "Central Campus" }
  ],
  quickFilterTags: [
    { id: "under_50", label: "Under $50" },
    { id: "textbooks", label: "Textbooks" }
  ]
};