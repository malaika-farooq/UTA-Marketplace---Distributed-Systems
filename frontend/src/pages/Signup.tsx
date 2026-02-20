import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authRegister } from "../lib/api";

export default function Signup() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      await authRegister(form);

      nav("/auth/login");   // ✅ FIXED (was /api/auth/login)
    } catch (e: any) {
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md mt-16">
      <div className="rounded-3xl border bg-white p-6 shadow-soft">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              required
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
            />
          </div>

          {err && (
            <div className="text-red-600 text-sm">{err}</div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-2xl bg-uta-blue px-4 py-3 text-sm font-semibold text-white"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}