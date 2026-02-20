import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { authLogin } from "../lib/api";
import wordmark from "../assets/uta/mavericks-wordmark.png"

export default function Login() {
  const nav = useNavigate();
  const { setAuth } = useAuth();   // ✅ correct function

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await authLogin({
        email: form.email,        // ✅ backend expects email
        password: form.password,
      });

      // ✅ backend returns user_id and token
      setAuth(res.token, res.user_id);

      nav("/listings");
    } catch (error: any) {
      setErr(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md mt-16">
      <h1 className="text-xl font-semibold mb-6">Sign In</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full border px-4 py-3 rounded-2xl"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full border px-4 py-3 rounded-2xl"
        />

        {err && <div className="text-red-500 text-sm">{err}</div>}

        <button
          disabled={loading}
          className="w-full bg-uta-blue text-white py-3 rounded-2xl"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600">
          Sign up
        </Link>
      </p>
    </div>
  );
}