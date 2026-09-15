"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect password.");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #e5e5e5 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 shadow-sm">
            <LogoMark size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Checkout</h1>
            <p className="text-sm text-neutral-500">Sign in to your admin account</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-7 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_30px_rgba(0,0,0,0.04)]"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
            <input
              required
              type="password"
              autoFocus
              placeholder="••••••••"
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-[15px] outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
          <Lock size={12} />
          Restricted to authorized store admins
        </div>
      </div>
    </div>
  );
}
