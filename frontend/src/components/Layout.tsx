import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { NAV_ITEMS, DIS } from "../config/marketpkace";
import { useAuth } from "../state/auth";

export default function Layout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { token, userId, setAuth } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          {/* Brand */}
          <Link to={DIS.brandHref} className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-blue-100 bg-uta-blue/10 font-extrabold text-uta-blue">
              {DIS.brandMark}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-uta-navy">{DIS.brandTitle}</div>
              <div className="text-xs text-slate-500">{DIS.brandSubtitle}</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map((it) => {
              const active =
                it.match === "prefix"
                  ? loc.pathname.startsWith(it.href)
                  : loc.pathname === it.href;

              return (
                <Link
                  key={it.id}
                  to={it.href}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-uta-blue bg-uta-blue text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-2">
            {token && userId ? (
              <>
                <div className="hidden sm:block rounded-full border border-slate-200 bg-white px-3 py-2 text-xs">
                  {DIS.signedInLabel}{" "}
                  <span className="font-mono font-bold text-slate-800">{userId}</span>
                </div>

                <button
                  onClick={() => {
                    // Logout = clear auth state using existing setter
                    setAuth("", "");
                    nav("/auth");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  {DIS.signOutLabel}
                </button>
              </>
            ) : (
              <button
                onClick={() => nav("/auth")}
                className="rounded-full bg-uta-blue px-4 py-2 text-sm font-semibold text-white hover:bg-uta-blue/90"
              >
                {DIS.signInLabel}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2">
            {NAV_ITEMS.map((it) => {
              const active =
                it.match === "prefix"
                  ? loc.pathname.startsWith(it.href)
                  : loc.pathname === it.href;

              return (
                <Link
                  key={it.id}
                  to={it.href}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-uta-blue bg-uta-blue text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>{DIS.footerLeft}</div>
          <div>{DIS.footerRight}</div>
        </div>
      </footer>
    </div>
  );
}