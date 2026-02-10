import { useState } from "react";
import { devLogin } from "../lib/api";
import { useAuth } from "../state/auth";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Login() {
  const [userId, setUserId] = useState("buyer123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const nav = useNavigate();

  return (
    <div className="mx-auto">
      <div className="rounded-3xl border bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Sign in (Dev mode)</h1>
            <p className="mt-1 text-sm text-slate-600">
              Temporary login for testing. Later this will be replaced with Auth microservice.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-slate-700">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="buyer123"
          />
          <div className="text-xs text-slate-500">
            Try: <span className="font-mono">buyer123</span> or <span className="font-mono">seller456</span>
          </div>

          {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setErr(null);
              try {
                const { token } = await devLogin(userId.trim());
                setAuth(token, userId.trim());
                nav("/listings");
              } catch (e: any) {
                setErr(e.message || "Login failed");
              } finally {
                setLoading(false);
              }
            }}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}