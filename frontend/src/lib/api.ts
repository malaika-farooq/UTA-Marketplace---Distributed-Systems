const BASE = "http://localhost:8080";

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const r = await fetch(`${BASE}${path}`, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${r.status}`;
    throw new Error(msg);
  }
  return data as T;
}

// --- DEV (works with your current backend)
export async function devLogin(userId: string): Promise<{ token: string }> {
  return req("/auth/dev-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

// --- REAL AUTH (you will implement these in gateway later)
export async function authRegister(body: { username: string; email: string; password: string }): Promise<{ token: string; userId: string }> {
  return req("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function authLogin(body: { login: string; password: string }): Promise<{ token: string; userId: string }> {
  return req("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// --- Messaging
export async function startConversation(token: string, listingId: string, sellerId: string): Promise<{ conversationId: string }> {
  return req("/messages/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ listingId, sellerId }),
  });
}

export async function sendMessage(token: string, conversationId: string, text: string): Promise<any> {
  return req("/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ conversationId, text }),
  });
}

export async function listMessages(token: string, conversationId: string): Promise<{ messages: any[] }> {
  return req(`/messages/conversation/${conversationId}?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listInbox(token: string): Promise<{ conversations: any[] }> {
  return req(`/messages/inbox?limit=50&offset=0`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}