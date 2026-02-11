import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { devLogin } from "../lib/api";
import { useAuth } from "../state/auth";

import campusImg from "../assets/uta/campus.png";
import horseLogo from "../assets/uta/mavericks-horse.png";
import pennantImg from "../assets/uta/uta-pennant.png";
import mavericksWordmark from "../assets/uta/mavericks-wordmark.png";

export default function Auth() {
  const nav = useNavigate();
  const { setAuth } = useAuth();

  const [userId, setUserId] = useState("buyer123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tips = useMemo(
    () => [
      { k: "buyer123", v: "Buyer / browse listings" },
      { k: "seller456", v: "Seller / reply to messages" },
      { k: "grad789", v: "Grad-student account" },
    ],
    []
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* subtle background accents (NOT blur blobs, just soft gradients) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(0,83,159,0.10), transparent 50%), radial-gradient(circle at 85% 20%, rgba(244,121,32,0.12), transparent 55%), radial-gradient(circle at 70% 90%, rgba(0,83,159,0.08), transparent 55%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 md:px-10 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 ring-1 ring-slate-200 shadow-sm">
              <img src={horseLogo} alt="Mavericks" className="h-10 w-10" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">UTA Marketplace</div>
              <div className="text-lg font-extrabold text-slate-900">
                Buy • Sell • Meet on Campus
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-extrabold text-[#00539F]">
            Dev Mode (no signup yet)
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-2">
          {/* Left: Hero collage */}
          <div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-soft">
            {/* Hero image */}
            <div className="relative h-64">
              <img src={campusImg} alt="UTA Campus" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

              {/* Floating poster cards (clean, no blur blobs) */}
              <div className="absolute left-6 top-6 rotate-[-6deg] animate-[float_6s_ease-in-out_infinite]">
                <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
                  <img src={pennantImg} alt="UTA Pennant" className="h-14 w-auto" />
                  <div className="mt-2 text-xs font-extrabold text-slate-900">Meet on campus</div>
                  <div className="text-[11px] text-slate-500">Library • UC • Engineering</div>
                </div>
              </div>

              <div className="absolute right-6 top-10 rotate-[7deg] animate-[float2_7s_ease-in-out_infinite]">
                <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
                  <img src={mavericksWordmark} alt="Mavericks" className="h-12 w-auto" />
                  <div className="mt-2 text-xs font-extrabold text-slate-900">Deals. Fast.</div>
                  <div className="text-[11px] text-slate-500">Textbooks • Furniture • Tech</div>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-extrabold text-[#9A3F00]">
                <span className="h-2 w-2 rounded-full bg-[#F47920]" />
                Student community vibe
              </div>
            </div>

            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-slate-900">
                Your campus{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00539F] to-[#F47920]">
                  marketplace
                </span>
                , made simple.
              </h1>

              <p className="mt-3 text-sm text-slate-600 max-w-xl">
                List items, message sellers, and pick up on campus. Built for undergrad, grad,
                PhD, and everyone in between.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Electronics", "Textbooks", "Furniture", "Dorm", "Bikes", "Services"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Dev Login */}
          <div className="relative">
            {/* small floating stickers (clean, no blur) */}
            <div className="pointer-events-none absolute -left-3 -top-3 rotate-[-10deg] animate-[float_6.5s_ease-in-out_infinite]">
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
                <div className="text-xs font-extrabold text-slate-900">No spam</div>
                <div className="text-[11px] text-slate-500">Student-to-student</div>
              </div>
            </div>

            <div className="pointer-events-none absolute right-4 -bottom-4 rotate-[9deg] animate-[float2_7.5s_ease-in-out_infinite]">
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
                <div className="text-xs font-extrabold text-slate-900">Fast chat</div>
                <div className="text-[11px] text-slate-500">Messaging service</div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white p-8 shadow-soft">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-extrabold text-[#00539F]">
                Dev Login
              </div>

              <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Enter a username</h2>
              <p className="mt-2 text-sm text-slate-600">
                This generates a dev token for testing. Later we’ll replace it with real auth.
              </p>

              <div className="mt-6 space-y-3">
                <div className="text-sm font-semibold text-slate-700">User ID</div>
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-200"
                  placeholder="buyer123"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tips.map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      onClick={() => setUserId(t.k)}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:bg-slate-50 transition shadow-sm"
                    >
                      <div className="font-mono font-bold text-slate-900">{t.k}</div>
                      <div className="text-slate-500">{t.v}</div>
                    </button>
                  ))}
                </div>

                {err && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {err}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#00539F] to-[#F47920] px-4 py-3 text-sm font-extrabold text-white hover:brightness-105 disabled:opacity-60 transition"
                  onClick={async () => {
                    setLoading(true);
                    setErr(null);
                    try {
                      const resp = await devLogin(userId.trim());
                      setAuth(resp.token, userId.trim());
                      nav("/listings");
                    } catch (e: any) {
                      setErr(e?.message || "Dev login failed (Gateway not running?)");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Signing in..." : "Enter Marketplace"}
                </button>

                <div className="text-xs text-slate-500">
                  Backend must be running on <span className="font-mono">http://localhost:8080</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Built for Distributed Systems — Design A: REST Gateway → gRPC Microservices → Postgres
            </div>
          </div>
        </div>
      </div>

      {/* custom keyframes (no libs) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-10px) rotate(var(--tw-rotate)); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-14px) rotate(var(--tw-rotate)); }
        }
      `}</style>
    </div>
  );
}