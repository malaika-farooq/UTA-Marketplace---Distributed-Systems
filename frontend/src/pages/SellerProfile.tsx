import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../lib/api";
import { Card, Button } from "../components/ui";

export default function SellerProfile() {
  const { id } = useParams();
  const nav = useNavigate();

  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getUserById(id)
      .then(setSeller)
      .catch(() => setError("Failed to load seller"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="w-full px-6 py-6">
      <Card className="w-full p-8 space-y-4">
        <h1 className="text-2xl font-bold">Seller Profile</h1>

        <div>
          <div className="text-sm text-slate-600">Full Name</div>
          <div className="text-lg font-semibold">{seller.full_name}</div>
        </div>

        <div>
          <div className="text-sm text-slate-600">Email</div>
          <div>{seller.email}</div>
        </div>

        <div>
          <div className="text-sm text-slate-600">WhatsApp</div>
          <div>{seller.phone}</div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            className="bg-green-600 text-white"
            onClick={() =>
              window.open(
                `https://wa.me/${seller.phone}`,
                "_blank"
              )
            }
          >
            Chat on WhatsApp
          </Button>

          <Button
            variant="secondary"
            onClick={() => nav(-1)}
          >
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}