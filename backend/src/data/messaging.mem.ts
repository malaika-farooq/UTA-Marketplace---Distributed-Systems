// TODO: replace with DB later (conversations/messages tables)
// TODO: later call gRPC messaging service instead of arrays

export type Conversation = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAtMs: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAtMs: number;
};

const conversations: Conversation[] = [];
const messages: Message[] = [];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function getOrCreateConversation(listingId: string, buyerId: string, sellerId: string) {
  let c = conversations.find(
    (x) => x.listingId === listingId && x.buyerId === buyerId && x.sellerId === sellerId
  );
  if (!c) {
    c = { id: uid("conv"), listingId, buyerId, sellerId, createdAtMs: Date.now() };
    conversations.push(c);
  }
  return c;
}

export function isParticipant(conversationId: string, userId: string) {
  const c = conversations.find((x) => x.id === conversationId);
  if (!c) return false;
  return c.buyerId === userId || c.sellerId === userId;
}

export function listConversations(userId: string, limit: number, offset: number) {
  const mine = conversations
    .filter((c) => c.buyerId === userId || c.sellerId === userId)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);

  const page = mine.slice(offset, offset + limit);

  return page.map((c) => {
    const last = [...messages]
      .filter((m) => m.conversationId === c.id)
      .sort((a, b) => b.createdAtMs - a.createdAtMs)[0];

    return {
      conversationId: c.id,
      listingId: c.listingId,
      buyerId: c.buyerId,
      sellerId: c.sellerId,
      lastMessageText: last?.text ?? "",
      lastMessageAtMs: last?.createdAtMs ?? 0
    };
  });
}

export function insertMessage(conversationId: string, senderId: string, text: string) {
  const m: Message = {
    id: uid("msg"),
    conversationId,
    senderId,
    text: String(text || "").slice(0, 1000),
    createdAtMs: Date.now()
  };
  messages.push(m);
  return m;
}

export function listMessages(conversationId: string, limit: number, beforeMs?: number) {
  const b = beforeMs && beforeMs > 0 ? beforeMs : Number.POSITIVE_INFINITY;
  return messages
    .filter((m) => m.conversationId === conversationId && m.createdAtMs < b)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, limit);
}