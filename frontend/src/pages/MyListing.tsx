import { useEffect, useState } from "react";
import { useAuth } from "../state/auth";
import { getUserListings, listListings, deleteListing } from "../lib/api";
import { Card, Button } from "../components/ui";

export default function MyListings() {
  const { token, userId } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const resp: any = await listListings();

    console.log("Current User:", userId);
    console.log("All Listings:", resp.listings);

    const mine = (resp.listings || []).filter(
      (l: any) => String(l.seller_id) === String(userId)
    );

    console.log("Filtered Mine:", mine);

    setItems(mine);
  }

  useEffect(() => {
    load();
  }, [token, userId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Listings</h1>

      {items.length === 0 && (
        <div className="text-slate-500">
          No listings yet.
        </div>
      )}

      {items.map((l) => (
        <Card key={l.id} className="p-4 flex justify-between">
          <div>
            <div className="font-bold">{l.title}</div>
            <div>${l.price}</div>
          </div>

          <Button
            variant="secondary"
            onClick={async () => {
              await deleteListing(token!, l.id);
              load();
            }}
          >
            Delete
          </Button>
        </Card>
      ))}
    </div>
  );
}