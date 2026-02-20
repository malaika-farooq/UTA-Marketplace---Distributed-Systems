import { useAuth } from "../state/auth";
import { useEffect, useState } from "react";
import { loadProfile, updateProfile } from "../lib/api";
import { Card, Button, Input } from "../components/ui";

export default function Profile() {
  const { token, userId, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile on mount
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError("");

    loadProfile(token)
      .then((data) => {
        setProfile(data);
      })
      .catch(() => {
        setError("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Save profile updates
  async function handleSave() {
    if (!token || !profile) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateProfile(token, {
        full_name: profile.full_name,
        phone: profile.phone ?? profile.whatsapp,
      });

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">My Profile</h1>

        {loading && <div className="mt-4">Loading...</div>}

        {error && (
          <div className="mt-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 text-green-600 text-sm">
            {success}
          </div>
        )}

        {profile && (
          <div className="mt-4 space-y-4">

            {/* User ID */}
            <div>
              <label className="text-sm text-slate-600">User ID</label>
              <Input value={userId ?? ""} disabled />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <Input value={profile.email ?? ""} disabled />
            </div>

            {/* Full Name */}
            <div>
              <label className="text-sm text-slate-600">Full Name</label>
              <Input
                value={profile.full_name ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    full_name: e.target.value,
                  })
                }
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-sm text-slate-600">WhatsApp</label>
              <Input
                value={profile.phone ?? profile.whatsapp ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 bg-blue-600 text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>

          </div>
        )}

        {/* Logout */}
        <Button
          onClick={logout}
          className="mt-6 bg-red-600 text-white"
        >
          Logout
        </Button>
      </Card>
    </div>
  );
}