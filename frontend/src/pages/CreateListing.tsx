import { useState, useEffect } from "react";
import { useAuth } from "../state/auth";
import { createListing, loadProfile } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input } from "../components/ui";

import {
  CATEGORIES,
  CONDITIONS,
  MEET_SPOTS,
} from "../config/marketplace";

import type {
  Category,
  Condition,
  MeetSpot,
} from "../config/marketplace";

export default function CreateListing() {
  const { token } = useAuth();
  const nav = useNavigate();

  const [profile, setProfile] = useState<any>(null); // 🔥 NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: CATEGORIES[0].id,
    condition: CONDITIONS[0].id,
    meetSpot: MEET_SPOTS[0].id,
    image_url: "",
  });

  // 🔥 Load profile once
  useEffect(() => {
    if (!token) return;

    loadProfile(token)
      .then((data) => setProfile(data))
      .catch(console.error);
  }, [token]);

  const mapToNumber = <T extends { id: string }>(
    value: string,
    list: T[]
  ) => list.findIndex((item) => item.id === value) + 1;

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image_url: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!token) {
      setError("You must be signed in.");
      return;
    }

    if (!profile) {
      setError("Unable to load profile.");
      return;
    }

    if (!form.title || !form.description || !form.price) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await createListing(token, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category_id: form.category,
        condition_id: form.condition,
        meet_spot_id: form.meetSpot,
        seller_email: profile.email ?? "",
        seller_whatsapp: profile.whatsapp ?? profile.phone ?? "",
        image_url: "",
      });

      setSuccess("🎉 Listing posted successfully!");

      setTimeout(() => {
        nav("/my-listings");
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl">
      <h1 className="text-3xl font-bold mb-8 text-uta-navy">
        Sell Your Item
      </h1>

      {/* 🔥 Show auto-mapped contact info */}
      {profile && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg text-sm">
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>WhatsApp:</strong> {profile.phone || "Not provided"}</div>
        </div>
      )}

      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-6">

        <Input
          placeholder="Item Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <Input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <Input
          placeholder="Price ($)"
          type="number"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />

        <select
          className="w-full border rounded-lg p-3"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        >
          {CATEGORIES.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>

        <select
          className="w-full border rounded-lg p-3"
          value={form.condition}
          onChange={(e) =>
            setForm({ ...form, condition: e.target.value })
          }
        >
          {CONDITIONS.map((c: Condition) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          className="w-full border rounded-lg p-3"
          value={form.meetSpot}
          onChange={(e) =>
            setForm({ ...form, meetSpot: e.target.value })
          }
        >
          {MEET_SPOTS.map((m: MeetSpot) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImageUpload(e.target.files[0]);
            }
          }}
        />

        {form.image_url && (
          <img
            src={form.image_url}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl shadow"
          />
        )}

      </div>

      <div className="mt-8 flex justify-end">
        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? "Posting..." : "Post Listing"}
        </Button>
      </div>
    </Card>
  );
}