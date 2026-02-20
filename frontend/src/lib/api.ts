// ---------------- ARCHITECTURE ----------------

let BASE =
  localStorage.getItem("architecture") === "mono"
    ? "http://localhost:9000"
    : "http://localhost:8080";

export function setArchitecture(mode: "micro" | "mono") {
  BASE =
    mode === "mono"
      ? "http://localhost:9000"
      : "http://localhost:8080";

  localStorage.setItem("architecture", mode);
}

// ---------------- REQUEST WRAPPER ----------------

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const r = await fetch(`${BASE}${path}`, opts);

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `Request failed: ${r.status}`;
    throw new Error(msg);
  }

  return data as T;
}

// =================================================
// ================= AUTH ===========================
// =================================================

// Dev login (unchanged)
export async function devLogin(userId: string): Promise<{ token: string }> {
  return req("/auth/dev-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

// ✅ REGISTER FIXED
export async function authRegister(body: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}): Promise<{
  success: boolean;
  message: string;
  user_id: string;
  token: string;
}> {
  return req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ✅ LOGIN FIXED
export async function authLogin(body: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  user_id: string;
  token: string;
}> {
  return req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// =================================================
// ================= PROFILE ========================
// =================================================

export interface UserProfile {
  id?: string;
  email: string;
  full_name?: string;
  phone?: string;
  whatsapp?: string;
}

export async function loadProfile(token: string): Promise<UserProfile> {
  const resp = await req<any>("/api/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const user = resp.user ?? resp;

  if (!user?.email) {
    throw new Error("Invalid profile response");
  }

  return user as UserProfile;
}

export async function getUserById(id: string) {
  const res = await fetch(`http://localhost:8080/api/user/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch seller");
  }

  return res.json();
}

export async function updateProfile(token: string, data: any) {
  const res = await fetch("http://localhost:8080/api/user/profile", {
    method: "PUT", // or PATCH depending on backend
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return res.json();
}
// =================================================
// ================= CONTACT (Messaging Service) ===
// =================================================

export async function initiateContact(
  token: string,
  listing_id: string,
  seller_id: string,
  contact_method: "whatsapp" | "email"
): Promise<{
  success: boolean;
  message: string;
  contact_url?: string;
  contact_info?: string;
}> {
  return req("/api/messages/initiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      listing_id,
      seller_id,
      contact_method,
    }),
  });
}


// =================================================
// ================= LISTINGS =======================
// =================================================

export async function listListings(): Promise<{ listings: any[] }> {
  return req("/api/listings");
}

export async function createListing(token: string, body: any) {
  return req("/api/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

// Get My Listings (AUTH REQUIRED)
export async function getMyListings(
  token: string
): Promise<{ listings: any[]; total_count: number }> {
  return req("/api/listings/user/my-listings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateListing(
  token: string,
  id: string,
  body: any
) {
  return req(`/api/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

export async function deleteListing(token: string, id: string) {
  return req(`/api/listings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export interface UserListingsResponse {
  success: boolean;
  listings: any[];
  total_count: number;
}

export async function getUserListings(
  token: string,
  userId: string
): Promise<UserListingsResponse> {
  return req<UserListingsResponse>("/api/listings/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      limit: 50,
      offset: 0,
    }),
  });
}
export async function listInbox(
  token: string
): Promise<{ attempts: any[]; total_count: number }> {
  return req(`/api/messages/history?limit=50&offset=0`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}