import { useEffect, useState } from "react";
import { useAuth } from "../state/auth";
import { listInbox } from "../lib/api";
import { Card, Button } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function Inbox() {
  const { token } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const data = await listInbox(token);
        setItems(data.conversations || []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load inbox");
      }
    })();
  }, [token]);

  return (
    <div className="space-y-4">
      <div className="text-2xl font-extrabold text-uta-navy">Inbox</div>

      {err && <Card className="p-4 border-red-200 bg-red-50 text-red-700">{err}</Card>}

      <div className="grid gap-4">
        {items.map((c) => (
          <Card key={c.conversationId} className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-uta-navy inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-uta-blue" />
                Conversation {String(c.conversationId).slice(0, 8)}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                Listing: <span className="font-mono">{c.listingId}</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                Last: {c.lastMessageText || <span className="italic text-slate-400">No messages yet</span>}
              </div>
            </div>
            <Button className="bg-uta-blue" onClick={() => nav(`/chat/${c.conversationId}`)}>
              Open
            </Button>
          </Card>
        ))}

        {!items.length && (
          <Card className="p-8 text-center">
            <div className="font-extrabold text-uta-navy">No conversations yet</div>
            <div className="text-sm text-slate-600 mt-1">Message a seller from the Listings page.</div>
          </Card>
        )}
      </div>
    </div>
  );
}