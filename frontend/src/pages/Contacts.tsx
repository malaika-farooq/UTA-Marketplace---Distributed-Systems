import { useEffect, useState } from "react";
import { listInbox } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/ui";

export default function Contacts() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;

      try {
        const data = await listInbox(token);
        setContacts(data.attempts || []);
      } catch (err) {
        console.error("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">My Contact History</h1>

      {contacts.length === 0 && (
        <div className="text-slate-500">
          No contact attempts yet.
        </div>
      )}

      <div className="space-y-4">
        {contacts.map((c, i) => (
          <Card key={i} className="p-4">
            <div className="font-bold">{c.listing_title}</div>
            <div className="text-sm text-slate-600">
              Seller: {c.seller_id}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Method: {c.contact_method}
            </div>
            <div className="text-xs text-slate-400">
              {new Date(Number(c.timestamp)).toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}