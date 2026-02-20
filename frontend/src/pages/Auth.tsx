import { Link } from "react-router-dom";
import wordmark from "../assets/uta/mavericks-wordmark.png";

export default function Auth() {
  return (
    <>
      <div className="mx-auto max-w-md mt-16">
        <div className="flex-col rounded-3xl border bg-white p-6 shadow-soft text-center items-center space-y-4">

          <h1 className="text-xl font-semibold text-slate-900">
            Welcome to UTA Marketplace
          </h1>

          <div className="flex justify-center gap-4">
            <Link
              to="/auth/login"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>

            <Link
              to="/auth/signup"
              className="rounded-full bg-uta-blue px-4 py-2 text-sm font-semibold text-white hover:bg-uta-blue/90"
            >
              Sign Up
            </Link>
          </div>
          <img
            src={wordmark}
            alt="UTA wordmark"
            className="relative opacity-10"
          />
        </div>
      </div>
    </>
  );
}