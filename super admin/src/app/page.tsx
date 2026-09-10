"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Lock, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("superadmin");
  const [password, setPassword] = useState("SuperAdmin@2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pass: password }),
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("super_admin_token", data.token);
          localStorage.setItem("super_admin_token", data.token);
        }
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid Super Admin credentials.");
      }
    } catch {
      setError("Network error connecting to backend API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/60 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25 text-white font-black mb-4 ring-4 ring-blue-100">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SUPER ADMIN PORTAL</h1>
          <p className="text-xs text-blue-600 font-bold mt-1">Tenant Credit Allocation & Assessment Quota Engine</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Root Authority Sign In
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
                  placeholder="superadmin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Master Security Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating Root..." : "Access Super Admin Console"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
            Protected Enterprise Quota Engine • GreatCampus
          </div>
        </div>
      </div>
    </div>
  );
}
