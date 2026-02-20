import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import wordmark from "../assets/uta/mavericks-wordmark.png";
import seal from "../assets/uta/uta-seal.png";
import logo from "../assets/uta/uta-large-logo.png";
import pennant from "../assets/uta/uta-pennant.png";


import { NAV_ITEMS, DIS } from "../config/marketplace";
import { useAuth } from "../state/auth";
import { setArchitecture } from "../lib/api";

export default function Layout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { token, userId, logout } = useAuth();

  const currentArch = localStorage.getItem("architecture") || "micro";

  return (
    <div className="min-h-screen bg-gradient-to-br w-full from-slate-50 via-white to-slate-100 text-slate-900">

      {/* Top Bar */}
      <header className="sticky w-full top-0 z-50 border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <img
            src={logo}
            alt="UTA Logo"
            className="h-20 w-30 object-contain opacity-100"
          />
          {/* Brand */}
          <Link to={DIS.brandHref} className="flex items-start gap-3 group">

            <div className="leading-tight">

              <div className="text-base font-bold text-uta-navy tracking-tight">
                {DIS.brandTitle}
              </div>
              <div className="text-xs text-slate-500">
                {DIS.brandSubtitle}
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3">
            {NAV_ITEMS.map((it) => {
              const active =
                it.match === "prefix"
                  ? loc.pathname.startsWith(it.href)
                  : loc.pathname === it.href;

              return (
                <Link
                  key={it.id}
                  to={it.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${active
                    ? "bg-uta-blue text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
          {/* User actions */}
          <div className="flex items-center gap-3">

            {/* Architecture Toggle */}
            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="arch"
                  checked={currentArch !== "mono"}
                  onChange={() => setArchitecture("micro")}
                />
                Micro
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="arch"
                  checked={currentArch === "mono"}
                  onChange={() => setArchitecture("mono")}
                />
                Mono
              </label>
            </div>

            {token && userId ? (
              <>
                {/* Sell Item */}
                <button
                  onClick={() => nav("/create")}
                  className="hidden sm:inline-flex rounded-lg bg-uta-orange px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-uta-orange/90 transition"
                >
                  Sell Item
                </button>

                {/* My Listings */}
                <button
                  onClick={() => nav("/my-listings")}
                  className="hidden sm:inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  My Listings
                </button>

                {/* Signed In Badge */}
                <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs">
                  <span className="text-slate-500">{DIS.signedInLabel}</span>
                  <span className="font-semibold text-uta-navy truncate max-w-[120px]">
                    {userId}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    nav("/auth");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <LogOut className="h-4 w-4" />
                  {DIS.signOutLabel}
                </button>
              </>
            ) : (
              <button
                onClick={() => nav("/auth")}
                className="rounded-lg bg-uta-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-uta-blue/90 transition"
              >
                {DIS.signInLabel}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
            {NAV_ITEMS.map((it) => {
              const active =
                it.match === "prefix"
                  ? loc.pathname.startsWith(it.href)
                  : loc.pathname === it.href;

              return (
                <Link
                  key={it.id}
                  to={it.href}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${active
                    ? "bg-uta-blue text-white"
                    : "bg-slate-100 text-slate-700"
                    }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Architecture Toggle */}
          <div className="flex justify-center gap-6 py-3 text-xs text-slate-600 bg-slate-50">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="arch-mobile"
                defaultChecked={currentArch !== "mono"}
                onChange={() => setArchitecture("micro")}
              />
              Micro
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="arch-mobile"
                defaultChecked={currentArch === "mono"}
                onChange={() => setArchitecture("mono")}
              />
              Mono
            </label>
          </div>

          {/* Mobile Sell + My Listings */}
          {token && (
            <div className="mx-auto flex max-w-6xl gap-3 px-4 pb-4">
              <button
                onClick={() => nav("/create")}
                className="flex-1 rounded-lg bg-uta-orange px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                Sell
              </button>
              <button
                onClick={() => nav("/my-listings")}
                className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                My Listings
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="mx-auto w-max-10xl px-6 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>{DIS.footerLeft}</div>
          <div>{DIS.footerRight}</div>
        </div>
      </footer>
    </div>
  );
}