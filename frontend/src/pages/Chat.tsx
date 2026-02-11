import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { listMessages, sendMessage } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card, Button, Input } from "../components/ui";
import { Send } from "lucide-react";

type Msg = {
  messageId: string;
  senderId: string;
  text: string;
  createdAtMs: number;
};

export default function Chat() {
  const { conversationId } = useParams();
  const { token, userId } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function refresh() {
    if (!token || !conversationId) return;
    const data = await listMessages(token, conversationId);
    setMessages((data.messages || []) as Msg[]);
  }

  useEffect(() => {
    let t: any;
    (async () => {
      try {
        setErr(null);
        await refresh();
        t = setInterval(refresh, 1200);
      } catch (e: any) {
        setErr(e?.message || "Failed to load messages");
      }
    })();
    return () => t && clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!conversationId) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Card className="overflow-hidden">
        <div className="border-b bg-white px-6 py-4">
          <div className="text-xs text-slate-500">UTA Marketplace</div>
          <div className="text-xl font-extrabold text-uta-navy">
            Chat • {conversationId.slice(0, 8)}
          </div>
        </div>

        <div className="h-[65vh] overflow-y-auto bg-uta-ice/60 p-6">
          {err && (
            <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="space-y-3">
            {messages.map((m) => {
              const mine = m.senderId === userId;
              return (
                <div key={m.messageId} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm shadow-soft ${
                      mine
                        ? "bg-uta-blue text-white"
                        : "bg-white text-slate-900 border"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div className={`mt-1 text-[11px] ${mine ? "text-white/80" : "text-slate-500"}`}>
                      {mine ? "You" : m.senderId} • {new Date(m.createdAtMs).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t bg-white p-4">
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token) return;
              const trimmed = text.trim();
              if (!trimmed) return;
              setText("");
              try {
                await sendMessage(token, conversationId, trimmed);
                await refresh();
              } catch (e: any) {
                setErr(e?.message || "Send failed");
              }
            }}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
            <Button className="bg-uta-orange hover:brightness-105" type="submit">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </form>
        </div>
      </Card>

      <Card className="p-6 h-fit">
        <div className="font-extrabold text-uta-navy">Safe meetup</div>
        <div className="text-sm text-slate-600 mt-2 space-y-2">
          <div>• Meet at public places (Library / UC).</div>
          <div>• Avoid sharing sensitive info.</div>
          <div>• Confirm the item before payment.</div>
        </div>

        <div className="mt-5 rounded-2xl bg-orange-50 border border-orange-100 p-4">
          <div className="text-xs text-slate-500">You are</div>
          <div className="mt-1 font-mono font-bold text-uta-navy">{userId}</div>
        </div>
      </Card>
    </div>
  );
}