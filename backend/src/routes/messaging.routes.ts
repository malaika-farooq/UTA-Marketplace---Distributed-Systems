import { Router } from "express";
import { requireAuth } from "../auth/requireAuth.js";
import * as mem from "../data/messaging.mem.js";

const r = Router();

// POST /messaging/conversations { listingId, sellerId }
r.post("/conversations", requireAuth, (req, res) => {
  const listingId = String((req.body as any)?.listingId ?? "").trim();
  const sellerId = String((req.body as any)?.sellerId ?? "").trim();
  const buyerId = String(req.userId ?? "").trim();

  if (!listingId || !sellerId) return res.status(400).json({ error: "listingId and sellerId required" });

  const c = mem.getOrCreateConversation(listingId, buyerId, sellerId);

  res.json({
    conversationId: c.id,
    listingId: c.listingId,
    buyerId: c.buyerId,
    sellerId: c.sellerId
  });
});

// GET /messaging/conversations?limit=&offset=
r.get("/conversations", requireAuth, (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);

  const rows = mem.listConversations(String(req.userId), limit, offset);
  res.json({ conversations: rows });
});

// GET /messaging/messages/:conversationId?limit=&beforeMs=
r.get("/messages/:conversationId", requireAuth, (req, res) => {
  const conversationId = String(req.params.conversationId ?? "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 200);
  const beforeMs = Math.max(Number(req.query.beforeMs ?? 0), 0);

  if (!conversationId) return res.status(400).json({ error: "conversationId required" });

  const ok = mem.isParticipant(conversationId, String(req.userId));
  if (!ok) return res.status(403).json({ error: "Not a participant" });

  const rows = mem.listMessages(conversationId, limit, beforeMs);
  res.json({ messages: rows });
});

// POST /messaging/messages { conversationId, text }
r.post("/messages", requireAuth, (req, res) => {
  const conversationId = String((req.body as any)?.conversationId ?? "").trim();
  const text = String((req.body as any)?.text ?? "").trim();

  if (!conversationId || !text) return res.status(400).json({ error: "conversationId and text required" });

  const ok = mem.isParticipant(conversationId, String(req.userId));
  if (!ok) return res.status(403).json({ error: "Not a participant" });

  const m = mem.insertMessage(conversationId, String(req.userId), text);

  res.json({
    messageId: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    text: m.text,
    createdAtMs: m.createdAtMs
  });
});

export default r;